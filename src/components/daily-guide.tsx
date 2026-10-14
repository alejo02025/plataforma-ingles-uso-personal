'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Clock3, Newspaper, Puzzle } from 'lucide-react';
import { dailyGuide, type NewsStory } from '@/lib/daily-guide';
import { assetBase, isPortuguese, studyStorage } from '@/lib/workspace';
import type { Activity, Document, Snapshot } from '@/lib/types';
import { Button } from './ui';
export function DailyGuide({
  data,
  onRead,
  onStart,
  onClass,
  onGame,
  navigate,
}: {
  data: Snapshot;
  onRead: (doc: Document) => void;
  onStart: (a: Activity) => void;
  onClass: (id: string) => void;
  onGame: (seed: string) => void;
  navigate: (view: string) => void;
}) {
  const [stories, setStories] = useState<NewsStory[]>([]);
  const [answer, setAnswer] = useState('');
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    let alive = true;
    fetch(`${assetBase}/assets/briefing.json`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('No briefing');
        return r.json();
      })
      .then((value) => {
        if (alive && Array.isArray(value.stories))
          setStories(
            value.stories.filter((s: NewsStory) => s.language === (isPortuguese ? 'pt' : 'en')),
          );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const guide = dailyGuide(data, stories);
  const key = `daily-guide:${data.day}:${guide.story?.id || 'no-news'}`;
  useEffect(() => {
    try {
      setAnswer(studyStorage.getItem(key) || '');
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [key]);
  const pt = isPortuguese;
  return (
    <section
      className="card daily-guide"
      aria-label={pt ? 'Sugestão para hoje' : 'Today’s suggested route'}
    >
      <div className="daily-guide-heading">
        <div>
          <span className="eyebrow">
            {pt ? 'UM BOM JEITO DE COMEÇAR' : 'A GOOD PLACE TO START'}
          </span>
          <h2>{pt ? 'Seu dia, com um fio condutor.' : 'Your day, one connected idea.'}</h2>
          <p>
            {pt
              ? 'Uma sugestão, não uma lista obrigatória. Escolha o que cabe no seu dia.'
              : 'A suggestion, not a required checklist. Pick what fits your day.'}
          </p>
        </div>
        <span className="pill neutral">
          <Clock3 size={15} />
          {guide.minutes} min · {guide.journey.level}
        </span>
      </div>
      <p className="fine-print" lang="es">
        Tiempo estimado para explorar, no para completar todas las tareas. Podés cambiar el orden o
        saltear esta sugerencia; los requisitos reales de las clases siguen vigentes.
      </p>
      {guide.journey.repairs.length > 0 && (
        <p className="journey-next" lang="es">
          {guide.journey.repairs[0].explanation}
        </p>
      )}
      <ol className="daily-guide-steps">
        <li>
          <span className="guide-number">01</span>
          <div>
            <h3>
              <BookOpen size={18} />
              {pt ? 'Dê uma primeira olhada' : 'Take a first look'}
            </h3>
            <strong>{guide.reading?.title || (pt ? 'Sua biblioteca' : 'Your library')}</strong>
            <p>
              {pt
                ? 'Leia a introdução e um trecho. Toque em uma palavra que despertar sua curiosidade.'
                : 'Read the introduction and one passage. Tap a word that catches your attention.'}
            </p>
            <p lang="es">
              {guide.pending
                ? 'Primero retomá esta lectura pendiente: conserva tus respuestas anteriores.'
                : `Buscamos una lectura de tu nivel para observar el idioma antes de practicar «${guide.lesson.title}».`}
            </p>
            <Button
              secondary
              onClick={() =>
                guide.pending
                  ? onStart(guide.pending)
                  : guide.reading
                    ? onRead(guide.reading)
                    : navigate('Library')
              }
            >
              {pt ? 'Abrir leitura' : 'Open suggested reading'}
              <ArrowRight size={15} />
            </Button>
          </div>
        </li>
        <li>
          <span className="guide-number">02</span>
          <div>
            <h3>
              <BookOpen size={18} />
              {pt ? 'Transforme a leitura em prática' : 'Turn noticing into practice'}
            </h3>
            <strong>{guide.lesson.title}</strong>
            <p>{guide.lesson.goal}</p>
            <p lang="es">
              Usá el texto anterior como ejemplo: buscá una oración y comparala con este modelo. Si
              todavía hay requisitos pendientes, podés repasar la explicación sin saltar el
              recorrido.
            </p>
            <blockquote>{guide.lesson.examples[0]}</blockquote>
            <Button secondary onClick={() => onClass(guide.lesson.id)}>
              {pt ? 'Abrir aula sugerida' : 'Open suggested class'}
              <ArrowRight size={15} />
            </Button>
          </div>
        </li>
        <li>
          <span className="guide-number">03</span>
          <div>
            <h3>
              <Newspaper size={18} />
              {pt ? 'Olhe para o mundo' : 'Look at the world'}
            </h3>
            {guide.story ? (
              <>
                <strong>{guide.story.title}</strong>
                <p className="fine-print">
                  {guide.story.source} ·{' '}
                  <time dateTime={guide.story.published}>
                    {new Date(guide.story.published).toLocaleDateString(pt ? 'pt-BR' : 'en-US')}
                  </time>
                </p>
                <p lang="es">
                  {guide.relatedStory
                    ? 'Elegimos este titular porque comparte vocabulario con tu lectura o clase.'
                    : 'Este titular amplía la práctica: intentá hablar de otra situación usando el modelo de la clase. No necesariamente trata el mismo tema.'}{' '}
                  La pregunta es abierta y no recibe una nota automática.
                </p>
                <a className="text-link" href={guide.story.url} target="_blank" rel="noreferrer">
                  {pt ? 'Ler na fonte' : 'Read the source'} ↗
                </a>
                <label className="guide-question">
                  {pt
                    ? 'O que aconteceu e por que isso importa? Escreva duas frases usando uma ideia da aula.'
                    : 'What happened, and why does it matter? Write two sentences using an idea from your class.'}
                  <textarea
                    maxLength={4000}
                    rows={3}
                    value={answer}
                    placeholder={pt ? 'Minha reflexão…' : 'My reflection…'}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      try {
                        studyStorage.setItem(key, e.target.value);
                        setStorageError(false);
                      } catch {
                        setStorageError(true);
                      }
                    }}
                  />
                </label>
                <small lang="es">
                  {storageError
                    ? 'No se pudo guardar en este navegador. Conservá una copia de tu respuesta.'
                    : 'Tu reflexión se guarda automáticamente en este dispositivo, sin nota. Abrir la fuente requiere conexión.'}
                </small>
              </>
            ) : (
              <>
                <p lang="es">
                  No hay una noticia descargada disponible. Podés saltear este paso o abrir Noticias
                  con conexión; no inventamos un titular.
                </p>
                <Button secondary onClick={() => navigate('News')}>
                  {pt ? 'Ver notícias' : 'See news'}
                </Button>
              </>
            )}
          </div>
        </li>
        <li>
          <span className="guide-number">04</span>
          <div>
            <h3>
              <Puzzle size={18} />
              {pt ? 'Brinque com as palavras' : 'Play with the words'}
            </h3>
            <strong>{pt ? 'Combinar significados' : 'Meaning Match'}</strong>
            <p lang="es">
              {guide.linkedWords.length
                ? `Este juego recupera vocabulario del texto o de los ejemplos: ${guide.linkedWords.join(', ')}. Intentá recordar antes de mirar la ayuda.`
                : 'Este juego repasa palabras de tu nivel. Después, elegí una y escribí una oración sobre lo que leíste.'}{' '}
              Si tenés una partida pendiente, se retoma primero para conservarla.
            </p>
            <div className="guide-words">
              {guide.puzzle.rounds.map((r) => (
                <span key={r.word}>{r.word}</span>
              ))}
            </div>
            <Button secondary onClick={() => onGame(guide.seed)}>
              {pt ? 'Jogar a sugestão' : 'Play suggested game'}
              <ArrowRight size={15} />
            </Button>
          </div>
        </li>
      </ol>
      <p className="fine-print" lang="es">
        Para cerrar: contá en una oración qué idea te llevás hoy. Con pocos minutos, elegí un solo
        paso. Esta guía se adapta a tu nivel y a los refuerzos pendientes, sin reiniciar tu
        progreso.
      </p>
    </section>
  );
}
