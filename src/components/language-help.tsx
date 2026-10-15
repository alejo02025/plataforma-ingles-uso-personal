'use client';
import { StudyCopy } from './study-copy';
import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { isPortuguese } from '@/lib/workspace';
import { grammarReference } from '@/locales/learning/grammar-reference';
import { englishTenses, portugueseTenses } from '@/locales/learning/tense-reference';
import { VerbCatalog } from './verb-catalog';
import { lessons } from '@/lib/lessons';
import { Foundations } from './foundations';
import { Heading, Speak } from './ui';
export function LanguageHelp({ onOpenLesson }: { onOpenLesson?: (id: string) => void } = {}) {
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
    <div className="language-desk">
      <Heading
        eyebrow={isPortuguese ? 'ENTENDA E PRATIQUE' : 'LEARN THE PATTERN'}
        title={isPortuguese ? 'Como formar frases' : 'Build your own sentences'}
        description={isPortuguese ? 'Aprenda a estrutura e depois crie as suas frases.' : 'Understand the pattern, then make it your own.'}
      />
      <StudyCopy as="p" className="toolkit-note">
        Siempre disponible, sin requisitos de nivel.
      </StudyCopy>
      <div className="toolkit-tabs" role="group" aria-label="Language help sections">
        <button
          className={mode === 'sentences' ? 'active' : ''}
          onClick={() => setMode('sentences')}
        >
          <span>01</span> {isPortuguese ? 'Formar frases' : 'Build sentences'}
        </button>
        <button className={mode === 'tenses' ? 'active' : ''} onClick={() => setMode('tenses')}>
          <span>02</span> {isPortuguese ? 'Todos os tempos' : 'All tenses'}
        </button>
        <button className={mode === 'verbs' ? 'active' : ''} onClick={() => setMode('verbs')}>
          <span>03</span> {isPortuguese ? 'Verbos' : 'Verbs'}
        </button>
      </div>
      {mode === 'tenses' ? (
        <section className="tense-reference">
          <div className="toolkit-intro">
            <h2>{isPortuguese ? 'Um mapa de todos os tempos' : 'A map of all tenses'}</h2>
            <StudyCopy as="p">
              Elegí un grupo y abrí un ejemplo. Vas a ver cuándo usarlo y cómo afirmar, negar o
              preguntar.
            </StudyCopy>
          </div>
          {Array.from(
            new Set((isPortuguese ? portugueseTenses : englishTenses).map((t) => t.group)),
          ).map((group, index) => (
            <details className="tense-group" key={group} open={index === 0}>
              <summary>{group}</summary>
              {(isPortuguese ? portugueseTenses : englishTenses)
                .filter((t) => t.group === group)
                .map((t) => (
                  <details className="tense-card card" key={t.name}>
                    <summary>
                      <strong>{t.name}</strong>
                      <StudyCopy as="span">{t.use}</StudyCopy>
                    </summary>
                    <div className="tense-body">
                      <code className="lesson-pattern">{t.pattern}</code>
                      {t.examples.map((text, i) => (
                        <div className="tense-example" key={text}>
                          <StudyCopy as="span">
                            {['Afirmación / modelo', 'Negativa', 'Pregunta'][i]}
                          </StudyCopy>
                          <div className="lesson-example">
                            <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>{text}</blockquote>
                            <Speak text={text} />
                          </div>
                          {i === 0 && <p lang="es">{t.translation}</p>}
                        </div>
                      ))}
                      <StudyCopy as="p" className="tense-tip">
                        {t.tip}
                      </StudyCopy>
                    </div>
                  </details>
                ))}
            </details>
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
              <StudyCopy as="p">
                {isPortuguese ? entry.explanationPT : entry.explanationEN}
              </StudyCopy>
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
          <StudyCopy as="p">
            Estas explicaciones de A1 a C2 son de consulta libre. Los ejemplos y las notas no son
            una evaluación y no completan clases.
          </StudyCopy>
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
              <StudyCopy as="p">{l.explanation}</StudyCopy>
              <code className="lesson-pattern">{l.pattern}</code>
              {l.examples.map((model) => (
                <div className="lesson-example" key={model}>
                  <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>{model}</blockquote>
                  <Speak text={model} />
                </div>
              ))}
              <StudyCopy as="p">{l.tip}</StudyCopy>
            </details>
          ))}
          {!notes.length && (
            <StudyCopy as="p">
              No hay notas con ese texto. Probá otra palabra o cambiá el nivel de consulta.
            </StudyCopy>
          )}
        </section>
      ) : (
        <div className="sentence-toolkit">
          <div className="sentence-shape toolkit-guide">
            <h2>{isPortuguese ? 'Comece por aqui' : 'Start here'}</h2>
            <ol>
              <StudyCopy as="li">
                <strong>Elegí cuándo.</strong> Presente para una rutina; pasado para algo que
                terminó; futuro para un plan.
              </StudyCopy>
              <StudyCopy as="li">
                <strong>Elegí la acción y quién la hace.</strong> Buscá un verbo y seleccioná la
                persona.
              </StudyCopy>
              <StudyCopy as="li">
                <strong>Mirá tu oración.</strong> Cambiala a negativa o pregunta y compará.
              </StudyCopy>
            </ol>
            <StudyCopy as="p" className="guide-formula">
              Sujeto + verbo + complemento.
            </StudyCopy>
          </div>
          <Foundations
            mode="sentences"
            referenceOnly
            allowLessonLink={!!onOpenLesson}
            onOpenLesson={onOpenLesson || (() => {})}
          />
        </div>
      )}
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
    </div>
  );
}
