import { isPortuguese } from '../workspace';
import { requireAccount, encryptLocal, decryptLocal } from './local-accounts';
let opening: Promise<IDBDatabase> | undefined;
const privateKey = (key: string) => isPortuguese ? key : `account:${requireAccount().id}:${key}`;
function database() {
  return (opening ||= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(
      isPortuguese ? 'portuguese-os-private-v1' : 'english-os-private-v1',
      1,
    );
    request.onupgradeneeded = () => request.result.createObjectStore('values');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      opening = undefined;
      reject(new Error('Browser storage could not be opened.'));
    };
  }).catch((error) => {
    opening = undefined;
    throw error;
  }));
}
export async function read<T>(key: string): Promise<T | undefined> {
  const databaseHandle = await database();
  return new Promise((resolve, reject) => {
    const request = databaseHandle.transaction('values').objectStore('values').get(privateKey(key));
    request.onsuccess = () => { void (async () => resolve((!isPortuguese && request.result !== undefined ? await decryptLocal(request.result) : request.result) as T | undefined))().catch(reject); };
    request.onerror = () => reject(request.error);
  });
}
export async function write(key: string, value: unknown) {
  return writeMany([[key, value]]);
}

function saveFailure(cause: unknown) {
  return new Error(
    (isPortuguese
      ? 'Não foi possível salvar neste dispositivo. Mantenha esta página aberta e tente novamente.'
      : 'Could not save on this device. Keep this page open and try again.') +
      '\nNo se pudo guardar en este dispositivo. Mantené esta página abierta y volvé a intentarlo.',
    { cause },
  );
}

/** A snapshot and its sync metadata must be committed together, including on quota/clone errors. */
export async function writeMany(entries: ReadonlyArray<readonly [string, unknown]>) {
  const prepared = await Promise.all(entries.map(async ([key, value]) => [privateKey(key), isPortuguese ? value : await encryptLocal(value)] as const));
  const databaseHandle = await database();
  return new Promise<void>((resolve, reject) => {
    const transaction = databaseHandle.transaction('values', 'readwrite');
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(saveFailure(transaction.error));
    transaction.onabort = () => reject(saveFailure(transaction.error));
    try {
      const values = transaction.objectStore('values');
      for (const [key, value] of prepared) values.put(value, key);
    } catch (error) {
      // A synchronous failure on a later put does not automatically cancel earlier puts.
      try {
        transaction.abort();
      } catch {}
      reject(saveFailure(error));
    }
  });
}

/** Read one consistent revision rather than mixing keys from concurrent commits. */
export async function readMany(keys: readonly string[]) {
  const databaseHandle = await database();
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const transaction = databaseHandle.transaction('values');
    const result: Record<string, unknown> = {};
    transaction.oncomplete = () => { void (async () => { if (!isPortuguese) { for (const key of keys) if (result[key] !== undefined) result[key] = await decryptLocal(result[key]); } resolve(result); })().catch(reject); };
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
    try {
      const values = transaction.objectStore('values');
      for (const key of keys) {
        const request = values.get(privateKey(key));
        request.onsuccess = () => {
          result[key] = request.result;
        };
      }
    } catch (error) {
      try {
        transaction.abort();
      } catch {}
      reject(error);
    }
  });
}
