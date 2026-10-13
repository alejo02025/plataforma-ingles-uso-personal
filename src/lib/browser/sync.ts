import { assertRestorable, capture, exclusive, load, persist, restore } from './database';
import { merge, validate, type Manifest } from './merge';
import { read, write } from './storage';
export type SyncStatus = {
  connected: boolean;
  busy: boolean;
  message: string;
  lastSync?: string;
  repository?: string;
};
let credentials: { repository: string; token: string } | undefined;
let status: SyncStatus = { connected: false, busy: false, message: 'Guardado en este dispositivo' };
let running: Promise<void> | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let epoch = 0;
let pending = false;
export function getStatus() {
  return { ...status };
}
function update(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch };
  window.dispatchEvent(new Event('english-sync-status'));
}
function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.slice(i, i + 8192));
  return btoa(binary);
}
function decode(value: string) {
  return Uint8Array.from(atob(value.replace(/\s/g, '')), (c) => c.charCodeAt(0));
}
async function request(route: string, options?: RequestInit) {
  if (!credentials) throw new Error('Conectá tu repositorio privado para sincronizar.');
  const response = await fetch(`https://api.github.com/repos/${credentials.repository}${route}`, {
    ...options,
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${credentials.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options?.headers,
    },
  });
  if (response.status === 404) return { missing: true } as const;
  if (response.status === 409 || response.status === 422) return { conflict: true } as const;
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? 'La autorización venció. Volvé a conectar GitHub.'
        : response.status === 403
          ? 'GitHub rechazó el acceso. Revisá Contents: Read and write o esperá si alcanzaste el límite de solicitudes.'
          : 'No se pudo sincronizar. Tus cambios siguen guardados en este dispositivo.',
    );
  return response.json();
}
async function getFile(filename: string) {
  const data = await request(`/contents/english-os/${filename}`);
  if (data.missing) return undefined;
  if (!data.sha || data.type !== 'file') throw new Error('GitHub devolvió un archivo inválido.');
  if (data.size > 20 * 1024 * 1024)
    throw new Error('El archivo supera el límite de sincronización de 20 MB.');
  const payload = data.encoding === 'base64' ? data : await request(`/git/blobs/${data.sha}`);
  return { sha: String(data.sha), bytes: decode(payload.content) };
}
async function putFile(filename: string, bytes: Uint8Array, sha?: string) {
  const response = await request(`/contents/english-os/${filename}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'English OS: sincronizar datos personales',
      content: encode(bytes),
      ...(sha ? { sha } : {}),
    }),
  });
  if (response.missing)
    throw new Error('El repositorio no existe o la autorización no permite escribir.');
  return response;
}
export async function connect(repository: string, token: string) {
  if (
    !/^[a-zA-Z0-9-]+\/[a-zA-Z0-9_.-]+$/.test(repository) ||
    repository.endsWith('/plataforma-ingles-uso-personal')
  )
    throw new Error(
      'Usá un repositorio separado y privado, por ejemplo alejo02025/english-os-datos.',
    );
  disconnect();
  await running;
  credentials = { repository, token };
  try {
    const metadata = await request('');
    if (metadata.missing || metadata.private !== true || metadata.permissions?.push !== true)
      throw new Error(
        'Se necesita un repositorio privado con permiso de escritura. No se enviaron datos personales.',
      );
    await write('repository', repository);
    update({ connected: true, repository, message: 'Conectado a GitHub' });
    await syncNow();
  } catch (error) {
    disconnect();
    throw error;
  }
}
export function disconnect() {
  epoch++;
  credentials = undefined;
  clearTimeout(timer);
  update({ connected: false, busy: false, message: 'Guardado en este dispositivo' });
}
export function changed() {
  if (!credentials) return;
  if (running) {
    pending = true;
    return;
  }
  clearTimeout(timer);
  timer = setTimeout(() => {
    timer = undefined;
    void syncNow();
  }, 1500);
}
export function syncNow(): Promise<void> {
  if (running) {
    pending = true;
    return running;
  }
  if (!credentials) return Promise.resolve();
  const started = epoch;
  update({ busy: true, message: 'Sincronizando…' });
  running = (async () => {
    do {
      pending = false;
      await synchronize(started);
    } while (pending && started === epoch && credentials);
  })()
    .catch((error) => {
      if (started === epoch)
        update({
          message:
            error instanceof Error
              ? error.message
              : 'Sin conexión. Cambios guardados en este dispositivo.',
        });
    })
    .finally(() => {
      running = undefined;
      if (started === epoch && credentials) {
        update({ busy: false });
        clearTimeout(timer);
        timer = setTimeout(() => {
          timer = undefined;
          void syncNow();
        }, 20000);
      }
    });
  return running;
}
async function synchronize(started: number) {
  await load();
  update({ busy: true, message: 'Sincronizando…' });
  for (let attempt = 0; attempt < 4; attempt++) {
    const remote = await getFile('state.json');
    if (started !== epoch || !credentials) return;
    const remoteManifest = remote
      ? validate(JSON.parse(new TextDecoder().decode(remote.bytes)))
      : undefined;
    const candidate = await exclusive(() =>
      remoteManifest ? merge(capture(), remoteManifest) : capture(),
    );
    await exclusive(() => {
      try {
        assertRestorable(candidate);
      } catch {
        throw new Error(
          'El historial de GitHub no es válido. Tus datos locales se conservaron; no se subieron cambios.',
        );
      }
    });
    for (const document of candidate.data.documents.filter((d) => d.filename)) {
      const filename = String(document.filename);
      if (!/^[a-zA-Z0-9-]+\.pdf$/.test(filename))
        throw new Error('El respaldo contiene un nombre de archivo inválido.');
      const local = await read<Uint8Array>(`file:${filename}`);
      if (!local) continue;
      const marker = `uploaded:${credentials.repository}:${filename}`;
      if (!(await read<boolean>(marker))) {
        const existing = await getFile(`files/${filename}`);
        if (
          existing &&
          (existing.bytes.length !== local.length || existing.bytes.some((v, i) => v !== local[i]))
        )
          throw new Error(
            'Un PDF tiene versiones distintas. Ambos archivos se conservaron sin sobrescribir.',
          );
        if (!existing) {
          const result = await putFile(`files/${filename}`, local);
          if (result.conflict) continue;
        }
        await write(marker, true);
      }
    }
    const serialized = JSON.stringify(candidate);
    if (new TextEncoder().encode(serialized).length > 20 * 1024 * 1024)
      throw new Error(
        'El historial supera el límite de sincronización de 20 MB. Descargá una copia antes de continuar.',
      );
    const remoteSerialized = remoteManifest ? JSON.stringify(remoteManifest) : '';
    if (serialized !== remoteSerialized) {
      const response = await putFile(
        'state.json',
        new TextEncoder().encode(serialized),
        remote?.sha,
      );
      if (response.conflict) continue;
    }
    if (started !== epoch || !credentials) return;
    await exclusive(async () => {
      // Read again after the network request so edits made during upload are preserved.
      const current = capture(),
        merged = merge(current, candidate);
      const dataChanged = JSON.stringify(current.data) !== JSON.stringify(merged.data);
      restore(merged);
      await persist();
      if (dataChanged) window.dispatchEvent(new Event('english-data-changed'));
    });
    update({ message: 'Sincronizado con GitHub', lastSync: new Date().toISOString() });
    return;
  }
  throw new Error('Otro dispositivo está guardando. Volveremos a intentar automáticamente.');
}
export async function pdfBytes(id: string) {
  await load();
  const filename = await exclusive(
    () => capture().data.documents.find((d) => d.id === id)?.filename,
  );
  if (!filename || !/^[a-zA-Z0-9-]+\.pdf$/.test(String(filename)))
    throw new Error('Archivo inexistente.');
  const local = await read<Uint8Array>(`file:${filename}`);
  if (local) return local;
  const remote = await getFile(`files/${filename}`);
  if (!remote) throw new Error('Este PDF todavía no se sincronizó desde el otro dispositivo.');
  await write(`file:${filename}`, remote.bytes);
  return remote.bytes;
}
