'use client';
import { useEffect, useState } from 'react';
import {
  readRefresh,
  refreshedLink,
  refreshEvent,
  isRefreshStorage,
} from '@/lib/browser/app-refresh';
import { siteRoot, spaceNames } from '@/lib/workspace';
import { ArrowUpRight } from 'lucide-react';
export const blockedSpaceChangeEvent = 'study-space-change-blocked';
/** Same release across spaces, separate learning databases. */
export function SpaceLink({
  language,
  compact = false,
}: {
  language: 'en' | 'pt';
  compact?: boolean;
}) {
  const [token, setToken] = useState(process.env.NEXT_PUBLIC_APP_BUILD || '');
  useEffect(() => {
    const check = () => setToken(readRefresh() || process.env.NEXT_PUBLIC_APP_BUILD || '');
    const storage = (e: StorageEvent) => {
      if (isRefreshStorage(e)) check();
    };
    check();
    window.addEventListener('storage', storage);
    window.addEventListener(refreshEvent, check);
    return () => {
      window.removeEventListener('storage', storage);
      window.removeEventListener(refreshEvent, check);
    };
  }, []);
  const href = `${siteRoot}${language === 'pt' ? '/portugues/' : '/'}`;
  const label = language === 'pt' ? 'Português' : 'English';
  return (
    <a
      aria-label={compact ? `${label} — ${spaceNames[language]}` : spaceNames[language]}
      href={refreshedLink(href, token)}
      onClick={(event) => {
        if (document.querySelector('.oral-recording-active')) {
          event.preventDefault();
          window.dispatchEvent(new Event(blockedSpaceChangeEvent));
          return;
        }
        const fresh = refreshedLink(href, readRefresh() || process.env.NEXT_PUBLIC_APP_BUILD || '');
        event.currentTarget.href = `${fresh}${fresh.includes('?') ? '&' : '?'}opened=${Date.now()}`;
      }}
    >
      <span aria-hidden>{language === 'pt' ? '🇧🇷' : '🇬🇧'}</span>
      {compact ? label : spaceNames[language]}
      {!compact && <ArrowUpRight size={14} />}
    </a>
  );
}

/** Always visible: changing space never shares its learning database. */
export function LanguageSwitcher({ portuguese }: { portuguese: boolean }) {
  const current = (
    <span className="language-current" aria-current="true">
      <span aria-hidden>{portuguese ? '🇧🇷' : '🇬🇧'}</span>
      {portuguese ? 'Português' : 'English'}
    </span>
  );
  return (
    <div
      className="language-switcher"
      role="group"
      aria-label={portuguese ? 'Idioma de estudo' : 'Study language'}
    >
      {portuguese ? <SpaceLink language="en" compact /> : current}
      {portuguese ? current : <SpaceLink language="pt" compact />}
    </div>
  );
}
