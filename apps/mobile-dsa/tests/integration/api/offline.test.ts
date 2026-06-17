import { createNetInfoMock } from '@kuberone/mobile-testing';

describe('DSA offline mode', () => {
  it('detects offline state', async () => {
    const net = createNetInfoMock(false);
    expect((await net.fetch()).isConnected).toBe(false);
  });
});
