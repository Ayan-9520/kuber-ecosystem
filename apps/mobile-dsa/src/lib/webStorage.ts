/** Web-only storage access (Expo web) without requiring DOM lib in tsconfig. */
export function getWebLocalStorage(): { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void } | null {
  try {
    const storage = (globalThis as {
      localStorage?: { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void };
    }).localStorage;
    return storage ?? null;
  } catch {
    return null;
  }
}

export function getWebHostname(): string | undefined {
  return (globalThis as { location?: { hostname?: string } }).location?.hostname;
}
