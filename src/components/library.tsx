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
  const [topic, setTopic] = useState('Todo'),
    [search, setSearch] = useState(''),
    [showImport, setShowImport] = useState(false);
  const docs = data.documents.filter(
    (d) =>
      (topic === 'Todo' || d.topic === topic) &&
      `${d.title} ${d.topic}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="LECTURAS CON PROPÓSITO"
        title="Seguí tu curiosidad."
        description="Ideas interesantes. Inglés a tu alcance. Un espacio para tus propios textos."
      >
        <Button onClick={() => setShowImport(true)}>
          <Plus size={17} />
          Agregar material
        </Button>
      </Heading>
      <div className="library-tools">
        <div className="tabs">
          {['Todo', 'Viajes', 'Finanzas', 'Historia', 'Tecnología', 'Trabajo', 'Tu material'].map(
            (t) => (
              <button key={t} className={t === topic ? 'active' : ''} onClick={() => setTopic(t)}>
                {t}
              </button>
            ),
          )}
        </div>
        <input
          className="search"
          aria-label="Buscar lecturas"
          placeholder="Buscar una lectura…"
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
                {d.updated_at ? `Continuar · fragmento ${d.paragraph + 1}` : 'Abrir lectura'}
                <ArrowUpRight size={16} />
              </span>
            </div>
          </button>
        ))}
      </div>
      {!docs.length && (
        <Empty
          title="Todavía no hay lecturas acá."
          detail="Probá otro tema o agregá tu propio material."
        />
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
          <h2 id="import-title">Traé algo que te interese.</h2>
          <button
            className="icon-button"
            aria-label="Cerrar importación"
            onClick={close}
            disabled={busy}
          >
            <X size={20} />
          </button>
        </div>
        <p className="muted">
          El material se extrae y se guarda en tu biblioteca privada. No se envía automáticamente a
          IA.
        </p>
        <div className="tabs">
          <button className={mode === 'pdf' ? 'active' : ''} onClick={() => setMode('pdf')}>
            PDF
          </button>
          <button className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>
            Texto
          </button>
        </div>
        <form onSubmit={upload}>
          <label className="field">
            Título
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={160}
              placeholder="Por ejemplo: A weekend in Edinburgh"
            />
          </label>
          {mode === 'pdf' ? (
            <label className="upload-zone">
              <Upload size={27} />
              <strong>{file?.name || 'Elegí un PDF'}</strong>
              <span>Hasta 10 MB · 150 páginas · con texto seleccionable</span>
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
              Texto en inglés
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                minLength={80}
                maxLength={100000}
                placeholder="Pegá acá un artículo o fragmento…"
              />
            </label>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? 'Extrayendo y guardando…' : 'Incorporar a mi biblioteca'}
            <ArrowUpRight size={16} />
          </Button>
        </form>
        <p className="fine-print">
          Los PDF escaneados necesitan OCR, pendiente de la siguiente fase. Los textos propios
          comienzan sin estimación de nivel.
        </p>
      </section>
    </div>
  );
}
