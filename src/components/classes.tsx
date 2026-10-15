'use client';
import { StudyCopy, SpanishTranslation } from './study-copy';
import { spanishCopy } from '@/lib/study-copy';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Lightbulb,
  RotateCcw,
  LockKeyhole,
} from 'lucide-react';
import { lessons, classRevision, type Lesson } from '@/lib/lessons';
import { cefrLevels } from '@/lib/cefr-curriculum';
import { isPortuguese, studyStorage } from '@/lib/workspace';
import { nativeCopy } from '@/lib/study-copy';
import type { Snapshot, Result } from '@/lib/types';
import { Heading, Button, Speak, api } from './ui';
import { Correction } from './correction';

import {
  blockSize,
  courseRoute,
  levelLessons,
  lessonRequirements,
  passedLesson,
  learningJourney,
  type Requirement,
} from '@/lib/course-route';
import type { Activity } from '@/lib/types';
type Review = {
  correct: number;
  total: number;
  responses?: number[];
  practice?: string;
  feedback: { correct: boolean; explanationSpanish: string; correction: string }[];
};
type Attempt = Review & {
  lessonId: string;
  revision: number;
  responses: number[];
  practice: string;
};
function attempt(result: Result): Attempt | undefined {
  if (!result.activity_id.startsWith('class:')) return;
  try {
    return { ...JSON.parse(result.answers), correct: result.correct, total: result.total };
  } catch {
    return;
  }
}
export function Classes({
  data,
  refresh,
  navigate,
  onStart,
  initialLesson = '',
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  navigate: (view: string) => void;
  onStart: (activity: Activity) => void;
  initialLesson?: string;
}) {
  const route = courseRoute(data),
    suggested = route.level;
  const [level, setLevel] = useState(suggested),
    [selected, setSelected] = useState('');
  useEffect(() => {
    setLevel(suggested);
    setSelected(initialLesson);
  }, [suggested, initialLesson]);
  const history = data.results.filter((r) => attempt(r));
  const lesson = lessons.find((item) => item.id === selected);
  const blocked = lesson ? lessonRequirements(data, lesson).filter((r) => !r.done) : [];
  const journey = learningJourney(data),
    currentBlock = journey.block,
    tasks = journey.tasks;
  const [taskError, setTaskError] = useState('');
  async function goTask(requirement: Requirement) {
    if (requirement.activity) {
      onStart(requirement.activity);
      return;
    }
    if (requirement.lessonId) {
      setSelected(requirement.lessonId);
      setLevel(suggested);
      return;
    }
    if (requirement.id === 'reinforce:grammar') {
      try {
        const activity = await api<Activity>('course/grammar', {});
        await refresh();
        onStart(activity);
      } catch (error) {
        setTaskError((error as Error).message);
      }
      return;
    }
    if (requirement.id === 'previous' && lesson) {
      const items = levelLessons(lesson.level);
      setSelected(items[items.findIndex((l) => l.id === lesson.id) - 1].id);
      return;
    }
    if (requirement.id === 'writing') {
      try {
        const activity = await api<Activity>('course/writing', {});
        await refresh();
        onStart(activity);
      } catch (error) {
        setTaskError((error as Error).message);
      }
      return;
    }
    if (requirement.view === 'Classes') {
      setLevel(suggested);
      setSelected('');
    } else navigate(requirement.view);
  }
  function checklist(requirements: Requirement[]) {
    return (
      <div className="course-checklist">
        {requirements.map((r) => (
          <div key={r.id} className={r.done ? 'done' : ''} data-requirement={r.id}>
            {r.done ? <Check size={18} /> : <LockKeyhole size={18} />}
            <StudyCopy as="p">{r.explanation}</StudyCopy>
            {!r.done && (
              <Button secondary onClick={() => void goTask(r)}>
                Go to task <ArrowRight size={15} />
              </Button>
            )}
          </div>
        ))}
        {taskError && (
          <p className="error" role="alert">
            {taskError}
          </p>
        )}
      </div>
    );
  }
  const [browseBlock, setBrowseBlock] = useState<number | null>(null);
  const block = browseBlock ?? (level === journey.level ? journey.block : 0);
  const levelItems = levelLessons(level);
  const filtered = levelItems.slice(block * blockSize, (block + 1) * blockSize);
  return (
    <>
      {lesson && blocked.length ? (
        <section className="card course-locked">
          <Button secondary onClick={() => setSelected('')}>
            <ArrowLeft size={16} />
            Back to classes
          </Button>
          <LockKeyhole size={32} />
          <h2>{lesson.title}</h2>
          <StudyCopy as="p">
            Esta clase todavía está bloqueada. Tu progreso se conserva; completá estas tareas para
            habilitarla.
          </StudyCopy>
          {checklist(blocked)}
        </section>
      ) : lesson ? (
        <LessonRoom
          key={lesson.id}
          lesson={lesson}
          history={history}
          refresh={refresh}
          close={() => setSelected('')}
          navigate={navigate}
          next={() => {
            const items = levelLessons(lesson.level);
            setSelected(items[items.findIndex((item) => item.id === lesson.id) + 1]?.id || '');
          }}
        />
      ) : (
        <>
          <div className="course-toolbar">
            <label>
              {isPortuguese ? 'Nível de estudo' : 'Study level'}
              <select
                aria-label={isPortuguese ? 'Nível de estudo' : 'Study level'}
                value={level}
                onChange={(e) => {
                  setLevel(e.target.value as typeof suggested);
                  setBrowseBlock(0);
                }}
              >
                {cefrLevels.map((item) => (
                  <option
                    key={item}
                    value={item}
                    disabled={item !== route.level && !route.completed.includes(item)}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {isPortuguese ? 'Bloco' : 'Block'}
              <select
                aria-label={isPortuguese ? 'Bloco' : 'Block'}
                value={block}
                onChange={(e) => setBrowseBlock(Number(e.target.value))}
              >
                {Array.from({ length: Math.ceil(levelItems.length / blockSize) }, (_, i) => (
                  <option key={i} value={i}>
                    {i + 1} / {Math.ceil(levelItems.length / blockSize)}
                  </option>
                ))}
              </select>
            </label>
            <span>
              {levelItems.filter((l) => passedLesson(data, l.id)).length} / {levelItems.length}{' '}
              {isPortuguese ? 'aulas aprovadas' : 'classes passed'}
            </span>
          </div>
          <div className="course-current">
            <span className="eyebrow">{isPortuguese ? 'SEU PRÓXIMO PASSO' : 'YOUR NEXT STEP'}</span>
            <h2>
              {journey.nextLesson?.title || (isPortuguese ? 'Rever e aplicar' : 'Review and apply')}
            </h2>
            <p lang={isPortuguese ? 'pt-BR' : 'en'}>
              {journey.nextLesson?.goal ||
                (isPortuguese
                  ? 'Complete as práticas conectadas antes de avançar.'
                  : 'Complete the connected practice before moving on.')}
            </p>
            <p className="course-current-es" lang="es">
              {journey.nextLesson?.goal && spanishCopy(journey.nextLesson.goal)
                ? spanishCopy(journey.nextLesson.goal)
                : 'Aprendé cómo se usa esta estructura, practicá y después aplicala a tu vida.'}
            </p>
            <button
              className="button"
              onClick={() => journey.nextLesson && setSelected(journey.nextLesson.id)}
            >
              {isPortuguese ? 'Abrir aula' : 'Open class'} <ArrowRight size={17} />
            </button>
          </div>
          <section className="course-guide-shortcut">
            <span className="course-guide-symbol" aria-hidden="true">🧩</span>
            <div className="course-guide-copy">
              <span className="course-guide-kicker">{isPortuguese ? 'GUIA DE GRAMÁTICA' : 'GRAMMAR MADE SIMPLE'}</span>
              <h3>{isPortuguese ? 'Como formar frases' : 'How to build sentences'}</h3>
              <p lang={isPortuguese ? 'pt-BR' : 'en'}>{isPortuguese ? 'Sujeito, verbo e complemento. Explore perguntas, negativas e todos os tempos.' : 'Subject, verb and complement. Explore questions, negatives and every tense.'}</p>
              <p className="study-spanish" lang="es">Aprendé cómo se construyen las oraciones, elegí verbos y compará presente, pasado, futuro y otros tiempos.</p>
            </div>
            <button className="course-guide-action" onClick={() => navigate('Language help')}>
              {isPortuguese ? 'Abrir guia' : 'Open guide'} <ArrowRight size={17}/>
            </button>
          </section>
          <h2 className="list-heading">
            {level} · {isPortuguese ? 'Bloco' : 'Block'} {block + 1}
          </h2>
          <div className="class-grid">
            {filtered.map((item, index) => {
              const pending = lessonRequirements(data, item).filter((r) => !r.done);
              const latest = history.findLast((r) => attempt(r)!.lessonId === item.id);
              return (
                <button
                  className={`class-card ${pending.length ? 'is-locked' : ''} ${latest ? 'is-complete' : ''}`}
                  aria-label={`${item.title}${pending.length ? ' · Locked' : ''}`}
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                >
                  <span className="class-card-top">
                    <span className="class-node-art" aria-hidden="true">{['💬', '🧩', '🎧', '✍️'][index % 4]}</span>
                    <span className="class-node-meta">
                      {item.level} · <Clock3 size={13} /> 8 min
                    </span>
                    {pending.length ? <LockKeyhole size={23} /> : <BookOpen size={23} />}
                  </span>
                  <h2>{item.title}</h2>
                  <p lang={isPortuguese ? 'pt-BR' : 'en'}>{item.goal}</p>
                  <p className="class-card-spanish" lang="es">{spanishCopy(item.goal) || 'Leé la explicación, practicá y formá tus propias oraciones.'}</p>
                  <span className="class-card-bottom">
                    {pending.length ? (
                      <>
                        <LockKeyhole size={15} />
                        View requirements
                      </>
                    ) : latest ? (
                      <>
                        <Check size={15} />
                        {latest.correct} / {latest.total} ·{' '}
                        {latest.correct === latest.total ? 'Practised' : 'Worth another look'}
                      </>
                    ) : (
                      <>
                        Open class <ArrowRight size={16} />
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {!lesson && (
        <details className="course-requirements">
          <summary>
            {isPortuguese ? 'O que preciso para avançar?' : 'What do I need to move on?'}
          </summary>
          <p>
            {isPortuguese
              ? 'Aulas e práticas compartilham o mesmo percurso. Fazer exercícios não certifica seu nível.'
              : 'Classes and practice share the same path. Completing exercises does not certify your level.'}
          </p>
          {checklist([
            ...journey.pending.filter((r) => r.id.startsWith('reinforce:') || r.id === 'backlog'),
            ...tasks,
          ])}
        </details>
      )}
      <details className="class-method card">
        <summary>How these classes are designed</summary>
        <StudyCopy as="p">
          Estas son clases originales con objetivos orientados al MCER, ejemplos explicados,
          práctica de recuperación, corrección y repaso espaciado. Esos métodos tienen respaldo en
          investigación educativa. No significa que estas clases hayan sido validadas como un curso
          completo ni que aprobarlas certifique un nivel.
        </StudyCopy>
        <StudyCopy as="p">
          Las explicaciones priorizan el uso cotidiano y respetan variantes aceptadas. El espacio de
          portugués trabaja con portugués de Brasil. El material y la IA no se presentan como una
          persona con años de carrera, títulos o premios reales.
        </StudyCopy>
        <ul>
          <li>
            <a
              href="https://www.coe.int/en/web/common-european-framework-reference-languages"
              target="_blank"
              rel="noreferrer"
            >
              Council of Europe · CEFR / Companion Volume
            </a>
          </li>
          <li>
            <a
              href="https://doi.org/10.1111/j.1467-9280.2006.01693.x"
              target="_blank"
              rel="noreferrer"
            >
              Roediger &amp; Karpicke (2006) · Test-enhanced learning
            </a>
          </li>
          <li>
            <a href="https://doi.org/10.1037/0033-2909.132.3.354" target="_blank" rel="noreferrer">
              Cepeda et al. (2006) · Distributed practice in verbal recall
            </a>
          </li>
        </ul>
      </details>
    </>
  );
}
function LessonRoom({
  lesson,
  history,
  refresh,
  close,
  navigate,
  next,
}: {
  lesson: Lesson;
  history: Result[];
  refresh: () => Promise<void>;
  close: () => void;
  navigate: (view: string) => void;
  next: () => void;
}) {
  type Stage = 'understand' | 'exercise' | 'personal' | 'summary';
  type Draft = {
    id: string;
    answers: number[];
    practice: string;
    seconds: number;
    stage?: Stage;
    question?: number;
    confirmed?: boolean[];
  };
  const storageKey = `class-draft:${classRevision}:${lesson.id}`;
  const [initial] = useState<Draft>(() => {
    try {
      const parsed = JSON.parse(studyStorage.getItem(storageKey) || 'null');
      if (
        parsed &&
        typeof parsed.id === 'string' &&
        Array.isArray(parsed.answers) &&
        parsed.answers.length === lesson.checks.length &&
        parsed.answers.every(
          (a: unknown) => typeof a === 'number' && Number.isInteger(a) && a >= -1 && a <= 2,
        ) &&
        typeof parsed.practice === 'string'
      )
        return parsed;
    } catch {}
    const latest = history.findLast(
      (r) => attempt(r)!.lessonId === lesson.id && attempt(r)!.revision === classRevision,
    );
    const saved = latest ? attempt(latest)! : undefined;
    return {
      id: latest?.id.slice('class:'.length) || crypto.randomUUID(),
      answers: saved?.responses || lesson.checks.map(() => -1),
      practice: saved?.practice || '',
      seconds: 0,
    };
  });
  const savedAttempt = history.find((r) => r.id === `class:${initial.id}`);
  const [id, setId] = useState(initial.id);
  const [answers, setAnswers] = useState<number[]>(initial.answers);
  const [practice, setPractice] = useState(initial.practice);
  const [review, setReview] = useState<Review | undefined>(() =>
    savedAttempt ? attempt(savedAttempt) : undefined,
  );
  const [stage, setStage] = useState<Stage>(() =>
    savedAttempt
      ? 'summary'
      : ['understand', 'exercise', 'personal'].includes(initial.stage || '')
        ? (initial.stage as Stage)
        : 'understand',
  );
  const [question, setQuestion] = useState(() =>
    Number.isInteger(initial.question) &&
    initial.question! >= 0 &&
    initial.question! < lesson.checks.length
      ? initial.question!
      : 0,
  );
  const [confirmed, setConfirmed] = useState<boolean[]>(() =>
    initial.confirmed?.length === lesson.checks.length
      ? initial.confirmed.map((value, i) => value === true && initial.answers[i] >= 0)
      : lesson.checks.map(() => false),
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const seconds = useRef(
    Number.isFinite(initial.seconds) ? Math.min(7200, Math.max(0, initial.seconds)) : 0,
  );
  const latestDraft = useRef({ id, answers, practice, stage, question, confirmed });
  latestDraft.current = { id, answers, practice, stage, question, confirmed };
  const reviewed = useRef(Boolean(review));
  reviewed.current = Boolean(review);
  useEffect(() => {
    const write = () => {
      try {
        studyStorage.setItem(
          storageKey,
          JSON.stringify({ ...latestDraft.current, seconds: seconds.current }),
        );
      } catch {}
    };
    const timer = setInterval(() => {
      if (!reviewed.current && document.visibilityState === 'visible' && document.hasFocus())
        seconds.current = Math.min(7200, seconds.current + 1);
      if (seconds.current % 5 === 0) write();
    }, 1000);
    window.addEventListener('pagehide', write);
    document.addEventListener('visibilitychange', write);
    return () => {
      clearInterval(timer);
      window.removeEventListener('pagehide', write);
      document.removeEventListener('visibilitychange', write);
      write();
    };
  }, [storageKey]);
  useEffect(() => {
    try {
      studyStorage.setItem(
        storageKey,
        JSON.stringify({
          id,
          answers,
          practice,
          stage,
          question,
          confirmed,
          seconds: seconds.current,
        }),
      );
    } catch {}
  }, [id, answers, practice, stage, question, confirmed, storageKey]);
  const copy = (en: string, pt: string) => (isPortuguese ? pt : en);
  async function save() {
    setBusy(true);
    setError('');
    try {
      const result = await api<Review>('classes/result', {
        id,
        lessonId: lesson.id,
        revision: classRevision,
        answers,
        practice,
        seconds: seconds.current,
      });
      if (result.responses) setAnswers(result.responses);
      if (result.practice !== undefined) setPractice(result.practice);
      setReview(result);
      setStage('summary');
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function retry() {
    setId(crypto.randomUUID());
    setAnswers(lesson.checks.map(() => -1));
    setConfirmed(lesson.checks.map(() => false));
    setQuestion(0);
    setStage('understand');
    setReview(undefined);
    setError('');
    seconds.current = 0;
  }
  const current = lesson.checks[question];
  // Visual variation keeps stored answer indices unchanged for historical attempts and drafts.
  const seed = Array.from(`${lesson.id}:${question}`).reduce(
    (value, char) => (value * 31 + char.charCodeAt(0)) >>> 0,
    0,
  );
  const choiceOrder = [
    [0, 1, 2],
    [1, 2, 0],
    [2, 0, 1],
    [0, 2, 1],
    [1, 0, 2],
    [2, 1, 0],
  ][seed % 6];
  const checked = confirmed[question];
  const correct = answers[question] === current.answer;
  const steps = [
    copy('Understand', 'Entender'),
    copy('Practise', 'Praticar'),
    copy('Make it yours', 'Aplicar'),
    copy('Review', 'Rever'),
  ];
  const activeStep = ({ understand: 0, exercise: 1, personal: 2, summary: 3 } as const)[stage];
  function explanation(q: Lesson['checks'][number], response: number, scored: boolean) {
    return (
      <div className={`lesson-feedback ${scored ? 'correct' : ''}`} role="status">
        <strong>
          {scored
            ? copy('That is the model for this situation.', 'Esse é o modelo para esta situação.')
            : copy(
                'Compare your choice with the situation.',
                'Compare sua escolha com a situação.',
              )}
        </strong>
        <p className="lesson-response" lang={isPortuguese ? 'pt-BR' : 'en'}>
          {copy('Your choice: ', 'Sua escolha: ')}
          {q.options[response]}
        </p>
        <StudyCopy
          native={
            nativeCopy(q.why) ||
            copy(
              'Check the subject, time and meaning. The corrected model below shows the form used in this situation. Read the explanation and try changing one detail in your own example.',
              'Confira o sujeito, o tempo e o sentido. O modelo corrigido abaixo mostra a forma usada nesta situação. Leia a explicação e tente mudar um detalhe no seu próprio exemplo.',
            )
          }
        >
          {q.why}
        </StudyCopy>
        <p className="answer-correction-model" lang={isPortuguese ? 'pt-BR' : 'en'}>
          <strong>{copy('Model: ', 'Modelo: ')}</strong>
          {q.correction}
          <SpanishTranslation text={q.correction} />
        </p>
        <Speak text={q.correction} />
      </div>
    );
  }
  return (
    <section className="lesson-room card lesson-focus">
      <div className="section-heading">
        <Button secondary disabled={busy} onClick={close}>
          <ArrowLeft size={16} />
          Back to classes
        </Button>
        <span className="pill neutral">{lesson.level} · 8 min</span>
      </div>
      <div className="lesson-heading">
        <span className="eyebrow">TODAY’S IDEA</span>
        <h2>{lesson.title}</h2>
        <p>
          {lesson.goal}
          <SpanishTranslation text={lesson.goal} />
        </p>
      </div>
      <ol className="lesson-stage-list" aria-label={copy('Class stages', 'Etapas da aula')}>
        {steps.map((title, index) => (
          <li
            key={title}
            aria-current={index === activeStep ? 'step' : undefined}
            className={index < activeStep ? 'done' : ''}
          >
            <span>{index < activeStep ? <Check size={14} /> : index + 1}</span>
            {title}
          </li>
        ))}
      </ol>
      {stage === 'understand' && (
        <div className="lesson-focus-content">
          <section className="lesson-step">
            <span className="lesson-step-label">01 · Understand</span>
            <StudyCopy
              native={
                nativeCopy(lesson.explanation) ||
                copy(
                  `Your goal: ${lesson.goal} Notice the subject, verb and time in this pattern, then compare the two examples.`,
                  `Seu objetivo: ${lesson.goal} Observe o sujeito, o verbo e o tempo neste modelo e depois compare os dois exemplos.`,
                )
              }
            >
              {lesson.explanation}
            </StudyCopy>
            <code className="lesson-pattern" lang={isPortuguese ? 'pt-BR' : 'en'}>
              {lesson.pattern}
            </code>
          </section>
          <section className="lesson-step">
            <span className="lesson-step-label">02 · Hear it in real life</span>
            {lesson.examples.map((example) => (
              <div className="lesson-example" key={example}>
                <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>
                  {example}
                  <SpanishTranslation text={example} />
                </blockquote>
                <Speak text={example} />
              </div>
            ))}
          </section>
          <details className="lesson-tip">
            <summary>
              <Lightbulb size={16} />A useful detail
            </summary>
            <StudyCopy
              native={
                nativeCopy(lesson.tip) ||
                copy(
                  'Use the complete example as a pattern. Compare its meaning with the detail below before replacing words.',
                  'Use o exemplo completo como modelo. Compare seu sentido com o detalhe abaixo antes de trocar palavras.',
                )
              }
            >
              {lesson.tip}
            </StudyCopy>
          </details>
          <Button onClick={() => setStage('exercise')}>
            {copy('Start the practice', 'Começar a prática')}
            <ArrowRight size={16} />
          </Button>
          <StudyCopy
            native={copy(
              'You can reopen the explanation at any time. Each answer stays saved in your draft until you finish the class.',
              'Você pode reabrir a explicação a qualquer momento. Cada resposta fica no rascunho até você concluir a aula.',
            )}
            className="fine-print"
          >
            Podés volver a la explicación cuando quieras. Tus respuestas y tu frase se conservan si
            salís y retomás la clase.
          </StudyCopy>
        </div>
      )}
      {stage === 'exercise' && (
        <div className="lesson-focus-content">
          <div className="lesson-exercise-header">
            <strong>{copy('One situation at a time', 'Uma situação de cada vez')}</strong>
            <span>
              {question + 1} / {lesson.checks.length}
            </span>
          </div>
          <div className="progress-bar">
            <span
              style={{
                width: `${(confirmed.filter(Boolean).length / lesson.checks.length) * 100}%`,
              }}
            />
          </div>
          <p className="lesson-context">
            {lesson.goal}
            <SpanishTranslation text={lesson.goal} />
          </p>
          <details className="lesson-theory-inline">
            <summary>{copy('Review the explanation', 'Rever a explicação')}</summary>
            <StudyCopy
              native={
                nativeCopy(lesson.explanation) ||
                copy(
                  `Compare the pattern: ${lesson.pattern}`,
                  `Compare o modelo: ${lesson.pattern}`,
                )
              }
            >
              {lesson.explanation}
            </StudyCopy>
          </details>
          <fieldset className="lesson-check" key={question}>
            <legend>
              {question + 1}. {current.prompt}
              <SpanishTranslation text={current.prompt} />
            </legend>
            <div className="options">
              {choiceOrder.map((choice) => {
                const option = current.options[choice];
                return (
                  <label
                    className={`option ${answers[question] === choice ? 'selected' : ''}`}
                    key={option}
                  >
                    <input
                      type="radio"
                      name={`class-check-${question}`}
                      value={choice}
                      checked={answers[question] === choice}
                      disabled={busy || checked}
                      onChange={() =>
                        setAnswers((previous) =>
                          previous.map((answer, i) => (i === question ? choice : answer)),
                        )
                      }
                    />
                    {option}
                    {checked && <SpanishTranslation text={option} />}
                  </label>
                );
              })}
            </div>
          </fieldset>
          {checked && explanation(current, answers[question], correct)}
          {!checked ? (
            <Button
              disabled={answers[question] < 0}
              onClick={() =>
                setConfirmed((previous) =>
                  previous.map((value, i) => (i === question ? true : value)),
                )
              }
            >
              {copy('Check this answer', 'Conferir esta resposta')}
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (question + 1 < lesson.checks.length) setQuestion(question + 1);
                else setStage('personal');
              }}
            >
              {question + 1 < lesson.checks.length
                ? copy('Next question', 'Próxima pergunta')
                : copy('Apply it to your life', 'Aplicar à sua vida')}
              <ArrowRight size={16} />
            </Button>
          )}
          <StudyCopy
            native={copy(
              'The first checked answer counts. Feedback helps you learn; a later retry is a separate attempt.',
              'A primeira resposta conferida conta. A explicação ajuda a aprender; uma nova tentativa fica registrada separadamente.',
            )}
            className="fine-print"
          >
            Cuenta la primera respuesta que verificás. El feedback sirve para aprender; un reintento
            posterior se registra aparte.
          </StudyCopy>
        </div>
      )}
      {stage === 'personal' && (
        <div className="lesson-focus-content">
          <h3>{copy('Use it in your own day', 'Use no seu dia a dia')}</h3>
          <StudyCopy
            native={copy(
              'Write a real example that matters to you. It is optional and is stored as a draft of your production, without an automatic language grade.',
              'Escreva um exemplo real que seja importante para você. É opcional e fica registrado como produção sua, sem nota automática de idioma.',
            )}
          >
            Escribí una situación real para vos. Es opcional y se guarda sin una nota inventada
            sobre tu escritura.
          </StudyCopy>
          <label className="field lesson-own">
            <strong>Make it yours · optional</strong>
            <span>
              {lesson.practice}
              <SpanishTranslation text={lesson.practice} />
            </span>
            <textarea
              aria-label="Your class practice"
              value={practice}
              disabled={busy}
              maxLength={2000}
              onChange={(event) => setPractice(event.target.value)}
              placeholder={lesson.model}
            />
          </label>
          <details className="lesson-model">
            <summary>Show a model answer</summary>
            <p lang={isPortuguese ? 'pt-BR' : 'en'}>
              {lesson.model}
              <SpanishTranslation text={lesson.model} />
            </p>
            <Speak text={lesson.model} />
          </details>
          <Button
            disabled={
              busy || answers.some((answer) => answer < 0) || confirmed.some((value) => !value)
            }
            onClick={() => void save()}
          >
            {busy ? 'Saving your class…' : 'Check and save my class'}
          </Button>
        </div>
      )}
      {stage === 'summary' && review && (
        <div className="lesson-focus-content lesson-saved">
          <p>
            <Check size={18} />
            {review.correct} / {review.total} · Class practice saved
          </p>
          <StudyCopy
            native={copy(
              'This score describes these selected-response questions. Your personal writing is saved but not graded, and this class alone does not demonstrate a CEFR level.',
              'Esse resultado descreve estas questões objetivas. Sua escrita pessoal foi salva sem nota, e esta aula sozinha não demonstra um nível do QECR.',
            )}
          >
            La puntuación corresponde sólo a estas preguntas objetivas. Tu producción personal se
            conserva sin nota; esta clase por sí sola no demuestra dominio de un nivel MCER.
          </StudyCopy>
          <details className="lesson-answer-review">
            <summary>{copy('Review my answers', 'Rever minhas respostas')}</summary>
            {lesson.checks.map((q, i) => (
              <section key={q.prompt}>
                <h3>{q.prompt}</h3>
                {explanation(q, answers[i], review.feedback[i].correct)}
              </section>
            ))}
          </details>
          {practice && (
            <details>
              <summary>{copy('My saved example', 'Meu exemplo salvo')}</summary>
              <p className="lesson-writing-saved">{practice}</p>
            </details>
          )}
          <div className="lesson-next-actions">
            <Button onClick={next}>
              {copy('Continue to the next class', 'Continuar para a próxima aula')}
              <ArrowRight size={16} />
            </Button>
            <Button secondary onClick={retry}>
              <RotateCcw size={16} />
              Try again later
            </Button>
            <Button secondary onClick={() => navigate('Language help')}>
              Open language help
              <ArrowRight size={16} />
            </Button>
          </div>
          <div className="lesson-return">
            <BookOpen size={18} />
            <p>Come back tomorrow. Try remembering one example before reading it again.</p>
          </div>
        </div>
      )}
      {error && (
        <div role="alert" className="error">
          <p>{error}</p>
          {review && (
            <Button
              secondary
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await refresh();
                  setError('');
                } catch (error) {
                  setError((error as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {copy('Retry loading progress', 'Tentar carregar o progresso novamente')}
            </Button>
          )}
        </div>
      )}
    </section>
  );
}
