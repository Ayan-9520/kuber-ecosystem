#!/usr/bin/env node
/**
 * Full runtime verification for KuberOne CRM + mobile flows.
 * Usage: node scripts/runtime-verification.mjs [--base http://localhost:4000/api/v1]
 */
const BASE = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:4000/api/v1';

const DEV_OTP = '123456';
const CUSTOMER_PHONE = '9876543210';
const DSA_PHONE = '8888777766';

const results = [];
const ctx = { token: null, ids: {} };

function pass(module, route, detail = '') {
  results.push({ module, status: 'PASS', route, error: null, rootCause: null, fix: null, detail });
}

function fail(module, route, error, rootCause, fix) {
  results.push({ module, status: 'FAIL', route, error, rootCause, fix });
}

async function api(method, path, body, token = ctx.token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let json;
    try {
      json = await res.json();
    } catch {
      json = { success: false, error: { message: `Non-JSON response (${res.status})` } };
    }
    return { status: res.status, json, networkError: null };
  } catch (err) {
    return { status: 0, json: { success: false, error: { message: err.message } }, networkError: err.message };
  }
}

async function loadPrerequisites() {
  const products = await api('GET', '/products?limit=1');
  const sources = await api('GET', '/lead-sources?limit=1');
  const docTypes = await api('GET', '/document-types?limit=1');
  const refTypes = await api('GET', '/referral-types?limit=1');
  const partners = await api('GET', '/partners?limit=1');
  const customers = await api('GET', '/customers?limit=1');

  ctx.ids.productId = products.json?.data?.[0]?.id;
  ctx.ids.sourceId = sources.json?.data?.[0]?.id;
  ctx.ids.documentTypeId = docTypes.json?.data?.[0]?.id;
  ctx.ids.referralTypeId = refTypes.json?.data?.[0]?.id;
  ctx.ids.partnerId = partners.json?.data?.[0]?.id;
  ctx.ids.existingCustomerId = customers.json?.data?.[0]?.id;
}

// 1. CRM Login
async function testCrmLogin() {
  const route = 'POST /auth/login';
  const { status, json } = await api('POST', '/auth/login', {
    loginType: 'employee',
    email: 'admin@kuberone.com',
    password: 'Admin@123',
    device: { deviceId: 'runtime-verify', platform: 'WEB' },
  }, null);
  if (json.success && json.data?.accessToken) {
    ctx.token = json.data.accessToken;
    pass('1. CRM Login', route, `HTTP ${status}`);
  } else {
    fail('1. CRM Login', route, json.error?.message ?? `HTTP ${status}`, 'Auth endpoint rejected credentials', 'Verify admin seed: pnpm db:seed; check JWT secrets in apps/backend/.env');
  }
}

// 2. Lead Creation
async function testLeadCreation() {
  const route = 'POST /leads';
  if (!ctx.ids.productId || !ctx.ids.sourceId) {
    fail('2. Lead Creation', route, 'Missing productId or sourceId', 'Seed data incomplete', 'Run pnpm db:seed');
    return;
  }
  const phone = `9${String(Date.now()).slice(-9)}`;
  const { status, json } = await api('POST', '/leads', {
    prospectName: 'Runtime Verify Lead',
    prospectPhone: phone,
    prospectEmail: `verify.${Date.now()}@example.com`,
    productId: ctx.ids.productId,
    sourceId: ctx.ids.sourceId,
    requestedAmount: 1500000,
    priority: 'MEDIUM',
  });
  if (json.success && json.data?.id) {
    ctx.ids.leadId = json.data.id;
    pass('2. Lead Creation', route, `leadId=${json.data.id}`);
  } else {
    fail('2. Lead Creation', route, json.error?.message ?? `HTTP ${status}`, json.error?.code ?? 'API error', 'Check leads.write permission and product/source FKs');
  }
}

// 3. Customer Creation
async function testCustomerCreation() {
  const route = 'POST /customers';
  const phone = `8${String(Date.now()).slice(-9)}`;
  const userRes = await api('POST', '/users', { userType: 'CUSTOMER', phone, status: 'ACTIVE' });
  if (!userRes.json.success) {
    fail('3. Customer Creation', route, userRes.json.error?.message ?? 'User create failed', 'Cannot create customer without user', userRes.json.error?.code === 'FORBIDDEN' ? 'Grant users.create:all to admin role' : 'Check users API');
    return;
  }
  const userId = userRes.json.data.id;
  const { status, json } = await api('POST', '/customers', {
    userId,
    firstName: 'Runtime',
    lastName: 'Verify',
    source: 'DIRECT',
  });
  if (json.success && json.data?.id) {
    ctx.ids.customerId = json.data.id;
    pass('3. Customer Creation', route, `customerId=${json.data.id}`);
  } else {
    fail('3. Customer Creation', route, json.error?.message ?? `HTTP ${status}`, 'Customer record creation failed', 'Check customers.write permission');
  }
}

// 4. KYC Flow
async function testKycFlow() {
  const customerId = ctx.ids.customerId ?? ctx.ids.existingCustomerId;
  const route = 'POST /kyc/pan → POST /kyc/profile';
  if (!customerId) {
    fail('4. KYC Flow', route, 'No customerId available', 'Customer prerequisite missing', 'Fix customer creation first');
    return;
  }
  const panRes = await api('POST', '/kyc/pan', { customerId, pan: 'ABCDE1234F', nameOnPan: 'Runtime Verify' });
  const profileRes = await api('POST', '/kyc/profile', { customerId });
  if (panRes.json.success && profileRes.json.success) {
    pass('4. KYC Flow', route, 'PAN + profile upserted');
  } else {
    const err = panRes.json.error?.message ?? profileRes.json.error?.message ?? 'KYC step failed';
    fail('4. KYC Flow', route, err, panRes.json.error?.code ?? profileRes.json.error?.code ?? 'KYC API error', 'Check kyc.write permission and PAN validation');
  }
}

// 5. Application Creation
async function testApplicationCreation() {
  const route = 'POST /applications';
  const customerId = ctx.ids.customerId ?? ctx.ids.existingCustomerId;
  if (!customerId || !ctx.ids.productId) {
    fail('5. Application Creation', route, 'Missing customerId or productId', 'Prerequisites missing', 'Fix customer/product setup');
    return;
  }
  const { status, json } = await api('POST', '/applications', {
    customerId,
    leadId: ctx.ids.leadId,
    productId: ctx.ids.productId,
    requestedAmount: 2000000,
    requestedTenureMonths: 240,
    runEligibility: false,
  });
  if (json.success && json.data?.id) {
    ctx.ids.applicationId = json.data.id;
    pass('5. Application Creation', route, `applicationId=${json.data.id}`);
  } else {
    fail('5. Application Creation', route, json.error?.message ?? `HTTP ${status}`, json.error?.code ?? 'API error', 'Check applications.write permission');
  }
}

// 6. Document Upload
async function testDocumentUpload() {
  const route = 'POST /documents/upload';
  const customerId = ctx.ids.customerId ?? ctx.ids.existingCustomerId;
  if (!customerId || !ctx.ids.documentTypeId) {
    fail('6. Document Upload', route, 'Missing customerId or documentTypeId', 'Prerequisites missing', 'Run db:seed for document types');
    return;
  }
  const tinyPdf = Buffer.from('%PDF-1.4 runtime verify').toString('base64');
  const { status, json, networkError } = await api('POST', '/documents/upload', {
    ownerType: 'CUSTOMER',
    customerId,
    documentTypeId: ctx.ids.documentTypeId,
    fileName: 'runtime-verify.pdf',
    mimeType: 'application/pdf',
    contentBase64: tinyPdf,
    runOcr: false,
    autoVerify: false,
  });
  if (networkError) {
    fail('6. Document Upload', route, networkError, 'Backend crashed or unreachable during S3 upload', 'Ensure asyncHandler wraps document upload route; configure AWS S3');
    return;
  }
  if (json.error?.code === 'STORAGE_UNAVAILABLE') {
    fail('6. Document Upload', route, json.error.message, 'AWS S3 bucket/credentials not configured', 'Set AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in apps/backend/.env');
    return;
  }
  if (json.success && json.data?.id) {
    ctx.ids.documentId = json.data.id;
    pass('6. Document Upload', route, `documentId=${json.data.id}`);
  } else {
    fail('6. Document Upload', route, json.error?.message ?? `HTTP ${status}`, json.error?.code === 'S3_ERROR' ? 'S3 not configured' : (json.error?.code ?? 'Upload failed'), 'Set AWS_S3_BUCKET + credentials or use local mock storage');
  }
}

// 7. Eligibility Calculator
async function testEligibilityCalculator() {
  const route = 'POST /eligibility/calculate';
  const { status, json } = await api('POST', '/eligibility/calculate', {
    productSlug: 'HOME_LOAN',
    monthlyIncome: 120000,
    requestedLoanAmount: 5000000,
    requestedTenureMonths: 240,
    creditScore: 750,
    employmentType: 'SALARIED',
    persist: false,
    useCache: false,
  });
  if (json.success && json.data) {
    pass('7. Eligibility Calculator', route, `eligible=${json.data.isEligible ?? json.data.result ?? 'computed'}`);
  } else {
    fail('7. Eligibility Calculator', route, json.error?.message ?? `HTTP ${status}`, json.error?.code ?? 'Calculator error', 'Check eligibility rules seed and product slug');
  }
}

// 8. EMI Calculator
async function testEmiCalculator() {
  const route = 'POST /emi/calculate';
  const { status, json } = await api('POST', '/emi/calculate', {
    loanAmount: 2500000,
    interestRate: 8.5,
    tenureMonths: 240,
    includeAmortization: true,
    persist: false,
    useCache: false,
  });
  if (json.success && (json.data?.emi ?? json.data?.monthlyEmi)) {
    pass('8. EMI Calculator', route, `emi=${json.data.emi ?? json.data.monthlyEmi}`);
  } else {
    fail('8. EMI Calculator', route, json.error?.message ?? `HTTP ${status}`, 'EMI calculation failed', 'Check finance engine routes');
  }
}

// 9. Voice AI Console
async function testVoiceAi() {
  const healthRoute = 'GET /ai/voice/health';
  const sessionRoute = 'POST /ai/voice/sessions';
  const health = await api('GET', '/ai/voice/health');
  if (!health.json.success) {
    fail('9. Voice AI Console', healthRoute, health.json.error?.message ?? `HTTP ${health.status}`, 'Voice AI health check failed', 'Check ai-advisor module and permissions');
    return;
  }
  const session = await api('POST', '/ai/voice/sessions', { language: 'en' });
  if (!session.json.success || !session.json.data?.id) {
    fail('9. Voice AI Console', sessionRoute, session.json.error?.message ?? `HTTP ${session.status}`, 'Session creation failed', 'Check voice AI permissions (voice.read)');
    return;
  }
  const sessionId = session.json.data.id;
  const msg = await api('POST', `/ai/voice/sessions/${sessionId}/message`, { text: 'Hello, what loan products do you offer?' });
  if (msg.json.success) {
    const provider = msg.json.data?.provider ?? health.json.data?.openaiConfigured ? 'openai/rules' : 'rules';
    pass('9. Voice AI Console', `${sessionRoute} → message`, `provider=${provider}`);
  } else {
    fail('9. Voice AI Console', `POST /ai/voice/sessions/${sessionId}/message`, msg.json.error?.message ?? 'Message failed', 'OpenAI not configured — rules fallback may still work', 'Set OPENAI_API_KEY in apps/backend/.env for full AI responses');
  }
}

// 10. AI Copilot
async function testAiCopilot() {
  const route = 'GET /ai-copilot/health';
  const health = await api('GET', '/ai-copilot/health');
  if (!health.json.success) {
    fail('10. AI Copilot', route, health.json.error?.message ?? `HTTP ${health.status}`, 'Copilot health failed', 'Check ai-copilot module');
    return;
  }
  const leadId = ctx.ids.leadId;
  if (!leadId) {
    const leads = await api('GET', '/leads?limit=1');
    ctx.ids.leadId = leads.json?.data?.[0]?.id;
  }
  if (!ctx.ids.leadId) {
    fail('10. AI Copilot', 'GET /ai-copilot/lead/:id', 'No lead available', 'No leads in DB', 'Create a lead or run demo leads seed');
    return;
  }
  const analyze = await api('GET', `/ai-copilot/lead/${ctx.ids.leadId}`);
  if (analyze.json.success) {
    pass('10. AI Copilot', `GET /ai-copilot/lead/${ctx.ids.leadId}`, `mode=${analyze.json.data?.provider ?? analyze.json.data?.source ?? 'analysis'}`);
  } else {
    fail('10. AI Copilot', `GET /ai-copilot/lead/${ctx.ids.leadId}`, analyze.json.error?.message ?? `HTTP ${analyze.status}`, analyze.json.error?.code ?? 'Analysis failed', 'Set OPENAI_API_KEY for LLM analysis; rules fallback should still respond');
  }
}

// 11. Campaign Creation
async function testCampaignCreation() {
  const route = 'POST /campaigns';
  const { status, json } = await api('POST', '/campaigns', {
    name: `Runtime Verify Campaign ${Date.now()}`,
    channel: 'EMAIL',
    audience: 'ALL_CUSTOMERS',
    status: 'DRAFT',
    subject: 'Test',
    body: 'Runtime verification campaign',
  });
  if (json.success && json.data?.id) {
    pass('11. Campaign Creation', route, `campaignId=${json.data.id}`);
  } else {
    fail('11. Campaign Creation', route, json.error?.message ?? `HTTP ${status}`, json.error?.code ?? 'Campaign create failed', 'Check campaigns.write permission');
  }
}

// 12. Referral Creation
async function testReferralCreation() {
  const route = 'POST /referrals';
  const phone = `7${String(Date.now()).slice(-9)}`;
  const body = {
    referrerName: 'Runtime Referrer',
    refereeName: 'Runtime Referee',
    refereePhone: phone,
    referralTypeCode: 'CUSTOMER_TO_CUSTOMER',
  };
  if (!ctx.ids.referralTypeId) {
    body.referralTypeCode = 'CUSTOMER_TO_CUSTOMER';
  } else {
    body.referralTypeId = ctx.ids.referralTypeId;
    delete body.referralTypeCode;
  }
  const { status, json } = await api('POST', '/referrals', body);
  if (json.success && json.data?.id) {
    ctx.ids.referralId = json.data.id;
    pass('12. Referral Creation', route, `referralId=${json.data.id}`);
  } else {
    fail('12. Referral Creation', route, json.error?.message ?? `HTTP ${status}`, json.error?.code ?? 'Referral create failed', 'Check referral-types seed and referrals.write permission');
  }
}

// 13. Commission Flow
async function testCommissionFlow() {
  const route = 'POST /commission-ledger/calculate';
  if (!ctx.ids.partnerId) {
    fail('13. Commission Flow', route, 'No partner in DB', 'DSA partner seed missing', 'Run pnpm db:seed (demo DSA partner)');
    return;
  }
  const calc = await api('POST', '/commission-ledger/calculate', {
    partnerId: ctx.ids.partnerId,
    commissionType: 'LEAD_GENERATION',
    baseAmount: 100000,
    leadId: ctx.ids.leadId,
    notes: 'Runtime verification',
  });
  if (!calc.json.success) {
    fail('13. Commission Flow', route, calc.json.error?.message ?? `HTTP ${calc.status}`, calc.json.error?.code ?? 'Commission calc failed', 'Check commission rules seed');
    return;
  }
  const analytics = await api('GET', '/commission-analytics');
  if (analytics.json.success) {
    pass('13. Commission Flow', `${route} → GET /commission-analytics`, 'calculate + analytics OK');
  } else {
    fail('13. Commission Flow', 'GET /commission-analytics', analytics.json.error?.message ?? 'Analytics failed', 'Commission calculated but analytics failed', 'Check commission-analytics service');
  }
}

// 14. User Management
async function testUserManagement() {
  const listRoute = 'GET /users';
  const list = await api('GET', '/users?limit=5');
  if (!list.json.success) {
    fail('14. User Management', listRoute, list.json.error?.message ?? `HTTP ${list.status}`, 'User list failed', 'Check users.read:all permission');
    return;
  }
  const phone = `6${String(Date.now()).slice(-9)}`;
  const createRoute = 'POST /users';
  const created = await api('POST', '/users', { userType: 'EMPLOYEE', phone, email: `emp.${Date.now()}@kuberone.com`, status: 'ACTIVE' });
  if (created.json.success && created.json.data?.id) {
    pass('14. User Management', `${listRoute} → ${createRoute}`, `users=${list.json.meta?.total ?? list.json.data?.length}, created=${created.json.data.id}`);
  } else {
    fail('14. User Management', createRoute, created.json.error?.message ?? `HTTP ${created.status}`, created.json.error?.code ?? 'User create failed', 'Check users.create:all permission');
  }
}

// 15. Settings Page
async function testSettingsPage() {
  const listRoute = 'GET /settings';
  const list = await api('GET', '/settings?limit=5');
  if (!list.json.success || !list.json.data?.length) {
    fail('15. Settings Page', listRoute, list.json.error?.message ?? 'No settings found', 'Settings seed missing', 'Run pnpm db:seed (system-settings)');
    return;
  }
  const key = list.json.data[0].key ?? list.json.data[0].settingKey;
  const patchRoute = `PATCH /settings/${key}`;
  const original = list.json.data[0].value;
  const patched = await api('PATCH', `/settings/${key}`, { value: original });
  if (patched.json.success) {
    pass('15. Settings Page', `${listRoute} → ${patchRoute}`, `key=${key}`);
  } else {
    fail('15. Settings Page', patchRoute, patched.json.error?.message ?? `HTTP ${patched.status}`, patched.json.error?.code ?? 'Settings update failed', 'Check settings.write permission');
  }
}

// 16. Customer Mobile Login
async function testCustomerMobileLogin() {
  const sendRoute = 'POST /auth/send-otp';
  const verifyRoute = 'POST /auth/verify-otp';
  const send = await api('POST', '/auth/send-otp', { phone: CUSTOMER_PHONE, purpose: 'LOGIN' }, null);
  if (!send.json.success) {
    fail('16. Customer Mobile Login', sendRoute, send.json.error?.message ?? `HTTP ${send.status}`, send.json.error?.code ?? 'OTP send failed', 'Verify demo customer seed (9876543210)');
    return;
  }
  const verify = await api('POST', '/auth/verify-otp', {
    phone: CUSTOMER_PHONE,
    otp: DEV_OTP,
    purpose: 'LOGIN',
    device: { deviceId: 'mobile-customer-verify', platform: 'ANDROID' },
  }, null);
  if (verify.json.success && verify.json.data?.accessToken) {
    pass('16. Customer Mobile Login', `${sendRoute} → ${verifyRoute}`, 'OTP login OK');
  } else {
    fail('16. Customer Mobile Login', verifyRoute, verify.json.error?.message ?? `HTTP ${verify.status}`, verify.json.error?.code ?? 'OTP verify failed', 'Dev OTP is 123456 when APP_ENV!=production; seed demo customer');
  }
}

// 17. DSA Mobile Login
async function testDsaMobileLogin() {
  const sendRoute = 'POST /auth/send-otp';
  const verifyRoute = 'POST /auth/verify-otp';
  const send = await api('POST', '/auth/send-otp', { phone: DSA_PHONE, purpose: 'LOGIN' }, null);
  if (!send.json.success) {
    fail('17. DSA Mobile Login', sendRoute, send.json.error?.message ?? `HTTP ${send.status}`, send.json.error?.code ?? 'OTP send failed', 'Verify demo DSA seed (8888777766)');
    return;
  }
  const verify = await api('POST', '/auth/verify-otp', {
    phone: DSA_PHONE,
    otp: DEV_OTP,
    purpose: 'LOGIN',
    device: { deviceId: 'mobile-dsa-verify', platform: 'ANDROID' },
  }, null);
  if (verify.json.success && verify.json.data?.accessToken) {
    pass('17. DSA Mobile Login', `${sendRoute} → ${verifyRoute}`, 'OTP login OK');
  } else {
    fail('17. DSA Mobile Login', verifyRoute, verify.json.error?.message ?? `HTTP ${verify.status}`, verify.json.error?.code ?? 'OTP verify failed', 'Dev OTP is 123456; seed demo DSA partner');
  }
}

async function main() {
  console.log(`\n🔍 KuberOne Runtime Verification\nBase: ${BASE}\n${'─'.repeat(60)}\n`);

  try {
    await testCrmLogin();
    if (!ctx.token) {
      console.error('Cannot continue without CRM login token.');
      printResults();
      process.exit(1);
    }
    await loadPrerequisites();
    await testLeadCreation();
    await testCustomerCreation();
    await testKycFlow();
    await testApplicationCreation();
    await testDocumentUpload();
    await testEligibilityCalculator();
    await testEmiCalculator();
    await testVoiceAi();
    await testAiCopilot();
    await testCampaignCreation();
    await testReferralCreation();
    await testCommissionFlow();
    await testUserManagement();
    await testSettingsPage();
    await testCustomerMobileLogin();
    await testDsaMobileLogin();
  } catch (err) {
    console.error('Fatal:', err.message);
  }

  printResults();
  const passed = results.filter((r) => r.status === 'PASS').length;
  const score = Math.round((passed / 17) * 100);
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`FUNCTIONAL READINESS SCORE: ${score}% (${passed}/17 PASS)`);
  console.log(`${'═'.repeat(60)}\n`);
  process.exit(passed === 17 ? 0 : 1);
}

function printResults() {
  for (const r of results) {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.module}: ${r.status}`);
    console.log(`   Route: ${r.route}`);
    if (r.detail) console.log(`   Detail: ${r.detail}`);
    if (r.error) console.log(`   Error: ${r.error}`);
    if (r.rootCause) console.log(`   Root Cause: ${r.rootCause}`);
    if (r.fix) console.log(`   Fix: ${r.fix}`);
    console.log('');
  }
}

main();
