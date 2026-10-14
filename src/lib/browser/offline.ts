import { assetBase } from '../workspace';
let registration: Promise<ServiceWorkerRegistration> | undefined;
export function registerOffline() {
  if (process.env.NEXT_PUBLIC_DEPLOY_TARGET !== 'github' || !('serviceWorker' in navigator))
    return undefined;
  return (registration ||= navigator.serviceWorker.register(`${assetBase}/sw.js`, {
    scope: `${assetBase}/`,
    updateViaCache: 'none',
  }));
}
export async function offlineRelease() {
  await registerOffline();
  const controller = navigator.serviceWorker.controller;
  if (!controller) return undefined;
  return new Promise<{ build: string; offlineReady: boolean } | undefined>((resolve) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => resolve(undefined), 2000);
    channel.port1.onmessage = (event) => {
      clearTimeout(timer);
      channel.port1.close();
      resolve(event.data);
    };
    controller.postMessage({ type: 'RELEASE' }, [channel.port2]);
  });
}
export async function prepareOfflineUpdate() {
  const reg = await registerOffline();
  if (!reg) return;
  if (!navigator.onLine)
    throw new Error(
      'Connect to the internet before downloading an app update. Your progress is still saved.',
    );
  await reg.update();
  const worker = reg.installing;
  if (worker)
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        worker.removeEventListener('statechange', check);
        reject(
          new Error('The update is still downloading. Try again shortly; your progress is safe.'),
        );
      }, 45000);
      function check() {
        if (worker!.state === 'installed') {
          clearTimeout(timer);
          worker!.removeEventListener('statechange', check);
          resolve();
        } else if (worker!.state === 'redundant') {
          clearTimeout(timer);
          worker!.removeEventListener('statechange', check);
          reject(
            new Error(
              'The offline update could not be downloaded. The previous release and your progress are kept.',
            ),
          );
        }
      }
      worker.addEventListener('statechange', check);
      check();
    });
  if (reg.waiting)
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        navigator.serviceWorker.removeEventListener('controllerchange', changed);
        reject(new Error('The update has not activated yet. Try again shortly.'));
      }, 10000);
      const changed = () => {
        clearTimeout(timer);
        navigator.serviceWorker.removeEventListener('controllerchange', changed);
        resolve();
      };
      navigator.serviceWorker.addEventListener('controllerchange', changed);
      reg.waiting!.postMessage({ type: 'ACTIVATE_RELEASE' });
    });
}
