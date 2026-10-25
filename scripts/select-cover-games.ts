import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { classify } from '../src/lib/classify';

// An existing selection is never replaced. Scores are editorial, not telemetry.
if (!existsSync('src/data/game-covers.json')) {
  const read = (name: string) => JSON.parse(readFileSync(`src/data/${name}.json`, 'utf8'));
  const games = read('games');
  const scores = read('scores');
  const featured = new Set(read('featured'));
  const verification = read('verification');
  const removed = read('removed-games');
  const blocked = new Set(removed.filter((g: { status?: string }) => ['down', 'copyright'].includes(g.status ?? '')).map((g: { name: string }) => g.name));
  const ranked = games.filter((g: { name: string; url: string }) => g.url && !blocked.has(g.name) && !['down', 'copyright'].includes(verification[g.name]?.status)).map((g: { name: string; category: string; host: string; url: string; index: number }) => {
    const audit = verification[g.name]?.status ?? 'unknown';
    const meta = classify({ ...g, score: scores[g.name] ?? null });
    const points = (scores[g.name] ?? 0) * 10 + (featured.has(g.name) ? 8 : 0) + (audit === 'ok' ? 4 : audit === 'problem' ? -4 : 0) + (meta.platform !== 'Web' ? 1 : 0);
    return { ...g, platform: meta.platform, points, audit };
  }).sort((a: { points: number; index: number }, b: { points: number; index: number }) => b.points - a.points || a.index - b.index);
  const selected = ranked.slice(0, 200);
  // Guarantee representation of every category without inventing titles.
  for (const category of new Set(ranked.map((g: { category: string }) => g.category))) {
    if (!selected.some((g: { category: string }) => g.category === category)) {
      const candidate = ranked.find((g: { category: string }) => g.category === category);
      const replace = selected.findLastIndex((g: { category: string }) => selected.filter((x: { category: string }) => x.category === g.category).length > 1);
      if (candidate && replace >= 0) selected[replace] = candidate;
    }
  }
  selected.sort((a: { points: number; index: number }, b: { points: number; index: number }) => b.points - a.points || a.index - b.index);
  writeFileSync('src/data/game-covers.json', JSON.stringify(selected.map((g: { name: string; platform: string; audit: string; points: number }, i: number) => ({ gameName: g.name, rank: i + 1, platform: g.platform, image: null, source: null, sourceType: null, verifiedAt: null, credit: null, license: 'unconfirmed', status: 'pending', availability: g.audit, rankingPoints: g.points, notes: 'Capa original exata ainda não confirmada.' })), null, 2) + '\n');
}