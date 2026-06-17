import { createOpenAiMock, openAiMockResponses } from '@kuberone/test-utils';

describe('OpenAI mock layer', () => {
  const openai = createOpenAiMock();

  it('returns advisor chat completion', async () => {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Recommend a loan' }],
    });
    expect(res.choices[0]!.message.content).toContain('Mock AI advisor');
  });

  it('returns embeddings for RAG', async () => {
    const res = await openai.embeddings.create({ model: 'text-embedding-3-small', input: 'loan' });
    expect(res.data[0]!.embedding).toHaveLength(8);
  });

  it('returns voice transcription', async () => {
    const res = await openai.audio.transcriptions.create({} as never);
    expect(res.text).toBe('mock transcription');
  });

  it('exposes canned AI responses', () => {
    expect(openAiMockResponses.leadScore.grade).toBe('HOT');
    expect(openAiMockResponses.recommendation.confidence).toBeGreaterThan(0.8);
  });
});
