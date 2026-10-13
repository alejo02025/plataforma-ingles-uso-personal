'use client';
import { DownloadLink } from './ui';
import { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, BookmarkPlus, Check, BookOpen } from 'lucide-react';
import type { Snapshot, Activity, Document } from '@/lib/types';
import { glossary } from '@/lib/content';
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
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState({ meaning: '', pronunciation: '', example: '' });
  const [saved, setSaved] = useState(false),
    [busy, setBusy] = useState(false),
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
    const clean = value
      .replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '')
      .trim()
      .toLowerCase();
    if (!clean || clean.length > 100) return;
    setWord(clean);
    setDefinition(
      glossary[clean] || { meaning: '', pronunciation: '', example: doc.paragraphs[paragraph] },
    );
    setSaved(data.vocabulary.some((w) => w.word === clean));
    setError('');
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
  async function saveWord() {
    setBusy(true);
    setError('');
    try {
      await api('word', {
        word,
        sourceId: doc.id,
        meaning: definition.meaning,
        pronunciation: definition.pronunciation,
        example: definition.example,
      });
      setSaved(true);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
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
  async function lookup() {
    setBusy(true);
    setError('');
    try {
      setDefinition(
        await api('lookup', { word, sentence: doc.paragraphs[paragraph].slice(0, 1500) }),
      );
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
        Volver a mi espacio
      </button>
      <div className="reader-layout">
        <article className="card reader">
          <div className="reading-meta">
            {doc.topic}
            <span>·</span>
            {doc.level}
            <span>·</span>
            {doc.source === 'editorial' ? 'English OS · texto original' : 'Tu material'}
          </div>
          <h1>{doc.title}</h1>
          <p className="reader-intro">{doc.intro}</p>
          <div className="reader-divider" />
          <div className="section-heading">
            <span className="eyebrow">
              FRAGMENTO {paragraph + 1} DE {doc.paragraphs.length}
            </span>
            <Speak text={doc.paragraphs[paragraph]} />
          </div>
          <p
            lang="en"
            className="reading-text"
            onMouseUp={() => {
              const selection = window.getSelection()?.toString();
              if (selection?.trim()) select(selection);
            }}
          >
            {doc.paragraphs[paragraph].split(/(\s+)/).map((token, i) =>
              /[a-zA-Z]/.test(token) ? (
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
              Anterior
            </Button>
            <span>{Math.round(((paragraph + 1) / doc.paragraphs.length) * 100)}% del texto</span>
            <Button
              secondary
              disabled={paragraph === doc.paragraphs.length - 1}
              onClick={() => move(paragraph + 1)}
            >
              Siguiente
              <ChevronRight size={16} />
            </Button>
          </div>
          <p className="fine-print">
            Seleccioná una palabra o una expresión para guardarla. Tu posición se guarda al cambiar
            de fragmento.
          </p>
          <div className="reader-divider" />
          <h2>{doc.questions.length ? 'Conectá las ideas' : 'Lo que te llevás de esta lectura'}</h2>
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
                Escribí un resumen breve en inglés. Esta lectura se registra sin una nota de
                comprensión automática.
              </p>
              <div className="pdf-question-tools">
                <Button
                  secondary
                  disabled={busy || !data.aiAvailable || finished}
                  onClick={generate}
                >
                  Preparar preguntas con IA
                </Button>
                <p className="fine-print">
                  Se envían hasta 12.000 caracteres del texto al servicio de IA. Las preguntas
                  generadas son orientativas y pueden necesitar revisión.
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
              {busy ? 'Guardando…' : 'Completar lectura'}
              <Check size={17} />
            </Button>
          )}
          {finished && (
            <Button secondary onClick={close}>
              Volver a mi día
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
            <span className="eyebrow">TU VOCABULARIO, EN CONTEXTO</span>
            {word ? (
              <>
                <div className="section-heading">
                  <h2 lang="en">{word}</h2>
                  <Speak text={word} />
                </div>
                <p className="phonetic">
                  {definition.pronunciation || 'Escuchá la voz de tu navegador'}
                </p>
                {definition.meaning ? (
                  <p>{definition.meaning}</p>
                ) : (
                  <p className="muted">
                    Esta palabra no está en el glosario inicial. Podés consultar IA o agregar un
                    significado.
                  </p>
                )}
                <label className="field">
                  Significado
                  <input
                    value={definition.meaning}
                    maxLength={1000}
                    onChange={(e) => setDefinition({ ...definition, meaning: e.target.value })}
                    placeholder="Traducción o nota personal"
                  />
                </label>
                <blockquote lang="en">{definition.example}</blockquote>
                {!glossary[word] && (
                  <Button secondary disabled={busy || !data.aiAvailable} onClick={lookup}>
                    {busy ? 'Consultando…' : 'Consultar significado con IA'}
                  </Button>
                )}
                <Button disabled={saved || busy} onClick={saveWord}>
                  {saved ? <Check size={16} /> : <BookmarkPlus size={16} />}
                  {saved ? 'En tu vocabulario' : 'Guardar palabra'}
                </Button>
              </>
            ) : (
              <div className="word-empty">
                <BookOpen size={32} strokeWidth={1} />
                <h3>Las palabras se quedan.</h3>
                <p>
                  Tocá una palabra del texto. Descubrí su significado y llevála a tus próximos
                  repasos.
                </p>
              </div>
            )}
          </section>
          <section className="card quiet-card">
            <span className="eyebrow">LEER SIN APURO</span>
            <p>No necesitás entender cada palabra. Primero, buscá la idea.</p>
            {doc.filename && (
              <DownloadLink endpoint={`files/${doc.id}`}>Descargar PDF original</DownloadLink>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
