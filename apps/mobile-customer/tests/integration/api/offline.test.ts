import { createNetInfoMock } from '@kuberone/mobile-testing';

describe('Customer offline mode', () => {
  it('detects offline network state', async () => {
    const netInfo = createNetInfoMock(false);
    const state = await netInfo.fetch();
    expect(state.isConnected).toBe(false);
  });

  it('detects online network state', async () => {
    const netInfo = createNetInfoMock(true);
    const state = await netInfo.fetch();
    expect(state.isConnected).toBe(true);
  });
});
