import coversJson from '@/data/game-covers.json';

export type GameCover = {
  gameName: string;
  rank: number;
  image: string | null;
  status: string;
  source: string | null;
  credit: string | null;
};

const covers = new Map<string, GameCover>((coversJson as GameCover[]).map((cover) => [cover.gameName, cover]));

// Exact names only: aliases search games, never guess cover identities.
export function coverOf(gameName: string): GameCover | null {
  return covers.get(gameName) ?? null;
}

export function coverImageOf(gameName: string): string | null {
  const cover = coverOf(gameName);
  return cover?.status === 'ready' && cover.image?.startsWith('/covers/') ? cover.image : null;
}

export function coverAttemptUrl(image: string, attempt: number): string | null {
  if (attempt > 1 || attempt < 0) return null;
  return attempt === 1 ? `${image}${image.includes('?') ? '&' : '?'}respawn-retry=1` : image;
}