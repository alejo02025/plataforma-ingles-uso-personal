import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
export async function writeOfflineWorker(build, siteRoot) {
  const files = [];
  async function walk(directory) {
    for (const item of await readdir(directory, { withFileTypes: true })) {
      const full = path.join(directory, item.name);
      if (item.isDirectory()) await walk(full);
      else if (
        !full.endsWith('.bin') &&
        !full.endsWith('.map') &&
        !full.endsWith('/sw.js') &&
        !item.name.startsWith('.')
      )
        files.push(`${siteRoot}/${path.relative('out', full).split(path.sep).join('/')}`);
    }
  }
  await walk('out');
  const worker = await readFile('scripts/service-worker.js', 'utf8');
  await writeFile(
    'out/sw.js',
    `const RELEASE=${JSON.stringify(build)};\nconst ROOT=${JSON.stringify(siteRoot)};\nconst FILES=${JSON.stringify(files)};\n${worker}`,
  );
}
