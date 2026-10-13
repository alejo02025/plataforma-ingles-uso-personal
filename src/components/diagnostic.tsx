'use client';
import { useState } from 'react';
import type { Snapshot } from '@/lib/types';
import { Button, Heading, QuestionForm, api } from './ui';
export function Diagnostic({
  data,
  refresh,
  close,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  close: () => void;
}) {
  const next = data.questions.find(
    (q) => !data.diagnostic.answers.some((a) => a.question_id === q.id),
  );
  const [answer, setAnswer] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function save() {
    if (!next) return;
    setBusy(true);
    setError('');
    try {
      setFeedback(await api('diagnostic', { questionId: next.id, answer: answer[next.id] }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function advance() {
    setBusy(true);
    setError('');
    try {
      await refresh();
      setFeedback(null);
      setAnswer({});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow-page">
      <Heading
        eyebrow="YOUR STARTING POINT"
        title={
          data.diagnostic.completed_at
            ? 'Ya tenemos una primera referencia.'
            : 'Let’s get to know your English.'
        }
        description="Nine short reading, grammar, and vocabulary situations. No timer or pressure."
      />
      <section className="card diagnostic-card">
        <div className="section-heading">
          <span>{data.diagnostic.answers.length} of 9 saved</span>
          <Button secondary onClick={close}>
            Save and leave{' '}
          </Button>
        </div>
        <div className="progress-bar">
          <span style={{ width: `${(data.diagnostic.answers.length / 9) * 100}%` }} />
        </div>
        {next ? (
          <>
            <QuestionForm
              key={next.id}
              questions={[next]}
              answers={answer}
              onAnswer={(id, value) => setAnswer({ [id]: value })}
              disabled={busy || Boolean(feedback)}
            />
            {feedback && (
              <div className={`feedback ${feedback.correct ? 'positive' : ''}`}>
                <strong>{feedback.correct ? 'Well done.' : 'A clue for next time.'}</strong>
                <p>{feedback.explanation}</p>
              </div>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <Button
              disabled={busy || (!feedback && answer[next.id] === undefined)}
              onClick={feedback ? advance : save}
            >
              {busy ? 'Saving…' : feedback ? 'Next' : 'Save answer'}
            </Button>
          </>
        ) : (
          <>
            <h2>Your starting point is saved.</h2>
            <p className="muted">
              These estimates are informal and have low confidence. This short assessment does not
              certify a CEFR level. Speaking, listening, and writing need other assessments.{' '}
            </p>
            <Button onClick={close}>Go to my journey</Button>
          </>
        )}
        <p className="fine-print">Every answer is saved. You can continue another day. </p>
      </section>
    </div>
  );
}
