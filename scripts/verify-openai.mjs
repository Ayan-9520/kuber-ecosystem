#!/usr/bin/env node
/**
 * Verify OpenAI-backed AI modules (no secret output).
 * Usage: node scripts/verify-openai.mjs [--base http://localhost:4000/api/v1]
 */
const BASE = process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : 'http://localhost:4000/api/v1';

const results = [];

function row(module, status, route, detail) {
  results.push({ module, status, route, detail });
}

async function api(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({ success: false }));
  return { status: res.status, json };
}

async function main() {
  console.log('\nOpenAI Module Verification\n' + '─'.repeat(50));

  const login = await api('POST', '/auth/login', {
    loginType: 'employee',
    email: 'admin@kuberone.com',
    password: 'Admin@123',
    device: { deviceId: 'openai-verify', platform: 'WEB' },
  });
  if (!login.json.success) {
    console.error('Login failed — cannot verify AI modules');
    process.exit(1);
  }
  const token = login.json.data.accessToken;

  // Platform health
  const platform = await api('GET', '/ai/platform/health', undefined, token);
  const openaiOn = platform.json.data?.openaiConfigured === true;
  const completionOn = platform.json.data?.completionAvailable === true;
  console.log(`OpenAI configured: ${openaiOn ? 'yes' : 'no'}`);
  console.log(`Completion available: ${completionOn ? 'yes' : 'no'}\n`);

  // 1. AI Advisor
  const advisorHealth = await api('GET', '/ai/advisor/health', undefined, token);
  const advisorChat = await api('POST', '/ai/chat', {
    message: 'What is a home loan?',
    language: 'en',
  }, token);
  const advisorProvider = advisorChat.json.data?.provider ?? advisorChat.json.data?.source;
  if (advisorHealth.json.success && advisorChat.json.success) {
    row('AI Advisor', openaiOn && advisorProvider === 'openai' ? 'PASS' : 'PASS (degraded)', 'POST /ai/chat', `provider=${advisorProvider ?? 'unknown'}`);
  } else {
    row('AI Advisor', 'FAIL', 'POST /ai/chat', advisorChat.json.error?.message ?? 'chat failed');
  }

  // 2. Voice AI
  const voiceHealth = await api('GET', '/ai/voice/health', undefined, token);
  const session = await api('POST', '/ai/voice/sessions', { language: 'en' }, token);
  let voiceStatus = 'FAIL';
  let voiceDetail = voiceHealth.json.error?.message ?? 'session failed';
  if (session.json.success && session.json.data?.id) {
    const msg = await api('POST', `/ai/voice/sessions/${session.json.data.id}/message`, {
      text: 'Explain EMI in one sentence.',
    }, token);
    if (msg.json.success) {
      voiceStatus = openaiOn ? 'PASS' : 'PASS (degraded)';
      voiceDetail = `provider=${msg.json.data?.provider ?? 'rules'}`;
    } else {
      voiceDetail = msg.json.error?.message ?? 'message failed';
    }
  }
  row('Voice AI', voiceStatus, 'POST /ai/voice/sessions → message', voiceDetail);

  // 3. RAG Embeddings
  const ragHealth = await api('GET', '/rag/health', undefined, token);
  const ragQuery = await api('POST', '/rag/query', {
    q: 'home loan eligibility documents',
    generateAnswer: true,
    topK: 3,
  }, token);
  if (ragHealth.json.success && ragQuery.json.success) {
    const embed = platform.json.data?.embeddingProvider ?? 'unknown';
    row('RAG Embeddings', embed === 'OPENAI' || embed === 'openai' ? 'PASS' : 'PASS (local_hash)', 'POST /rag/query', `embedding=${embed}`);
  } else {
    row('RAG Embeddings', 'FAIL', 'POST /rag/query', ragQuery.json.error?.message ?? 'query failed');
  }

  // 4. Content Generation
  const contentGen = await api('POST', '/content/generate', {
    contentType: 'SMS',
    prompt: 'Welcome message for new home loan lead',
    variantCount: 1,
    ragEnabled: false,
    async: false,
  }, token);
  if (contentGen.json.success) {
    row('Content Generation', completionOn ? 'PASS' : 'FAIL', 'POST /content/generate', completionOn ? 'LLM body generated' : 'completionService unavailable — set OPENAI_API_KEY');
  } else {
    row('Content Generation', 'FAIL', 'POST /content/generate', contentGen.json.error?.message ?? 'generate failed');
  }

  // 5. AI Copilot
  const copilotHealth = await api('GET', '/ai-copilot/health', undefined, token);
  const leads = await api('GET', '/leads?limit=1', undefined, token);
  const leadId = leads.json.data?.[0]?.id;
  if (leadId && copilotHealth.json.success) {
    const analyze = await api('GET', `/ai-copilot/lead/${leadId}`, undefined, token);
    if (analyze.json.success) {
      const mode = analyze.json.data?.provider ?? analyze.json.data?.source ?? 'analysis';
      row('AI Copilot', analyze.json.success ? (completionOn ? 'PASS' : 'PASS (degraded)') : 'FAIL', `GET /ai-copilot/lead/${leadId}`, `mode=${mode}`);
    } else {
      row('AI Copilot', 'FAIL', `GET /ai-copilot/lead/${leadId}`, analyze.json.error?.message);
    }
  } else {
    row('AI Copilot', 'FAIL', 'GET /ai-copilot/lead/:id', 'no lead or health check failed');
  }

  // Deployment readiness
  const readiness = await api('GET', '/monitoring/deployment-readiness', undefined, token);
  const openaiSecret = readiness.json.data?.infrastructure?.openai;
  row('Startup / Readiness', openaiSecret?.configured ? 'PASS' : 'FAIL', 'GET /monitoring/deployment-readiness', `openai.status=${openaiSecret?.status ?? 'unknown'}`);

  for (const r of results) {
    const icon = r.status.startsWith('PASS') ? '✅' : '❌';
    console.log(`${icon} ${r.module}: ${r.status}`);
    console.log(`   Route: ${r.route}`);
    console.log(`   ${r.detail}\n`);
  }

  const pass = results.filter((r) => r.status.startsWith('PASS')).length;
  console.log('─'.repeat(50));
  console.log(`AI Readiness: ${pass}/${results.length} checks passed\n`);
  process.exit(pass === results.length && openaiOn ? 0 : 1);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
