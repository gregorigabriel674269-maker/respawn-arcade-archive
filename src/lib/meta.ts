import { GAMES, scoreOf, verificationOf, type AuditStatus, type Game } from "@/lib/catalog";
import { classify, normalize, type DurationBand, type Perf, type Platform, type TagId } from "@/lib/classify";
import { coverImageOf } from "@/lib/game-covers";
import { applyCatalogOverrides,addedCatalogGames,getCatalogOverrides } from '@/lib/catalog-overrides';

export type Enriched = Game & {
  score: number | null;
  platform: Platform;
  perf: Perf;
  duration: DurationBand;
  minuteFit: 5 | 10 | 15 | null;
  tags: TagId[];
  devices: {
    web: boolean;
    chromebook: boolean;
    linux: boolean;
    keyboard: boolean;
    gamepad: boolean;
  };
  haystack: string;
  audit: AuditStatus;
  image: string | null;
  checkedAt: string | null;
  auditNote: string;
};

export const TAG_LABEL: Record<TagId, string> = {
  retro: "Retrô",
  rapido: "Rápido",
  leve: "Leve",
  multiplayer: "Multiplayer",
  terror: "Terror",
  classico: "Clássico",
  pc: "PC",
  mobile: "Mobile",
};

function enrichGame(game:Game):Enriched {
  const score = scoreOf(game.name);
  const meta = classify({ ...game, score });
  const verification = verificationOf(game.name);
  return {
    ...game,
    score,
    platform: meta.platform,
    perf: meta.perf,
    duration: meta.duration,
    minuteFit: meta.minuteFit,
    tags: meta.tags,
    devices: meta.devices,
    haystack: `${normalize(game.name)} ${normalize(meta.searchExtra)}`,
    audit: verification?.status ?? "unknown",
    image: coverImageOf(game.name),
    checkedAt: verification?.lastChecked ?? null,
    auditNote: verification?.failureReason || verification?.verificationNotes || "",
  };
}
export const LIBRARY: Enriched[] = GAMES.map(enrichGame);

const BY_NAME = new Map(LIBRARY.map((game) => [game.name, game]));

export function enrich(name: string): Enriched | null {
  const overrides=getCatalogOverrides();
  const original=BY_NAME.get(name);
  if(original)return applyCatalogOverrides([original],overrides)[0] ?? null;
  const added=addedCatalogGames(GAMES,overrides).find(g=>g.name===name);
  return added?enrichGame(added):null;
}

export type SortMode = "pop" | "az" | "recent" | "random";
export type DeviceFilter = "todos" | "chromebook" | "linux" | "web" | "keyboard" | "gamepad";

export type GameQuery = {
  text: string;
  category: string;
  platform: Platform | "Todos";
  sort: SortMode;
  perf: Perf | "todos";
  duration: DurationBand | "todos";
  minute: 5 | 10 | 15 | null;
  tags: TagId[];
  device: DeviceFilter;
  favoritesOnly: boolean;
  favorites: string[];
  onlyNames: string[] | null;
  school: boolean;
};

export function playable(game: Enriched): boolean {
  return Boolean(game.url) && game.audit !== "down" && game.audit !== "copyright";
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(/[^a-z0-9+]+/)
    .filter((token) => token.length > 1);
}

function distance(a: string, b: string): number {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const next = a[i - 1] === b[j - 1] ? prev : Math.min(prev, row[j], row[j - 1]) + 1;
      prev = row[j];
      row[j] = next;
    }
  }
  return row[b.length] ?? 2;
}

export function matchesText(game: Enriched, text: string): boolean {
  const query = normalize(text).trim();
  if (!query) return true;
  const words = game.haystack.split(" ").filter(Boolean);
  if (query.length < 3) return words.some((word) => word === query || word.startsWith(query));
  if (game.haystack.includes(query)) return true;
  const parts = tokens(query);
  if (parts.length === 0) return false;
  const direct = parts.every((part) => words.some((word) => word.includes(part)));
  if (direct) return true;
  return parts.every((part) => words.some((word) => distance(part, word) <= 1));
}

function perfRank(perf: Perf): number {
  if (perf === "leve") return 0;
  if (perf === "medio") return 1;
  return 2;
}

export function queryGames(query: GameQuery): Enriched[] {
  const overrides=getCatalogOverrides();
  let list = [...applyCatalogOverrides(LIBRARY,overrides),...addedCatalogGames(GAMES,overrides).map(enrichGame)].filter((game) => playable(game));
  if (query.onlyNames) {
    const allowed = new Set(query.onlyNames);
    list = query.onlyNames.flatMap((name) => {
      const game = enrich(name);
      return game && allowed.has(name) && playable(game) ? [game] : [];
    });
    list = list.filter((game) => matchesText(game, query.text));
  }
  if (query.favoritesOnly) list = list.filter((game) => query.favorites.includes(game.name));
  if (query.category !== "Todos") list = list.filter((game) => game.category === query.category);
  if (query.platform !== "Todos") list = list.filter((game) => game.platform === query.platform);
  if (query.perf !== "todos") list = list.filter((game) => game.perf === query.perf);
  if (query.duration !== "todos") list = list.filter((game) => game.duration === query.duration);
  if (query.minute === 5) list = list.filter((game) => game.minuteFit === 5);
  else if (query.minute === 10) list = list.filter((game) => game.minuteFit === 5 || game.minuteFit === 10);
  else if (query.minute === 15) list = list.filter((game) => game.minuteFit != null);
  if (query.tags.length) list = list.filter((game) => query.tags.every((tag) => game.tags.includes(tag)));
  if (query.device === "chromebook") list = list.filter((game) => game.devices.chromebook);
  else if (query.device === "linux") list = list.filter((game) => game.devices.linux);
  else if (query.device === "web") list = list.filter((game) => game.devices.web);
  else if (query.device === "keyboard") list = list.filter((game) => game.devices.keyboard);
  else if (query.device === "gamepad") list = list.filter((game) => game.devices.gamepad);
  if (!query.onlyNames) list = list.filter((game) => matchesText(game, query.text));

  if (query.onlyNames && query.sort === "pop") return list;

  const seed = query.text || "respawn";
  if (query.sort === "az") list.sort((a, b) => a.name.localeCompare(b.name, "pt"));
  else if (query.sort === "recent") list.sort((a, b) => b.index - a.index);
  else if (query.sort === "random") list.sort((a, b) => hash(a.name + seed) - hash(b.name + seed));
  else {
    list.sort((a, b) => {
      if (query.school) {
        const perf = perfRank(a.perf) - perfRank(b.perf);
        if (perf !== 0) return perf;
      }
      return (b.score ?? -1) - (a.score ?? -1) || a.index - b.index;
    });
  }
  return list;
}

export function suggestGames(text: string, limit = 6): Enriched[] {
  const query = text.trim();
  if (query.length < 2) return [];
  return LIBRARY.filter((game) => playable(game) && matchesText(game, query)).slice(0, limit);
}

function hash(value: string): number {
  let h = 2166136261;
  for (const char of value) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function weekKey(date = new Date()): number {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return utc.getUTCFullYear() * 100 + week;
}

export function gameOfWeek(date = new Date()): Enriched | null {
  const ranked = LIBRARY.filter((game) => playable(game) && game.score != null).sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0) || a.name.localeCompare(b.name),
  );
  const withArt = ranked.filter((game) => game.audit === "ok" && game.image);
  const confirmed = ranked.filter((game) => game.audit === "ok");
  const pool = (withArt.length >= 8 ? withArt : confirmed.length >= 8 ? confirmed : ranked).slice(0, 20);
  if (pool.length === 0) return null;
  return pool[weekKey(date) % pool.length] ?? null;
}

export function unavailableGames(): Enriched[] {
  return LIBRARY.filter((game) => !playable(game));
}

export function pickSurprise(pool: Enriched[], lastName: string | null, playedToday: string[]): Enriched | null {
  if (pool.length === 0) return null;
  let choices = lastName ? pool.filter((game) => game.name !== lastName) : pool.slice();
  if (choices.length === 0) choices = pool.slice();
  const today = new Set(playedToday);
  const fresh = choices.filter((game) => !today.has(game.name));
  const source = fresh.length > 0 ? fresh : choices;
  const index = Math.floor(Math.random() * source.length);
  return source[index] ?? null;
}

export function startOfToday(now = Date.now()): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
