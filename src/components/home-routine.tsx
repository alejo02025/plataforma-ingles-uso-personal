'use client';
import { StudyCopy } from './study-copy';
import { useEffect, useState } from 'react';
import { BookOpen, Check, Lock, Pencil, Puzzle, Sparkles, Shapes } from 'lucide-react';
import {
  learningJourney,
  levelLessons,
  blockSize,
  passedLesson,
  lessonRequirements,
} from '@/lib/course-route';
import { cefrLevels } from '@/lib/cefr-curriculum';
import { levelBases } from '@/locales/learning/level-bases';
import { isPortuguese } from '@/lib/workspace';
import {
  routineRecord,
  routineTitles,
  routineEdition,
  routinePassThreshold,
  type RoutineMode,
} from '@/lib/routine';
import {
  readRoutineDraft,
  clearRoutineDraft,
  type RoutineDraft,
} from '@/lib/browser/routine-draft';
import type { Snapshot, Activity } from '@/lib/types';
import { api } from './ui';
import { RoutineSession } from './routine-session';
export function HomeRoutine({
  data,
  refresh,
  onStart,
  onClass,
  onGame,
  compact = false,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  onStart: (a: Activity) => void;
  onClass: (id: string) => void;
  onGame: (seed: string) => void;
  compact?: boolean;
}) {
  const journey = learningJourney(data),
    [preview, setPreview] = useState(''),
    [session, setSession] = useState<RoutineDraft | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  const level =
      preview && journey.completed.includes(preview as (typeof cefrLevels)[number])
        ? preview
        : journey.level,
    block = level === journey.level ? journey.block : 0;
  const lessons = levelLessons(level).slice(block * blockSize, (block + 1) * blockSize),
    passed = lessons.filter((l) => passedLesson(data, l.id)).length,
    next = lessons.find((l) => !passedLesson(data, l.id)) || lessons[0];
  const rows = data.results.filter((r) => {
    const meta = routineRecord(r);
    return meta?.level === level && meta.block === block;
  });
  function practised(mode: RoutineMode) {
    if (level === journey.level && journey.repairs.some((r) => r.id === `reinforce:${mode}`))
      return false;
    if (
      level === journey.level &&
      mode !== 'grammar' &&
      journey.tasks.find((r) => r.id === mode || (mode === 'vocabulary' && r.id === 'vocabulary'))
        ?.done
    )
      return true;
    if (
      mode === 'grammar' &&
      lessons.some((l) => passedLesson(data, l.id) && (l.skill || 'grammar') === 'grammar')
    )
      return true;
    return rows.some((r) => {
      const meta = routineRecord(r);
      return (
        r.skill === mode &&
        Number(r.total) > 0 &&
        Number(r.correct) / Number(r.total) >= routinePassThreshold(mode) &&
        !meta?.helpUsed
      );
    });
  }
  function open(mode: RoutineMode) {
    setError('');
    const pending = readRoutineDraft({ mode, level, block });
    if (pending && !data.results.some((r) => r.activity_id === `routine:${pending.id}`)) {
      setSession(pending);
      return;
    }
    if (pending) clearRoutineDraft(pending.id);
    setSession({
      id: crypto.randomUUID(),
      mode,
      level,
      block,
      edition: routineEdition,
      variant: Math.min(
        1000,
        Math.max(
          -1,
          ...rows.map((r) => {
            const meta = routineRecord(r);
            return meta?.mode === mode && meta.edition === 2 ? meta.variant : -1;
          }),
        ) + 1,
      ),
      answers: [],
      choice: '',
      picked: [],
      checked: false,
      helpUsed: false,
      seconds: 0,
    });
  }
  useEffect(() => {
    const start = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: string }>).detail?.mode;
      if (mode === 'vocabulary' || mode === 'grammar' || mode === 'reading') open(mode);
      else if (mode === 'writing') void write();
    };
    window.addEventListener('english-os:routine-start', start);
    return () => window.removeEventListener('english-os:routine-start', start);
  }, [data, preview]);
  async function write() {
    setError('');
    setBusy(true);
    try {
      const activity = await api<Activity>('course/writing', {});
      await refresh();
      onStart(activity);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const writing = journey.tasks.find((t) => t.id === 'writing')?.done || false;
  const pendingClass = next ? lessonRequirements(data, next).filter((t) => !t.done) : [];
  const steps = [
    {
      id: 'vocabulary',
      name: routineTitles.vocabulary,
      why: 'Reconocé palabras útiles antes de usarlas. Elegí la palabra que corresponde a cada significado.',
      icon: Shapes,
      done: practised('vocabulary'),
      onClick: () => open('vocabulary'),
    },
    {
      id: 'grammar',
      name: routineTitles.grammar,
      why: 'Pasá de palabras sueltas a una idea: ordená bloques para armar una oración y entendé el porqué.',
      icon: Pencil,
      done: practised('grammar'),
      onClick: () => open('grammar'),
    },
    {
      id: 'reading',
      name: routineTitles.reading,
      why: 'Leé una situación de pocas líneas y encontrá información. No necesitás empezar con un artículo largo.',
      icon: BookOpen,
      done: practised('reading'),
      onClick: () => open('reading'),
    },
    {
      id: 'classes',
      name: isPortuguese ? 'Aprender e aplicar' : 'Learn and apply',
      why: `Aplicá el patrón de tus clases de este bloque. ${passed}/${lessons.length} clases aprobadas. ${pendingClass.length ? 'Hay un paso pendiente; al abrir la clase vas a ver qué retomar primero.' : 'Cada clase necesita al menos 80 % de aciertos; podés volver a intentarla.'}`,
      icon: BookOpen,
      done: passed === lessons.length,
      onClick: () => next && onClass(next.id),
      locked: pendingClass.length > 0,
    },
    {
      id: 'writing',
      name: isPortuguese ? 'Dizer algo seu' : 'Say something of your own',
      why:
        level === journey.level
          ? 'Escribí dos frases sobre tu vida usando una idea del bloque. Se guarda la práctica; la extensión no demuestra la calidad del idioma.'
          : `La escritura nueva usa tu nivel activo ${journey.level}; podés aplicar una idea de este repaso.`,
      icon: Pencil,
      done: level === journey.level && writing,
      onClick: () => void write(),
    },
  ];
  const stepReasons: Record<string, string> = isPortuguese
    ? {
        vocabulary:
          'Reconheça palavras úteis em situações reais antes de usá-las. Escolha a palavra que completa cada ideia.',
        grammar:
          'Passe de palavras a ideias: organize blocos para responder a situações e entender o padrão.',
        reading:
          'Leia situações curtas, encontre detalhes e use-os para decidir. Não é preciso começar por um artigo longo.',
        classes: `Aplique os padrões nas aulas deste bloco. ${passed}/${lessons.length} aulas aprovadas. ${pendingClass.length ? 'Ao abrir, você verá o que retomar primeiro.' : 'Cada aula exige pelo menos 80% de acertos nos exercícios; isso não certifica domínio.'}`,
        writing: `Escreva duas frases pessoais no nível ativo ${journey.level}. A prática é salva; a extensão não demonstra qualidade linguística.`,
      }
    : {
        vocabulary:
          'Recognise useful words in real situations before using them. Choose the word that completes each idea.',
        grammar:
          'Move from words to ideas: arrange blocks to respond to situations and understand the pattern.',
        reading:
          'Read short situations, find details and use them to decide. You do not need to start with a long article.',
        classes: `Apply patterns in this block’s classes. ${passed}/${lessons.length} classes passed. ${pendingClass.length ? 'Open the class to see what to resume first.' : 'Each class needs at least 80% correct answers in its exercises; this does not certify mastery.'}`,
        writing: `Write two personal sentences at your active level ${journey.level}. Practice is saved; length does not demonstrate language quality.`,
      };
  const done = steps.filter((s) => s.done).length;
  const pendingDraft = readRoutineDraft();
  const following = session
    ? steps.find((step) => !step.done && step.id !== session.mode)
    : undefined;
  function advance(independentPass: boolean) {
    if (!session) return;
    const mode = session.mode;
    setSession(null);
    if (!independentPass) open(mode);
    else if (following) following.onClick();
  }
  const goalNative: Record<string, string> = isPortuguese
    ? {
        A1: 'Apresentar-se e falar da família, da cidade e de necessidades imediatas.',
        A2: 'Descrever rotinas, comparar opções e lidar com viagens e compras.',
        B1: 'Narrar experiências e explicar decisões com exemplos.',
        B2: 'Defender uma opinião com razões, exemplos e um contraponto.',
        C1: 'Expressar ideias complexas com precisão e adaptar o registro.',
        C2: 'Interpretar nuances e formular argumentos com precisão e alcance controlado.',
      }
    : {
        A1: 'Introduce yourself and discuss family, your town and immediate needs.',
        A2: 'Describe routines, compare options and handle travel and shopping.',
        B1: 'Describe experiences and explain decisions with examples.',
        B2: 'Support an opinion with reasons, examples and a counterargument.',
        C1: 'Express complex ideas precisely and adapt your register.',
        C2: 'Interpret nuances and formulate precise arguments with carefully controlled scope.',
      };
  if (compact) {
    return session ? (
      <RoutineSession
        key={session.id}
        initial={session}
        refresh={refresh}
        close={() => {
          setSession(null);
          window.dispatchEvent(new Event('english-os:routine-paused'));
        }}
        onAdvance={advance}
        nextLabel={
          following
            ? `${isPortuguese ? 'Próxima etapa' : 'Next step'}: ${following.name}`
            : isPortuguese
              ? 'Concluir por hoje'
              : 'Finish for today'
        }
      />
    ) : null;
  }
  return (
    <section
      className="home-routine card"
      aria-label={isPortuguese ? 'Atividades de aprendizagem' : 'Learning activities'}
    >
      <span className="eyebrow">
        {isPortuguese ? 'APRENDER, UM PASSO DE CADA VEZ' : 'LEARN, ONE STEP AT A TIME'}
      </span>
      <h2>{isPortuguese ? 'Seu percurso de atividades' : 'Your activity path'}</h2>
      <StudyCopy
        as="p"
        className="routine-purpose"
        native={
          isPortuguese
            ? 'Por que entrar hoje? Para reconhecer palavras, formar uma ideia, entendê-la em contexto e usá-la por conta própria. Este é seu percurso; a sugestão acima oferece alternativas.'
            : 'Why come back today? To recognise words, build an idea, understand it in context and use it independently. This is your path; the suggestion above offers alternatives.'
        }
      >
        <strong>¿Para qué entrar hoy?</strong> Para aprender algo que puedas usar: reconocer
        palabras, armar una idea, entenderla en contexto y expresarla por tu cuenta. Este es tu
        recorrido; la sugerencia de arriba te ofrece alternativas.
      </StudyCopy>
      <div
        className="routine-levels"
        role="group"
        aria-label={isPortuguese ? 'Níveis do percurso' : 'Path levels'}
      >
        {cefrLevels.map((l) => {
          const available = l === journey.level || journey.completed.includes(l);
          return (
            <button
              key={l}
              disabled={!available}
              aria-pressed={l === level}
              title={
                !available
                  ? isPortuguese
                    ? `Nível ativo: ${journey.level}. Os outros níveis são desbloqueados com aulas e práticas.`
                    : `Active level: ${journey.level}. Other levels unlock through classes and practice.`
                  : l === journey.level
                    ? isPortuguese
                      ? 'Seu nível ativo'
                      : 'Your active level'
                    : isPortuguese
                      ? 'Nível concluído, disponível para revisão'
                      : 'Completed level, available for review'
              }
              onClick={() => setPreview(l === journey.level ? '' : l)}
            >
              {!available && <Lock size={12} />} {l}
            </button>
          );
        })}
      </div>
      <StudyCopy
        as="p"
        className="fine-print"
        native={
          isPortuguese
            ? `Seu nível ativo é ${journey.level}. Os próximos são desbloqueados com aulas e práticas; os concluídos ficam para revisão.`
            : `Your active level is ${journey.level}. Later levels unlock through classes and practice; completed ones remain available for review.`
        }
      >
        Tu nivel activo es {journey.level}. Los siguientes se habilitan al completar clases y
        prácticas; los ya completados quedan para repaso.
      </StudyCopy>
      <StudyCopy
        as="p"
        className="routine-goal"
        native={`${level} · ${isPortuguese ? 'Bloco' : 'Block'} ${block + 1}: ${goalNative[level]}`}
      >
        <strong>
          {level} · Bloque {block + 1}:
        </strong>{' '}
        {(isPortuguese ? levelBases[level].pt : levelBases[level].en)[0]}
      </StudyCopy>
      {level !== journey.level && (
        <StudyCopy
          as="p"
          native={
            isPortuguese
              ? `Você está revisando ${level}; seu nível ativo continua sendo ${journey.level}.`
              : `You are reviewing ${level}; your active level is still ${journey.level}.`
          }
        >
          Estás repasando {level}; tu nivel activo sigue siendo {journey.level}.
        </StudyCopy>
      )}
      {journey.next?.activity && (
        <div className="routine-required">
          <StudyCopy as="p">{journey.next.explanation}</StudyCopy>
          <button className="text-link" onClick={() => onStart(journey.next!.activity!)}>
            {isPortuguese ? 'Retomar atividade pendente' : 'Resume pending activity'}
          </button>
        </div>
      )}
      {journey.repairs.length > 0 && (
        <StudyCopy as="p" className="routine-repair">
          {journey.repairs[0].explanation}
        </StudyCopy>
      )}
      <StudyCopy
        as="p"
        className="routine-pace"
        native={
          isPortuguese
            ? 'Comece com uma atividade curta e uma aula. Um bloco pode levar vários dias; ao voltar, continue do próximo passo. Etapas concluídas ficam disponíveis para revisão.'
            : 'Start with a short activity and a class. A block can take several days; when you return, continue with the next step. Completed steps remain available for review.'
        }
      >
        Empezá con una actividad corta y una clase. El bloque se puede completar en varios días; al
        volver, seguís desde tu próximo paso.
      </StudyCopy>
      <p className="fine-print">
        {done} / {steps.length}{' '}
        {isPortuguese ? 'etapas praticadas neste bloco' : 'steps practised in this block'}
      </p>
      {pendingDraft &&
        !data.results.some((r) => r.activity_id === `routine:${pendingDraft.id}`) && (
          <button className="text-link" onClick={() => setSession(pendingDraft)}>
            {isPortuguese ? 'Retomar exercício pausado' : 'Resume paused exercise'}
          </button>
        )}
      <ol className="routine-path">
        {steps.map((step, i) => (
          <li key={step.id}>
            <button
              className={`routine-node node-${i} ${step.done ? 'done' : ''}`}
              disabled={busy}
              onClick={step.onClick}
            >
              <span className="routine-node-icon">
                {step.done ? (
                  <Check size={22} />
                ) : step.locked ? (
                  <Lock size={20} />
                ) : (
                  <step.icon size={22} />
                )}
              </span>
              <span className="routine-node-copy">
                <strong>
                  {step.name}
                  {step.done && <small> · {isPortuguese ? 'Revisar' : 'Review'}</small>}
                </strong>
                <StudyCopy as="small" native={stepReasons[step.id]}>
                  {step.why}
                </StudyCopy>
              </span>
              <span className="routine-node-index">{i + 1}</span>
            </button>
          </li>
        ))}
      </ol>
      <details className="routine-extras">
        <summary>{isPortuguese ? 'Um jogo para reforçar' : 'A game to reinforce it'}</summary>
        <StudyCopy
          as="p"
          native={
            isPortuguese
              ? 'Revise palavras do seu nível com um jogo. O resultado faz parte do mesmo histórico; o uso de ajuda é registrado.'
              : 'Review words at your level with a game. The result joins the same history; help use is recorded.'
          }
        >
          Repasá palabras de tu nivel jugando. El resultado también cuenta en el mismo progreso; las
          ayudas se registran.
        </StudyCopy>
        <button
          className="text-link"
          onClick={() => onGame(`${data.day}:routine:${level}:${block}`)}
        >
          <Puzzle size={18} />
          {isPortuguese ? 'Jogar com as palavras' : 'Play with words'}
        </button>
      </details>
      <StudyCopy
        as="p"
        className="fine-print"
        native={
          isPortuguese
            ? 'Os exercícios são salvos ao terminar. Para avançar, complete as aulas e práticas conectadas; este percurso não certifica o MCER. Você pode pausar e retomar.'
            : 'Exercises are saved on completion. To advance, complete the connected classes and practice; this path does not certify CEFR proficiency. You can pause and resume.'
        }
      >
        Los ejercicios se guardan al terminarlos. Para avanzar de nivel necesitás completar las
        clases y las prácticas conectadas; este recorrido no certifica el MCER. Podés pausar y
        retomar.
      </StudyCopy>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {session && (
        <RoutineSession
          key={session.id}
          initial={session}
          refresh={refresh}
          close={() => {
            setSession(null);
            window.dispatchEvent(new Event('english-os:routine-paused'));
          }}
          onAdvance={advance}
          nextLabel={
            following
              ? `${isPortuguese ? 'Próxima etapa' : 'Next step'}: ${following.name}`
              : isPortuguese
                ? 'Concluir por hoje'
                : 'Finish for today'
          }
        />
      )}
    </section>
  );
}
