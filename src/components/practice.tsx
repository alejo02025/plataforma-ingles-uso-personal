'use client';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import type { Snapshot, Activity } from '@/lib/types';
import { Button, Heading, QuestionForm, api } from './ui';
import { useStudySession } from './use-session';
import { Vocabulary } from './vocabulary';
type Feedback = {
  correct: number | null;
  total: number | null;
  feedback?: { id: string; correct: boolean; explanation: string }[];
};
export function ResultFeedback({ result }: { result: Feedback }) {
  return (
    <div className="feedback positive">
      <strong>
        {result.total
          ? `${result.correct} de ${result.total} respuestas correctas`
          : 'Práctica guardada, sin puntuación automática.'}
      </strong>
      {result.feedback?.map((f, i) => (
        <p key={f.id}>
          <span>
            {f.correct ? '✓' : '↗'} {i + 1}.
          </span>{' '}
          {f.explanation}
        </p>
      ))}
    </div>
  );
}
export function WritingBox({
  activity,
  initialText,
  onText,
  aiAvailable,
  disabled,
}: {
  activity: Activity;
  initialText: string;
  onText: (text: string) => void;
  aiAvailable: boolean;
  disabled?: boolean;
}) {
  const [text, setText] = useState(initialText);
  const [feedback, setFeedback] = useState<{
    revised: string;
    feedback: string;
    corrections: { category: string; original: string; corrected: string; explanation: string }[];
  } | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [saveStatus, setSaveStatus] = useState('');
  const original = useRef(initialText);
  useEffect(() => {
    if (disabled || text === original.current) return;
    setSaveStatus('Guardando borrador…');
    const timer = setTimeout(() => {
      void api('draft', { activityId: activity.id, text })
        .then(() => {
          original.current = text;
          setSaveStatus('Borrador guardado');
        })
        .catch((e) => {
          setSaveStatus('No se guardó el borrador');
          setError(e.message);
        });
    }, 700);
    return () => clearTimeout(timer);
  }, [text, activity.id, disabled]);
  async function correct() {
    setBusy(true);
    setError('');
    try {
      setFeedback(await api('correction', { text, activityId: activity.id }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="writing-box">
      <textarea
        aria-label="Tu respuesta en inglés"
        lang="en"
        value={text}
        maxLength={6000}
        disabled={disabled}
        placeholder="Take your time. Start with one idea…"
        onChange={(e) => {
          setText(e.target.value);
          onText(e.target.value);
          setFeedback(null);
        }}
      />
      <div className="writing-meta">
        <span>
          {text.trim().split(/\s+/).filter(Boolean).length} palabras · {saveStatus}
        </span>
        <Button
          secondary
          disabled={!aiAvailable || busy || text.trim().length < 30}
          onClick={correct}
        >
          <Sparkles size={15} />
          {busy ? 'Revisando…' : 'Recibir devolución'}
        </Button>
      </div>
      <p className="fine-print">
        {aiAvailable
          ? 'Al pedir una devolución, tu texto y hasta cinco patrones de errores se envían al servicio de IA. No se evalúa pronunciación.'
          : 'Corrección por IA disponible al configurar ENGLISH_AI_API_KEY. Podés guardar tu práctica sin una corrección.'}
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {feedback && (
        <div className="ai-feedback">
          <span className="eyebrow">DEVOLUCIÓN DE IA · REVISABLE</span>
          <p>{feedback.feedback}</p>
          <blockquote lang="en">{feedback.revised}</blockquote>
          {feedback.corrections.map((c, i) => (
            <div key={i} className="correction-item">
              <span className="tag">
                {c.category === 'grammar'
                  ? 'Gramática'
                  : c.category === 'vocabulary'
                    ? 'Vocabulario'
                    : 'Naturalidad · sugerencia'}
              </span>
              <p lang="en">
                <del>{c.original}</del> → <strong>{c.corrected}</strong>
              </p>
              <p>{c.explanation}</p>
            </div>
          ))}
          {!feedback.corrections.length && <p>No se señalaron cambios necesarios.</p>}
        </div>
      )}
    </div>
  );
}
export function Practice({
  activity,
  data,
  refresh,
  close,
}: {
  activity: Activity;
  data: Snapshot;
  refresh: () => Promise<void>;
  close: () => void;
}) {
  const previous = data.results.find((r) => r.activity_id === activity.id);
  const saved = previous ? JSON.parse(previous.answers) : null;
  const [answers, setAnswers] = useState<Record<string, number>>(saved?.choices || {});
  const [text, setText] = useState(saved?.text || activity.payload.draft || '');
  const [result, setResult] = useState<Feedback | null>(
    previous ? { ...previous, feedback: saved?.feedback } : null,
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const session = useStudySession(activity.id, Boolean(result));
  async function finish() {
    setBusy(true);
    setError('');
    try {
      setResult(
        await api('result', {
          activityId: activity.id,
          sessionId: session.sessionId,
          seconds: session.seconds.current,
          answers,
          text,
        }),
      );
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button className="back-link" onClick={close}>
        <ArrowLeft size={16} />
        Volver a mi día
      </button>
      <Heading
        eyebrow={
          activity.kind === 'writing'
            ? 'ESCRITURA'
            : activity.kind === 'vocabulary'
              ? 'REPASO INTELIGENTE'
              : 'PRÁCTICA CON PROPÓSITO'
        }
        title={activity.title}
        description={`${activity.minutes} minutos sugeridos. A tu ritmo.`}
      />
      <section className="card practice-card">
        {activity.kind === 'grammar' && (
          <QuestionForm
            questions={activity.payload.questions || []}
            answers={answers}
            onAnswer={(id, value) => setAnswers({ ...answers, [id]: value })}
            disabled={Boolean(result)}
          />
        )}
        {activity.kind === 'writing' && (
          <>
            <div className="prompt" lang="en">
              {activity.payload.prompt}
            </div>
            <WritingBox
              activity={activity}
              initialText={text}
              onText={setText}
              aiAvailable={data.aiAvailable}
              disabled={Boolean(result)}
            />
          </>
        )}
        {activity.kind === 'vocabulary' && <Vocabulary data={data} refresh={refresh} embedded />}
        {result ? (
          <>
            <ResultFeedback result={result} />
            <Button secondary onClick={close}>
              Volver a mi día
            </Button>
          </>
        ) : (
          <Button
            disabled={
              busy ||
              !session.sessionId ||
              (activity.kind === 'grammar' &&
                (activity.payload.questions || []).some((q) => answers[q.id] === undefined)) ||
              (activity.kind === 'writing' && text.trim().length < 30)
            }
            onClick={finish}
          >
            {busy ? 'Guardando…' : 'Guardar y completar'}
            <Check size={16} />
          </Button>
        )}
        {(error || session.error) && (
          <p className="error" role="alert">
            {error || session.error}
          </p>
        )}
      </section>
    </>
  );
}
