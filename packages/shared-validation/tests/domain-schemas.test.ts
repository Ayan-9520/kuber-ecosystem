import { createCustomerSchema } from '../src/customer.schema.js';
import { createLeadSchema } from '../src/lead.schema.js';
import { createApplicationSchema } from '../src/application.schema.js';
import { submitPanSchema } from '../src/kyc.schema.js';
import { createProductSchema } from '../src/product.schema.js';
import { calculateEmiSchema } from '../src/finance-engine.schema.js';
import { createCommissionRuleSchema } from '../src/commission.schema.js';
import { createReferralSchema } from '../src/referral.schema.js';
import { createTicketSchema } from '../src/support.schema.js';
import { sendNotificationSchema } from '../src/notification.schema.js';
import { createRoleSchema } from '../src/role.schema.js';
import { createPermissionSchema } from '../src/permission.schema.js';
import { paginationSchema } from '../src/pagination.schema.js';

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

describe('domain validation schemas', () => {
  it('customer create schema', () => {
    const parsed = createCustomerSchema.parse({
      userId: uuid(1),
      firstName: 'Rahul',
      lastName: 'Sharma',
    });
    expect(parsed.firstName).toBe('Rahul');
  });

  it('lead create schema', () => {
    const parsed = createLeadSchema.parse({
      prospectName: 'Amit Patel',
      prospectPhone: '9123456789',
      productId: uuid(2),
      sourceId: uuid(3),
    });
    expect(parsed.prospectPhone).toBe('9123456789');
  });

  it('application create schema', () => {
    const parsed = createApplicationSchema.parse({
      customerId: uuid(4),
      productId: uuid(5),
      requestedAmount: 500000,
      requestedTenureMonths: 60,
    });
    expect(parsed.requestedAmount).toBe(500000);
  });

  it('kyc pan submit schema', () => {
    expect(submitPanSchema.parse({ pan: 'ABCDE1234F' }).pan).toBe('ABCDE1234F');
  });

  it('product create schema', () => {
    const parsed = createProductSchema.parse({
      name: 'Personal Loan',
      code: 'PL01',
      familyId: uuid(6),
      minAmount: 50000,
      maxAmount: 5000000,
      minTenureMonths: 12,
      maxTenureMonths: 60,
    });
    expect(parsed.code).toBe('PL01');
  });

  it('EMI calculation schema', () => {
    const parsed = calculateEmiSchema.parse({
      loanAmount: 100000,
      interestRate: 12,
      tenureMonths: 24,
      processingFee: 0,
      includeAmortization: false,
    });
    expect(parsed.tenureMonths).toBe(24);
  });

  it('commission rule schema', () => {
    expect(
      createCommissionRuleSchema.parse({
        ruleCode: 'DEFAULT_RULE',
        name: 'Default',
        commissionType: 'DISBURSEMENT',
        calculationMethod: 'PERCENTAGE',
        percentage: 1.5,
        effectiveFrom: new Date().toISOString(),
      }).percentage,
    ).toBe(1.5);
  });

  it('referral schema', () => {
    expect(
      createReferralSchema.parse({
        referralTypeCode: 'CUSTOMER',
        referrerName: 'Ravi Kumar',
        refereeName: 'Suresh',
        refereePhone: '9876543210',
      }).refereePhone,
    ).toBe('9876543210');
  });

  it('support ticket schema', () => {
    expect(
      createTicketSchema.parse({
        subject: 'Need help',
        description: 'Issue with application status',
        categoryId: uuid(7),
        priority: 'MEDIUM',
      }).priority,
    ).toBe('MEDIUM');
  });

  it('notification schema', () => {
    expect(
      sendNotificationSchema.parse({
        userId: uuid(8),
        eventType: 'APPLICATION_SUBMITTED',
        channels: ['EMAIL'],
      }).channels,
    ).toEqual(['EMAIL']);
  });

  it('role and permission schemas', () => {
    expect(createRoleSchema.parse({ name: 'Sales Executive', code: 'SALES_EXEC' }).code).toBe(
      'SALES_EXEC',
    );
    expect(
      createPermissionSchema.parse({
        code: 'leads.read',
        name: 'Read Leads',
        module: 'leads',
      }).code,
    ).toBe('leads.read');
  });

  it('pagination schema', () => {
    expect(paginationSchema.parse({ page: 2, limit: 50 }).limit).toBe(50);
  });
});
