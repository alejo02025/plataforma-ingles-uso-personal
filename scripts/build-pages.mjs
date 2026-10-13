import { cp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root = process.cwd(),
  target = path.join(root, '.pages-project');
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp('src', path.join(target, 'src'), { recursive: true });
await rm(path.join(target, 'src/app/api'), { recursive: true });
await symlink(path.join(root, 'node_modules'), path.join(target, 'node_modules'), 'dir');
for (const name of ['package.json', 'tsconfig.json', 'next-env.d.ts'])
  await cp(name, path.join(target, name));
await writeFile(
  path.join(target, 'next.config.mjs'),
  `export default {output: 'export', basePath: '/plataforma-ingles-uso-personal', trailingSlash: true, images: {unoptimized: true}, env: {NEXT_PUBLIC_DEPLOY_TARGET: 'github', NEXT_PUBLIC_BASE_PATH: '/plataforma-ingles-uso-personal'}};\n`,
);
await mkdir(path.join(target, 'public/assets'), { recursive: true });
await cp(
  'node_modules/sql.js/dist/sql-wasm.wasm',
  path.join(target, 'public/assets/sql-wasm.wasm'),
);
await cp(
  'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
  path.join(target, 'public/assets/pdf.worker.min.mjs'),
);
const result = spawnSync(
  process.execPath,
  [path.join(root, 'node_modules/next/dist/bin/next'), 'build'],
  {
    cwd: target,
    stdio: 'inherit',
    env: { ...process.env, ENGLISH_AI_API_KEY: '', APP_ACCESS_TOKEN: '' },
  },
);
if (result.status !== 0) process.exit(result.status || 1);
await rm('out', { recursive: true, force: true });
await cp(path.join(target, 'out'), 'out', { recursive: true });
await writeFile('out/.nojekyll', '');
console.log('GitHub Pages: exportación lista en out/');
