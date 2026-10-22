import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

const plain = process.argv.includes('--plain');
const root = resolve('dist');
try {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  const files = entries.filter(entry => entry.isFile()).map(entry => resolve(entry.parentPath, entry.name));
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map(match => resolve(root, `.${match[1]}`));
  if (!assets.length) throw new Error('No built entry assets found. Run npm run build first.');
  for (const asset of assets) await stat(asset);
  console.log(plain ? 'Twitch Multiplayer - static build' : '📦 Twitch Multiplayer — static build');
  let total = 0;
  for (const file of files.sort()) {
    const bytes = (await stat(file)).size; total += bytes;
    console.log(`  ${relative(root, file).padEnd(38)} ${(bytes / 1024).toFixed(1).padStart(7)} KiB`);
  }
  console.log(`${plain ? '' : '✅ '}${[`${assets.length} entry assets resolve`, `${files.length} files`, `${(total / 1024).toFixed(1)} KiB`].join(plain ? ' / ' : ' · ')}`);
  console.log('Serve dist with any static host; Twitch still requires internet.');
} catch (error) {
  console.error(`${plain ? '' : '⚠️ '}${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
