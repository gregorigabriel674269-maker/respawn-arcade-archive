// Opaque-origin sandboxing also protects the app if an external game redirects here.
export const GAME_SANDBOX = 'allow-scripts allow-pointer-lock';
export const PLAYER_LOAD_TIMEOUT_MS = 8000;

export function safeGameUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (typeof window !== 'undefined' && url.origin === window.location.origin) return null;
    return url.href;
  } catch {
    return null;
  }
}
