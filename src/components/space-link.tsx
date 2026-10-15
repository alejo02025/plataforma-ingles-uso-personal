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
      href={refreshedLink(href, token)}
      onClick={(event) => {
        const fresh = refreshedLink(href, readRefresh() || process.env.NEXT_PUBLIC_APP_BUILD || '');
        event.currentTarget.href = `${fresh}${fresh.includes('?') ? '&' : '?'}opened=${Date.now()}`;
      }}
    >
      {spaceNames[language]} <ArrowUpRight size={14} />
    </a>
  );
}
