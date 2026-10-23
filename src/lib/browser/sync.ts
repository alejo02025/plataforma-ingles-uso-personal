// Compatibility entry point: personal data never leaves this browser.
import { capture, exclusive, load } from './database';
import { read } from './storage';
export function changed() {
  window.dispatchEvent(new Event('english-local-save'));
}
export async function pdfBytes(id: string) {
  await load();
  const filename = await exclusive(
    () => capture().data.documents.find((d) => d.id === id)?.filename,
  );
  if (!filename || !/^[a-zA-Z0-9-]+\.pdf$/.test(String(filename)))
    throw new Error('File not found.');
  const local = await read<Uint8Array>(`file:${filename}`);
  if (!local)
    throw new Error('The original PDF is unavailable on this device. Restore a full backup.');
  return local;
}
