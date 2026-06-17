import { getAgent, API } from '../helpers/api.js';
import { loginAsAdmin } from '../helpers/auth.js';
import { findSeedIds } from '../helpers/db.js';
import { markFlow } from '../helpers/flow-coverage.js';

describe('AI integration flows', () => {
  it('exercises advisor, voice AI, lead scoring, recommendations, knowledge, and RAG', async () => {
    const agent = await getAgent();
    const admin = await loginAsAdmin(agent);
    const seeds = await findSeedIds();

    const advisorHealth = await agent
      .get(`${API}/ai/advisor/health`)
      .set('Authorization', admin.authorization);
    expect(advisorHealth.status).toBe(200);

    const chatRes = await agent
      .post(`${API}/ai/chat`)
      .set('Authorization', admin.authorization)
      .send({ message: 'What is the home loan eligibility criteria?' });
    expect([200, 201]).toContain(chatRes.status);
    markFlow('ai.advisor');
    markFlow('ai.openai-layer');

    const voiceSession = await agent
      .post(`${API}/ai/voice/sessions`)
      .set('Authorization', admin.authorization)
      .send({ language: 'en' });
    expect([200, 201]).toContain(voiceSession.status);
    markFlow('ai.voice');

    const leads = await agent
      .get(`${API}/leads`)
      .set('Authorization', admin.authorization)
      .query({ page: 1, limit: 1 });
    expect(leads.status).toBe(200);
    const leadItems = (Array.isArray(leads.body.data) ? leads.body.data : leads.body.data?.items) as
      | Array<{ id: string }>
      | undefined;
    const leadId = leadItems?.[0]?.id;
    if (leadId) {
      const scoringRes = await agent
        .get(`${API}/lead-scoring/calculate/${leadId}`)
        .set('Authorization', admin.authorization);
      expect([200, 201]).toContain(scoringRes.status);
      markFlow('ai.lead-scoring');
    }

    const recHealth = await agent
      .get(`${API}/recommendations/health`)
      .set('Authorization', admin.authorization);
    expect(recHealth.status).toBe(200);
    markFlow('ai.recommendations');

    const kbRes = await agent
      .get(`${API}/knowledge/articles`)
      .set('Authorization', admin.authorization)
      .query({ page: 1, limit: 5 });
    expect(kbRes.status).toBe(200);
    markFlow('ai.knowledge');

    const ragHealth = await agent.get(`${API}/rag/health`).set('Authorization', admin.authorization);
    expect(ragHealth.status).toBe(200);

    const ragQuery = await agent
      .post(`${API}/rag/query`)
      .set('Authorization', admin.authorization)
      .send({ q: 'home loan eligibility', topK: 3 });
    expect([200, 201]).toContain(ragQuery.status);
    markFlow('ai.rag');
  });
});
