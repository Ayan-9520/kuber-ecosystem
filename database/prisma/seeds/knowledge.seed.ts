import type { PrismaClient } from '@prisma/client';

const CATEGORIES = [
  { code: 'LOAN_POLICIES', name: 'Loan Policies', sortOrder: 1 },
  { code: 'HOME_LOAN', name: 'Home Loan Policies', parentCode: 'LOAN_POLICIES', sortOrder: 10 },
  { code: 'LAP', name: 'LAP Policies', parentCode: 'LOAN_POLICIES', sortOrder: 20 },
  { code: 'BUSINESS_LOAN', name: 'Business Loan Policies', parentCode: 'LOAN_POLICIES', sortOrder: 30 },
  { code: 'AUTO_LOAN', name: 'Auto Loan Policies', parentCode: 'LOAN_POLICIES', sortOrder: 40 },
  { code: 'EV_LOAN', name: 'EV Loan Policies', parentCode: 'LOAN_POLICIES', sortOrder: 50 },
  { code: 'BALANCE_TRANSFER', name: 'Balance Transfer Policies', parentCode: 'LOAN_POLICIES', sortOrder: 60 },
  { code: 'TOP_UP', name: 'Top-Up Policies', parentCode: 'LOAN_POLICIES', sortOrder: 70 },
  { code: 'ELIGIBILITY', name: 'Eligibility Rules', sortOrder: 2 },
  { code: 'DOCUMENT_REQ', name: 'Document Requirements', sortOrder: 3 },
  { code: 'LENDER_POLICIES', name: 'Lender Policies', sortOrder: 4 },
  { code: 'BANK_GUIDELINES', name: 'Bank Guidelines', parentCode: 'LENDER_POLICIES', sortOrder: 41 },
  { code: 'NBFC_GUIDELINES', name: 'NBFC Guidelines', parentCode: 'LENDER_POLICIES', sortOrder: 42 },
  { code: 'SALES_SCRIPTS', name: 'Sales Scripts', sortOrder: 5 },
  { code: 'SUPPORT_SCRIPTS', name: 'Support Scripts', sortOrder: 6 },
  { code: 'FAQS', name: 'FAQs', sortOrder: 7 },
  { code: 'TRAINING', name: 'Training Materials', sortOrder: 8 },
  { code: 'SOPS', name: 'Company SOPs', sortOrder: 9 },
  { code: 'COMPLIANCE', name: 'Compliance Guidelines', sortOrder: 10 },
  { code: 'OPERATIONS', name: 'Operational Guidelines', sortOrder: 11 },
  { code: 'MARKETING', name: 'Marketing Content', sortOrder: 12 },
];

const TAGS = [
  { code: 'HOME_LOAN', name: 'Home Loan', tagGroup: 'products' },
  { code: 'PERSONAL_LOAN', name: 'Personal Loan', tagGroup: 'products' },
  { code: 'LAP_TAG', name: 'LAP', tagGroup: 'products' },
  { code: 'HDFC', name: 'HDFC Bank', tagGroup: 'lenders' },
  { code: 'ICICI', name: 'ICICI Bank', tagGroup: 'lenders' },
  { code: 'SALES', name: 'Sales', tagGroup: 'departments' },
  { code: 'CREDIT', name: 'Credit', tagGroup: 'departments' },
  { code: 'OPERATIONS', name: 'Operations', tagGroup: 'departments' },
  { code: 'KYC', name: 'KYC Process', tagGroup: 'processes' },
  { code: 'DISBURSAL', name: 'Disbursal', tagGroup: 'processes' },
  { code: 'LOW_RISK', name: 'Low Risk', tagGroup: 'risk' },
  { code: 'HIGH_RISK', name: 'High Risk', tagGroup: 'risk' },
];

const SAMPLE_ARTICLES = [
  {
    slug: 'home-loan-eligibility-2026',
    title: 'Home Loan Eligibility Criteria 2026',
    summary: 'Minimum income, CIBIL, FOIR and LTV requirements for home loan approval.',
    content: 'Minimum monthly income: ₹25,000 (salaried) / ₹3L annual (self-employed). CIBIL score: 650+ preferred, 750+ for premium rates. Maximum FOIR: 60% for salaried, 65% for self-employed. Maximum LTV: 80% for ready property, 75% for under-construction.',
    contentType: 'POLICY' as const,
    categoryCode: 'HOME_LOAN',
    productCode: 'HOME_LOAN',
    searchKeywords: 'home loan eligibility income cibil foir ltv',
    tagCodes: ['HOME_LOAN', 'SALES'],
  },
  {
    slug: 'hdfc-home-loan-guidelines',
    title: 'HDFC Bank Home Loan Guidelines',
    summary: 'HDFC-specific home loan policy including rate, tenure and documentation.',
    content: 'Interest rate: 8.50%–9.75% p.a. based on profile. Max tenure: 30 years. Min loan: ₹5 lakh. Max loan: ₹10 crore. Required docs: PAN, Aadhaar, salary slips (3 months), bank statement (6 months), property papers.',
    contentType: 'POLICY' as const,
    categoryCode: 'BANK_GUIDELINES',
    lenderCode: 'HDFC',
    productCode: 'HOME_LOAN',
    searchKeywords: 'hdfc home loan rate tenure documents',
    tagCodes: ['HDFC', 'HOME_LOAN'],
  },
  {
    slug: 'faq-cibil-score-impact',
    title: 'How does CIBIL score affect loan approval?',
    summary: 'FAQ on CIBIL score impact on loan eligibility and interest rates.',
    content: 'CIBIL score above 750 qualifies for best rates and fastest approval. Score 650–749 may require additional documentation. Below 650 significantly reduces approval chances. Each lender has different cutoffs.',
    contentType: 'FAQ' as const,
    categoryCode: 'FAQS',
    searchKeywords: 'cibil score loan approval faq',
    tagCodes: ['CREDIT', 'LOW_RISK'],
  },
  {
    slug: 'sales-script-lead-qualification',
    title: 'Lead Qualification Sales Script',
    summary: 'Standard script for qualifying inbound loan leads.',
    content: '1. Greet and confirm identity. 2. Ask loan purpose and amount. 3. Check employment type and monthly income. 4. Ask about existing loans and EMI obligations. 5. Check property/vehicle details if applicable. 6. Explain next steps and document requirements. 7. Schedule follow-up within 24 hours.',
    contentType: 'SCRIPT' as const,
    categoryCode: 'SALES_SCRIPTS',
    department: 'SALES',
    searchKeywords: 'sales script lead qualification',
    tagCodes: ['SALES'],
  },
  {
    slug: 'kyc-document-checklist',
    title: 'KYC Document Checklist',
    summary: 'Complete list of KYC documents required for all loan products.',
    content: 'Identity: PAN Card, Aadhaar Card. Address: Utility bill / Rent agreement. Income (Salaried): Salary slips (3 months), Form 16, bank statement (6 months). Income (Self-employed): ITR (2 years), GST returns, bank statement (12 months). Property: Sale deed, NOC, approved plan.',
    contentType: 'SOP' as const,
    categoryCode: 'DOCUMENT_REQ',
    searchKeywords: 'kyc documents checklist pan aadhaar salary itr',
    tagCodes: ['KYC', 'OPERATIONS'],
  },
  {
    slug: 'balance-transfer-policy',
    title: 'Balance Transfer Policy',
    summary: 'Policy for balance transfer loans including eligibility and process.',
    content: 'Minimum existing loan tenure completed: 12 months. CIBIL: 700+. Savings threshold: minimum 0.25% rate reduction. Processing fee: 0.5%–1% of loan amount. Top-up option available with BT for eligible profiles.',
    contentType: 'POLICY' as const,
    categoryCode: 'BALANCE_TRANSFER',
    productCode: 'BALANCE_TRANSFER',
    searchKeywords: 'balance transfer bt policy eligibility',
    tagCodes: ['PERSONAL_LOAN'],
  },
];

export async function seedKnowledge(prisma: PrismaClient): Promise<void> {
  const categoryMap = new Map<string, string>();

  for (const cat of CATEGORIES.filter((c) => !('parentCode' in c))) {
    const created = await prisma.knowledgeCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, sortOrder: cat.sortOrder },
      create: { code: cat.code, name: cat.name, sortOrder: cat.sortOrder },
    });
    categoryMap.set(cat.code, created.id);
  }

  for (const cat of CATEGORIES.filter((c) => 'parentCode' in c)) {
    const parentId = categoryMap.get((cat as { parentCode: string }).parentCode);
    const created = await prisma.knowledgeCategory.upsert({
      where: { code: cat.code },
      update: { name: cat.name, sortOrder: cat.sortOrder, parentId },
      create: { code: cat.code, name: cat.name, sortOrder: cat.sortOrder, parentId },
    });
    categoryMap.set(cat.code, created.id);
  }

  const tagMap = new Map<string, string>();
  for (const tag of TAGS) {
    const created = await prisma.knowledgeTag.upsert({
      where: { code: tag.code },
      update: { name: tag.name, tagGroup: tag.tagGroup },
      create: tag,
    });
    tagMap.set(tag.code, created.id);
  }

  for (const article of SAMPLE_ARTICLES) {
    const categoryId = categoryMap.get(article.categoryCode);
    if (!categoryId) continue;

    const existing = await prisma.knowledgeArticle.findUnique({ where: { slug: article.slug } });
    if (existing) continue;

    const created = await prisma.knowledgeArticle.create({
      data: {
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        content: article.content,
        contentType: article.contentType,
        categoryId,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        searchKeywords: article.searchKeywords,
        productCode: article.productCode,
        lenderCode: article.lenderCode,
        department: article.department,
        semanticReady: true,
      },
    });

    await prisma.knowledgeVersion.create({
      data: {
        articleId: created.id,
        version: 1,
        title: article.title,
        summary: article.summary,
        content: article.content,
        changeNotes: 'Initial published version',
      },
    });

    for (const tagCode of article.tagCodes) {
      const tagId = tagMap.get(tagCode);
      if (tagId) {
        await prisma.knowledgeArticleTag.create({
          data: { articleId: created.id, tagId },
        });
      }
    }
  }

  console.log('  → knowledge base categories, tags & articles seeded');
}
