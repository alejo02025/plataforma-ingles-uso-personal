import { assertRestorable, capture, durable, exclusive, load, restore } from './database';
import { readAttachments } from './storage';
import { backupLimit, parseLocalBackup, type LocalBackupFile } from './backup-format';
import { workspaceId } from '../workspace';
function base64(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
export async function createLocalBackup(): Promise<LocalBackupFile> {
  await load();
  return exclusive(async () => {
    const attachments = [];
    let size = 0;
    for (const [key, value] of await readAttachments()) {
      const bytes = value instanceof Blob ? new Uint8Array(await value.arrayBuffer()) : value;
      size += Math.ceil(bytes.length / 3) * 4;
      if (size > backupLimit)
        throw new Error('Los archivos superan 100 MB. Descargá los PDFs y audios por separado.');
      attachments.push({
        key,
        kind: value instanceof Blob ? ('blob' as const) : ('bytes' as const),
        mime: value instanceof Blob ? value.type : 'application/pdf',
        base64: base64(bytes),
      });
    }
    return parseLocalBackup({
      format: 'lingua-local-backup',
      version: 1,
      workspace: workspaceId,
      createdAt: new Date().toISOString(),
      manifest: capture(),
      attachments,
    });
  });
}
export async function inspectLocalBackup(file: File) {
  if (file.size > backupLimit) throw new Error('El archivo supera el límite de 100 MB.');
  const backup = parseLocalBackup(JSON.parse(await file.text()));
  await load();
  await exclusive(() => assertRestorable(backup.manifest));
  return backup;
}
export async function restoreLocalBackup(input: unknown) {
  const backup = parseLocalBackup(input);
  const attachments: Array<[string, Uint8Array | Blob]> = backup.attachments.map((a) => {
    const bytes = Uint8Array.from(atob(a.base64), (c) => c.charCodeAt(0));
    return [a.key, a.kind === 'blob' ? new Blob([bytes], { type: a.mime }) : bytes];
  });
  await load();
  await exclusive(async () => {
    assertRestorable(backup.manifest);
    // Records, originals and recordings commit in the same IndexedDB transaction.
    // A quota/write failure restores the last durable database in memory too.
    await durable(() => restore(backup.manifest), attachments);
  });
  window.dispatchEvent(new Event('english-data-changed'));
}
export function downloadLocalBackup(backup: LocalBackupFile) {
  const serialized = JSON.stringify(backup);
  if (new Blob([serialized]).size > backupLimit)
    throw new Error('El respaldo supera el límite de 100 MB.');
  const url = URL.createObjectURL(new Blob([serialized], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `lingua-${backup.workspace}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
