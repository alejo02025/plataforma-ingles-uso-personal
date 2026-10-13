'use client';
import { useEffect, useState } from 'react';
import {
  readRefresh,
  refreshedLink,
  refreshEvent,
  isRefreshStorage,
} from '@/lib/browser/app-refresh';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { isPortuguese, siteRoot } from '@/lib/workspace';

export function StudySpaces({ compact = false }: { compact?: boolean }) {
  const [token, setToken] = useState(process.env.NEXT_PUBLIC_APP_BUILD || '');
  useEffect(() => {
    const check = () => setToken(readRefresh() || process.env.NEXT_PUBLIC_APP_BUILD || '');
    const storage = (event: StorageEvent) => {
      if (isRefreshStorage(event)) check();
    };
    check();
    window.addEventListener('storage', storage);
    window.addEventListener(refreshEvent, check);
    window.addEventListener('pageshow', check);
    return () => {
      window.removeEventListener('storage', storage);
      window.removeEventListener(refreshEvent, check);
      window.removeEventListener('pageshow', check);
    };
  }, []);
  return (
    <section
      className={`study-spaces ${compact ? 'compact' : ''}`}
      aria-label={isPortuguese ? 'Espaços de estudo' : 'Study spaces'}
    >
      {!compact && (
        <div className="study-spaces-caption">
          <BookOpen size={17} />
          <span>
            {isPortuguese
              ? 'Dois idiomas. Cada um com seu próprio caminho.'
              : 'Two languages. A journey of your own.'}
          </span>
        </div>
      )}
      <div className="study-space-links">
        <a
          href={refreshedLink(`${siteRoot}/`, token)}
          onClick={(event) => {
            const href = refreshedLink(
              `${siteRoot}/`,
              readRefresh() || process.env.NEXT_PUBLIC_APP_BUILD || '',
            );
            event.currentTarget.href = `${href}${href.includes('?') ? '&' : '?'}opened=${Date.now()}`;
          }}
          aria-current={!isPortuguese ? 'page' : undefined}
          className="study-space english-space"
        >
          <span className="study-space-mark">e↗</span>
          <span>
            <strong>Alejo</strong>
            <small>{isPortuguese ? 'Inglês' : 'English'}</small>
          </span>
          <ArrowUpRight size={16} />
        </a>
        <a
          href={refreshedLink(`${siteRoot}/portugues/`, token)}
          onClick={(event) => {
            const href = refreshedLink(
              `${siteRoot}/portugues/`,
              readRefresh() || process.env.NEXT_PUBLIC_APP_BUILD || '',
            );
            event.currentTarget.href = `${href}${href.includes('?') ? '&' : '?'}opened=${Date.now()}`;
          }}
          aria-current={isPortuguese ? 'page' : undefined}
          className="study-space portuguese-space"
        >
          <span className="study-space-mark">p↗</span>
          <span>
            <strong>Jazmín</strong>
            <small>Português · Brasil</small>
          </span>
          <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
