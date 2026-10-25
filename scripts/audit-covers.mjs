import { readFile, readdir, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, basename, extname } from 'node:path';
import sharp from 'sharp';

const manifest = JSON.parse(await readFile('src/data/game-covers.json', 'utf8'));
const games = JSON.parse(await readFile('src/data/games.json', 'utf8'));
const verification = JSON.parse(await readFile('src/data/verification.json', 'utf8'));
const removed = JSON.parse(await readFile('src/data/removed-games.json', 'utf8'));
const excluded = status => ['down', 'copyright'].includes(status);
const blocked = new Set(removed.filter(g => excluded(g.status)).map(g => g.name));
const names = new Set(games.filter(g => g.url && !blocked.has(g.name) && !excluded(verification[g.name]?.status)).map(g => g.name));
const directory = resolve('public/covers');
const files = (await readdir(directory).catch(() => [])).filter((f) => /\.(webp|jpe?g|png)$/i.test(f));
const referenced = new Set();
const hashes = new Map();
const seenNames = new Set();
const seenRanks = new Set();
const issues = [];
let ok = 0, missing = 0, invalid = 0, duplicates = 0, licenses = 0, bytes = 0;
const slug = (name) => name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
for (const entry of manifest) {
  const label = `${entry.rank}: ${entry.gameName}`;
  if (seenNames.has(entry.gameName) || seenRanks.has(entry.rank)) { duplicates++; issues.push(`${label}: duplicate identity/rank`); }
  seenNames.add(entry.gameName); seenRanks.add(entry.rank);
  if (!names.has(entry.gameName) || entry.rank < 1 || entry.rank > 200) { invalid++; issues.push(`${label}: unknown catalog identity/rank`); continue; }
  if (!entry.image) { missing++; issues.push(`${label}: ${entry.notes || 'missing image'}`); continue; }
  if (!entry.licenseConfirmed) licenses++;
  const expected = `${String(entry.rank).padStart(3, '0')}-${slug(entry.gameName)}`;
  if (!entry.image.startsWith('/covers/') || basename(entry.image, extname(entry.image)) !== expected || !['.webp', '.jpg', '.jpeg'].includes(extname(entry.image))) { invalid++; issues.push(`${label}: invalid image path/identity/extension`); continue; }
  const path = resolve('public', '.' + entry.image);
  if (!path.startsWith(directory + '/')) { invalid++; continue; }
  referenced.add(basename(path));
  try {
    const buffer = await readFile(path);
    const metadata = await sharp(buffer).metadata();
    const size = (await stat(path)).size;
    bytes += size;
    const hash = createHash('sha256').update(buffer).digest('hex');
    if (hashes.has(hash)) { duplicates++; issues.push(`${label}: duplicate bytes with ${hashes.get(hash)}`); }
    hashes.set(hash, label);
    if (!metadata.width || !metadata.height || metadata.width * 3 !== metadata.height * 2 || metadata.width < 320 || metadata.height < 480 || size > 200 * 1024 || metadata.format !== extname(path).slice(1).replace('jpg', 'jpeg') || entry.sha256 !== hash || !entry.matchVerified || !entry.source || !entry.sourceTitle || entry.width !== metadata.width || entry.height !== metadata.height || entry.bytes !== size) {
      invalid++; issues.push(`${label}: invalid dimensions, size, format, integrity or missing match evidence`);
    } else { ok++; }
  } catch { missing++; issues.push(`${label}: local file missing or unreadable`); }
}
const orphans = files.filter((f) => !referenced.has(f));
for (const file of orphans) issues.push(`Orphan: ${file}`);
const report = { expected: 200, entries: manifest.length, ok, missing, invalid, licenseUnconfirmed: licenses, duplicates, orphans: orphans.length, totalBytes: bytes, issues };
console.log(`ESPERADOS: 200\nCAPAS: ${manifest.length}\nOK: ${ok}\nSEM IMAGEM: ${missing}\nIMAGEM INVÁLIDA: ${invalid}\nLICENÇA NÃO CONFIRMADA: ${licenses}\nDUPLICADAS: ${duplicates}\nÓRFÃS: ${orphans.length}\nTAMANHO: ${(bytes / 1024 / 1024).toFixed(2)} MiB`);
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
if (manifest.length !== 200 || missing || invalid || duplicates || orphans.length) process.exitCode = 1;