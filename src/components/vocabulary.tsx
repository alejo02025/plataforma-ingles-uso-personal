'use client';
import { useState } from 'react';
import { Bookmark, RefreshCw, Check } from 'lucide-react';
import type { Snapshot } from '@/lib/types';
import { Button, Heading, Empty, Speak, api, dateLabel } from './ui';
export function Vocabulary({
  data,
  refresh,
  embedded = false,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  embedded?: boolean;
}) {
  const [revealed, setRevealed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const due = data.vocabulary.filter((w) => w.due_at <= new Date().toISOString());
  const current = due[0];
  async function review(known: boolean) {
    setBusy(true);
    setError('');
    try {
      await api('review', { id: current.id, known });
      setRevealed(false);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {!embedded && (
        <Heading
          eyebrow="PALABRAS QUE SE QUEDAN"
          title="Tu vocabulario."
          description="Descubierto en tus lecturas. Recuperado a su debido tiempo."
        />
      )}
      {current ? (
        <section className={`review-card ${embedded ? '' : 'card'}`}>
          <div className="section-heading">
            <span className="eyebrow">
              <RefreshCw size={14} /> REPASO ESPACIADO
            </span>
            <span className="pill neutral">{due.length} pendientes</span>
          </div>
          <p className="muted">Antes de mirar: ¿qué significa? Pensá una frase donde la usarías.</p>
          <div className="flash-word">
            <h2 lang="en">{current.word}</h2>
            <Speak text={current.word} />
          </div>
          {revealed ? (
            <>
              <p className="word-meaning">
                {current.meaning ||
                  'Todavía no agregaste un significado. Podés consultarlo desde la lectura original.'}
              </p>
              <blockquote lang="en">{current.example}</blockquote>
              <div className="button-row">
                <Button secondary disabled={busy} onClick={() => review(false)}>
                  Necesito volver a verla
                </Button>
                <Button disabled={busy} onClick={() => review(true)}>
                  La recordé
                  <Check size={16} />
                </Button>
              </div>
              <p className="fine-print">
                Tu valoración es autorreportada. No es una medición objetiva de dominio.
              </p>
            </>
          ) : (
            <Button onClick={() => setRevealed(true)}>Mostrar significado</Button>
          )}
        </section>
      ) : (
        <Empty
          title={
            data.vocabulary.length ? 'Estás al día.' : 'Tu biblioteca empieza con una palabra.'
          }
          detail={
            data.vocabulary.length
              ? 'Las próximas palabras aparecerán según su fecha de repaso.'
              : 'Guardá palabras o expresiones desde una lectura. Sus repasos se preparan automáticamente.'
          }
        />
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {!embedded && data.vocabulary.length > 0 && (
        <section className="card word-library">
          <div className="section-heading">
            <h2>Todas tus palabras</h2>
            <span className="muted">{data.vocabulary.length} entradas</span>
          </div>
          {data.vocabulary.map((w) => (
            <div className="word-row" key={w.id}>
              <span className="activity-icon vocabulary">
                <Bookmark size={17} />
              </span>
              <div>
                <h3 lang="en">{w.word}</h3>
                <p>{w.meaning || 'Significado pendiente'}</p>
                <span className="fine-print">
                  {w.reviews} repasos · Próximo: {dateLabel(w.due_at.slice(0, 10), true)}
                </span>
              </div>
              <Speak text={w.word} />
            </div>
          ))}
        </section>
      )}
    </>
  );
}
