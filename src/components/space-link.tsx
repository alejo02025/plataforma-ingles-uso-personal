'use client';
import { useEffect, useState } from 'react';
import {
  readRefresh,
  refreshedLink,
  refreshEvent,
  isRefreshStorage,
} from '@/lib/browser/app-refresh';
import { siteRoot, isPortuguese } from '@/lib/workspace';
export const blockedSpaceChangeEvent = 'study-space-change-blocked';
/** Same release across spaces, separate learning databases. */
export function SpaceLink({ language }: { language: 'en' | 'pt' }) {
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
  return (
    <a
      className="language-choice"
      aria-label={language === 'pt' ? '🇧🇷 Português brasileiro' : '🇬🇧 English'}
      aria-current={(language === 'pt') === isPortuguese ? 'page' : undefined}
      lang={language === 'pt' ? 'pt-BR' : 'en'}
      href={refreshedLink(href, token)}
      onClick={(event) => {
        if ((language === 'pt') === isPortuguese) {
          event.preventDefault();
          return;
        }
        if (document.querySelector('.oral-recording-active')) {
          event.preventDefault();
          window.dispatchEvent(new Event(blockedSpaceChangeEvent));
          return;
        }
        const fresh = refreshedLink(href, readRefresh() || process.env.NEXT_PUBLIC_APP_BUILD || '');
        event.currentTarget.href = `${fresh}${fresh.includes('?') ? '&' : '?'}opened=${Date.now()}`;
      }}
    >
      <span className="language-flag" aria-hidden="true">
        {language === 'pt' ? '🇧🇷' : '🇬🇧'}
      </span>
      <span className="language-name">{language === 'pt' ? 'Português' : 'English'}</span>
    </a>
  );
}

export function LanguageSwitcher({ portuguese }: { portuguese: boolean }) {
  return (
    <div
      className="language-switcher mobile-language-switch"
      role="group"
      aria-label={portuguese ? 'Idioma de estudo' : 'Study language'}
    >
      <SpaceLink language="en" />
      <SpaceLink language="pt" />
    </div>
  );
}
