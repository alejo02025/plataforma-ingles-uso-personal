'use client';
import { useState } from 'react';
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
import { routineRecord, routineTitles, routineEdition, type RoutineMode } from '@/lib/routine';
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
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  onStart: (a: Activity) => void;
  onClass: (id: string) => void;
  onGame: (seed: string) => void;
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
        Number(r.correct) / Number(r.total) >= 0.8 &&
        !meta?.helpUsed
      );
    });
  }
  function open(mode: RoutineMode) {
    setError('');
    const pending = readRoutineDraft();
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
      answers: [],
      choice: '',
      picked: [],
      checked: false,
      helpUsed: false,
      seconds: 0,
    });
  }
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
  const done = steps.filter((s) => s.done).length;
  return (
    <section
      className="home-routine card"
      aria-label={isPortuguese ? 'Atividades de aprendizagem' : 'Learning activities'}
    >
      <span className="eyebrow">
        {isPortuguese ? 'APRENDER, UM PASSO DE CADA VEZ' : 'LEARN, ONE STEP AT A TIME'}
      </span>
      <h2>{isPortuguese ? 'Seu percurso de atividades' : 'Your activity path'}</h2>
      <p className="routine-purpose" lang="es">
        <strong>¿Para qué entrar hoy?</strong> Para aprender algo que puedas usar: reconocer
        palabras, armar una idea, entenderla en contexto y expresarla por tu cuenta. Este es tu
        recorrido; la sugerencia de arriba te ofrece alternativas.
      </p>
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
                  ? `Nivel activo: ${journey.level}. Los demás se habilitan con las clases y prácticas del recorrido.`
                  : l === journey.level
                    ? 'Tu nivel activo'
                    : 'Nivel completado, disponible para repaso'
              }
              onClick={() => setPreview(l === journey.level ? '' : l)}
            >
              {!available && <Lock size={12} />} {l}
            </button>
          );
        })}
      </div>
      <p className="fine-print" lang="es">
        Tu nivel activo es {journey.level}. Los siguientes se habilitan al completar clases y
        prácticas; los ya completados quedan para repaso.
      </p>
      <p className="routine-goal" lang="es">
        <strong>
          {level} · Bloque {block + 1}:
        </strong>{' '}
        {(isPortuguese ? levelBases[level].pt : levelBases[level].en)[0]}
      </p>
      {level !== journey.level && (
        <p lang="es">
          Estás repasando {level}; tu nivel activo sigue siendo {journey.level}.
        </p>
      )}
      {journey.next?.activity && (
        <div className="routine-required">
          <p lang="es">{journey.next.explanation}</p>
          <button className="text-link" onClick={() => onStart(journey.next!.activity!)}>
            {isPortuguese ? 'Retomar atividade pendente' : 'Resume pending activity'}
          </button>
        </div>
      )}
      {journey.repairs.length > 0 && (
        <p className="routine-repair" lang="es">
          {journey.repairs[0].explanation}
        </p>
      )}
      <p className="routine-pace" lang="es">
        Empezá con una actividad corta y una clase. El bloque se puede completar en varios días; al
        volver, seguís desde tu próximo paso.
      </p>
      <p className="fine-print">
        {done} / {steps.length}{' '}
        {isPortuguese ? 'etapas praticadas neste bloco' : 'steps practised in this block'}
      </p>
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
                <strong>{step.name}</strong>
                <small lang="es">{step.why}</small>
              </span>
              <span className="routine-node-index">{i + 1}</span>
            </button>
          </li>
        ))}
      </ol>
      <details className="routine-extras">
        <summary>{isPortuguese ? 'Um jogo para reforçar' : 'A game to reinforce it'}</summary>
        <p lang="es">
          Repasá palabras de tu nivel jugando. El resultado también cuenta en el mismo progreso; las
          ayudas se registran.
        </p>
        <button
          className="text-link"
          onClick={() => onGame(`${data.day}:routine:${level}:${block}`)}
        >
          <Puzzle size={18} />
          {isPortuguese ? 'Jogar com as palavras' : 'Play with words'}
        </button>
      </details>
      <p className="fine-print" lang="es">
        Los ejercicios se guardan al terminarlos. Para avanzar de nivel necesitás completar las
        clases y las prácticas conectadas; este recorrido no certifica el MCER. Podés pausar y
        retomar.
      </p>
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
          close={() => setSession(null)}
        />
      )}
    </section>
  );
}
