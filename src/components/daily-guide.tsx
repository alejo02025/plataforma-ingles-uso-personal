'use client';
import { StudyCopy } from './study-copy';
import { useEffect, useState, type ReactNode } from 'react';
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
  availableMinutes = data.profile.daily_minutes,
}: {
  data: Snapshot;
  onRead: (doc: Document) => void;
  onStart: (a: Activity) => void;
  onClass: (id: string) => void;
  onGame: (seed: string) => void;
  navigate: (view: string) => void;
  availableMinutes?: number;
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
          <h2>{pt ? 'Por onde começar hoje?' : 'Where should you start today?'}</h2>
          <StudyCopy
            as="p"
            native={
              pt
                ? 'Uma sugestão flexível para explorar. Para aprender passo a passo, siga as Atividades. Você não precisa começar lendo um artigo.'
                : 'A flexible suggestion for exploring. To learn step by step, follow Activities. You do not need to start with an article.'
            }
          >
            Una sugerencia flexible para explorar. Para aprender paso a paso, seguí Actividades más
            abajo; no necesitás empezar leyendo un artículo.
          </StudyCopy>
        </div>
        <span className="pill neutral">
          <Clock3 size={15} />
          {guide.minutes} min · {pt ? 'percurso completo' : 'full route'} · {guide.journey.level}
        </span>
      </div>
      {availableMinutes < guide.minutes && (
        <StudyCopy
          as="small"
          native={
            pt
              ? `Hoje você escolheu ${availableMinutes} minutos. Explore apenas um passo; este percurso completo é opcional e pode continuar em outro dia.`
              : `You chose ${availableMinutes} minutes today. Explore just one step; this full route is optional and can continue another day.`
          }
        >
          Hoy elegiste {availableMinutes} minutos. Explorá un solo paso; este recorrido completo es
          opcional y puede seguir otro día.
        </StudyCopy>
      )}
      {guide.journey.repairs.length > 0 && (
        <StudyCopy
          as="p"
          className="journey-next"
          native={
            pt
              ? 'Hoje vale reforçar uma habilidade. Nas Atividades, você verá o que retomar e por quê.'
              : 'Today is a good day to strengthen a skill. In Activities, you will see what to revisit and why.'
          }
        >
          Hoy conviene reforzar una competencia. En Actividades, más abajo, vas a ver qué retomar y
          por qué.
        </StudyCopy>
      )}
      <ol className="daily-guide-steps">
        <GuideStep
          number="01"
          title={
            <>
              <BookOpen size={18} />
              {pt ? 'Dê uma primeira olhada' : 'Take a first look'}
            </>
          }
          first={false}
          reason="Reconocé palabras e ideas antes de usarlas."
          nativeReason={
            pt
              ? 'Reconheça palavras e ideias antes de usá-las.'
              : 'Notice words and ideas before using them.'
          }
        >
          <strong>{guide.reading?.title || (pt ? 'Sua biblioteca' : 'Your library')}</strong>
          <p>
            {pt
              ? 'Leia a introdução e um trecho. Toque em uma palavra que despertar sua curiosidade.'
              : 'Read the introduction and one passage. Tap a word that catches your attention.'}
          </p>
          <StudyCopy
            as="p"
            native={
              guide.pending
                ? pt
                  ? 'Retome esta leitura pendente. Suas respostas anteriores foram preservadas.'
                  : 'Resume this unfinished reading. Your previous answers have been preserved.'
                : pt
                  ? `Escolhemos uma leitura do seu nível para observar o idioma antes de praticar “${guide.lesson.title}”.`
                  : `We chose a reading at your study level to notice language before practising “${guide.lesson.title}”.`
            }
          >
            {guide.pending
              ? 'Primero retomá esta lectura pendiente: conserva tus respuestas anteriores.'
              : `Buscamos una lectura de tu nivel para observar el idioma antes de practicar «${guide.lesson.title}».`}
          </StudyCopy>
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
        </GuideStep>
        <GuideStep
          number="02"
          title={
            <>
              <BookOpen size={18} />
              {pt ? 'Transforme a leitura em prática' : 'Turn noticing into practice'}
            </>
          }
          first={false}
          reason="Convertí una idea de la lectura en una oración propia."
          nativeReason={
            pt
              ? 'Transforme uma ideia da leitura em uma frase sua.'
              : 'Turn an idea from the reading into a sentence of your own.'
          }
        >
          <strong>{guide.lesson.title}</strong>
          <p>{guide.lesson.goal}</p>
          <StudyCopy
            as="p"
            native={
              pt
                ? 'Use o texto anterior como exemplo: encontre uma frase e compare-a com este modelo. Se faltam requisitos, reveja a explicação sem pular etapas.'
                : 'Use the previous text as an example: find a sentence and compare it with this model. If requirements are still pending, review the explanation without skipping steps.'
            }
          >
            Usá el texto anterior como ejemplo: buscá una oración y comparala con este modelo. Si
            todavía hay requisitos pendientes, podés repasar la explicación sin saltar el recorrido.
          </StudyCopy>
          <blockquote>{guide.lesson.examples[0]}</blockquote>
          <Button secondary onClick={() => onClass(guide.lesson.id)}>
            {pt ? 'Abrir aula sugerida' : 'Open suggested class'}
            <ArrowRight size={15} />
          </Button>
        </GuideStep>
        <GuideStep
          number="03"
          title={
            <>
              <Newspaper size={18} />
              {pt ? 'Olhe para o mundo' : 'Look at the world'}
            </>
          }
          first={false}
          reason="Probá el idioma con una noticia real."
          nativeReason={
            pt
              ? 'Pratique o idioma com uma notícia real.'
              : 'Try the language with a real news story.'
          }
        >
          {guide.story ? (
            <>
              <strong>{guide.story.title}</strong>
              <p className="fine-print">
                {guide.story.source} ·{' '}
                <time dateTime={guide.story.published}>
                  {new Date(guide.story.published).toLocaleDateString(pt ? 'pt-BR' : 'en-US')}
                </time>
              </p>
              <StudyCopy
                as="p"
                native={
                  (guide.relatedStory
                    ? pt
                      ? 'Este título compartilha vocabulário com sua leitura ou aula.'
                      : 'This headline shares vocabulary with your reading or class.'
                    : pt
                      ? 'Este título amplia a prática: use o modelo da aula em outra situação. O tema pode ser diferente.'
                      : 'This headline broadens your practice: use the class model in another situation. The topic may differ.') +
                  (pt
                    ? ' A pergunta é aberta, sem nota automática.'
                    : ' The question is open-ended, with no automatic score.')
                }
              >
                {guide.relatedStory
                  ? 'Elegimos este titular porque comparte vocabulario con tu lectura o clase.'
                  : 'Este titular amplía la práctica: intentá hablar de otra situación usando el modelo de la clase. No necesariamente trata el mismo tema.'}{' '}
                La pregunta es abierta y no recibe una nota automática.
              </StudyCopy>
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
              <StudyCopy
                as="small"
                native={
                  storageError
                    ? pt
                      ? 'Não foi possível salvar neste navegador. Guarde uma cópia da sua resposta.'
                      : 'This browser could not save your response. Keep a copy.'
                    : pt
                      ? 'Sua reflexão é salva automaticamente neste dispositivo, sem nota. A fonte requer conexão.'
                      : 'Your reflection is automatically saved on this device, without a score. Opening the source requires a connection.'
                }
              >
                {storageError
                  ? 'No se pudo guardar en este navegador. Conservá una copia de tu respuesta.'
                  : 'Tu reflexión se guarda automáticamente en este dispositivo, sin nota. Abrir la fuente requiere conexión.'}
              </StudyCopy>
            </>
          ) : (
            <>
              <StudyCopy
                as="p"
                native={
                  pt
                    ? 'Não há notícia baixada disponível. Pule este passo ou abra Notícias com conexão; não inventamos títulos.'
                    : 'There is no downloaded story available. Skip this step or open News while online; we do not invent headlines.'
                }
              >
                No hay una noticia descargada disponible. Podés saltear este paso o abrir Noticias
                con conexión; no inventamos un titular.
              </StudyCopy>
              <Button secondary onClick={() => navigate('News')}>
                {pt ? 'Ver notícias' : 'See news'}
              </Button>
            </>
          )}
        </GuideStep>
        <GuideStep
          number="04"
          title={
            <>
              <Puzzle size={18} />
              {pt ? 'Brinque com as palavras' : 'Play with the words'}
            </>
          }
          first={false}
          reason="Recordá y reutilizá las palabras que viste."
          nativeReason={
            pt
              ? 'Lembre e reutilize as palavras que viu.'
              : 'Recall and reuse the words you noticed.'
          }
        >
          <strong>{pt ? 'Combinar significados' : 'Meaning Match'}</strong>
          <StudyCopy
            as="p"
            native={
              (guide.linkedWords.length
                ? pt
                  ? `Este jogo recupera palavras do texto ou dos exemplos: ${guide.linkedWords.join(', ')}. Tente lembrar antes de consultar a ajuda.`
                  : `This game revisits words from the text or examples: ${guide.linkedWords.join(', ')}. Try to recall them before using help.`
                : pt
                  ? 'Este jogo revisa palavras do seu nível. Depois, escolha uma e escreva uma frase sobre o que leu.'
                  : 'This game reviews words at your level. Then choose one and write a sentence about what you read.') +
              (pt
                ? ' Uma partida pendente é retomada primeiro para preservá-la.'
                : 'An unfinished game is resumed first to preserve it.')
            }
          >
            {guide.linkedWords.length
              ? `Este juego recupera vocabulario del texto o de los ejemplos: ${guide.linkedWords.join(', ')}. Intentá recordar antes de mirar la ayuda.`
              : 'Este juego repasa palabras de tu nivel. Después, elegí una y escribí una oración sobre lo que leíste.'}{' '}
            Si tenés una partida pendiente, se retoma primero para conservarla.
          </StudyCopy>
          <div className="guide-words">
            {guide.puzzle.rounds.map((r) => (
              <span key={r.word}>{r.word}</span>
            ))}
          </div>
          <Button secondary onClick={() => onGame(guide.seed)}>
            {pt ? 'Jogar a sugestão' : 'Play suggested game'}
            <ArrowRight size={15} />
          </Button>
        </GuideStep>
      </ol>
      <StudyCopy
        as="p"
        className="guide-closing"
        native={
          pt
            ? 'Dica: comece com uma atividade curta do percurso. A ordem é uma sugestão; as aulas mantêm seus requisitos.'
            : 'Tip: start with a short path activity. The order is a suggestion; classes still respect their requirements.'
        }
      >
        Tip: si estás empezando, probá primero una actividad corta del recorrido de abajo. El orden
        es una sugerencia; abrir una clase sigue respetando sus requisitos.
      </StudyCopy>
    </section>
  );
}

function GuideStep({
  number,
  title,
  first,
  reason,
  nativeReason,
  children,
}: {
  number: string;
  title: ReactNode;
  first: boolean;
  reason: string;
  nativeReason: string;
  children: ReactNode;
}) {
  return (
    <li>
      <details className="guide-step" open={first}>
        <summary>
          <span className="guide-number">{number}</span>
          <span className="guide-summary-copy">
            <h3>{title}</h3>
            <StudyCopy as="small" native={nativeReason}>
              {reason}
            </StudyCopy>
          </span>
        </summary>
        <div className="guide-step-body">{children}</div>
      </details>
    </li>
  );
}
