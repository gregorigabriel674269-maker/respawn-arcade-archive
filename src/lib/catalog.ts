import featuredJson from "@/data/featured.json";
import gamesJson from "@/data/games.json";
import scoresJson from "@/data/scores.json";
import verificationJson from "@/data/verification.json";
import removedJson from "@/data/removed-games.json";
import { catalogEligible } from "@/lib/catalog-eligibility";

export type Game = {
  name: string;
  category: string;
  host: string;
  url: string;
  index: number;
  featured: boolean;
};

export type AuditStatus = "ok" | "problem" | "down" | "copyright" | "unknown";

export type GameVerification = {
  status: AuditStatus;
  lastChecked: string;
  failureReason: string;
  verificationSource: string;
  verificationNotes: string;
  evidence: string;
  httpStatus: number | null;
  finalUrl: string;
  image: string | null;
};

const VERIFICATION = verificationJson as Record<string, GameVerification>;

export function verificationOf(name: string): GameVerification | null {
  return VERIFICATION[name] ?? null;
}

const ALL_GAMES = gamesJson as Game[];

export const GAMES = ALL_GAMES.filter((game) => catalogEligible(game, VERIFICATION, removedJson));
export const FEATURED_NAMES = featuredJson as string[];
const SCORES = scoresJson as Record<string, number>;

export const CATEGORIES = [
  "Todos",
  "Tiro",
  "Zumbis",
  "Corrida",
  "Esportes",
  "Luta",
  "Ação",
  "Aventura",
  "Estratégia",
  "Música",
  "Outros",
  "Plataforma",
  "RPG",
  "Puzzle",
  "Arcade",
  "Terror",
  "Casual",
  "Simulação",
] as const;

const GRADS = ["g-orange", "g-teal", "g-magenta", "g-blue", "g-violet", "g-red"] as const;

export type SortKey = "default" | "az" | "za" | "featured" | "recent";

export function scoreOf(name: string): number | null {
  const known = SCORES[name];
  return typeof known === "number" ? known : null;
}

export function gradClass(name: string): string {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return GRADS[hash % GRADS.length] ?? "g-violet";
}

export function filterGames(opts: {
  query: string;
  category: string;
  sort: SortKey;
  favoritesOnly: boolean;
  favorites: string[];
}): Game[] {
  let list = GAMES.slice();
  if (opts.favoritesOnly) list = list.filter((game) => opts.favorites.includes(game.name));
  if (opts.category !== "Todos") list = list.filter((game) => game.category === opts.category);
  const query = opts.query.trim().toLowerCase();
  if (query) list = list.filter((game) => game.name.toLowerCase().includes(query));

  if (opts.sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
  else if (opts.sort === "za") list.sort((a, b) => b.name.localeCompare(a.name));
  else if (opts.sort === "featured") {
    list.sort(
      (a, b) => Number(FEATURED_NAMES.includes(b.name)) - Number(FEATURED_NAMES.includes(a.name)),
    );
  } else if (opts.sort === "recent") list.sort((a, b) => b.index - a.index);
  else list.sort((a, b) => (scoreOf(b.name) ?? -1) - (scoreOf(a.name) ?? -1) || a.index - b.index);

  return list;
}

export const FEATURED_GAMES = GAMES.filter((game) => FEATURED_NAMES.includes(game.name));

export function findGame(name: string): Game | null {
  return GAMES.find((game) => game.name === name) ?? null;
}

export function controlHints(category: string): { keys: string; action: string }[] {
  if (["Tiro", "Terror", "Zumbis"].includes(category)) {
    return [
      { keys: "W A S D / ↑ ↓ ← →", action: "Movimento (padrão comum)" },
      { keys: "Mouse", action: "Câmera / mira" },
      { keys: "Clique", action: "Ação / disparo" },
    ];
  }
  if (category === "Corrida") {
    return [
      { keys: "↑ ↓ / W S", action: "Acelerar / frear (padrão comum)" },
      { keys: "← → / A D", action: "Direção" },
    ];
  }
  if (["Plataforma", "Ação", "Aventura", "Arcade"].includes(category)) {
    return [
      { keys: "↑ ↓ ← → / W A S D", action: "Movimento (padrão comum)" },
      { keys: "Espaço / Z", action: "Pulo / ação (varia por jogo)" },
    ];
  }
  return [{ keys: "Controles do jogo", action: "Consulte as opções da versão aberta" }];
}
