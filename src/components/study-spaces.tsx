'use client';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { isPortuguese, siteRoot } from '@/lib/workspace';

export function StudySpaces({ compact = false }: { compact?: boolean }) {
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
          href={`${siteRoot}/`}
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
          href={`${siteRoot}/portugues/`}
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
