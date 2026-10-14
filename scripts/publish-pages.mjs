import { readFile, writeFile, cp, rm, readdir } from 'node:fs/promises';
const manifest = '.pages-files.json';
const files = await readdir('out');
let previous = [];
try {
  previous = JSON.parse(await readFile(manifest, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
// Only remove generated files recorded by an earlier publication, never source or personal data.
const allowed = (name) =>
  name === '_next' ||
  name === 'sw.js' ||
  name === 'assets' ||
  name === 'manifest.webmanifest' ||
  name === 'local-ai' ||
  name === 'portugues' ||
  name === '_not-found' ||
  name === '.nojekyll' ||
  name === '404' ||
  /^(index|404)\.(html|txt)$/.test(name) ||
  /^__next\.[a-zA-Z0-9_.-]+\.txt$/.test(name);
for (const name of [...previous, ...files])
  if (!allowed(name)) throw new Error(`Unexpected generated file: ${name}`);
for (const name of previous) await rm(name, { recursive: true, force: true });
for (const name of files) await cp(`out/${name}`, name, { recursive: true });
await writeFile(manifest, JSON.stringify(files, null, 2) + '\n');
console.log('Sitio preparado en la raíz de main para GitHub Pages.');
