'use client';
import { categoryFor, wordCategories, wordDetails, type WordCategory } from '@/lib/daily-words';
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
  const [collection, setCollection] = useState<'words' | 'sentences'>('words');
  const [category, setCategory] = useState<WordCategory>('All'),
    [search, setSearch] = useState('');
  const [revealed, setRevealed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const matches = (word: string, example: string, item: WordCategory) =>
    item === 'All' ||
    (item === 'Expressions' ? word.includes(' ') : categoryFor(word, example) === item);
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
          eyebrow="WORDS TO KEEP"
          title="Your vocabulary."
          description="Discovered in your readings. Reviewed when you need it."
        />
      )}
      {current ? (
        <section className={`review-card ${embedded ? '' : 'card'}`}>
          <div className="section-heading">
            <span className="eyebrow">
              <RefreshCw size={14} /> SPACED REVIEW{' '}
            </span>
            <span className="pill neutral">{due.length} due</span>
          </div>
          <p className="muted">
            Before looking: what does it mean? Think of a sentence where you would use it.
          </p>
          <div className="flash-word">
            <h2 lang="en">{current.word}</h2>
            <Speak text={current.word} />
          </div>
          {revealed ? (
            <>
              <p className="word-meaning">
                {current.meaning ||
                  'You have not added a meaning yet. Check the original reading for context.'}
              </p>
              <blockquote lang="en">{current.example}</blockquote>
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
      {!embedded && data.vocabulary.length > 0 && (
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
          {data.vocabulary
            .filter(
              (word) =>
                matches(word.word, word.example, category) &&
                `${word.word} ${word.meaning} ${word.example}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
            )
            .map((w) => (
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
                    {categoryFor(w.word, w.example)} ·{' '}
                    {w.word.includes(' ') ? 'Expression' : 'Word'}
                  </span>
                  <p>{w.meaning || 'Meaning not added yet'}</p>
                  <p className="word-example">
                    “
                    {w.example ||
                      wordDetails(w.word)?.example ||
                      'Add an example from your reading.'}
                    ”
                  </p>
                  {wordDetails(w.word)?.usage && wordDetails(w.word)!.usage !== w.example && (
                    <p className="fine-print">Try it today: {wordDetails(w.word)!.usage}</p>
                  )}
                  <span className="fine-print">
                    {w.reviews} reviews · Next: {dateLabel(w.due_at.slice(0, 10), true)}
                  </span>
                </div>
                <Speak text={collection === 'sentences' ? w.example || w.word : w.word} />
              </div>
            ))}
        </section>
      )}
    </>
  );
}
