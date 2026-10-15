'use client';
import { assetBase } from '@/lib/workspace';
import {
  readRefresh,
  requestRefresh,
  refreshEvent,
  isRefreshStorage,
} from '@/lib/browser/app-refresh';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw } from 'lucide-react';
const base = assetBase;
const current = process.env.NEXT_PUBLIC_APP_BUILD || '';
export function AppUpdate() {
  const [newVersion, setNewVersion] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const updating = useRef(false);
  const observedRefresh = useRef<string | null>(null);
  const update = useCallback(async (sharedToken?: string) => {
    if (updating.current) return;
    if (document.querySelector('.oral-recording-active')) {
      if (sharedToken) setNewVersion(true);
      if (!sharedToken) setError('Stop the audio recording before updating.');
      return;
    }
    if (
      sharedToken &&
      (document.visibilityState !== 'visible' ||
        document.querySelector(
          '[data-update-guard="dirty"], [role="dialog"], input:focus, textarea:focus, [contenteditable="true"]:focus, .game-session, .practice-card, .reader-layout, .voice-room, .lesson-room',
        ))
    ) {
      setNewVersion(true);
      return;
    }
    updating.current = true;
    setBusy(true);
    setError('');
    try {
      const local = await import('@/lib/browser/local-ai').catch(() => undefined);
      if (local && ['generating', 'loading'].includes(local.localStatus().state)) {
        if (sharedToken) {
          setNewVersion(true);
          setBusy(false);
          updating.current = false;
          return;
        }
        throw new Error('Finish the AI response or download before updating.');
      }
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (document.querySelector('.oral-recording-active'))
        throw new Error('Stop the audio recording before updating.');
      // A dialog or draft may have been opened while preparing the update.
      if (
        sharedToken &&
        (document.visibilityState !== 'visible' ||
          document.querySelector(
            '[data-update-guard="dirty"], [role="dialog"], input:focus, textarea:focus, [contenteditable="true"]:focus, .game-session, .practice-card, .reader-layout, .voice-room, .lesson-room',
          ))
      ) {
        setNewVersion(true);
        setBusy(false);
        updating.current = false;
        return;
      }
      if (process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github') {
        const { exclusive, load, persist } = await import('@/lib/browser/database');
        await load();
        await exclusive(persist);
        if (!navigator.onLine) {
          throw new Error('Connect to the internet before updating. Your saved progress is safe.');
        }
        const { prepareOfflineUpdate } = await import('@/lib/browser/offline');
        // Online navigation is network-first in our service worker. A stalled
        // offline pre-cache must not prevent loading the newly published app.
        // The background worker update may continue after this timeout.
        await Promise.race([
          prepareOfflineUpdate().catch(() => undefined),
          new Promise<void>((resolve) => setTimeout(resolve, 3000)),
        ]);
      }
      if (document.querySelector('.oral-recording-active'))
        throw new Error('Stop the audio recording before updating.');
      const token = sharedToken || String(Date.now());
      const url = new URL(window.location.href);
      url.searchParams.set('updated', token);
      url.searchParams.set('refresh', String(Date.now()));
      if (!sharedToken && process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github') requestRefresh(token);
      window.location.replace(url.href);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The update could not be loaded.');
      setBusy(false);
      updating.current = false;
    }
  }, []);
  useEffect(() => {
    setAnchor(document.getElementById('app-updates'));
    let active = true;
    const checkShared = () => {
      if (process.env.NEXT_PUBLIC_DEPLOY_TARGET !== 'github') return;
      const token = readRefresh();
      const loaded = new URL(window.location.href).searchParams.get('updated');
      if (observedRefresh.current === null) {
        observedRefresh.current = token && !loaded ? '' : token;
        // Explicit fresh links already chose a version; do not replay an older request.
        if (token && !loaded) void update(token);
        return;
      }
      if (token && token !== observedRefresh.current) {
        if (loaded === token) observedRefresh.current = token;
        else void update(token);
      }
    };
    const onStorage = (event: StorageEvent) => {
      if (isRefreshStorage(event)) checkShared();
    };
    const check = async () => {
      checkShared();
      if (document.visibilityState !== 'visible' || !current) return;
      try {
        const response = await fetch(`${base}/assets/version.json?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (response.ok) {
          const version = await response.json();
          if (active && typeof version.build === 'string') setNewVersion(version.build !== current);
        }
      } catch {}
    };
    void check();
    const retry = setInterval(checkShared, 5000);
    window.addEventListener('storage', onStorage);
    window.addEventListener(refreshEvent, checkShared);
    window.addEventListener('focus', checkShared);
    window.addEventListener('pageshow', checkShared);
    const timer = setInterval(() => void check(), 60000);
    document.addEventListener('visibilitychange', check);
    return () => {
      active = false;
      clearInterval(timer);
      clearInterval(retry);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(refreshEvent, checkShared);
      window.removeEventListener('focus', checkShared);
      window.removeEventListener('pageshow', checkShared);
      document.removeEventListener('visibilitychange', check);
    };
  }, [update]);
  return (
    <>
      <div className="app-update-wrap">
        <button
          className={`icon-button app-update ${newVersion ? 'available' : ''}`}
          aria-label="Update app"
          title={
            newVersion
              ? 'A new version is available. Update the app.'
              : 'Load the latest published version'
          }
          disabled={busy}
          onClick={() => void update()}
        >
          <RefreshCw size={18} className={busy ? 'spinner' : ''} />
          {newVersion && <span className="app-update-dot" />}
        </button>
        {error && (
          <div className="app-update-error" role="alert">
            {error}
            <button aria-label="Dismiss update message" onClick={() => setError('')}>
              ×
            </button>
          </div>
        )}
      </div>
      {newVersion &&
        anchor &&
        createPortal(
          <div className="app-update-banner" role="status">
            <div>
              <RefreshCw size={19} />
              <span>A new version of the app is available.</span>
            </div>
            <button disabled={busy} onClick={() => void update()}>
              {busy ? 'Saving your progress…' : 'Update'}
            </button>
          </div>,
          anchor,
        )}
    </>
  );
}
