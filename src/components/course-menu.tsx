'use client';
import { StudyCopy } from './study-copy';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, X, BookOpen, Newspaper, Plane, FileText, Bookmark } from 'lucide-react';
import { learningJourney } from '@/lib/course-route';
import { isPortuguese } from '@/lib/workspace';
import type { Snapshot } from '@/lib/types';
import { StudySpaces } from './study-spaces';
import { useDialog } from './use-dialog';
export function CourseMenu({
  data,
  navigate,
}: {
  data: Snapshot;
  navigate: (view: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="icon-button course-flag"
        aria-label="Choose a learning section"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">{isPortuguese ? '🇧🇷' : '🇬🇧'}</span>
      </button>
      {open &&
        createPortal(
          <Menu
            data={data}
            close={() => setOpen(false)}
            navigate={(view) => {
              setOpen(false);
              navigate(view);
            }}
          />,
          document.body,
        )}
    </>
  );
}
function Menu({
  data,
  close,
  navigate,
}: {
  data: Snapshot;
  close: () => void;
  navigate: (view: string) => void;
}) {
  const ref = useDialog(close),
    journey = learningJourney(data),
    level = journey.level;
  const categories = [
    {
      icon: BookOpen,
      title: isPortuguese ? 'Português completo' : 'Complete English',
      detail: isPortuguese
        ? 'Seu percurso conectado, de A1 a C2.'
        : 'Your connected learning path, from A2 to C2.',
      view: 'Classes',
    },
    {
      icon: Bookmark,
      title: isPortuguese ? 'Prática com jogos' : 'Practice through games',
      detail: isPortuguese
        ? 'Pratique o vocabulário do seu percurso.'
        : 'Practise vocabulary from your learning path.',
      view: 'Games',
    },
    {
      icon: Newspaper,
      title: isPortuguese ? 'O mundo em português' : 'The world in English',
      detail: isPortuguese
        ? 'Notícias reais, com fonte e data.'
        : 'Real headlines, with sources and dates.',
      view: 'News',
    },
    {
      icon: Plane,
      title: isPortuguese ? 'Leitura para a vida real' : 'Reading for real life',
      detail: isPortuguese ? 'Viagens, trabalho e ideias novas.' : 'Travel, work and new ideas.',
      view: 'Library',
    },
    {
      icon: FileText,
      title: isPortuguese ? 'Seus PDF' : 'Your PDFs',
      detail: isPortuguese ? 'Sua biblioteca, suas perguntas.' : 'Your bookshelf, your questions.',
      view: 'PDF Studio',
    },
    {
      icon: Bookmark,
      title: isPortuguese ? 'Palavras para guardar' : 'Words worth keeping',
      detail: isPortuguese ? 'Tradução, exemplos e revisão.' : 'Translation, examples and review.',
      view: 'Vocabulary',
    },
    {
      icon: BookOpen,
      title: isPortuguese ? 'Ajuda com o idioma' : 'Language help',
      detail: isPortuguese
        ? 'Verbos, frases e tempos. Sempre disponível.'
        : 'Verbs, sentences and tenses. Always available.',
      view: 'Language help',
    },
  ];
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        className="course-menu card"
        ref={ref as React.RefObject<HTMLElement>}
        role="dialog"
        aria-modal="true"
        aria-label="Learning sections"
      >
        <div className="section-heading">
          <h2>
            {isPortuguese ? 'Português · Brasil' : 'English'} · {level}
          </h2>
          <button className="icon-button" onClick={close} aria-label="Close learning sections">
            <X size={20} />
          </button>
        </div>
        <StudySpaces compact />
        {journey.next && (
          <div className="flag-next-step">
            <strong>Next guided step</strong>
            <StudyCopy as="p">{journey.next.explanation}</StudyCopy>
            <button className="button secondary" onClick={() => navigate('Classes')}>
              Open my learning path <ArrowRight size={16} />
            </button>
          </div>
        )}
        <div className="course-category-grid">
          {categories.map(({ icon: Icon, title, detail, view }, i) => (
            <button
              key={view}
              className={`course-category category-${i}`}
              onClick={() => navigate(view)}
            >
              <span>
                <strong>{title}</strong>
                <small>{detail}</small>
                <small className="flag-course-state">
                  {view === 'Language help' ? (
                    'Always available'
                  ) : (
                    <>
                      {level} ·{' '}
                      {journey.repairs.some((r) => r.view === view)
                        ? 'Reinforce first'
                        : journey.pending.some((r) => r.view === view)
                          ? 'Practice needed'
                          : 'Part of your learning path'}
                    </>
                  )}
                </small>
              </span>
              <Icon size={32} />
              <ArrowRight size={17} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
