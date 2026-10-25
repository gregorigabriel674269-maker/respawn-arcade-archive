import { createServerFn } from "@tanstack/react-start";
import { GAMES, scoreOf } from "@/lib/catalog";

export type ProbeStatus = "ok" | "problem" | "down" | "unknown";

export type ProbeResult = {
  name: string;
  status: ProbeStatus;
  ms: number | null;
  checkedAt: string;
};

const TTL = 12 * 60 * 60 * 1000;
let memory: { at: number; results: ProbeResult[] } | null = null;

async function probe(url: string): Promise<{ status: ProbeStatus; ms: number | null }> {
  const started = Date.now();
  const signal = AbortSignal.timeout(4500);
  try {
    let response = await fetch(url, { method: "HEAD", redirect: "follow", signal, headers: { accept: "text/html" } });
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, { method: "GET", redirect: "follow", signal, headers: { accept: "text/html" } });
    }
    const ms = Date.now() - started;
    if (response.status === 404 || response.status === 410) return { status: "down", ms };
    if (response.ok || (response.status >= 300 && response.status < 400)) return { status: "ok", ms };
    if (response.status === 401 || response.status === 403) return { status: "unknown", ms };
    return { status: "problem", ms };
  } catch {
    return { status: "unknown", ms: null };
  }
}

export const checkHighlights = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (memory && now - memory.at < TTL) {
    return { checkedAt: new Date(memory.at).toISOString(), results: memory.results, cached: true };
  }
  const ranked = GAMES.filter((game) => game.url && scoreOf(game.name) != null).sort(
    (a, b) => (scoreOf(b.name) ?? 0) - (scoreOf(a.name) ?? 0) || a.name.localeCompare(b.name),
  );
  const featured = GAMES.filter((game) => game.featured && game.url && !ranked.slice(0, 8).some((item) => item.name === game.name));
  const targets = [...ranked.slice(0, 8), ...featured].slice(0, 12);
  const checkedAt = new Date().toISOString();
  const results: ProbeResult[] = [];
  for (let index = 0; index < targets.length; index += 3) {
    const batch = targets.slice(index, index + 3);
    const part = await Promise.all(
      batch.map(async (game) => {
        const result = await probe(game.url);
        return { name: game.name, status: result.status, ms: result.ms, checkedAt };
      }),
    );
    results.push(...part);
  }
  memory = { at: now, results };
  return { checkedAt, results, cached: false };
});

const CACHE_KEY = "respawn-status-v1";

export function readStatusMap(): Record<string, ProbeResult> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") as { byName?: Record<string, ProbeResult> };
    return parsed.byName ?? {};
  } catch {
    return {};
  }
}

export function scheduleHighlightCheck(onUpdate: (map: Record<string, ProbeResult>) => void) {
  const raw = localStorage.getItem(CACHE_KEY);
  let at = 0;
  try {
    const parsed = raw ? (JSON.parse(raw) as { at?: number; byName?: Record<string, ProbeResult> }) : {};
    at = parsed.at ?? 0;
    if (parsed.byName) onUpdate(parsed.byName);
  } catch {
    at = 0;
  }
  if (Date.now() - at < TTL) return;
  const run = () => {
    void checkHighlights()
      .then((result) => {
        const byName = Object.fromEntries(result.results.map((item) => [item.name, item]));
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), byName }));
        onUpdate(byName);
      })
      .catch(() => undefined);
  };
  const idle = window.requestIdleCallback;
  if (idle) idle(() => run(), { timeout: 5000 });
  else setTimeout(run, 1600);
}
