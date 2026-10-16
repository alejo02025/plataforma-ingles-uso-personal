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
  X,
} from 'lucide-react';
import { lessons, classRevision, type Lesson } from '@/lib/lessons';
import { cefrLevels } from '@/lib/cefr-curriculum';
import { isPortuguese, studyStorage } from '@/lib/workspace';
import { nativeCopy } from '@/lib/study-copy';
import type { Snapshot, Result } from '@/lib/types';
import { Heading, Button, Speak, api } from './ui';
import { Correction } from './correction';
import { LearningInsight } from './learning-insight';
import { ExerciseFrame, ChoiceOptions } from './exercise-player';

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
  helpUsed?: boolean;
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
                {isPortuguese ? 'Ir para a tarefa' : 'Go to task'} <ArrowRight size={15} />
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
            {isPortuguese ? 'Voltar às aulas' : 'Back to classes'}
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
          <div className="course-level-bar">
            <div className="course-level-heading">
              <span>{isPortuguese ? 'Seu percurso' : 'Your learning path'}</span>
              <strong>{level}</strong>
            </div>
            <div
              className="course-level-progress"
              role="progressbar"
              aria-label={isPortuguese ? 'Aulas aprovadas' : 'Classes passed'}
              aria-valuemin={0}
              aria-valuemax={levelItems.length}
              aria-valuenow={levelItems.filter((l) => passedLesson(data, l.id)).length}
            >
              <span
                style={{
                  width: `${levelItems.length ? (levelItems.filter((l) => passedLesson(data, l.id)).length / levelItems.length) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="course-level-controls">
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
              <small>
                {levelItems.filter((l) => passedLesson(data, l.id)).length} / {levelItems.length}{' '}
                {isPortuguese ? 'aulas aprovadas' : 'classes passed'}
              </small>
            </div>
          </div>
          <div className="course-chapter">
            <div className="course-chapter-heading">
              <span className="eyebrow">
                {isPortuguese ? 'CAPÍTULO' : 'CHAPTER'} {block + 1}
              </span>
              <h2>
                {level} · {isPortuguese ? 'Bloco' : 'Block'} {block + 1}
              </h2>
              <p lang="es">Avanzá una lección a la vez. Tu progreso se guarda automáticamente.</p>
            </div>
            <ol className="course-path">
              {filtered.map((item, index) => {
                const pending = lessonRequirements(data, item).filter((r) => !r.done);
                const latest = history.findLast((r) => attempt(r)!.lessonId === item.id);
                const passed = Boolean(passedLesson(data, item.id));
                const current =
                  item.id === journey.nextLesson?.id &&
                  level === journey.level &&
                  block === journey.block;
                return (
                  <li
                    className={`course-path-step ${passed ? 'is-passed' : current ? 'is-current' : pending.length ? 'is-locked' : ''}`}
                    key={item.id}
                  >
                    <button
                      className="course-path-button class-card"
                      aria-label={`${item.title}${pending.length ? (isPortuguese ? ' · Bloqueada' : ' · Locked') : ''}`}
                      onClick={() => setSelected(item.id)}
                    >
                      <span className="course-path-icon" aria-hidden="true">
                        {passed ? (
                          <Check size={27} strokeWidth={3} />
                        ) : pending.length ? (
                          <LockKeyhole size={23} />
                        ) : (
                          <BookOpen size={20} />
                        )}
                      </span>
                      <span className="course-path-body">
                        <strong>{item.title}</strong>
                        <span className="course-path-native" lang={isPortuguese ? 'pt-BR' : 'en'}>
                          {item.goal}
                        </span>
                        <span className="course-path-es" lang="es">
                          {spanishCopy(item.goal)}
                        </span>
                        <span className="course-path-status">
                          {passed
                            ? isPortuguese
                              ? 'Concluída'
                              : 'Completed'
                            : pending.length
                              ? isPortuguese
                                ? 'Ver requisitos'
                                : 'View requirements'
                              : current
                                ? isPortuguese
                                  ? 'Próxima aula'
                                  : 'Next lesson'
                                : isPortuguese
                                  ? 'Abrir aula'
                                  : 'Open lesson'}
                        </span>
                      </span>
                      <ArrowRight className="course-path-chevron" size={19} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
              <li className="course-path-checkpoint">
                <span className="course-path-checkpoint-icon" aria-hidden="true">
                  <Check size={22} />
                </span>
                <div>
                  <strong>{isPortuguese ? 'Revisão do capítulo' : 'Chapter checkpoint'}</strong>
                  <p lang="es">Completá las lecciones y las prácticas de repaso para avanzar.</p>
                  <button
                    className="text-link"
                    onClick={() => {
                      const requirements =
                        document.querySelector<HTMLDetailsElement>('.course-requirements');
                      if (requirements) {
                        requirements.open = true;
                        requirements.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    {isPortuguese ? 'Ver requisitos' : 'View requirements'} <ArrowRight size={16} />
                  </button>
                </div>
              </li>
            </ol>
          </div>
          <button className="course-guide-inline" onClick={() => navigate('Language help')}>
            <span className="course-guide-inline-icon" aria-hidden="true">
              <BookOpen size={20} />
            </span>
            <span>
              <strong>{isPortuguese ? 'Como formar frases' : 'How to build sentences'}</strong>
              <small lang="es">
                Sujeto, verbo, tiempos verbales, negaciones y preguntas. Ejemplos con traducción.
              </small>
            </span>
            <ArrowRight size={19} aria-hidden="true" />
          </button>
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
        <summary>
          {isPortuguese ? 'Como estas aulas são organizadas' : 'How these classes are designed'}
        </summary>
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
    helpUsed?: boolean;
    support?: { questionId: string; kind: 'word' | 'theory'; step: number }[];
  };
  const storageKey = `class-draft:${classRevision}:${lesson.id}`;
  useEffect(() => {
    document.documentElement.dataset.exerciseActive = 'lesson';
    return () => {
      delete document.documentElement.dataset.exerciseActive;
    };
  }, []);
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
  const [helpUsed, setHelpUsed] = useState(initial.helpUsed === true);
  const [support, setSupport] = useState<NonNullable<Draft['support']>>(initial.support || []);
  const [storageError, setStorageError] = useState(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const seconds = useRef(
    Number.isFinite(initial.seconds) ? Math.min(7200, Math.max(0, initial.seconds)) : 0,
  );
  const latestDraft = useRef({
    id,
    answers,
    practice,
    stage,
    question,
    confirmed,
    helpUsed,
    support,
  });
  latestDraft.current = { id, answers, practice, stage, question, confirmed, helpUsed, support };
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
          helpUsed,
          support,
          seconds: seconds.current,
        }),
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [id, answers, practice, stage, question, confirmed, helpUsed, support, storageKey]);
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
        helpUsed,
        support,
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
    setHelpUsed(false);
    setSupport([]);
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
    copy('Learn', 'Aprender'),
    copy('Practise', 'Praticar'),
    copy('Use it', 'Usar'),
    copy('Result', 'Resultado'),
  ];
  const activeStep = ({ understand: 0, exercise: 1, personal: 2, summary: 3 } as const)[stage];
  const stageProgress = Math.round(
    (100 *
      (stage === 'understand'
        ? 0
        : stage === 'exercise'
          ? 1 + confirmed.filter(Boolean).length
          : stage === 'personal'
            ? lesson.checks.length + 1
            : lesson.checks.length + 2)) /
      (lesson.checks.length + 2),
  );
  function markHelp(kind: 'word' | 'theory') {
    if (stage !== 'exercise' || confirmed[question]) return;
    setHelpUsed(true);
    setSupport((previous) => [
      ...previous.filter((s) => !(s.questionId === `${lesson.id}:${question}` && s.kind === kind)),
      { questionId: `${lesson.id}:${question}`, kind, step: 1 },
    ]);
  }
  useEffect(() => {
    const lookedUp = () => markHelp('word');
    window.addEventListener('study-word-looked-up', lookedUp);
    return () => window.removeEventListener('study-word-looked-up', lookedUp);
  }, [stage, question, confirmed]);
  function explanation(q: Lesson['checks'][number], response: number, scored: boolean) {
    const insight = (
      <LearningInsight
        correct={scored}
        explanation={q.why}
        model={scored ? undefined : q.correction}
        response={q.options[response]}
      />
    );
    return scored ? (
      <div className="lesson-feedback">
        <p className="exercise-correct-label">
          <Check size={16} />
          {copy('Answer checked', 'Resposta conferida')}
        </p>
        <p className="answer-correction-model" lang={isPortuguese ? 'pt-BR' : 'en'}>
          {q.correction}
          <SpanishTranslation text={q.correction} />
        </p>
        <details>
          <summary>{copy('Why this form?', 'Por que essa forma?')}</summary>
          {insight}
        </details>
      </div>
    ) : (
      <div className="lesson-feedback">{insight}</div>
    );
  }
  return (
    <section className="lesson-room lesson-player" data-lesson-stage={stage}>
      <div className="lesson-player-top">
        <button
          className="lesson-player-close"
          disabled={busy}
          onClick={close}
          aria-label={copy('Back to classes', 'Voltar às aulas')}
        >
          <ArrowLeft size={19} />
          <span>{copy('Back to classes', 'Voltar às aulas')}</span>
        </button>
        <div className="lesson-player-meta">
          <span>{lesson.level}</span>
          <span>{steps[activeStep]}</span>
        </div>
      </div>
      <div
        className="lesson-player-meter"
        role="progressbar"
        aria-label={copy('Lesson progress', 'Progresso da aula')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={stageProgress}
      >
        <span style={{ width: `${stageProgress}%` }} />
      </div>
      <div className="lesson-heading">
        <span className="eyebrow">{copy('YOUR LESSON', 'SUA AULA')}</span>
        <h2>{lesson.title}</h2>
        <p lang={isPortuguese ? 'pt-BR' : 'en'}>
          {lesson.goal}
          <SpanishTranslation text={lesson.goal} />
        </p>
      </div>
      {storageError && (
        <p role="alert" className="error">
          {copy(
            'Draft could not be saved. Keep this tab open until your class result is saved.',
            'Não foi possível salvar o rascunho. Mantenha esta aba aberta até salvar o resultado da aula.',
          )}
        </p>
      )}
      {stage === 'understand' && (
        <div className="lesson-focus-content">
          <section className="lesson-step">
            <span className="lesson-step-label">
              {copy('First, notice the pattern', 'Primeiro, observe a estrutura')}
            </span>
            <StudyCopy
              native={
                nativeCopy(lesson.explanation)
                  ? nativeCopy(lesson.explanation)!.split('. ')[0].replace(/\.$/, '') + '.'
                  : undefined
              }
            >
              {lesson.explanation.split('. ')[0].replace(/\.$/, '') + '.'}
            </StudyCopy>

            <code className="lesson-pattern" lang={isPortuguese ? 'pt-BR' : 'en'}>
              {lesson.pattern}
            </code>
          </section>
          <section className="lesson-step">
            <span className="lesson-step-label">
              {copy('Hear the model · synthetic voice', 'Ouça o modelo · voz sintética')}
            </span>
            {lesson.examples.slice(0, 1).map((example) => (
              <div className="lesson-example" key={example}>
                <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>
                  {example}
                  <SpanishTranslation text={example} />
                </blockquote>
                <Speak text={example} />
              </div>
            ))}
          </section>
          <Button onClick={() => setStage('exercise')}>
            {copy('Start the practice', 'Começar a prática')}
            <ArrowRight size={16} />
          </Button>
          <details className="lesson-theory-inline">
            <summary>
              {copy('Full explanation and another example', 'Explicação completa e outro exemplo')}
            </summary>
            <StudyCopy>{lesson.explanation}</StudyCopy>
            <StudyCopy>{lesson.tip}</StudyCopy>
            {lesson.examples.slice(1).map((example) => (
              <div className="lesson-example" key={example}>
                <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>
                  {example}
                  <SpanishTranslation text={example} />
                </blockquote>
                <Speak text={example} />
              </div>
            ))}
          </details>
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
          <details
            className="lesson-theory-inline"
            onToggle={(event) => {
              if (event.currentTarget.open) markHelp('theory');
            }}
          >
            <summary>{copy('Review the explanation (help)', 'Rever a explicação (ajuda)')}</summary>
            <StudyCopy>{lesson.explanation}</StudyCopy>
          </details>
          <ExerciseFrame
            key={question}
            count={question + 1}
            total={lesson.checks.length}
            prompt={copy(
              'Choose the answer for this sentence or situation.',
              'Escolha a resposta para esta frase ou situação.',
            )}
            spanish="Elegí la respuesta que corresponde a esta oración o situación."
          >
            <fieldset className="lesson-check">
              <legend lang={isPortuguese ? 'pt-BR' : 'en'}>{current.prompt}</legend>
              {spanishCopy(current.prompt) && (
                <p className="lesson-prompt-es" lang="es">
                  {spanishCopy(current.prompt)}
                </p>
              )}
              <ChoiceOptions
                options={current.options}
                value={answers[question]}
                order={choiceOrder}
                disabled={busy || checked}
                onChange={(choice) =>
                  setAnswers((previous) =>
                    previous.map((answer, i) => (i === question ? choice : answer)),
                  )
                }
              />
            </fieldset>
          </ExerciseFrame>
          <div className={`lesson-response-dock ${checked ? 'has-feedback' : ''}`}>
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
          </div>
          {helpUsed && (
            <p className="fine-print">
              {copy(
                'Help used during practice. The result is saved separately from independent evidence.',
                'Ajuda usada durante a prática. O resultado fica separado da evidência independente.',
              )}
            </p>
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
            <strong>
              {copy('Write your example (optional)', 'Escreva seu exemplo (opcional)')}
            </strong>
            <span>
              {lesson.practice}
              <SpanishTranslation text={lesson.practice} />
            </span>
            <textarea
              aria-label={copy('Your class practice', 'Sua prática da aula')}
              value={practice}
              disabled={busy}
              maxLength={2000}
              onChange={(event) => setPractice(event.target.value)}
              placeholder={lesson.model}
            />
          </label>
          <details className="lesson-model">
            <summary>{copy('See an example', 'Ver um exemplo')}</summary>
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
            {busy
              ? copy('Saving your class…', 'Salvando sua aula…')
              : copy('Check and save my class', 'Conferir e salvar minha aula')}
          </Button>
        </div>
      )}
      {stage === 'summary' && review && (
        <div className="lesson-focus-content lesson-saved">
          <p>
            <Check size={18} />
            {review.correct} / {review.total} · {copy('Class saved', 'Aula salva')}
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
          {(review.helpUsed || helpUsed) && (
            <StudyCopy
              native={copy(
                'Help was used during these questions. Your practice is saved; try again without help to unlock the next lesson.',
                'Você usou ajuda durante estas questões. Sua prática está salva; tente novamente sem ajuda para liberar a próxima aula.',
              )}
            >
              Usaste ayuda durante estas preguntas. La práctica se conserva; repetila sin ayuda para
              habilitar la siguiente clase.
            </StudyCopy>
          )}
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
            <Button
              onClick={
                review.correct / review.total >= 0.8 && !review.helpUsed && !helpUsed ? next : retry
              }
            >
              {review.correct / review.total >= 0.8 && !review.helpUsed && !helpUsed
                ? copy('Continue to the next class', 'Continuar para a próxima aula')
                : copy('Practise again', 'Praticar novamente')}
              <ArrowRight size={16} />
            </Button>
            <Button secondary onClick={retry}>
              <RotateCcw size={16} />
              {copy('Try again later', 'Tentar novamente depois')}
            </Button>
            <Button secondary onClick={() => navigate('Language help')}>
              {copy('Open language help', 'Abrir o guia de idioma')}
              <ArrowRight size={16} />
            </Button>
          </div>
          <div className="lesson-return">
            <BookOpen size={18} />
            <p>
              {copy(
                'Come back tomorrow. Try recalling one example before reading it again.',
                'Volte amanhã. Tente lembrar um exemplo antes de ler novamente.',
              )}
            </p>
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
