import { describe, expect, it } from 'vitest';
import manifest from '@/data/game-covers.json';
import { GAMES, verificationOf } from '@/lib/catalog';
import { coverAttemptUrl, coverImageOf, coverOf } from '@/lib/game-covers';
import { enrich, matchesText, queryGames } from '@/lib/meta';

describe('Original cover identity', () => {
  it('selects exactly 200 unique real games with consecutive ranks', () => {
    expect(manifest).toHaveLength(200);
    expect(new Set(manifest.map((g) => g.gameName)).size).toBe(200);
    expect(manifest.map((g) => g.rank)).toEqual(Array.from({ length: 200 }, (_, i) => i + 1));
    for (const cover of manifest) expect(GAMES.some((g) => g.name === cover.gameName)).toBe(true);
  });
  it('never includes confirmed unavailable or copyright-removed games', () => {
    for (const cover of manifest) expect(['down', 'copyright']).not.toContain(verificationOf(cover.gameName)?.status);
  });
  it('resolves only exact titles and uses the same record for enriched games', () => {
    const ready = manifest.find((g) => g.status === 'ready');
    expect(ready).toBeDefined();
    if (!ready) throw new Error('No original covers found');
    expect(coverImageOf(ready.gameName)).toBe(ready.image);
    expect(enrich(ready.gameName)?.image).toBe(ready.image);
    expect(coverOf('cod')).toBeNull();
    expect(coverImageOf('A game not in the actual catalog')).toBeNull();
  });
  it('retries exactly once before returning the gradient fallback', () => {
    expect(coverAttemptUrl('/covers/test.webp', 0)).toBe('/covers/test.webp');
    expect(coverAttemptUrl('/covers/test.webp', 1)).toBe('/covers/test.webp?respawn-retry=1');
    expect(coverAttemptUrl('/covers/test.webp', 2)).toBeNull();
    expect(coverAttemptUrl('/covers/test.webp', 3)).toBeNull();
  });
  it('keeps aliases, favorites and history attached to exact catalog identities', () => {
    const game = enrich('Call of Duty: Black Ops 2');
    expect(game).not.toBeNull();
    if (!game) throw new Error('Real game missing');
    expect(matchesText(game, 'cod')).toBe(true);
    const base = { text: 'cod', category: 'Todos', platform: 'Todos' as const, sort: 'pop' as const, perf: 'todos' as const, duration: 'todos' as const, minute: null, tags: [], device: 'todos' as const, favorites: [game.name], favoritesOnly: true, onlyNames: null, school: false };
    expect(queryGames(base).map((g) => g.name)).toEqual([game.name]);
    expect(queryGames({ ...base, favoritesOnly: false, onlyNames: [game.name] })[0]?.image).toBe(coverImageOf(game.name));
  });
});