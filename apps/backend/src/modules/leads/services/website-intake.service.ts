import type { Prisma } from '@kuberone/database';
import type {
  WebsiteLeadIntakeInput,
  WebsitePartnerAuthInput,
  WebsitePartnerIntakeInput,
  WebsiteVisitorIntakeInput,
  ListWebsiteVisitorsQuery,
} from '@kuberone/shared-validation';

import { prisma } from '../../../config/database.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../../shared/errors/app-error.js';
import { productRepository } from '../../product/repositories/product.repository.js';
import { partnerService } from '../../partners/services/partner.service.js';
import { partnerRepository } from '../../partners/repositories/partner.repository.js';
import { otpService } from '../../auth/services/otp.service.js';
import { loginService } from '../../auth/services/login.service.js';
import { authService } from '../../auth/services/auth.service.js';
import { securityService } from '../../auth/services/security.service.js';
import { userRepository } from '../../auth/repositories/user.repository.js';
import type { RequestContext } from '../../auth/types/auth.types.js';
import { buildPaginationMeta, generateLeadNumber } from '../utils/leads.utils.js';
import { leadRepository } from '../repositories/lead.repository.js';
import { leadSourceRepository } from '../repositories/lead-source.repository.js';
import { leadStatusHistoryRepository } from '../repositories/lead-status-history.repository.js';
import { serializeLead } from '../utils/lead-serializer.js';

const LOAN_TYPE_TO_PRODUCT_CODE: Record<string, string> = {
  'home loan': 'HL-01',
  'home-loan': 'HL-01',
  'loan against property': 'LAP-01',
  'loan-against-property': 'LAP-01',
  lap: 'LAP-01',
  'auto loan (new car)': 'AL-01',
  'new-car-loan': 'AL-01',
  'new car loan': 'AL-01',
  'auto loan (used car)': 'AL-02',
  'used-car-loan': 'AL-02',
  'used car loan': 'AL-02',
  'personal loan': 'PL-01',
  'personal-loan': 'PL-01',
  'business loan': 'BL-01',
  'business-loan': 'BL-01',
  'working-capital': 'BL-01',
  'working capital': 'BL-01',
  'machinery loan': 'ML-01',
  'machinery-loan': 'ML-01',
  'education loan': 'PL-01',
  'education-loan': 'PL-01',
  insurance: 'INS-01',
  'credit card': 'CC-01',
  'credit-card': 'CC-01',
};

function pickName(fields: WebsiteLeadIntakeInput['fields']): string {
  return fields.full_name?.trim() || fields.fullName?.trim() || fields.name?.trim() || '';
}

function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

function parseAmount(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(String(value).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

let websiteIntakeChangedByIdCache: string | null = null;

async function resolveWebsiteIntakeChangedById(): Promise<string> {
  if (websiteIntakeChangedByIdCache) return websiteIntakeChangedByIdCache;

  // Public intake has no authenticated actor; we still must populate `changedById`
  // for `leadStatusHistory` (DB has NOT NULL constraint).
  const firstActiveUser = await prisma.user.findFirst({
    where: { status: 'ACTIVE' },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!firstActiveUser) {
    throw new NotFoundError('User', 'No ACTIVE user found to record website intake status history');
  }

  websiteIntakeChangedByIdCache = firstActiveUser.id;
  return firstActiveUser.id;
}

function resolveProductCode(fields: WebsiteLeadIntakeInput['fields'], source?: string): string {
  const loanType = (fields.loan_type || fields.loanType || '').trim().toLowerCase();
  if (loanType) {
    if (LOAN_TYPE_TO_PRODUCT_CODE[loanType]) {
      return LOAN_TYPE_TO_PRODUCT_CODE[loanType];
    }
    // Website often sends "Insurance — Term Life", "Credit Card — …"
    if (loanType.startsWith('insurance')) return 'INS-01';
    if (loanType.startsWith('credit card') || loanType.includes('credit-card')) return 'CC-01';
    if (loanType.includes('home loan') || loanType.includes('home-loan')) return 'HL-01';
    if (loanType.includes('loan against property') || loanType.includes('lap')) return 'LAP-01';
    if (loanType.includes('personal loan')) return 'PL-01';
    if (loanType.includes('business loan') || loanType.includes('working capital')) return 'BL-01';
    if (loanType.includes('machinery')) return 'ML-01';
    if (loanType.includes('used car') || loanType.includes('used-car')) return 'AL-02';
    if (loanType.includes('new car') || loanType.includes('auto loan') || loanType.includes('car loan')) {
      return 'AL-01';
    }
    if (loanType.includes('education')) return 'PL-01';
    if (loanType.includes('cibil')) return 'PL-01';
  }

  const sourceSlug = (source ?? '').toLowerCase();
  for (const [key, code] of Object.entries(LOAN_TYPE_TO_PRODUCT_CODE)) {
    if (sourceSlug.includes(key.replace(/\s+/g, '-'))) return code;
  }

  return 'PL-01';
}

function buildMetadata(input: WebsiteLeadIntakeInput): Prisma.InputJsonValue {
  const fields = input.fields;
  return {
    origin: 'kuberfinserve-website',
    formType: input.form_type ?? 'Lead',
    source: input.source,
    pageUrl: input.page_url,
    city: fields.city,
    employmentType: fields.employment_type ?? fields.employmentType,
    companyName: fields.company_name ?? fields.companyName,
    monthlyIncome: fields.monthly_income ?? fields.monthlyIncome,
    tenureMonths: fields.tenure_months ?? fields.tenureMonths,
    propertyValue: fields.property_value,
    message: fields.message,
    externalLeadId: fields.external_lead_id ?? fields.lead_id,
    websitePartnerCode: fields.partner_id,
    crmChannel: fields.crm_channel,
    formVariant: fields.form_variant,
  };
}

export const websiteIntakeService = {
  async ingestLead(input: WebsiteLeadIntakeInput) {
    const fields = input.fields;
    const prospectName = pickName(fields);
    const prospectPhone = normalizePhone(fields.phone);

    if (prospectName.length < 2) {
      throw new ValidationError({ prospectName: ['Full name is required'] });
    }
    if (!/^[6-9]\d{9}$/.test(prospectPhone)) {
      throw new ValidationError({ prospectPhone: ['Valid 10-digit Indian mobile required'] });
    }

    const emailRaw = fields.email?.trim();
    const prospectEmail = emailRaw ? emailRaw.toLowerCase() : undefined;
    const productCode = resolveProductCode(fields, input.source);

    const [source, product] = await Promise.all([
      leadSourceRepository.findByCode('WEBSITE'),
      productRepository.findByCode(productCode),
    ]);

    if (!source) throw new NotFoundError('LeadSource', 'WEBSITE');
    if (!product) throw new NotFoundError('Product', productCode);

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await prisma.lead.findFirst({
      where: {
        deletedAt: null,
        prospectPhone,
        productId: product.id,
        createdAt: { gte: since },
      },
      include: {
        source: true,
        product: { include: { family: true } },
        variant: true,
        customer: true,
        partner: true,
        branch: true,
        region: true,
        assignedTo: true,
        createdBy: { select: { id: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recent) {
      return {
        duplicate: true,
        lead: serializeLead(recent),
        message: 'Lead already exists for this phone and product',
      };
    }

    const last = await leadRepository.getLastLeadNumber();
    const leadNumber = generateLeadNumber(last?.leadNumber);
    const requestedAmount = parseAmount(fields.loan_amount ?? fields.loanAmount);

    const lead = await leadRepository.create({
      leadNumber,
      prospectName,
      prospectPhone,
      prospectEmail,
      productId: product.id,
      sourceId: source.id,
      requestedAmount,
      priority: 'MEDIUM',
      metadata: buildMetadata(input),
      status: 'NEW',
    });

    await leadStatusHistoryRepository.create({
      leadId: lead.id,
      fromStatus: null,
      toStatus: 'NEW',
      changedById: await resolveWebsiteIntakeChangedById(),
      reason: 'Website lead intake',
    });

    const refreshed = await leadRepository.findById(lead.id);
    return {
      duplicate: false,
      lead: serializeLead(refreshed!),
      message: 'Lead created in KuberOne',
    };
  },

  async ingestPartner(input: WebsitePartnerIntakeInput) {
    try {
      const partner = await partnerService.register({
        phone: input.phone,
        email: input.email,
        businessName: input.businessName || input.businessType || undefined,
        contactName: input.contactName,
        partnerTypeCode: input.partnerTypeCode || 'DSA',
      });
      return { duplicate: false, partner, message: 'Partner application created in KuberOne' };
    } catch (err) {
      if (err instanceof ConflictError) {
        return { duplicate: true, partner: null, message: err.message };
      }
      throw err;
    }
  },

  /**
   * Website partner login: resolve mobile / email / partner code → phone OTP via KuberOne auth.
   */
  async partnerAuth(input: WebsitePartnerAuthInput, ctx: RequestContext) {
    const partner = await resolvePartnerByIdentifier(input.identifier);
    if (!partner?.phone) {
      throw new UnauthorizedError('No partner account found for this mobile, email, or partner code');
    }

    const user = await userRepository.findByPhone(partner.phone);
    if (!user) {
      throw new UnauthorizedError('No partner account found for this mobile, email, or partner code');
    }

    await securityService.assertUserCanAuthenticate(user.id);
    await securityService.assertPartnerCanLogin(user.id);

    if (input.mode === 'otp_request') {
      const result = await otpService.sendOtp({ phone: partner.phone, purpose: 'LOGIN' }, ctx);
      return {
        otp_sent: true,
        message: result.message || 'OTP sent to your registered mobile number.',
        phone_hint: maskPhone(partner.phone),
      };
    }

    if (!input.otp) {
      throw new ValidationError({ otp: ['OTP is required'] });
    }

    const tokens = await loginService.partnerLogin(
      {
        loginType: 'partner',
        phone: partner.phone,
        otp: input.otp,
        device: {
          deviceId: 'kuberfinserve-web',
          platform: 'WEB',
          appVersion: 'website',
        },
      },
      ctx,
    );

    const me = await authService.getMe(user.id);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      partner: {
        id: 0,
        partner_id: partner.partnerCode,
        full_name: partner.contactName || me.email || 'Partner',
        email: partner.email || me.email || '',
        phone: partner.phone,
        city: null,
        state: null,
        business_type: null,
        status: partner.status === 'ACTIVE' ? 'approved' : partner.status.toLowerCase(),
        created_at:
          partner.createdAt instanceof Date
            ? partner.createdAt.toISOString()
            : new Date().toISOString(),
      },
      must_change_password: false,
    };
  },

  async ingestVisitor(
    input: WebsiteVisitorIntakeInput,
    ctx?: { ipAddress?: string; userAgent?: string },
  ) {
    const city = input.city.trim();
    if (city.length < 2) {
      throw new ValidationError({ city: ['City is required'] });
    }

    const nameRaw = input.name?.trim();
    const name = nameRaw && nameRaw.length >= 2 ? nameRaw : null;

    const phoneRaw = input.phone?.trim();
    let phone: string | null = null;
    if (phoneRaw) {
      const normalized = normalizePhone(phoneRaw);
      if (!/^[6-9]\d{9}$/.test(normalized)) {
        throw new ValidationError({ phone: ['Valid 10-digit Indian mobile required'] });
      }
      phone = normalized;
    }

    const emailRaw = input.email?.trim();
    const email = emailRaw ? emailRaw.toLowerCase() : null;

    const externalVisitorId = input.external_visitor_id?.trim() || null;
    const sessionId = input.session_id?.trim() || null;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existing = externalVisitorId
      ? await prisma.websiteVisitor.findUnique({ where: { externalVisitorId } })
      : sessionId
        ? await prisma.websiteVisitor.findFirst({
            where: { sessionId, createdAt: { gte: since } },
            orderBy: { createdAt: 'desc' },
          })
        : null;

    const data = {
      city,
      name,
      phone,
      email,
      pageUrl: input.page_url?.trim() || null,
      referrer: input.referrer?.trim() || null,
      utmSource: input.utm_source?.trim() || null,
      utmMedium: input.utm_medium?.trim() || null,
      utmCampaign: input.utm_campaign?.trim() || null,
      sessionId,
      externalVisitorId: externalVisitorId ?? existing?.externalVisitorId ?? null,
      ipAddress: ctx?.ipAddress?.slice(0, 45) || null,
      userAgent: ctx?.userAgent || null,
    };

    if (existing) {
      const visitor = await prisma.websiteVisitor.update({
        where: { id: existing.id },
        data: {
          city: data.city,
          name: data.name ?? existing.name,
          phone: data.phone ?? existing.phone,
          email: data.email ?? existing.email,
          pageUrl: data.pageUrl ?? existing.pageUrl,
          referrer: data.referrer ?? existing.referrer,
          utmSource: data.utmSource ?? existing.utmSource,
          utmMedium: data.utmMedium ?? existing.utmMedium,
          utmCampaign: data.utmCampaign ?? existing.utmCampaign,
          sessionId: data.sessionId ?? existing.sessionId,
          ipAddress: data.ipAddress ?? existing.ipAddress,
          userAgent: data.userAgent ?? existing.userAgent,
        },
      });
      return { duplicate: true, visitor: serializeWebsiteVisitor(visitor) };
    }

    const visitor = await prisma.websiteVisitor.create({ data });
    return { duplicate: false, visitor: serializeWebsiteVisitor(visitor) };
  },

  async listVisitors(query: ListWebsiteVisitorsQuery) {
    const where: Prisma.WebsiteVisitorWhereInput = {};

    if (query.city?.trim()) {
      where.city = { contains: query.city.trim() };
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      where.OR = [
        { city: { contains: q } },
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { pageUrl: { contains: q } },
      ];
    }

    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = query.fromDate;
      if (query.toDate) where.createdAt.lte = query.toDate;
    }

    const skip = (query.page - 1) * query.limit;
    const orderBy = { [query.sortBy]: query.sortOrder } as Prisma.WebsiteVisitorOrderByWithRelationInput;

    const [items, total] = await Promise.all([
      prisma.websiteVisitor.findMany({ where, skip, take: query.limit, orderBy }),
      prisma.websiteVisitor.count({ where }),
    ]);

    return {
      items: items.map(serializeWebsiteVisitor),
      meta: buildPaginationMeta(query.page, query.limit, total),
    };
  },
};

function serializeWebsiteVisitor(v: {
  id: string;
  city: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  pageUrl: string | null;
  referrer: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  sessionId: string | null;
  externalVisitorId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: v.id,
    city: v.city,
    name: v.name,
    phone: v.phone,
    email: v.email,
    pageUrl: v.pageUrl,
    referrer: v.referrer,
    utmSource: v.utmSource,
    utmMedium: v.utmMedium,
    utmCampaign: v.utmCampaign,
    sessionId: v.sessionId,
    externalVisitorId: v.externalVisitorId,
    ipAddress: v.ipAddress,
    userAgent: v.userAgent,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

function maskPhone(phone: string): string {
  if (phone.length < 4) return '****';
  return `${phone.slice(0, 2)}******${phone.slice(-2)}`;
}

async function resolvePartnerByIdentifier(raw: string) {
  const identifier = raw.trim();
  if (!identifier) return null;

  const phone = normalizePhone(identifier);
  if (/^[6-9]\d{9}$/.test(phone)) {
    const byPhone = await partnerRepository.findByPhone(phone);
    if (byPhone) return byPhone;
  }

  if (identifier.includes('@')) {
    const email = identifier.toLowerCase();
    const byEmail = await partnerRepository.findByEmail(email);
    if (byEmail) return byEmail;
    // Fallback: user email then partner by userId
    const user = await userRepository.findByEmail(email);
    if (user) {
      const byUser = await userRepository.findPartnerByUserId(user.id);
      if (byUser) {
        return partnerRepository.findById(byUser.id);
      }
    }
  }

  const byCode = await partnerRepository.findByPartnerCode(identifier.toUpperCase());
  if (byCode) {
    return partnerRepository.findById(byCode.id);
  }

  // Try original casing for partner codes
  const byCodeRaw = await partnerRepository.findByPartnerCode(identifier);
  if (byCodeRaw) {
    return partnerRepository.findById(byCodeRaw.id);
  }

  return null;
}
