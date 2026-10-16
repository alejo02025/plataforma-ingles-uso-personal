import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const base = 'https://alejo02025.github.io/plataforma-ingles-uso-personal/';
const expectedPrior = process.argv[2] || '2026-10-15T18:10:11.952Z';
const destination = process.argv[3] || 'artifacts/redesign/published-assets.json';
const get = async (url) => {
  const response = await fetch(url, {
    headers: { 'Cache-Control': 'no-cache', 'Accept-Encoding': 'identity' },
  });
  const body = Buffer.from(await response.arrayBuffer());
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return {
    url,
    status: response.status,
    bytes: body.length,
    sha256: createHash('sha256').update(body).digest('hex'),
    body,
    etag: response.headers.get('etag'),
    modified: response.headers.get('last-modified'),
  };
};
const version = JSON.parse((await get(base + 'assets/version.json')).body);
if (version.build === expectedPrior)
  throw new Error('The previous public build is still being served');
const generated = JSON.parse(await readFile('assets/version.json', 'utf8'));
if (version.build !== generated.build)
  throw new Error('Public version does not match the generated main export');
const worker = await get(base + 'sw.js');
const source = worker.body.toString();
const release = JSON.parse(source.match(/^const RELEASE=(.+);$/m)[1]);
if (release !== version.build) throw new Error('Service worker release and public version differ');
const paths = JSON.parse(source.match(/^const FILES=(.+);$/m)[1]);
if (
  !paths.includes('/plataforma-ingles-uso-personal/index.html') ||
  !paths.includes('/plataforma-ingles-uso-personal/portugues/index.html')
)
  throw new Error('Both language entry points must be precached');
const assets = [];
let index = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (index < paths.length) {
      const result = await get(new URL(paths[index++], base).href);
      const { body, ...evidence } = result;
      assets.push(evidence);
    }
  }),
);
const entries = [];
for (const suffix of ['', 'portugues/']) {
  const result = await get(base + suffix);
  const html = result.body.toString();
  const references = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((p) => p.includes('/_next/static/'));
  for (const ref of new Set(references)) {
    const url = new URL(ref, base).href;
    if (!assets.find((a) => a.url === url))
      throw new Error(`HTML references an asset absent from the offline release: ${url}`);
  }
  const { body, ...evidence } = result;
  entries.push({ ...evidence, linkedAssets: [...new Set(references)] });
}
const result = {
  checkedAt: new Date().toISOString(),
  base,
  priorBuild: expectedPrior,
  publicBuild: version.build,
  serviceWorkerRelease: release,
  allListedAssetsAvailable: true,
  serviceWorkerInstalledInPublicBrowser: false,
  note: 'TLS-verified Node fetch of actual public responses. Active-worker offline/update behavior is covered by local Playwright; this probe does not claim a physical PWA installation.',
  entries,
  assets: assets.sort((a, b) => a.url.localeCompare(b.url)),
};
await writeFile(destination, JSON.stringify(result, null, 2) + '\n');
console.log(
  JSON.stringify({
    build: version.build,
    serviceWorkerRelease: release,
    verifiedAssets: assets.length,
    entries: entries.length,
  }),
);
