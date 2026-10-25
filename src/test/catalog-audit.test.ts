import { describe, expect, it } from 'vitest';
import games from '@/data/games.json';
import removed from '@/data/removed-games.json';
import { GAMES, findGame, verificationOf } from '@/lib/catalog';
import { catalogEligible } from '@/lib/catalog-eligibility';
import { queryGames, type GameQuery } from '@/lib/meta';
import { GAME_SANDBOX } from '@/lib/player-safety';

describe('Reported catalog and sandbox rules', () => {
  it('removes only the empty GTA duplicate and preserves the canonical record', () => {
    expect(games.some(g => g.name === 'GTA 5')).toBe(false);
    expect(findGame('GTA 5')).toBeNull();
    expect(findGame('Grand Theft Auto V')?.url).toBe('https://fiveplay.lol');
    expect(removed.find(g => g.name === 'GTA 5')?.status).toBe('down');
  });
  it('records unverified availability instead of inventing successful checks', () => {
    expect(GAMES).toHaveLength(545);
    for (const game of GAMES) {
      expect(verificationOf(game.name)?.status).toBe('unknown');
      expect(verificationOf(game.name)?.httpStatus).toBeNull();
    }
  });
  it('excludes empty, unavailable and removed records', () => {
    const game = { name: 'Sample', url: 'https://example.com' };
    expect(catalogEligible({ ...game, url: '' }, {}, [])).toBe(false);
    expect(catalogEligible(game, { Sample: { status: 'down' } }, [])).toBe(false);
    expect(catalogEligible(game, {}, [{ name: 'Sample', status: 'copyright' }])).toBe(false);
    expect(catalogEligible(game, {}, [])).toBe(true);
  });
  it('applies every selected tag and restores results when tags clear', () => {
    const query: GameQuery = { text: '', category: 'Todos', platform: 'Todos', sort: 'pop', perf: 'todos', duration: 'todos', minute: null, tags: [], device: 'todos', favoritesOnly: false, favorites: [], onlyNames: null, school: false };
    const all = queryGames(query);
    const filtered = queryGames({ ...query, tags: ['retro', 'leve'] });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(all.length);
    expect(filtered.every(g => g.tags.includes('retro') && g.tags.includes('leve'))).toBe(true);
    expect(queryGames({ ...query, tags: [] }).length).toBe(all.length);
  });
  it('does not grant scripts same-origin access', () => {
    expect(GAME_SANDBOX.split(' ')).toContain('allow-scripts');
    expect(GAME_SANDBOX.split(' ')).not.toContain('allow-same-origin');
  });
});