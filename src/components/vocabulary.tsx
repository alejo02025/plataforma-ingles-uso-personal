'use client';
import { recallBand } from '@/lib/games';
import { categoryFor, wordCategories, wordDetails, type WordCategory } from '@/lib/daily-words';
import { useState, useEffect } from 'react';
import { isPortuguese } from '@/lib/workspace';
import { StudyCopy } from './study-copy';
import { Bookmark, RefreshCw, Check } from 'lucide-react';
import type { Snapshot, Word } from '@/lib/types';
import { dailyWordSpanish } from '@/locales/es/daily-word-meanings';
import { Button, Heading, Empty, Speak, api, dateLabel } from './ui';
function WordMeaning({ item }: { item: Word }) {
  const spanishNote = item.meaning.startsWith('ES:') ? item.meaning.slice(3).trim() : '';
  const primary = spanishNote ? wordDetails(item.word)?.meaning : item.meaning;
  const support = spanishNote || dailyWordSpanish[item.word.toLowerCase()];
  return (
    <>
      <p className="word-meaning" lang={isPortuguese ? 'pt-BR' : 'en'}>
        {primary ||
          (isPortuguese
            ? 'Ainda não há uma definição revisada. Confira a palavra no contexto.'
            : 'No reviewed definition yet. Check the word in context.')}
      </p>
      {support && (
        <p className="study-spanish" lang="es">
          {support}
        </p>
      )}
    </>
  );
}
export function Vocabulary({
  data,
  refresh,
  embedded = false,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  embedded?: boolean;
}) {
  const [strength, setStrength] = useState('all');
  const [collection, setCollection] = useState<'words' | 'sentences'>('words');
  const [category, setCategory] = useState<WordCategory>('All'),
    [search, setSearch] = useState('');
  const [recall, setRecall] = useState('');
  const [revealed, setRevealed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const matches = (word: string, example: string, item: WordCategory) =>
    item === 'All' ||
    (item === 'Expressions' ? word.includes(' ') : categoryFor(word, example) === item);
  const due = data.vocabulary.filter((w) => w.due_at <= new Date().toISOString());
  const current = due[0];
  useEffect(() => {
    setRevealed(false);
    setRecall('');
  }, [current?.id]);
  const visibleWords = data.vocabulary.filter(
    (word) =>
      (strength === 'all' || recallBand(word, data.reviews) === strength) &&
      matches(word.word, word.example, category) &&
      `${word.word} ${word.meaning} ${word.example}`.toLowerCase().includes(search.toLowerCase()),
  );
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
          eyebrow="WORDS TO KEEP"
          title="Your vocabulary."
          description="Discovered in your readings. Reviewed when you need it."
        />
      )}
      {!embedded && (
        <section className="recall-overview" aria-label="Your recall collection">
          <div className="section-heading">
            <h2>A word at a time.</h2>
            <button className="text-link" onClick={() => setStrength('all')}>
              Show all words
            </button>
          </div>
          <div className="recall-grid">
            {[
              { id: 'weak', title: 'Needs practice', note: 'New or missed last time' },
              { id: 'growing', title: 'Getting familiar', note: 'Remembered recently' },
              {
                id: 'strong',
                title: 'Remembered consistently',
                note: 'Three recent successful reviews',
              },
            ].map((item) => (
              <button
                className={`recall-card recall-${item.id} ${strength === item.id ? 'selected' : ''}`}
                aria-pressed={strength === item.id}
                key={item.id}
                onClick={() => setStrength(strength === item.id ? 'all' : item.id)}
              >
                <strong>
                  {data.vocabulary.filter((w) => recallBand(w, data.reviews) === item.id).length}
                </strong>
                <span>{item.title}</span>
                <small>{item.note}</small>
              </button>
            ))}
          </div>
          <p className="fine-print">
            Based on your own recall ratings, not a certified measure of mastery.
          </p>
        </section>
      )}
      {current ? (
        <section className={`review-card ${embedded ? '' : 'card'}`}>
          <div className="section-heading">
            <span className="eyebrow">
              <RefreshCw size={14} /> SPACED REVIEW{' '}
            </span>
            <span className="pill neutral">{due.length} due</span>
          </div>
          <StudyCopy
            native={
              isPortuguese
                ? 'Antes de revelar: lembre o significado e imagine uma situação em que usaria a palavra.'
                : 'Before revealing: recall the meaning and imagine a situation where you would use the word.'
            }
          >
            Antes de revelar: recordá el significado e imaginá una situación en la que usarías la
            palabra.
          </StudyCopy>
          <div className="flash-word">
            <h2 lang="en">{current.word}</h2>
            <Speak text={current.word} />
          </div>
          {!revealed && (
            <label className="field vocabulary-recall-input">
              {isPortuguese ? 'Sua tentativa (opcional)' : 'Your attempt (optional)'}
              <span className="study-spanish" lang="es">
                Tu intento (opcional). No se califica automáticamente.
              </span>
              <input
                value={recall}
                maxLength={500}
                onChange={(event) => setRecall(event.target.value)}
                placeholder={
                  isPortuguese
                    ? 'Uma ideia, um significado ou uma frase…'
                    : 'An idea, a meaning or a sentence…'
                }
              />
            </label>
          )}
          {revealed ? (
            <>
              {recall && (
                <p className="vocabulary-own-attempt">
                  <strong>{isPortuguese ? 'Sua tentativa: ' : 'Your attempt: '}</strong>
                  {recall}
                </p>
              )}
              <WordMeaning item={current} />
              <span className="vocabulary-pronunciation">
                {current.pronunciation || wordDetails(current.word)?.pronunciation || ''}
              </span>
              <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>{current.example}</blockquote>
              <div className="button-row">
                <Button secondary disabled={busy} onClick={() => review(false)}>
                  I need to see it again{' '}
                </Button>
                <Button disabled={busy} onClick={() => review(true)}>
                  I remembered it <Check size={16} />
                </Button>
              </div>
              <p className="fine-print">
                This is your own recall rating, not an objective measure of mastery.{' '}
              </p>
            </>
          ) : (
            <Button onClick={() => setRevealed(true)}>Show meaning</Button>
          )}
        </section>
      ) : (
        <Empty
          title={
            data.vocabulary.length ? 'You’re up to date.' : 'Your collection starts with one word.'
          }
          detail={
            data.vocabulary.length
              ? 'Your next words will appear when they are due for review.'
              : 'Save words or expressions from a reading or Word of the Day. Reviews are scheduled automatically.'
          }
        />
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {data.vocabulary.length > 0 && (
        <section className="card word-library">
          <div className="section-heading">
            <h2>All your words</h2>
            <span className="muted">{data.vocabulary.length} entries</span>
          </div>
          <div className="tabs vocabulary-collection-tabs">
            <button
              className={collection === 'words' ? 'active' : ''}
              onClick={() => setCollection('words')}
            >
              Words & expressions
            </button>
            <button
              className={collection === 'sentences' ? 'active' : ''}
              onClick={() => setCollection('sentences')}
            >
              Everyday sentences
            </button>
          </div>
          <div className="vocabulary-tools">
            <div className="tabs">
              {wordCategories.map((item) => (
                <button
                  key={item}
                  className={category === item ? 'active' : ''}
                  onClick={() => setCategory(item)}
                >
                  {item}{' '}
                  <span>
                    {item === 'All'
                      ? data.vocabulary.length
                      : data.vocabulary.filter((word) => matches(word.word, word.example, item))
                          .length}
                  </span>
                </button>
              ))}
            </div>
            <input
              className="search"
              aria-label="Search saved words"
              placeholder="Find a word or expression…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          {visibleWords.map((w) => (
            <div className="word-row" key={w.id}>
              <span className="activity-icon vocabulary">
                <Bookmark size={17} />
              </span>
              <div>
                <h3 lang="en">
                  {collection === 'words'
                    ? w.word
                    : w.example || wordDetails(w.word)?.example || w.word}
                </h3>
                <span className="word-category">
                  {collection === 'sentences' ? `${w.word} · ` : ''}
                  {categoryFor(w.word, w.example)} · {w.word.includes(' ') ? 'Expression' : 'Word'}
                </span>
                <p>{w.meaning || 'Meaning not added yet'}</p>
                {(w.pronunciation || wordDetails(w.word)?.pronunciation) && (
                  <span className="vocabulary-pronunciation">
                    {w.pronunciation || wordDetails(w.word)?.pronunciation}
                  </span>
                )}
                <p className="word-example">
                  “
                  {w.example || wordDetails(w.word)?.example || 'Add an example from your reading.'}
                  ”
                </p>
                {wordDetails(w.word)?.usage && wordDetails(w.word)!.usage !== w.example && (
                  <p className="fine-print">Try it today: {wordDetails(w.word)!.usage}</p>
                )}
                <span className="fine-print">
                  <span
                    className={`vocabulary-review-status ${w.due_at <= new Date().toISOString() ? 'due' : ''}`}
                  >
                    {w.due_at <= new Date().toISOString()
                      ? isPortuguese
                        ? 'Revisão pendente'
                        : 'Review due'
                      : isPortuguese
                        ? 'Agendada'
                        : 'Scheduled'}
                  </span>
                  {' · '}
                  {w.reviews} reviews · Next: {dateLabel(w.due_at.slice(0, 10), true)}
                </span>
              </div>
              <Speak text={collection === 'sentences' ? w.example || w.word : w.word} />
            </div>
          ))}
          {!visibleWords.length && (
            <Empty
              title={isPortuguese ? 'Nenhuma palavra encontrada.' : 'No matching words.'}
              detail={
                isPortuguese
                  ? 'Tente outra busca ou mostre todas as categorias.'
                  : 'Try another search or show all categories.'
              }
            />
          )}
        </section>
      )}
    </>
  );
}
