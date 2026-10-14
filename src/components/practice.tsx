'use client';
import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import type { Snapshot, Activity } from '@/lib/types';
import { Button, Heading, QuestionForm, api } from './ui';
import { useStudySession } from './use-session';
import { Vocabulary } from './vocabulary';
import { Correction } from './correction';
import { questionFeedback } from '@/lib/answer-feedback';
type Feedback = {
  correct: number | null;
  total: number | null;
  feedback?: {
    id: string;
    correct: boolean;
    explanation: string;
    correction?: string;
    explanationSpanish?: string;
  }[];
};
export function ResultFeedback({ result }: { result: Feedback }) {
  return (
    <div className="feedback positive">
      <strong>
        {result.total
          ? `${result.correct} of ${result.total} correct answers`
          : 'Practice saved, without an automatic score.'}
      </strong>
      {result.feedback?.map((f, i) => (
        <div key={f.id}>
          <span>
            {f.correct ? '✓' : '↗'} {i + 1}.
          </span>{' '}
          {f.correct ? (
            f.explanation
          ) : (
            <Correction
              explanation={f.explanationSpanish || questionFeedback(f.id).explanation}
              correction={f.correction || questionFeedback(f.id).correction}
            />
          )}
        </div>
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
    setSaveStatus('Saving draft…');
    const timer = setTimeout(() => {
      void api('draft', { activityId: activity.id, text })
        .then(() => {
          original.current = text;
          setSaveStatus('Draft saved');
        })
        .catch((e) => {
          setSaveStatus('Draft was not saved');
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
        aria-label="Your answer in English"
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
          {text.trim().split(/\s+/).filter(Boolean).length} words · {saveStatus}
        </span>
        <Button
          secondary
          disabled={!aiAvailable || busy || text.trim().length < 30}
          onClick={correct}
        >
          <Sparkles size={15} />
          {busy ? 'Reviewing…' : 'Get feedback'}
        </Button>
      </div>
      <p className="fine-print">
        {aiAvailable
          ? 'Requesting feedback sends your text and up to five previous error patterns to the configured AI service. Pronunciation is not evaluated.'
          : 'Writing feedback is available with a configured server AI key. You can save your practice without a correction.'}
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {feedback && (
        <div className="ai-feedback">
          <span className="eyebrow">AI FEEDBACK · CHECK AND REVIEW</span>
          <p lang="es">{feedback.feedback}</p>
          <blockquote lang="en">{feedback.revised}</blockquote>
          {feedback.corrections.map((c, i) => (
            <div key={i} className="correction-item">
              <span className="tag">
                {c.category === 'grammar'
                  ? 'Grammar'
                  : c.category === 'vocabulary'
                    ? 'Vocabulary'
                    : 'Naturalness · suggestion'}
              </span>
              <Correction explanation={c.explanation} correction={c.corrected} />
            </div>
          ))}
          {!feedback.corrections.length && <p>No necessary changes were identified.</p>}
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
        Back to My Day{' '}
      </button>
      <Heading
        eyebrow={
          activity.kind === 'writing'
            ? 'WRITING'
            : activity.kind === 'vocabulary'
              ? 'SMART REVIEW'
              : 'PRACTISE WITH PURPOSE'
        }
        title={activity.title}
        description={`${activity.minutes} suggested minutes. At your pace.`}
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
              Back to My Day{' '}
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
            {busy ? 'Saving…' : 'Save and complete'}
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
