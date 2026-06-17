export function createMobileApiHandlers() {
  const handlers = new Map<string, unknown>();

  return {
    set(path: string, response: unknown) {
      handlers.set(path, response);
    },
    get(path: string) {
      return handlers.get(path);
    },
    clear() {
      handlers.clear();
    },
    axiosAdapter: async (config: { url?: string; method?: string }) => {
      const key = `${(config.method ?? 'get').toLowerCase()}:${config.url ?? ''}`;
      const data = handlers.get(key);
      if (data instanceof Error) throw data;
      if (data === undefined) {
        const err = new Error(`No mock for ${key}`) as Error & { response?: { status: number } };
        err.response = { status: 404 };
        throw err;
      }
      return { data: { success: true, data } };
    },
  };
}

export function createNotificationMock() {
  const listeners: Array<(payload: unknown) => void> = [];
  return {
    requestPermission: async () => 'granted' as const,
    getDevicePushToken: async () => 'expo-push-token-test',
    addNotificationReceivedListener: (cb: (payload: unknown) => void) => {
      listeners.push(cb);
      return { remove: () => {} };
    },
    emitForeground(payload: unknown) {
      listeners.forEach((cb) => cb(payload));
    },
  };
}

export function createOpenAiMock(responseText = 'AI mock response') {
  return {
    chat: {
      completions: {
        create: async () => ({
          choices: [{ message: { content: responseText } }],
        }),
      },
    },
  };
}

export function createNetInfoMock(connected = true) {
  return {
    addEventListener: (cb: (state: { isConnected: boolean; isInternetReachable: boolean }) => void) => {
      cb({ isConnected: connected, isInternetReachable: connected });
      return () => {};
    },
    fetch: async () => ({ isConnected: connected, isInternetReachable: connected }),
  };
}
