'use client';
import { useState } from 'react';
import { ArrowUpRight, BookOpen, FileText, Plus, Upload, X } from 'lucide-react';
import type { Snapshot, Document } from '@/lib/types';
import { Button, Heading, Empty, api } from './ui';
import { useDialog } from './use-dialog';
export function Library({
  data,
  onOpen,
  refresh,
}: {
  data: Snapshot;
  onOpen: (doc: Document) => void;
  refresh: () => Promise<void>;
}) {
  const [topic, setTopic] = useState('All'),
    [search, setSearch] = useState(''),
    [showImport, setShowImport] = useState(false);
  const docs = data.documents.filter(
    (d) =>
      (topic === 'All' || d.topic === topic) &&
      `${d.title} ${d.topic}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="READ WITH PURPOSE"
        title="Follow your curiosity."
        description="Interesting ideas. English within reach. A space for your own texts."
      >
        <Button onClick={() => setShowImport(true)}>
          <Plus size={17} />
          Add material{' '}
        </Button>
      </Heading>
      <div className="library-tools">
        <div className="tabs">
          {['All', 'Travel', 'Finance', 'History', 'Technology', 'Work', 'Your material'].map(
            (t) => (
              <button key={t} className={t === topic ? 'active' : ''} onClick={() => setTopic(t)}>
                {t}
              </button>
            ),
          )}
        </div>
        <input
          className="search"
          aria-label="Search readings"
          placeholder="Find a reading…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="library-grid">
        {docs.map((d, index) => (
          <button className="card document-card" key={d.id} onClick={() => onOpen(d)}>
            <div className={`document-art tone-${index % 4}`} aria-hidden="true">
              <span>
                {d.source === 'editorial' ? 'ENGLISH OS / READINGS' : 'PERSONAL COLLECTION'}
              </span>
              {d.source === 'editorial' ? (
                <BookOpen size={54} strokeWidth={1} />
              ) : (
                <FileText size={54} strokeWidth={1} />
              )}
              <span>
                {d.topic.toUpperCase()}
                <ArrowUpRight size={18} />
              </span>
            </div>
            <div className="document-info">
              <div className="reading-meta">
                {d.level}
                <span>·</span>
                {d.minutes} min
                {d.source === 'pdf' && (
                  <>
                    <span>·</span>PDF
                  </>
                )}
              </div>
              <h2>{d.title}</h2>
              <p>{d.intro}</p>
              <span className="text-link">
                {d.updated_at ? `Continue · section ${d.paragraph + 1}` : 'Open reading'}
                <ArrowUpRight size={16} />
              </span>
            </div>
          </button>
        ))}
      </div>
      {!docs.length && (
        <Empty title="No readings here yet." detail="Try another topic or add your own material." />
      )}
      {showImport && <ImportDialog refresh={refresh} close={() => setShowImport(false)} />}
    </>
  );
}
function ImportDialog({ refresh, close }: { refresh: () => Promise<void>; close: () => void }) {
  const [mode, setMode] = useState('pdf'),
    [title, setTitle] = useState(''),
    [text, setText] = useState(''),
    [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const dialogRef = useDialog(close, busy);
  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const form = new FormData();
      form.set('title', title);
      if (mode === 'pdf' && file) form.set('file', file);
      else form.set('text', text);
      await api('import', form);
      await refresh();
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) close();
      }}
    >
      <section
        className="card modal"
        role="dialog"
        ref={dialogRef}
        aria-modal="true"
        aria-labelledby="import-title"
      >
        <div className="section-heading">
          <h2 id="import-title">Bring something that interests you.</h2>
          <button className="icon-button" aria-label="Close import" onClick={close} disabled={busy}>
            <X size={20} />
          </button>
        </div>
        <p className="muted">
          The text is extracted and saved in your personal library. It is not automatically sent to
          an AI service.{' '}
        </p>
        <div className="tabs">
          <button className={mode === 'pdf' ? 'active' : ''} onClick={() => setMode('pdf')}>
            PDF
          </button>
          <button className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>
            Text{' '}
          </button>
        </div>
        <form onSubmit={upload}>
          <label className="field">
            Title{' '}
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={160}
              placeholder="For example: A weekend in Edinburgh"
            />
          </label>
          {mode === 'pdf' ? (
            <label className="upload-zone">
              <Upload size={27} />
              <strong>{file?.name || 'Choose a PDF'}</strong>
              <span>Up to 10 MB · 150 pages · selectable text</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                required
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  if (!title && f) setTitle(f.name.replace(/\.pdf$/i, ''));
                }}
              />
            </label>
          ) : (
            <label className="field">
              Text in English{' '}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                minLength={80}
                maxLength={100000}
                placeholder="Paste an article or passage here…"
              />
            </label>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? 'Reading and saving…' : 'Add to my library'}
            <ArrowUpRight size={16} />
          </Button>
        </form>
        <p className="fine-print">
          Scanned PDFs need OCR, which is not included yet. Personal texts start without an
          estimated level.{' '}
        </p>
      </section>
    </div>
  );
}
