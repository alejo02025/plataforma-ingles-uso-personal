'use client';
import { useState } from 'react';
import { BookOpen, Lightbulb } from 'lucide-react';
import { isPortuguese } from '@/lib/workspace';
import { grammarReference } from '@/locales/learning/grammar-reference';
import { lessons } from '@/lib/lessons';
import { Foundations } from './foundations';
import { Heading, Speak } from './ui';
export function LanguageHelp() {
  const [mode, setMode] = useState<'verbs' | 'sentences' | 'reference' | 'notes'>('verbs');
  const [band, setBand] = useState('A1');
  const [query, setQuery] = useState('');
  const notes = lessons.filter(
    (l) =>
      l.level === band && `${l.title} ${l.explanation}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Heading
        eyebrow="ALWAYS HERE TO HELP"
        title="Your language toolkit."
        description="Verbs, sentence patterns and clear explanations. Open whenever you need a hand."
      />
      <p className="toolkit-note" lang="es">
        <Lightbulb size={18} /> Todas las ayudas están disponibles desde el primer día, sin
        requisitos de nivel. Consultarlas no modifica tus notas ni desbloquea clases. Tocá una
        palabra para ver su ayuda en español.
      </p>
      <div className="tabs foundation-tabs" role="group" aria-label="Language help sections">
        <button className={mode === 'verbs' ? 'active' : ''} onClick={() => setMode('verbs')}>
          Verbs
        </button>
        <button
          className={mode === 'sentences' ? 'active' : ''}
          onClick={() => setMode('sentences')}
        >
          Sentences
        </button>
        <button
          className={mode === 'reference' ? 'active' : ''}
          onClick={() => setMode('reference')}
        >
          Quick reference
        </button>
        <button className={mode === 'notes' ? 'active' : ''} onClick={() => setMode('notes')}>
          Study notes
        </button>
      </div>
      {mode === 'reference' ? (
        <section className="card grammar-reference">
          {grammarReference.map((entry, index) => (
            <details key={entry.en} className="grammar-reference-entry">
              <summary>
                <span className="guide-number">{String(index + 1).padStart(2, '0')}</span>
                <BookOpen size={18} />
                {isPortuguese ? entry.pt : entry.en}
              </summary>
              <p lang="es">{isPortuguese ? entry.explanationPT : entry.explanationEN}</p>
              {(isPortuguese ? entry.modelPT : entry.modelEN).map((model) => (
                <div className="lesson-example" key={model}>
                  <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>{model}</blockquote>
                  <Speak text={model} />
                </div>
              ))}
            </details>
          ))}
        </section>
      ) : mode === 'notes' ? (
        <section className="card grammar-reference study-notes">
          <p lang="es">
            Estas explicaciones de A1 a C2 son de consulta libre. Los ejemplos y las notas no son
            una evaluación y no completan clases.
          </p>
          <div className="foundation-selectors">
            <label className="field">
              Reference level
              <select
                aria-label="Reference level"
                value={band}
                onChange={(e) => setBand(e.target.value)}
              >
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Search help
              <input
                aria-label="Search help"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          {notes.map((l) => (
            <details className="grammar-reference-entry" key={l.id}>
              <summary>
                {l.level} · {l.title}
              </summary>
              <p>{l.goal}</p>
              <p lang="es">{l.explanation}</p>
              <code className="lesson-pattern">{l.pattern}</code>
              {l.examples.map((model) => (
                <div className="lesson-example" key={model}>
                  <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>{model}</blockquote>
                  <Speak text={model} />
                </div>
              ))}
              <p lang="es">{l.tip}</p>
            </details>
          ))}
          {!notes.length && (
            <p lang="es">
              No hay notas con ese texto. Probá otra palabra o cambiá el nivel de consulta.
            </p>
          )}
        </section>
      ) : (
        <Foundations mode={mode} referenceOnly onOpenLesson={() => {}} />
      )}
    </>
  );
}
