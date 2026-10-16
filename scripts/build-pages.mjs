import { writeOfflineWorker } from './offline-worker.mjs';
import { cp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { localizePortuguese } from './localize-portuguese.mjs';
const build = new Date().toISOString(),
  root = process.cwd(),
  siteRoot = '/plataforma-ingles-uso-personal';
await rm('out', { recursive: true, force: true });
for (const language of ['en', 'pt']) {
  const target = path.join(root, language === 'en' ? '.pages-project' : '.pages-pt-project');
  const base = siteRoot + (language === 'pt' ? '/portugues' : '');
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  // Both languages use the same frozen source snapshot, even during a local edit/build.
  const source = language === 'en' ? root : path.join(root, '.pages-project');
  await cp(path.join(source, 'src'), path.join(target, 'src'), { recursive: true });
  await cp(path.join(source, 'public'), path.join(target, 'public'), { recursive: true });
  await rm(path.join(target, 'src/app/api'), { recursive: true, force: true });
  if (language === 'pt') {
    await localizePortuguese(target);
    await rm(path.join(target, 'public/local-ai'), { recursive: true, force: true });
  }
  await symlink(path.join(root, 'node_modules'), path.join(target, 'node_modules'), 'dir');
  for (const name of ['package.json', 'tsconfig.json', 'next-env.d.ts'])
    await cp(name, path.join(target, name));
  await writeFile(
    path.join(target, 'next.config.mjs'),
    `export default {output:'export',basePath:'${base}',trailingSlash:true,images:{unoptimized:true},env:{NEXT_PUBLIC_DEPLOY_TARGET:'github',NEXT_PUBLIC_BASE_PATH:'${base}',NEXT_PUBLIC_ASSET_BASE_PATH:'${siteRoot}',NEXT_PUBLIC_SITE_ROOT:'${siteRoot}',NEXT_PUBLIC_STUDY_LANGUAGE:'${language}',NEXT_PUBLIC_APP_BUILD:'${build}'}};\n`,
  );
  if (language === 'en') {
    await mkdir(path.join(target, 'public/assets'), { recursive: true });
    await writeFile(
      path.join(target, 'public/assets/version.json'),
      JSON.stringify({ build }) + '\n',
    );
    for (const [from, to] of [
      ['node_modules/@wllama/wllama/esm/wasm/wllama.wasm', 'local-ai/wllama.wasm'],
      ['node_modules/@wllama/wllama-compat/wasm/wllama.wasm', 'local-ai/compat.wasm'],
      ['node_modules/@wllama/wllama-compat/wasm/wllama.js', 'local-ai/compat.js'],
      ['node_modules/sql.js/dist/sql-wasm.wasm', 'assets/sql-wasm.wasm'],
      ['node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'assets/pdf.worker.min.mjs'],
    ])
      await cp(from, path.join(target, 'public', to));
  }
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
  const destination = language === 'en' ? 'out' : 'out/portugues';
  await cp(path.join(target, 'out'), destination, { recursive: true });
}
await writeFile('out/.nojekyll', '');
await writeOfflineWorker(build, siteRoot);
console.log('English OS y Português OS: exportaciones listas en out/.');
