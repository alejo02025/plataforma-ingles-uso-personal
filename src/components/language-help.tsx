'use client';
import { useState } from 'react';
import { BookOpen, Lightbulb } from 'lucide-react';
import { isPortuguese } from '@/lib/workspace';
import { grammarReference } from '@/locales/learning/grammar-reference';
import { englishTenses, portugueseTenses } from '@/locales/learning/tense-reference';
import { VerbCatalog } from './verb-catalog';
import { lessons } from '@/lib/lessons';
import { Foundations } from './foundations';
import { Heading, Speak } from './ui';
export function LanguageHelp() {
  const [mode, setMode] = useState<'verbs' | 'sentences' | 'reference' | 'notes' | 'tenses'>(
    'sentences',
  );
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
        description="Sentences, tenses, verbs. Everything you need, always unlocked."
      />
      <p className="toolkit-note" lang="es">
        <Lightbulb size={18} /> Ayuda disponible desde el primer día, sin requisitos de nivel.
        Consultarla no modifica tu progreso.
      </p>
      <div className="toolkit-tabs" role="group" aria-label="Language help sections">
        <button
          className={mode === 'sentences' ? 'active' : ''}
          onClick={() => setMode('sentences')}
        >
          <span>01</span>
          {isPortuguese ? 'Formar frases' : 'Build sentences'}
        </button>
        <button className={mode === 'tenses' ? 'active' : ''} onClick={() => setMode('tenses')}>
          <span>02</span>
          {isPortuguese ? 'Todos os tempos' : 'All tenses'}
        </button>
        <button className={mode === 'verbs' ? 'active' : ''} onClick={() => setMode('verbs')}>
          <span>03</span>Verbs
        </button>
      </div>
      <details className="toolkit-extra">
        <summary>{isPortuguese ? 'Mais explicações' : 'More explanations'}</summary>
        <div className="tabs">
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
      </details>
      {mode === 'tenses' ? (
        <section className="tense-reference">
          <div className="toolkit-intro">
            <h2>{isPortuguese ? 'Um mapa de todos os tempos' : 'A map of all tenses'}</h2>
            <p lang="es">
              Abrí el tiempo que necesitás. Primero mirá para qué sirve, después compará afirmación,
              negativa y pregunta. Las formas no personales, los modos y las perífrasis también
              están incluidos, pero no son todos tiempos distintos.
            </p>
          </div>
          {Array.from(
            new Set((isPortuguese ? portugueseTenses : englishTenses).map((t) => t.group)),
          ).map((group) => (
            <section className="tense-group" key={group}>
              <h3>{group}</h3>
              {(isPortuguese ? portugueseTenses : englishTenses)
                .filter((t) => t.group === group)
                .map((t) => (
                  <details className="tense-card card" key={t.name}>
                    <summary>
                      <strong>{t.name}</strong>
                      <span lang="es">{t.use}</span>
                    </summary>
                    <div className="tense-body">
                      <code className="lesson-pattern">{t.pattern}</code>
                      {t.examples.map((text, i) => (
                        <div className="tense-example" key={text}>
                          <span lang="es">
                            {['Afirmación / modelo', 'Negativa', 'Pregunta'][i]}
                          </span>
                          <div className="lesson-example">
                            <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>{text}</blockquote>
                            <Speak text={text} />
                          </div>
                          {i === 0 && <p lang="es">{t.translation}</p>}
                        </div>
                      ))}
                      <p className="tense-tip" lang="es">
                        {t.tip}
                      </p>
                    </div>
                  </details>
                ))}
            </section>
          ))}
        </section>
      ) : mode === 'verbs' ? (
        <VerbCatalog />
      ) : mode === 'reference' ? (
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
        <div className="sentence-toolkit">
          <div className="sentence-shape card">
            <h2>{isPortuguese ? 'Como formar uma frase' : 'How to form a sentence'}</h2>
            <div className="sentence-pieces">
              <span>Sujeto</span>
              <b>+</b>
              <span>Verbo</span>
              <b>+</b>
              <span>Complemento</span>
            </div>
            <p lang="es">
              ¿Quién? + ¿Qué hace? + ¿Qué, dónde o cuándo? Primero armá una afirmación; después
              elegí negativa o pregunta en el modelo de abajo.
            </p>
            <p className="sentence-example">
              {isPortuguese ? 'Eu estudo português todos os dias.' : 'I study English every day.'}
            </p>
            <p lang="es">Estudio {isPortuguese ? 'portugués' : 'inglés'} todos los días.</p>
          </div>
          <Foundations mode="sentences" referenceOnly onOpenLesson={() => {}} />
        </div>
      )}
    </>
  );
}
