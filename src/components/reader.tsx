'use client';
import { DownloadLink } from './ui';
import { isPortuguese } from '@/lib/workspace';
import { StudyCopy } from './study-copy';
import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, BookOpen } from 'lucide-react';
import type { Snapshot, Activity, Document } from '@/lib/types';
import { requestWordHelp } from '@/lib/word-help';
import { Button, QuestionForm, Speak, api } from './ui';
import { useStudySession } from './use-session';
import { WritingBox, ResultFeedback } from './practice';
export function Reader({
  document: doc,
  activity,
  data,
  refresh,
  close,
}: {
  document: Document;
  activity: Activity;
  data: Snapshot;
  refresh: () => Promise<void>;
  close: () => void;
}) {
  const [paragraph, setParagraph] = useState(doc.paragraph);
  const [answers, setAnswers] = useState<Record<string, number>>(doc.draft);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const [finished, setFinished] = useState(Boolean(activity.completed_at));
  const [summary, setSummary] = useState(activity.payload.draft || '');
  const [result, setResult] = useState<null | {
    correct: number | null;
    total: number | null;
    feedback?: { id: string; correct: boolean; explanation: string }[];
  }>(
    (() => {
      const r = data.results.find((r) => r.activity_id === activity.id);
      return r ? { ...r, feedback: JSON.parse(r.answers).feedback } : null;
    })(),
  );
  const session = useStudySession(activity.id, finished);
  function select(value: string) {
    requestWordHelp(value, doc.paragraphs[paragraph], doc.id);
  }
  async function checkpoint(position: number, draft: Record<string, number>) {
    setError('');
    try {
      await api('checkpoint', { id: doc.id, paragraph: position, draft });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function move(position: number) {
    setParagraph(position);
    await checkpoint(position, answers);
  }
  async function generate() {
    setBusy(true);
    setError('');
    try {
      await api('generate-questions', { documentId: doc.id });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function complete() {
    setBusy(true);
    setError('');
    try {
      const r = await api<{
        correct: number | null;
        total: number | null;
        feedback: { id: string; correct: boolean; explanation: string }[];
      }>('result', {
        activityId: activity.id,
        sessionId: session.sessionId,
        seconds: session.seconds.current,
        answers,
        text: summary || undefined,
      });
      setResult(r);
      setFinished(true);
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
        Back to my space{' '}
      </button>
      <div className="reader-layout">
        <article className="card reader">
          <div className="reading-meta">
            {doc.topic}
            <span>·</span>
            {doc.level}
            <span>·</span>
            {doc.source === 'editorial' ? 'English OS · original text' : 'Your material'}
          </div>
          <h1>{doc.title}</h1>
          <p className="reader-intro">{doc.intro}</p>
          <div className="reader-divider" />
          <div className="section-heading">
            <span className="eyebrow">
              SECTION {paragraph + 1} OF {doc.paragraphs.length}
            </span>
            <Speak text={doc.paragraphs[paragraph]} />
          </div>
          <p
            lang={isPortuguese ? 'pt-BR' : 'en'}
            className="reading-text"
            data-source-id={doc.id}
            onMouseUp={() => {
              const selection = window.getSelection()?.toString();
              if (selection?.trim()) select(selection);
            }}
          >
            {doc.paragraphs[paragraph].split(/(\s+)/).map((token, i) =>
              /[\p{L}]/u.test(token) ? (
                <button key={i} className="word-token" onClick={() => select(token)}>
                  {token}
                </button>
              ) : (
                token
              ),
            )}
          </p>
          <div className="reader-controls">
            <Button secondary disabled={paragraph === 0} onClick={() => move(paragraph - 1)}>
              <ChevronLeft size={16} />
              Previous{' '}
            </Button>
            <span>{Math.round(((paragraph + 1) / doc.paragraphs.length) * 100)}% of the text</span>
            <Button
              secondary
              disabled={paragraph === doc.paragraphs.length - 1}
              onClick={() => move(paragraph + 1)}
            >
              Next <ChevronRight size={16} />
            </Button>
          </div>
          <p className="fine-print">
            Select a word or expression to save it. Your place is saved when you change
            sections.{' '}
          </p>
          <div className="reader-divider" />
          <h2>{doc.questions.length ? 'Connect the ideas' : 'What you take from this reading'}</h2>
          {doc.questions.length ? (
            <QuestionForm
              questions={doc.questions}
              answers={answers}
              disabled={finished || busy}
              onAnswer={(id, value) => {
                const next = { ...answers, [id]: value };
                setAnswers(next);
                void checkpoint(paragraph, next);
              }}
            />
          ) : (
            <>
              <p className="muted">
                Write a short summary in English. This reading is recorded without an automatic
                comprehension score.{' '}
              </p>
              <div className="pdf-question-tools">
                <Button
                  secondary
                  disabled={busy || !data.aiAvailable || finished}
                  onClick={generate}
                >
                  Generate AI questions{' '}
                </Button>
                <p className="fine-print">
                  Up to 12,000 characters are sent to the configured AI service. Generated questions
                  may need review.{' '}
                </p>
              </div>
              <WritingBox
                activity={activity}
                initialText={summary}
                aiAvailable={data.aiAvailable}
                onText={setSummary}
                disabled={finished}
              />
            </>
          )}
          {result && <ResultFeedback result={result} />}
          {!finished && (
            <Button
              disabled={
                busy ||
                !session.sessionId ||
                (doc.questions.length > 0 &&
                  doc.questions.some((q) => answers[q.id] === undefined)) ||
                (!doc.questions.length && summary.trim().length < 30)
              }
              onClick={complete}
            >
              {busy ? 'Saving…' : 'Complete reading'}
              <Check size={17} />
            </Button>
          )}
          {finished && (
            <Button secondary onClick={close}>
              Back to My Day{' '}
            </Button>
          )}
          {(error || session.error) && (
            <p role="alert" className="error">
              {error || session.error}
            </p>
          )}
        </article>
        <aside className="reader-sidebar">
          <section className="card word-card">
            <span className="eyebrow">YOUR VOCABULARY, IN CONTEXT</span>
            <div className="word-empty">
              <BookOpen size={32} />
              <h3>Keep the words you discover.</h3>
              <StudyCopy
                native={
                  isPortuguese
                    ? 'Toque em uma palavra para ver seu significado, uma explicação e um exemplo de uso.'
                    : 'Tap a word for its meaning, an explanation and an everyday example.'
                }
              >
                Tocá una palabra para ver su significado, una explicación y un ejemplo de uso.
              </StudyCopy>
            </div>
          </section>
          <section className="card quiet-card">
            <span className="eyebrow">READ AT YOUR PACE</span>
            <p>You don’t need to understand every word. Start with the idea.</p>
            {doc.filename && (
              <DownloadLink endpoint={`files/${doc.id}`}>Download original PDF</DownloadLink>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
