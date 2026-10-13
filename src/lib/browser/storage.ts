let opening: Promise<IDBDatabase> | undefined;
function database() {
  return (opening ||= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('english-os-private-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('values');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('No se pudo abrir el almacenamiento del navegador.'));
  }));
}
export async function read<T>(key: string): Promise<T | undefined> {
  const databaseHandle = await database();
  return new Promise((resolve, reject) => {
    const request = databaseHandle.transaction('values').objectStore('values').get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}
export async function write(key: string, value: unknown) {
  const databaseHandle = await database();
  return new Promise<void>((resolve, reject) => {
    const transaction = databaseHandle.transaction('values', 'readwrite');
    transaction.objectStore('values').put(value, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
