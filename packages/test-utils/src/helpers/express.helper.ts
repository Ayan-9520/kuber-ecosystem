type TestApp = {
  listen: (
    port: number,
    callback?: () => void,
  ) => {
    address: () => { port: number } | string | null;
    close: (callback: (err?: Error) => void) => void;
  };
};

export async function withTestServer(
  app: TestApp,
  fn: (baseUrl: string) => Promise<void>,
): Promise<void> {
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    await fn(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err?: Error) => (err ? reject(err) : resolve()));
    });
  }
}
