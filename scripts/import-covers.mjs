import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Import a reviewed source list; never perform fuzzy title matching or artwork generation.
const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/import-covers.mjs /path/to/reviewed-sources.json');
const manifestPath = 'src/data/game-covers.json';
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const sources = JSON.parse(await readFile(input, 'utf8'));
await mkdir('public/covers', { recursive: true });
const slug = (name) => name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const hashes = new Map(manifest.filter((g) => g.sha256).map((g) => [g.sha256, g.gameName]));
for (const source of sources) {
  const game = manifest.find((g) => g.rank === source.rank);
  if (!game) throw new Error(`Unknown rank: ${source.rank}`);
  if (source.gameName !== game.gameName) throw new Error(`Exact reviewed game identity required for rank ${source.rank}`);
  if (!source.source || !source.sourceTitle || !source.coverPlatform || source.matchVerified !== true) throw new Error(`Reviewed source evidence required for ${game.gameName}`);
  if (game.image) continue;
  try {
    const raw = source.raw ? await readFile(source.raw) : Buffer.from(await (await fetch(source.url)).arrayBuffer());
    const metadata = await sharp(raw).metadata();
    if (!metadata.width || !metadata.height || metadata.width < 180 || metadata.height < 240) throw new Error('Insufficient cover resolution');
    // Reject landscape screenshots/thumbnails. Slight box-format variations are center-cropped, never stretched.
    if (metadata.width / metadata.height > 0.95) throw new Error('Not a portrait cover; review original box format manually');
    const fileName = `${String(game.rank).padStart(3, '0')}-${slug(game.gameName)}.webp`;
    const output = await sharp(raw).rotate().resize(480, 720, { fit: 'cover', position: 'centre', withoutEnlargement: false }).webp({ quality: 78, effort: 6 }).toBuffer();
    const hash = createHash('sha256').update(output).digest('hex');
    if (hashes.has(hash)) throw new Error(`Duplicate artwork with ${hashes.get(hash)}; identity review required`);
    await writeFile(`public/covers/${fileName}`, output);
    hashes.set(hash, game.gameName);
    Object.assign(game, { image: `/covers/${fileName}`, source: source.source, sourceImage: source.url, sourceType: source.sourceType, sourceTitle: source.sourceTitle, coverPlatform: source.coverPlatform, region: source.region, verifiedAt: new Date().toISOString(), credit: source.credit, license: source.license, status: 'ready', width: 480, height: 720, bytes: output.length, sha256: hash, matchVerified: true, notes: 'Original source title matched explicitly; availability of browser port not established. Copyright permission not confirmed.' });
    console.log('OK', game.rank, game.gameName, output.length);
  } catch (error) {
    game.notes = error instanceof Error ? error.message : String(error);
    console.log('PENDING', game.rank, game.gameName, game.notes);
  }
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');