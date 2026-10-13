import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const directory = await mkdtemp(path.join(tmpdir(), 'english-os-restart-'));
const base = 'http://127.0.0.1:3101';
let processHandle;
async function start() {
  processHandle = spawn(
    process.execPath,
    [
      '--use-env-proxy',
      'node_modules/next/dist/bin/next',
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      '3101',
    ],
    {
      env: {
        ...process.env,
        ENGLISH_DATA_DIR: directory,
        APP_ACCESS_TOKEN: '',
        ENGLISH_AI_API_KEY: '',
      },
      stdio: ['ignore', 'ignore', 'pipe'],
    },
  );
  processHandle.stderr.on('data', () => {});
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    if (processHandle.exitCode !== null)
      throw new Error('El servidor de prueba no arrancó. Revisá que el puerto 3101 esté libre.');
    try {
      if ((await fetch(`${base}/api/state`)).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('El servidor no respondió a tiempo.');
}
async function stop() {
  if (!processHandle || processHandle.exitCode !== null) return;
  const handle = processHandle;
  await new Promise((resolve) => {
    const timeout = setTimeout(() => handle.kill('SIGKILL'), 5000);
    handle.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
    handle.kill('SIGTERM');
  });
}
async function post(endpoint, data) {
  const response = await fetch(
    `${base}/api/${endpoint}`,
    data instanceof FormData
      ? { method: 'POST', body: data }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
  );
  assert.equal(response.ok, true, `POST ${endpoint} falló`);
  return response.json();
}
try {
  await start();
  const initial = await (await fetch(`${base}/api/state`)).json();
  await post('profile', { ...initial.profile, name: 'Restart test' });
  const form = new FormData();
  form.set('title', 'Persistent travel notes');
  form.set(
    'text',
    'A quiet walk through a new city can teach us a lot. When we slow down, we notice the shops, the streets and the people who make a neighbourhood special.',
  );
  const document = await post('import', form);
  await post('word', { word: 'neighbourhood', sourceId: document.id });
  const writing = initial.plan.activities.find((a) => a.kind === 'writing');
  await post('session', { activityId: writing.id });
  await post('draft', {
    activityId: writing.id,
    text: 'I would like to visit Edinburgh because I enjoy learning about history.',
  });
  await stop();
  await start();
  const restored = await (await fetch(`${base}/api/state`)).json();
  assert.equal(restored.profile.name, 'Restart test');
  assert.ok(restored.documents.some((d) => d.id === document.id));
  assert.equal(restored.vocabulary[0].word, 'neighbourhood');
  assert.equal(restored.resumeActivity.id, writing.id);
  assert.match(restored.resumeActivity.payload.draft, /Edinburgh/);
  console.log(
    'Persistencia verificada tras reiniciar el servidor: perfil, texto, vocabulario, sesión y borrador.',
  );
} finally {
  await stop();
  await rm(directory, { recursive: true, force: true });
}
