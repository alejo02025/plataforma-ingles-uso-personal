'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Upload,
  X,
  Square,
  BookmarkPlus,
  LoaderCircle,
} from 'lucide-react';
import type { Snapshot, Document } from '@/lib/types';
import { guidedReply, questions, type Source } from '@/lib/tutor';
import { api, Button, DownloadLink, Speak } from './ui';
import type { LocalStatus } from '@/lib/browser/local-ai';
export function PdfStudio({
  data,
  refresh,
  onRead,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  onRead: (doc: Document) => void;
}) {
  const [selected, setSelected] = useState(''),
    [tab, setTab] = useState<'read' | 'practice' | 'chat'>('read'),
    [focus, setFocus] = useState(0),
    [round, setRound] = useState(0);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [dragging, setDragging] = useState(false),
    [uploadStatus, setUploadStatus] = useState('');
  const [draft, setDraft] = useState(''),
    [stream, setStream] = useState(''),
    [responding, setResponding] = useState(false),
    [word, setWord] = useState('');
  const [local, setLocal] = useState<LocalStatus>({ state: 'off', loaded: 0, total: 0 });
  const [localAnswers, setAnswers] = useState<Record<string, string>>({}),
    [localFeedback, setFeedback] = useState<
      Record<string, { correct: number | null; feedback: string }>
    >({});
  const input = useRef<HTMLInputElement>(null),
    tail = useRef<HTMLDivElement>(null),
    request = useRef(0);
  const personal = data.documents.filter((doc) => doc.source !== 'editorial');
  const doc = data.documents.find((doc) => doc.id === selected) || personal[0] || null;
  const previous = data.tutorAttempts.filter((attempt) => attempt.document_id === doc?.id);
  const answers: Record<string, string> = {
    ...Object.fromEntries(previous.map((attempt) => [attempt.question_id, attempt.answer])),
    ...localAnswers,
  };
  const feedback: Record<string, { correct: number | null; feedback: string }> = {
    ...Object.fromEntries(previous.map((attempt) => [attempt.question_id, attempt])),
    ...localFeedback,
  };
  const quiz = useMemo(() => (doc ? questions(doc, round, focus) : []), [doc, round, focus]);
  const messages = data.tutorMessages.filter((message) => message.document_id === doc?.id);
  useEffect(() => {
    let active = true;
    const update = () =>
      void import('@/lib/browser/local-ai').then((module) => {
        if (active) setLocal(module.localStatus());
      });
    update();
    window.addEventListener('english-local-ai', update);
    return () => {
      active = false;
      request.current++;
      window.removeEventListener('english-local-ai', update);
    };
  }, []);
  useEffect(() => {
    setFocus(doc?.paragraph || 0);
    setWord('');
    setRound(0);
    setFeedback({});
    setAnswers({});
    setDraft(doc ? localStorage.getItem(`english-tutor-draft:${doc.id}`) || '' : '');
  }, [doc?.id]);
  useEffect(() => {
    if (doc && focus < doc.paragraphs.length)
      void api('checkpoint', { id: doc.id, paragraph: focus, draft: doc.draft }).catch((error) =>
        setError(error.message),
      );
  }, [doc?.id, focus]);
  useEffect(() => {
    if (doc) localStorage.setItem(`english-tutor-draft:${doc.id}`, draft);
  }, [draft, doc?.id]);
  useEffect(() => {
    tail.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length, stream]);
  async function upload(files: FileList | File[]) {
    if (busy || responding) return;
    setBusy(true);
    setError('');
    const list = Array.from(files);
    let last = '';
    try {
      for (const [index, file] of list.entries()) {
        setUploadStatus(`Reading PDF ${index + 1} of ${list.length}…`);
        const form = new FormData();
        const title = file.name
          .replace(/\.pdf$/i, '')
          .replace(/[_-]/g, ' ')
          .trim()
          .slice(0, 160);
        form.set('title', title.length >= 3 ? title : `PDF: ${title || 'My document'}`);
        form.set('file', file);
        const result = await api<{ id: string }>('import', form);
        last = result.id;
        await refresh();
      }
      if (last) {
        setSelected(last);
        setTab('read');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The PDF could not be read.');
      if (last) setSelected(last);
    } finally {
      setBusy(false);
      setUploadStatus('');
      if (input.current) input.current.value = '';
    }
  }
  async function send(text = draft) {
    if (!doc || !text.trim() || responding) return;
    const current = doc,
      sequence = ++request.current;
    setResponding(true);
    setError('');
    setStream('');
    setDraft('');
    try {
      await api('tutor/message', {
        id: crypto.randomUUID(),
        documentId: current.id,
        role: 'user',
        content: text.trim().slice(0, 3000),
        sources: [],
        mode: 'user',
      });
      await refresh();
      let reply: { content: string; sources: Source[]; mode?: 'local' | 'guided' };
      if (local.state === 'ready') {
        const { localReply } = await import('@/lib/browser/local-ai');
        reply = await localReply(current, text, data.tutorMessages, focus, (content) => {
          if (sequence === request.current) setStream(content);
        });
      } else reply = guidedReply(current, text, focus);
      await api('tutor/message', {
        id: crypto.randomUUID(),
        documentId: current.id,
        role: 'assistant',
        content: reply.content,
        sources: reply.sources.map((source) => source.paragraph),
        mode: reply.mode || 'guided',
      });
      await refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'The response could not be completed. Your message is saved.',
      );
    } finally {
      if (sequence === request.current) {
        setResponding(false);
        setStream('');
      }
    }
  }
  async function answer(questionId: string) {
    if (!doc || !answers[questionId]) return;
    setBusy(true);
    setError('');
    try {
      const result = await api<{ correct: number | null; feedback: string }>('tutor/answer', {
        documentId: doc.id,
        round,
        focus,
        questionId,
        answer: answers[questionId],
      });
      setFeedback((current) => ({ ...current, [questionId]: result }));
      await refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const sourceLabel = (index: number) =>
    `${doc?.pages?.[index] ? `Page ${doc.pages[index]} · ` : ''}Section ${index + 1}`;
  return (
    <>
      <div className="studio-heading">
        <div>
          <span className="eyebrow">THE READING ROOM</span>
          <h1>Good reads. Better conversations.</h1>
          <p>Pull up a chair. Bring a book, a story, or something you want to understand.</p>
        </div>
        <span className="studio-local-pill">
          <Sparkles size={15} />
          Private by design
        </span>
      </div>
      <input
        ref={input}
        className="visually-hidden"
        type="file"
        accept="application/pdf,.pdf"
        multiple
        aria-label="Upload PDFs"
        onChange={(event) => {
          if (event.target.files) void upload(event.target.files);
        }}
      />
      <section
        className={`studio-drop ${dragging ? 'dragging' : ''} ${doc ? 'compact' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload(event.dataTransfer.files);
        }}
      >
        <div className="studio-drop-icon">
          <Upload size={doc ? 22 : 34} />
        </div>
        <div>
          <h2>
            {uploadStatus
              ? uploadStatus
              : doc
                ? 'Something else caught your eye?'
                : 'Drop your PDFs here.'}
          </h2>
          <p>Books, notes, articles. Text-based PDFs up to 10 MB each.</p>
        </div>
        <Button disabled={busy || responding} onClick={() => input.current?.click()}>
          <Plus size={17} />
          {uploadStatus ? 'Reading…' : 'Choose PDFs'}
        </Button>
      </section>
      {error && (
        <p className="error studio-error" role="alert">
          {error}
        </p>
      )}
      {!doc ? (
        <div className="studio-intro-grid">
          <section className="card studio-feature coral">
            <BookOpen />
            <h3>Understand the text.</h3>
            <p>Read in small sections, listen to words, and keep the page in view.</p>
          </section>
          <section className="card studio-feature blue">
            <MessageCircle />
            <h3>A little back-and-forth.</h3>
            <p>Ask about the content. Local AI runs on your device when you enable it.</p>
          </section>
          <section className="card studio-feature teal">
            <Sparkles />
            <h3>Keep the good bits.</h3>
            <p>Answer questions linked to your document and collect words you want to keep.</p>
          </section>
        </div>
      ) : (
        <>
          <div className="studio-toolbar">
            <label className="studio-doc-select">
              <FileText size={18} />
              <select
                aria-label="Current document"
                value={doc.id}
                disabled={responding}
                onChange={(event) => setSelected(event.target.value)}
              >
                {data.documents
                  .filter((item) => item.source !== 'editorial' || item.id === doc.id)
                  .map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.title}
                    </option>
                  ))}
              </select>
            </label>
            <div className="tabs studio-tabs">
              {(['read', 'practice', 'chat'] as const).map((item) => (
                <button
                  key={item}
                  className={tab === item ? 'active' : ''}
                  onClick={() => setTab(item)}
                >
                  {item === 'read' ? 'Read' : item === 'practice' ? 'Practice' : 'Chat'}
                </button>
              ))}
            </div>
          </div>
          <div className="studio-workspace">
            <aside className="studio-outline card">
              <span className="eyebrow">IN THIS DOCUMENT</span>
              <h3>{doc.title}</h3>
              <p>
                {doc.paragraphs.length} sections · about {doc.minutes} min
              </p>
              <div className="studio-sections">
                {doc.paragraphs.map((paragraph, index) => (
                  <button
                    disabled={responding}
                    className={focus === index ? 'active' : ''}
                    key={index}
                    onClick={() => {
                      setFocus(index);
                      setRound(0);
                      setFeedback({});
                      setAnswers({});
                    }}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {paragraph.slice(0, 65)}
                    {paragraph.length > 65 ? '…' : ''}
                  </button>
                ))}
              </div>
              {doc.filename && (
                <DownloadLink endpoint={`files/${doc.id}`}>Download original PDF</DownloadLink>
              )}
              <button className="text-link" onClick={() => onRead(doc)}>
                Open full reader <ArrowRight size={14} />
              </button>
            </aside>
            <section className="studio-content card">
              <div className="studio-section-heading">
                <span className="eyebrow">{sourceLabel(focus)}</span>
                <span className="pill neutral">
                  {tab === 'chat'
                    ? 'Your conversation'
                    : tab === 'practice'
                      ? 'Learn by doing'
                      : 'Take your time'}
                </span>
              </div>
              {tab === 'read' ? (
                <>
                  <h2>{doc.title}</h2>
                  <div
                    className="studio-passage"
                    lang="en"
                    onPointerUp={() => {
                      const selection = window.getSelection()?.toString().trim() || '';
                      if (selection && selection.length <= 100) setWord(selection);
                    }}
                  >
                    {doc.paragraphs[focus]}
                  </div>
                  {word && (
                    <div className="studio-selected-word">
                      <span>{word}</span>
                      <Speak text={word} />
                      <Button
                        secondary
                        disabled={busy}
                        onClick={async () => {
                          setBusy(true);
                          try {
                            await api('word', {
                              word,
                              sourceId: doc.id,
                              example: doc.paragraphs[focus].slice(0, 1500),
                            });
                            await refresh();
                            setWord('');
                          } catch (error) {
                            setError((error as Error).message);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        <BookmarkPlus size={16} />
                        Save word
                      </Button>
                      <button
                        className="icon-button"
                        aria-label="Clear selection"
                        onClick={() => setWord('')}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <p className="fine-print">
                    Select a word or phrase to save it. Your place and original PDF stay in your
                    library.
                  </p>
                  <div className="studio-reading-actions">
                    <Button secondary disabled={focus === 0} onClick={() => setFocus(focus - 1)}>
                      <ArrowLeft size={16} />
                      Previous
                    </Button>
                    <Button onClick={() => setTab('practice')}>
                      Practice this section
                      <Sparkles size={16} />
                    </Button>
                    <Button
                      secondary
                      disabled={focus === doc.paragraphs.length - 1}
                      onClick={() => setFocus(focus + 1)}
                    >
                      Next
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </>
              ) : tab === 'practice' ? (
                <>
                  <h2>Between the lines.</h2>
                  <p className="muted">
                    Use the source passage to check your thinking. Open answers are saved without an
                    automatic grade.
                  </p>
                  <details className="studio-source">
                    <summary>Show source passage</summary>
                    <blockquote>{doc.paragraphs[focus]}</blockquote>
                  </details>
                  {quiz.map((question, index) => (
                    <section className="studio-question" key={question.id}>
                      <div className="studio-question-number">
                        {index + 1}
                        <span>
                          {question.kind === 'open'
                            ? 'Your own words'
                            : question.kind === 'word'
                              ? 'Vocabulary in context'
                              : 'Find the detail'}
                        </span>
                      </div>
                      <h3>{question.prompt}</h3>
                      {question.options.length ? (
                        <div className="options">
                          {question.options.map((option) => (
                            <label
                              className={`option ${answers[question.id] === option ? 'selected' : ''}`}
                              key={option}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                disabled={!!feedback[question.id]}
                                checked={answers[question.id] === option}
                                onChange={() =>
                                  setAnswers((current) => ({ ...current, [question.id]: option }))
                                }
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          aria-label={`Your answer to question ${index + 1}`}
                          disabled={!!feedback[question.id]}
                          value={answers[question.id] || ''}
                          onChange={(event) =>
                            setAnswers((current) => ({
                              ...current,
                              [question.id]: event.target.value,
                            }))
                          }
                          placeholder="Try answering in English…"
                          rows={3}
                          maxLength={3000}
                        />
                      )}{' '}
                      {feedback[question.id] ? (
                        <p
                          className={`studio-feedback ${feedback[question.id].correct === 1 ? 'correct' : ''}`}
                          role="status"
                        >
                          {feedback[question.id].feedback}
                        </p>
                      ) : (
                        <Button
                          secondary
                          disabled={busy || !answers[question.id]?.trim()}
                          onClick={() => void answer(question.id)}
                        >
                          Check and save <Check size={15} />
                        </Button>
                      )}
                    </section>
                  ))}
                  <Button
                    onClick={() => {
                      setRound(round + 1);
                      setAnswers({});
                      setFeedback({});
                    }}
                  >
                    Give me more questions
                    <Sparkles size={16} />
                  </Button>
                </>
              ) : (
                <>
                  <div className="studio-chat-header">
                    <div>
                      <h2>Let's talk about it.</h2>
                      <p className="muted">Ask a question, explore an idea, or practise a reply.</p>
                    </div>
                    <span className={`studio-ai-state ${local.state === 'ready' ? 'enabled' : ''}`}>
                      {local.state === 'ready' || local.state === 'generating'
                        ? 'Local AI'
                        : 'Guided mode'}
                    </span>
                  </div>
                  {(local.state === 'off' || local.state === 'error') && (
                    <div className="studio-ai-callout">
                      <Sparkles size={22} />
                      <div>
                        <h3>Make room for a conversation.</h3>
                        <p>
                          Enable a small local AI model. A one-time download of about 110 MB, hosted
                          with this app on GitHub. Your document stays on this device. Speed depends
                          on your device.
                        </p>
                        <Button
                          secondary
                          onClick={async () => {
                            setError('');
                            try {
                              const { enableLocalAI } = await import('@/lib/browser/local-ai');
                              await enableLocalAI();
                            } catch (error) {
                              setError((error as Error).message);
                            }
                          }}
                        >
                          Enable local AI
                        </Button>
                      </div>
                    </div>
                  )}
                  {local.state === 'loading' && (
                    <div className="studio-ai-loading" role="status">
                      <LoaderCircle className="spinner" size={20} />
                      <div>
                        <p>
                          {local.total && local.loaded < local.total
                            ? `Downloading local AI · ${Math.round((local.loaded / local.total) * 100)}%`
                            : 'Preparing the local model…'}
                        </p>
                        <progress max={local.total || 1} value={local.loaded} />
                        <span className="fine-print">
                          The download is verified before the model is used.
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="studio-conversation" aria-live="polite">
                    {!messages.length && (
                      <div className="studio-welcome">
                        <MessageCircle size={27} />
                        <h3>Start with one question.</h3>
                        <p>“What is the main idea?” or “Can you explain this section?”</p>
                        <span className="fine-print">
                          Guided mode quotes your document. Enable local AI for generated
                          conversation.
                        </span>
                      </div>
                    )}
                    {messages.map((message) => (
                      <article className={`studio-message ${message.role}`} key={message.id}>
                        <span>
                          {message.role === 'user'
                            ? 'You'
                            : message.mode === 'local'
                              ? 'Local AI tutor'
                              : 'Reading guide'}
                        </span>
                        <p>{message.content}</p>
                        {message.role === 'assistant' && (
                          <div className="studio-citations">
                            {(JSON.parse(message.sources) as number[]).map((index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  setFocus(index);
                                  setTab('read');
                                }}
                              >
                                <BookOpen size={12} />
                                {sourceLabel(index)}
                              </button>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                    {responding && (
                      <article className="studio-message assistant">
                        <span>
                          {local.state === 'generating' ? 'Local AI tutor' : 'Reading guide'}
                        </span>
                        <p>{stream || 'Drafting and checking against your document…'}</p>
                      </article>
                    )}
                    <div ref={tail} />
                  </div>
                  <div className="studio-prompts">
                    {[
                      'Summarize this section',
                      'Ask me a question',
                      'Explain in simple English',
                    ].map((prompt) => (
                      <button key={prompt} disabled={responding} onClick={() => void send(prompt)}>
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <form
                    className="studio-composer"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void send();
                    }}
                  >
                    <textarea
                      rows={2}
                      aria-label="Message your PDF tutor"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      maxLength={3000}
                      placeholder="Ask anything about your document…"
                      disabled={responding}
                    />
                    {responding ? (
                      <button
                        className="studio-send"
                        type="button"
                        aria-label="Stop response"
                        onClick={() =>
                          void import('@/lib/browser/local-ai').then((module) =>
                            module.stopLocalAI(),
                          )
                        }
                      >
                        <Square size={17} />
                      </button>
                    ) : (
                      <button
                        className="studio-send"
                        disabled={!draft.trim() || local.state === 'loading'}
                        aria-label="Send message"
                      >
                        <Send size={18} />
                      </button>
                    )}
                  </form>
                  <p className="fine-print">
                    Small local models can make mistakes. Use the cited passages to check each
                    response.
                  </p>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
