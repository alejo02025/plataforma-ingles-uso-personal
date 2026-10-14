'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, Lightbulb, RotateCcw } from 'lucide-react';
import { lessons, classRevision, type Lesson } from '@/lib/lessons';
import { cefrLevels } from '@/lib/cefr-curriculum';
import { isPortuguese, studyStorage } from '@/lib/workspace';
import type { Snapshot, Result } from '@/lib/types';
import { Heading, Button, Speak, api } from './ui';
import { Correction } from './correction';
type Review = {
  correct: number;
  total: number;
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
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  navigate: (view: string) => void;
}) {
  const suggested = isPortuguese
    ? data.cefr?.level || 'A1'
    : data.evaluations.find((e) => e.skill === 'grammar')?.level?.match(/A1|A2|B1|B2|C1|C2/)?.[0] ||
      'A2';
  const [level, setLevel] = useState(suggested),
    [selected, setSelected] = useState('');
  const history = data.results.filter((r) => attempt(r));
  const practised = new Set(history.map((r) => attempt(r)!.lessonId));
  const lesson = lessons.find((item) => item.id === selected);
  const filtered = lessons.filter((item) => level === 'All levels' || item.level === level);
  return (
    <>
      <Heading
        eyebrow="YOUR CLASSROOM"
        title="Learn it. Use it."
        description="Short classes. Clear explanations. Something you can use today."
      />
      {lesson ? (
        <LessonRoom
          key={lesson.id}
          lesson={lesson}
          history={history}
          refresh={refresh}
          close={() => setSelected('')}
          navigate={navigate}
        />
      ) : (
        <>
          <section className="classes-intro card">
            <div>
              <span className="eyebrow">A CLEAR WAY TO LEARN</span>
              <h2>One idea. A real situation.</h2>
              <p>
                Understand the idea, listen to examples, then try it yourself. Return later to check
                what you remember.
              </p>
            </div>
            <div className="classes-count">
              <strong>
                {practised.size} / {lessons.length}
              </strong>
              <span>classes practised</span>
            </div>
          </section>
          <div className="class-levels" role="group" aria-label="Class level">
            <button aria-pressed={level === 'All levels'} onClick={() => setLevel('All levels')}>
              All levels
            </button>
            {cefrLevels.map((item) => (
              <button key={item} aria-pressed={level === item} onClick={() => setLevel(item)}>
                {item}
              </button>
            ))}
          </div>
          <p className="fine-print">
            Suggested study level: {suggested}. Browse other levels whenever you want; a class score
            does not certify a CEFR level.
          </p>
          <div className="class-grid">
            {filtered.map((item, index) => {
              const latest = history.findLast((r) => attempt(r)!.lessonId === item.id);
              return (
                <button
                  className={`class-card class-tone-${index % 3}`}
                  key={item.id}
                  onClick={() => setSelected(item.id)}
                >
                  <span className="class-card-top">
                    <span>
                      {item.level} · <Clock3 size={13} /> 8 min
                    </span>
                    <BookOpen size={23} />
                  </span>
                  <h2>{item.title}</h2>
                  <p>{item.goal}</p>
                  <span className="class-card-bottom">
                    {latest ? (
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
      <details className="class-method card">
        <summary>How these classes are designed</summary>
        <p lang="es">
          Estas son clases originales con objetivos orientados al MCER, ejemplos explicados,
          práctica de recuperación, corrección y repaso espaciado. Esos métodos tienen respaldo en
          investigación educativa. No significa que estas clases hayan sido validadas como un curso
          completo ni que aprobarlas certifique un nivel.
        </p>
        <p lang="es">
          Las explicaciones priorizan el uso cotidiano y respetan variantes aceptadas. El espacio de
          portugués trabaja con portugués de Brasil. El material y la IA no se presentan como una
          persona con años de carrera, títulos o premios reales.
        </p>
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
}: {
  lesson: Lesson;
  history: Result[];
  refresh: () => Promise<void>;
  close: () => void;
  navigate: (view: string) => void;
}) {
  const storageKey = `class-draft:${classRevision}:${lesson.id}`;
  const [initial] = useState(() => {
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
        return parsed as { id: string; answers: number[]; practice: string; seconds: number };
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
  const [id, setId] = useState(initial.id),
    [answers, setAnswers] = useState<number[]>(initial.answers),
    [practice, setPractice] = useState(initial.practice);
  const [review, setReview] = useState<Review | undefined>(() => {
    const saved = history.find((r) => r.id === `class:${initial.id}`);
    return saved ? attempt(saved) : undefined;
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const seconds = useRef(
    Number.isFinite(initial.seconds) ? Math.min(7200, Math.max(0, initial.seconds)) : 0,
  );
  const latestDraft = useRef({ id, answers, practice });
  latestDraft.current = { id, answers, practice };
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
    return () => {
      clearInterval(timer);
      write();
    };
  }, [storageKey]);
  useEffect(() => {
    try {
      studyStorage.setItem(
        storageKey,
        JSON.stringify({ id, answers, practice, seconds: seconds.current }),
      );
    } catch {}
  }, [id, answers, practice, storageKey]);
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
      setReview(result);
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
    setReview(undefined);
    setError('');
    seconds.current = 0;
  }
  return (
    <section className="lesson-room card">
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
        <p>{lesson.goal}</p>
      </div>
      <div className="lesson-columns">
        <div>
          <section className="lesson-step">
            <span className="lesson-step-label">01 · Understand</span>
            <p lang="es">{lesson.explanation}</p>
            <code className="lesson-pattern" lang={isPortuguese ? 'pt-BR' : 'en'}>
              {lesson.pattern}
            </code>
          </section>
          <section className="lesson-step">
            <span className="lesson-step-label">02 · Hear it in real life</span>
            {lesson.examples.map((example) => (
              <div className="lesson-example" key={example}>
                <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>{example}</blockquote>
                <Speak text={example} />
              </div>
            ))}
          </section>
          <details className="lesson-tip">
            <summary>
              <Lightbulb size={16} />A useful detail
            </summary>
            <p lang="es">{lesson.tip}</p>
          </details>
        </div>
        <div>
          <section className="lesson-step">
            <span className="lesson-step-label">03 · Try it yourself</span>
            {lesson.checks.map((q, index) => (
              <fieldset className="lesson-check" key={q.prompt}>
                <legend>
                  {index + 1}. {q.prompt}
                </legend>
                <div className="options">
                  {q.options.map((option, choice) => (
                    <label
                      className={`option ${answers[index] === choice ? 'selected' : ''}`}
                      key={option}
                    >
                      <input
                        type="radio"
                        name={`class-check-${index}`}
                        checked={answers[index] === choice}
                        disabled={busy || Boolean(review)}
                        onChange={() =>
                          setAnswers(answers.map((a, i) => (i === index ? choice : a)))
                        }
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {review && (
                  <div
                    className={`lesson-feedback ${review.feedback[index].correct ? 'correct' : ''}`}
                    role="status"
                  >
                    <strong>
                      {review.feedback[index].correct ? 'That’s it.' : 'A detail to keep.'}
                    </strong>
                    <Correction
                      explanation={review.feedback[index].explanationSpanish}
                      correction={review.feedback[index].correction}
                    />
                  </div>
                )}
              </fieldset>
            ))}
            <label className="field lesson-own">
              <strong>Make it yours · optional</strong>
              <span>{lesson.practice}</span>
              <textarea
                aria-label="Your class practice"
                value={practice}
                disabled={busy || Boolean(review)}
                maxLength={2000}
                onChange={(event) => setPractice(event.target.value)}
                placeholder={lesson.model}
              />
            </label>
            <details className="lesson-model">
              <summary>Show a model answer</summary>
              <p lang={isPortuguese ? 'pt-BR' : 'en'}>{lesson.model}</p>
              <Speak text={lesson.model} />
            </details>
            <p className="fine-print" lang="es">
              Tu frase personal se guarda sin nota automática. Comparala con el modelo; un ejemplo
              distinto también puede ser válido.
            </p>
            {review ? (
              <div className="lesson-saved">
                <p>
                  <Check size={18} />
                  {review.correct} / {review.total} · Class practice saved
                </p>
                <Button secondary onClick={retry}>
                  <RotateCcw size={16} />
                  Try again later
                </Button>
                <Button secondary onClick={() => navigate('Speaking')}>
                  Use it in a conversation <ArrowRight size={16} />
                </Button>
              </div>
            ) : (
              <Button disabled={busy || answers.some((a) => a < 0)} onClick={() => void save()}>
                {busy ? 'Saving your class…' : 'Check and save my class'}
              </Button>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
          </section>
        </div>
      </div>
      <div className="lesson-return">
        <BookOpen size={18} />
        <p>Come back tomorrow. Try remembering one example before reading it again.</p>
      </div>
    </section>
  );
}
