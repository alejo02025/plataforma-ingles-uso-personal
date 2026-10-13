'use client';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookmarkPlus, Check, Bookmark, X } from 'lucide-react';
import type { Snapshot } from '@/lib/types';
import { wordsForDay } from '@/lib/daily-words';
import { api, Button, Speak } from './ui';
export function DailyWords({
  data,
  refresh,
  openVocabulary,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  openVocabulary: () => void;
}) {
  const [open, setOpen] = useState(false),
    [index, setIndex] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const entries = wordsForDay(data.day),
    entry = entries[index % entries.length],
    saved = data.vocabulary.some((word) => word.word.toLowerCase() === entry.word.toLowerCase());
  useEffect(() => {
    setOpen(localStorage.getItem('english-word-day') !== data.day);
  }, [data.day]);
  const close = () => {
    setOpen(false);
    localStorage.setItem('english-word-day', data.day);
  };
  return (
    <>
      <button className="daily-word-launcher" onClick={() => setOpen(true)}>
        <Bookmark size={17} />
        Word of the Day
      </button>
      {open && (
        <aside className="daily-word-popup" role="dialog" aria-label="Word of the Day">
          <div className="daily-word-top">
            <span>
              <Bookmark size={15} />A WORD WORTH KEEPING
            </span>
            <button className="icon-button" aria-label="Close daily word" onClick={close}>
              <X size={18} />
            </button>
          </div>
          <div className="daily-word-title">
            <h2>{entry.word}</h2>
            <Speak text={entry.word} />
          </div>
          <div className="daily-word-tags">
            <span>{entry.category}</span>
            <span>{entry.kind}</span>
          </div>
          <p className="daily-word-definition">{entry.meaning}</p>
          <span className="eyebrow">USE IT TODAY</span>
          <blockquote>“{entry.usage}”</blockquote>
          {entry.example !== entry.usage && (
            <p className="fine-print">Another example: {entry.example}</p>
          )}
          <Button
            disabled={busy || saved}
            onClick={async () => {
              setBusy(true);
              setError('');
              try {
                await api('word', {
                  word: entry.word,
                  meaning: entry.meaning,
                  pronunciation: entry.pronunciation,
                  example: entry.usage,
                });
                await refresh();
              } catch (error) {
                setError((error as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {saved ? <Check size={16} /> : <BookmarkPlus size={16} />}{' '}
            {saved ? 'Saved to vocabulary' : 'Save this word'}
          </Button>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="daily-word-bottom">
            <button
              className="icon-button"
              aria-label="Previous daily word"
              onClick={() => setIndex((index + entries.length - 1) % entries.length)}
            >
              <ArrowLeft size={16} />
            </button>
            <span>
              {index + 1} / {entries.length}
            </span>
            <button
              className="icon-button"
              aria-label="Next daily word"
              onClick={() => setIndex((index + 1) % entries.length)}
            >
              <ArrowRight size={16} />
            </button>
            <button
              className="text-link"
              onClick={() => {
                close();
                openVocabulary();
              }}
            >
              My vocabulary <ArrowRight size={13} />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
