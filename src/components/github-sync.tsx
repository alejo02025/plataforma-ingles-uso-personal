'use client';
import { useEffect, useState } from 'react';
import { Button } from './ui';
import { read } from '@/lib/browser/storage';
import { connect, disconnect, getStatus, syncNow, type SyncStatus } from '@/lib/browser/sync';
export function GitHubSync() {
  const [status, setStatus] = useState<SyncStatus>({
    connected: false,
    busy: false,
    message: 'Saved on this device',
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
      <span className="eyebrow">YOUR DEVICES · GITHUB</span>
      <p role="status">
        {status.message}
        {status.lastSync && ` · ${new Date(status.lastSync).toLocaleTimeString('en-US')}`}
      </p>
      {status.connected ? (
        <div className="actions">
          <Button type="button" secondary disabled={status.busy} onClick={() => void syncNow()}>
            Sync now{' '}
          </Button>
          <Button type="button" secondary onClick={disconnect}>
            Disconnect{' '}
          </Button>
        </div>
      ) : (
        <>
          <p>
            Connect the same private repository on your phone and laptop. Progress syncs
            automatically while this tab is open and authorized.{' '}
          </p>
          <ol>
            <li>
              <a href="https://github.com/new" target="_blank" rel="noreferrer">
                Create a private repository{' '}
              </a>{' '}
              called <strong>english-os-datos</strong>. You can leave it empty.{' '}
            </li>
            <li>
              <a
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noreferrer"
              >
                Create a fine-grained access token{' '}
              </a>
              : select only that repository and choose this permission:{' '}
              <strong>Contents: Read and write</strong>.
            </li>
            <li>Enter it here on each device. Never share it in chat.</li>
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
              Private repository{' '}
              <input
                aria-label="Private repository"
                required
                value={repository}
                onChange={(event) => setRepository(event.target.value)}
                autoCapitalize="none"
                spellCheck={false}
              />
            </label>
            <label className="field">
              GitHub token{' '}
              <input
                aria-label="GitHub token"
                required
                type="password"
                autoComplete="off"
                value={token}
                onChange={(event) => setToken(event.target.value)}
              />
            </label>
            <Button disabled={busy} type="submit">
              {busy ? 'Connecting…' : 'Connect GitHub'}
            </Button>
          </form>
          <p className="fine-print">
            Authorization stays in memory and is cleared when you close or reload this tab. Your
            history stays in this browser. Reconnect to merge it with your GitHub data.{' '}
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
    message: 'Saved on this device',
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
      aria-label="GitHub sync"
    >
      {status.busy
        ? 'Syncing…'
        : status.connected
          ? status.message === 'Synced with GitHub'
            ? 'Sincronizado'
            : 'Check connection'
          : 'Connect GitHub'}
    </button>
  );
}
