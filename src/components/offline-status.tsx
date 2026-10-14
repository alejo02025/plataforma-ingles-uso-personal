'use client';
import { useEffect, useState } from 'react';
import { CloudDownload, WifiOff, Check } from 'lucide-react';
import { registerOffline, offlineRelease } from '@/lib/browser/offline';
export function OfflineStatus() {
  const [ready, setReady] = useState(false),
    [online, setOnline] = useState(true),
    [error, setError] = useState(false);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEPLOY_TARGET !== 'github') return;
    let alive = true;
    const check = () => {
      setOnline(navigator.onLine);
      void offlineRelease()
        .then((value) => {
          if (alive) setReady(Boolean(value?.offlineReady));
        })
        .catch(() => {
          if (alive) setError(true);
        });
    };
    void registerOffline()
      ?.then(() => {
        check();
        void navigator.storage?.persist?.().catch(() => false);
      })
      .catch(() => setError(true));
    check();
    const timer = setInterval(check, 5000);
    window.addEventListener('online', check);
    window.addEventListener('offline', check);
    navigator.serviceWorker?.addEventListener('controllerchange', check);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener('online', check);
      window.removeEventListener('offline', check);
      navigator.serviceWorker?.removeEventListener('controllerchange', check);
    };
  }, []);
  if (process.env.NEXT_PUBLIC_DEPLOY_TARGET !== 'github') return null;
  return (
    <details className="offline-status">
      <summary>
        {!online ? (
          <WifiOff size={15} />
        ) : ready ? (
          <Check size={15} />
        ) : (
          <CloudDownload size={15} />
        )}
        <span>
          {!online
            ? 'Offline'
            : ready
              ? 'Ready offline'
              : error
                ? 'Offline download unavailable'
                : 'Preparing offline access'}
        </span>
      </summary>
      <p lang="es">
        {ready
          ? 'La app, las clases y el diccionario están guardados en este dispositivo. Tus PDF y tu progreso siguen en el almacenamiento local.'
          : 'Abrí la app con conexión y esperá a que termine la descarga para poder usarla sin señal.'}{' '}
        La IA necesita que hayas descargado su modelo. El micrófono y las voces sin conexión
        dependen de tu navegador. Las novedades y la sincronización con GitHub requieren conexión.
        Actualizar la app no borra tus datos; eliminar los datos del navegador sí puede hacerlo.
      </p>
    </details>
  );
}
