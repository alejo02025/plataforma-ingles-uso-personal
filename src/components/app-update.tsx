'use client';
import { assetBase } from '@/lib/workspace';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw } from 'lucide-react';
const base = assetBase;
const current = process.env.NEXT_PUBLIC_APP_BUILD || '';
export function AppUpdate() {
  const [newVersion, setNewVersion] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [anchor, setAnchor] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setAnchor(document.getElementById('app-updates'));
    let active = true;
    const check = async () => {
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
    const timer = setInterval(() => void check(), 60000);
    document.addEventListener('visibilitychange', check);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);
  async function update() {
    setBusy(true);
    setError('');
    try {
      // An older page may reference a removed, never-loaded AI chunk after deployment.
      // A running engine has already loaded this module; keep its download/reply guard.
      const local = await import('@/lib/browser/local-ai').catch(() => undefined);
      if (local && ['generating', 'loading'].includes(local.localStatus().state))
        throw new Error('Finish the AI response or download before updating.');
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github') {
        const { exclusive, load, persist } = await import('@/lib/browser/database');
        await load();
        await exclusive(persist);
      }
      const url = new URL(window.location.href);
      url.searchParams.set('updated', String(Date.now()));
      window.location.replace(url.href);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The update could not be loaded.');
      setBusy(false);
    }
  }
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
