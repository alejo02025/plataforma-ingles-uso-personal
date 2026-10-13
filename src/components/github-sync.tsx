'use client';
import { useEffect, useState } from 'react';
import { Button } from './ui';
import { read } from '@/lib/browser/storage';
import { connect, disconnect, getStatus, syncNow, type SyncStatus } from '@/lib/browser/sync';
export function GitHubSync() {
  const [status, setStatus] = useState<SyncStatus>({
    connected: false,
    busy: false,
    message: 'Guardado en este dispositivo',
  });
  const [repository, setRepository] = useState('alejo02025/english-os-datos'),
    [token, setToken] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const update = () => setStatus(getStatus());
    update();
    window.addEventListener('english-sync-status', update);
    void read<string>('repository').then((value) => {
      if (value) setRepository(value);
    });
    const online = () => void syncNow();
    window.addEventListener('online', online);
    return () => {
      window.removeEventListener('english-sync-status', update);
      window.removeEventListener('online', online);
    };
  }, []);
  return (
    <section className="settings-info">
      <span className="eyebrow">TUS DISPOSITIVOS · GITHUB</span>
      <p role="status">
        {status.message}
        {status.lastSync && ` · ${new Date(status.lastSync).toLocaleTimeString('es-AR')}`}
      </p>
      {status.connected ? (
        <div className="actions">
          <Button type="button" secondary disabled={status.busy} onClick={() => void syncNow()}>
            Sincronizar ahora
          </Button>
          <Button type="button" secondary onClick={disconnect}>
            Desconectar
          </Button>
        </div>
      ) : (
        <>
          <p>
            Conectá el mismo repositorio privado en tu celular y notebook. El progreso se sincroniza
            automáticamente mientras esta pestaña siga abierta y autorizada.
          </p>
          <ol>
            <li>
              <a href="https://github.com/new" target="_blank" rel="noreferrer">
                Creá un repositorio privado
              </a>{' '}
              llamado <strong>english-os-datos</strong>. Podés dejarlo vacío.
            </li>
            <li>
              <a
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noreferrer"
              >
                Creá un token de acceso detallado
              </a>
              : seleccioná únicamente ese repositorio y en Repository permissions elegí{' '}
              <strong>Contents: Read and write</strong>.
            </li>
            <li>Ingresalo acá en cada dispositivo. No lo compartas por chat.</li>
          </ol>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError('');
              const authorization = token;
              setToken('');
              try {
                await connect(repository.trim(), authorization);
              } catch (error) {
                setError(error instanceof Error ? error.message : 'No se pudo conectar.');
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field">
              Repositorio privado
              <input
                aria-label="Repositorio privado"
                required
                value={repository}
                onChange={(event) => setRepository(event.target.value)}
                autoCapitalize="none"
                spellCheck={false}
              />
            </label>
            <label className="field">
              Token de GitHub
              <input
                aria-label="Token de GitHub"
                required
                type="password"
                autoComplete="off"
                value={token}
                onChange={(event) => setToken(event.target.value)}
              />
            </label>
            <Button disabled={busy} type="submit">
              {busy ? 'Conectando…' : 'Conectar GitHub'}
            </Button>
          </form>
          <p className="fine-print">
            La autorización queda en memoria y se borra al cerrar o recargar la pestaña. El
            historial permanece guardado en este navegador. Al volver a conectar, se recuperan y
            combinan los cambios de GitHub.
          </p>
        </>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </section>
  );
}

export function GitHubSyncStatus({ onOpen }: { onOpen: () => void }) {
  const [status, setStatus] = useState<SyncStatus>({
    connected: false,
    busy: false,
    message: 'Guardado en este dispositivo',
  });
  useEffect(() => {
    const update = () => setStatus(getStatus());
    update();
    window.addEventListener('english-sync-status', update);
    return () => window.removeEventListener('english-sync-status', update);
  }, []);
  return (
    <button
      type="button"
      className="text-link sync-status"
      onClick={onOpen}
      title={status.message}
      aria-label="Sincronización con GitHub"
    >
      {status.busy
        ? 'Sincronizando…'
        : status.connected
          ? status.message === 'Sincronizado con GitHub'
            ? 'Sincronizado'
            : 'Revisar conexión'
          : 'Conectar GitHub'}
    </button>
  );
}
