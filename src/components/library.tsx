'use client';
import { isPortuguese } from '@/lib/workspace';
import { courseRoute } from '@/lib/course-route';
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
  const currentLevel = courseRoute(data).level;
  const [levelOnly, setLevelOnly] = useState(true);
  const [topic, setTopic] = useState('All'),
    [search, setSearch] = useState(''),
    [showImport, setShowImport] = useState(false);
  const docs = data.documents.filter(
    (d) =>
      !d.filename &&
      (!levelOnly || d.level === currentLevel) &&
      (topic === 'All' || d.topic === topic) &&
      `${d.title} ${d.topic}`.toLowerCase().includes(search.toLowerCase()),
  );
  const continued = [...data.documents]
    .filter((d) => d.updated_at && !d.filename)
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))[0];
  const progress = (d: Document) =>
    data.results.some((r) => r.skill === 'reading' && r.document_id === d.id)
      ? 100
      : d.updated_at
        ? Math.round(((d.paragraph + 1) / Math.max(1, d.paragraphs.length)) * 100)
        : 0;
  return (
    <>
      <Heading
        eyebrow={isPortuguese ? 'LEIA COM PROPÓSITO' : 'READ WITH PURPOSE'}
        title={isPortuguese ? 'Leituras' : 'Readings'}
        description={
          isPortuguese ? 'Escolha um texto ou adicione o seu.' : 'Choose a text or add your own.'
        }
      >
        <Button onClick={() => setShowImport(true)}>
          <Plus size={17} />
          {isPortuguese ? 'Adicionar texto' : 'Add text'}{' '}
        </Button>
      </Heading>
      {continued && (
        <section className="continue-reading">
          <h2>{isPortuguese ? 'Continuar lendo' : 'Continue reading'}</h2>
          <button className="card continue-book" onClick={() => onOpen(continued)}>
            <span className="mini-book-cover">{continued.title}</span>
            <div>
              <h3>{continued.title}</h3>
              <span>
                {continued.topic} · {continued.level}
              </span>
              <progress
                value={progress(continued)}
                max={100}
                aria-label={isPortuguese ? 'Seções visitadas' : 'Reading sections visited'}
              />
              <strong>{progress(continued)} %</strong>
              <p>{isPortuguese ? 'Continuar · seção' : 'Continue · section'} {continued.paragraph + 1}</p>
            </div>
            <ArrowUpRight size={22} />
          </button>
        </section>
      )}
      <div className="library-tools">
        <label className="level-filter">
          <input
            type="checkbox"
            checked={levelOnly}
            onChange={(e) => setLevelOnly(e.target.checked)}
          />
          {isPortuguese ? 'Meu nível de estudo' : 'My study level'} · {currentLevel}
        </label>
        <div className="tabs">
          {['All', 'Travel', 'Finance', 'History', 'Technology', 'Work', 'Your material'].map(
            (t) => (
              <button key={t} className={t === topic ? 'active' : ''} onClick={() => setTopic(t)}>
                {isPortuguese ? ({ All: 'Todas', Travel: 'Viagens', Finance: 'Finanças', History: 'História', Technology: 'Tecnologia', Work: 'Trabalho', 'Your material': 'Seu material' } as Record<string,string>)[t] : t}
              </button>
            ),
          )}
        </div>
        <input
          className="search"
          aria-label={isPortuguese ? 'Buscar leituras' : 'Search readings'}
          placeholder={isPortuguese ? 'Encontre uma leitura…' : 'Find a reading…'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="library-grid">
        {docs.map((d, index) => (
          <button className="card document-card" key={d.id} onClick={() => onOpen(d)}>
            <div className={`document-art tone-${index % 4}`} aria-hidden="true">
              <span>
                {d.source === 'editorial' ? (isPortuguese ? 'PORTUGUÊS / LEITURAS' : 'ENGLISH OS / READINGS') : (isPortuguese ? 'COLEÇÃO PESSOAL' : 'PERSONAL COLLECTION')}
              </span>
              <strong className="book-cover-title">{d.title}</strong>
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
              <progress value={progress(d)} max={100} aria-label={isPortuguese ? 'Seções visitadas' : 'Reading sections visited'} />
              <p>{d.intro}</p>
              <span className="text-link">
                {d.updated_at ? (isPortuguese ? `Continuar · seção ${d.paragraph + 1}` : `Continue · section ${d.paragraph + 1}`) : (isPortuguese ? 'Abrir leitura' : 'Open reading')}
                <ArrowUpRight size={16} />
              </span>
            </div>
          </button>
        ))}
      </div>
      {!docs.length && (
        <Empty title={isPortuguese ? 'Ainda não há leituras aqui.' : 'No readings here yet.'} detail={isPortuguese ? 'Experimente outro tema ou adicione seu próprio material.' : 'Try another topic or add your own material.'} />
      )}
      {showImport && <ImportDialog refresh={refresh} close={() => setShowImport(false)} />}
    </>
  );
}
function ImportDialog({ refresh, close }: { refresh: () => Promise<void>; close: () => void }) {
  const [title, setTitle] = useState(''),
    [text, setText] = useState(''),
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
      form.set('text', text);
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
          <h2 id="import-title">{isPortuguese ? 'Adicionar um texto' : 'Add a text'}</h2>
          <button className="icon-button" aria-label={isPortuguese ? 'Fechar importação' : 'Close import'} onClick={close} disabled={busy}>
            <X size={20} />
          </button>
        </div>
        <p className="muted">
          {isPortuguese ? 'O texto é extraído e salvo na sua biblioteca pessoal. Ele não é enviado automaticamente a um serviço de IA.' : 'The text is extracted and saved in your personal library. It is not automatically sent to an AI service.'}
        </p>
        <form onSubmit={upload}>
          <label className="field">
            {isPortuguese ? 'Título' : 'Title'}{' '}
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={160}
              placeholder={isPortuguese ? 'Por exemplo: Um fim de semana em Salvador' : 'For example: A weekend in Edinburgh'}
            />
          </label>
          <label className="field">
            {isPortuguese ? 'Texto em português' : 'Text in English'}{' '}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              minLength={80}
              maxLength={100000}
              placeholder={isPortuguese ? 'Cole um artigo ou trecho aqui…' : 'Paste an article or passage here…'}
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={busy}>
            {busy ? (isPortuguese ? 'Lendo e salvando…' : 'Reading and saving…') : (isPortuguese ? 'Adicionar à biblioteca' : 'Add to my library')}
            <ArrowUpRight size={16} />
          </Button>
        </form>
        <p className="fine-print">
          {isPortuguese
            ? 'Textos pessoais são salvos sem um nível estimado. Para PDFs, use Meus arquivos.'
            : 'Personal texts are saved without an estimated level. For PDFs, use My files.'}
        </p>
      </section>
    </div>
  );
}
