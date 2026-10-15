'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Languages, X, Search, MousePointer2, BookmarkPlus, Check, Copy } from 'lucide-react';
import type { Snapshot } from '@/lib/types';
import { findWordHelp, reviewedHelp, cleanWord, type WordHelp } from '@/lib/word-help';
import { api, Button, Speak } from './ui';

type Lookup = { word: string; context: string; sourceId?: string; x?: number; y?: number };
function atPoint(x: number, y: number) {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const position = doc.caretPositionFromPoint?.(x, y),
    fallback = !position ? doc.caretRangeFromPoint?.(x, y) : null;
  const node = position?.offsetNode || fallback?.startContainer,
    offset = position?.offset ?? fallback?.startOffset;
  if (!node || node.nodeType !== Node.TEXT_NODE || offset === undefined) return;
  const text = node.textContent || '',
    letter = (c: string | undefined) => Boolean(c && /[\p{L}’'-]/u.test(c));
  let start = offset,
    end = offset;
  while (start > 0 && letter(text[start - 1])) start--;
  while (end < text.length && letter(text[end])) end++;
  if (start === end) return;
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  const rect = range.getBoundingClientRect();
  if (x < rect.left - 3 || x > rect.right + 3 || y < rect.top || y > rect.bottom) return;
  return { word: text.slice(start, end), node };
}
export function WordHelpCloud({
  data,
  refresh,
  showLauncher = true,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  showLauncher?: boolean;
}) {
  const [lookup, setLookup] = useState<Lookup | null>(null),
    [entry, setEntry] = useState<WordHelp>(),
    [armed, setArmed] = useState(false),
    [query, setQuery] = useState(''),
    [loading, setLoading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [note, setNote] = useState('');
  const request = useRef(0),
    armedRef = useRef(false),
    lastFocus = useRef<HTMLElement | null>(null),
    button = useRef<HTMLButtonElement>(null),
    queryInput = useRef<HTMLInputElement>(null),
    latestData = useRef(data);
  latestData.current = data;
  armedRef.current = armed;
  const saved = Boolean(entry && data.vocabulary.some((w) => cleanWord(w.word) === entry.word));
  function close() {
    request.current++;
    setLookup(null);
    setArmed(false);
    lastFocus.current?.focus();
  }
  async function open(value: Lookup) {
    const word = cleanWord(value.word);
    if (!word || word.length > 70) return;
    const current = ++request.current;
    lastFocus.current = document.activeElement as HTMLElement;
    setArmed(false);
    setLookup({ ...value, word });
    setQuery(word);
    setError('');
    setNote('');
    setEntry(reviewedHelp(word, value.context));
    setLoading(true);
    window.dispatchEvent(new Event('study-word-looked-up'));
    const result = await findWordHelp(word, value.context);
    if (request.current !== current) return;
    const personal = latestData.current.vocabulary.find(
      (w) => cleanWord(w.word) === word && w.meaning.startsWith('ES: '),
    );
    setEntry(
      personal && result.source === 'missing'
        ? {
            ...result,
            translation: personal.meaning.slice(4),
            source: 'personal',
            explanation:
              'Esta es la nota en español que guardaste. Revisala si cambia el contexto.',
            example: personal.example || result.example,
            usage: 'Podés revisar esta palabra en tu vocabulario.',
          }
        : result,
    );
    setLoading(false);
  }
  useEffect(() => {
    let selectionTimer: ReturnType<typeof setTimeout> | undefined;
    const click = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest('.word-cloud,.word-help-toggle,.word-inspect-notice')) return;
      if (target.closest('.topbar,.sidebar,.mobile-bottom-nav')) {
        setLookup(null);
        setArmed(false);
        request.current++;
        return;
      }
      if (
        !target.closest('#main-content') ||
        target.closest(
          '[lang="es"],input,textarea,select,[contenteditable="true"],a,[data-no-word-help]',
        )
      )
        return;
      if (
        document.querySelector(
          '[role="dialog"]:not(.word-cloud):not(.daily-word-popup):not(.routine-session)',
        )
      )
        return;
      const interactive = target.closest('button,label,summary,[role="button"],[role="tab"]');
      // Exercise controls keep their action; native prose remains available for word help.
      if (interactive && target.closest('.routine-session')) return;
      if (interactive && !armedRef.current) {
        setLookup(null);
        request.current++;
        return;
      }
      const hit = atPoint(event.clientX, event.clientY);
      if (!hit || (!target.contains(hit.node) && !hit.node.parentElement?.contains(target))) return;
      if (interactive) {
        event.preventDefault();
        event.stopPropagation();
      }
      const block =
        hit.node.parentElement?.closest(
          'p,blockquote,legend,label,h1,h2,h3,li,code,.studio-passage,.voice-message',
        ) || hit.node.parentElement;
      const sourceId =
        hit.node.parentElement?.closest('[data-source-id]')?.getAttribute('data-source-id') ||
        undefined;
      void open({
        word: hit.word,
        context: (block?.textContent || '').trim().slice(0, 1500),
        sourceId,
        x: event.clientX,
        y: event.clientY,
      });
    };
    const selection = () => {
      if (document.activeElement?.matches('input,textarea,select,[contenteditable="true"]')) return;
      clearTimeout(selectionTimer);
      selectionTimer = setTimeout(() => {
        const selected = window.getSelection(),
          value = selected?.toString().trim();
        const parent = selected?.anchorNode?.parentElement;
        if (
          !value ||
          value.length > 70 ||
          !parent?.closest('#main-content') ||
          parent.closest('[lang="es"],.word-cloud,input,textarea') ||
          !/[\p{L}]/u.test(value)
        )
          return;
        const sourceId =
          parent.closest('[data-source-id]')?.getAttribute('data-source-id') || undefined;
        void open({
          word: value,
          context: (parent.closest('p,blockquote,.studio-passage')?.textContent || value).slice(
            0,
            1500,
          ),
          sourceId,
        });
      }, 180);
    };
    const requested = (event: Event) => {
      const detail = (event as CustomEvent<Lookup>).detail;
      if (detail) void open(detail);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (document.querySelector('.word-cloud') || armedRef.current)) {
        close();
      }
    };
    document.addEventListener('click', click, true);
    document.addEventListener('mouseup', selection);
    document.addEventListener('keyup', selection);
    document.addEventListener('keydown', escape);
    window.addEventListener('study-word-help', requested);
    return () => {
      clearTimeout(selectionTimer);
      document.removeEventListener('click', click, true);
      document.removeEventListener('mouseup', selection);
      document.removeEventListener('keyup', selection);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('study-word-help', requested);
    };
  }, []);
  useEffect(() => {
    if (lookup && lookup.word === '') queryInput.current?.focus();
  }, [lookup]);
  const style =
    lookup?.x !== undefined && window.innerWidth > 640
      ? (() => {
          const top = Math.max(16, Math.min((lookup.y || 80) + 16, window.innerHeight - 450));
          return {
            left: Math.max(16, Math.min(lookup.x!, window.innerWidth - 400)),
            right: 'auto',
            bottom: 'auto',
            top,
            maxHeight: Math.max(140, window.innerHeight - top - 20),
          };
        })()
      : undefined;
  return (
    <>
      <button
        hidden={!showLauncher}
        className={`icon-button word-help-toggle ${armed ? 'active' : ''}`}
        ref={button}
        aria-label="Word help"
        title="Word help"
        onClick={() => {
          lastFocus.current = button.current;
          setLookup({ word: '', context: '' });
          setQuery('');
          setEntry(undefined);
          setError('');
          setLoading(false);
        }}
      >
        <Languages size={19} />
      </button>
      {armed &&
        createPortal(
          <div className="word-inspect-notice" role="status">
            <span>Tap a word to look it up. This tap will not choose an answer.</span>
            <button
              className="icon-button"
              aria-label="Cancel word lookup"
              onClick={() => setArmed(false)}
            >
              <X size={17} />
            </button>
          </div>,
          document.body,
        )}
      {lookup &&
        createPortal(
          <aside className="word-cloud" role="dialog" aria-label="Word help" style={style}>
            <div className="section-heading">
              <span className="eyebrow">A WORD, MADE CLEAR</span>
              <button className="icon-button" aria-label="Close word help" onClick={close}>
                <X size={18} />
              </button>
            </div>
            <form
              className="word-cloud-search"
              onSubmit={(event) => {
                event.preventDefault();
                void open({ ...lookup, word: query });
              }}
            >
              <input
                ref={queryInput}
                aria-label="Word or expression"
                value={query}
                maxLength={70}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Word or expression"
              />
              <button className="icon-button" type="submit" aria-label="Look up this word">
                <Search size={18} />
              </button>
            </form>
            {entry && (
              <>
                <div className="section-heading">
                  <h2>{entry.word}</h2>
                  <Speak text={entry.word} />
                </div>
                <div lang="es" className="word-cloud-meaning">
                  <strong>{entry.translation}</strong>
                  <p>{entry.explanation}</p>
                  {entry.source === 'indirect' && (
                    <span className="word-cloud-warning">
                      Sugerencia indirecta · revisá el contexto
                    </span>
                  )}
                </div>
                <span className="eyebrow">USE IT IN A SENTENCE</span>
                <blockquote>{entry.example}</blockquote>
                <Speak text={entry.example} />
                <p lang="es" className="word-cloud-usage">
                  {entry.usage}
                </p>
                {entry.source === 'missing' && (
                  <label className="field">
                    <span>Add a Spanish meaning</span>
                    <input
                      aria-label="Personal Spanish meaning"
                      value={note}
                      maxLength={1000}
                      onChange={(event) => setNote(event.target.value)}
                    />
                  </label>
                )}
                <Button
                  disabled={
                    busy || loading || saved || (entry.source === 'missing' && !note.trim())
                  }
                  onClick={async () => {
                    setBusy(true);
                    setError('');
                    try {
                      await api('word', {
                        word: entry.word,
                        sourceId: lookup.sourceId,
                        meaning: 'ES: ' + (note.trim() || entry.translation),
                        example: entry.example,
                      });
                      await refresh();
                      if (note.trim())
                        setEntry({
                          ...entry,
                          translation: note.trim(),
                          explanation:
                            'Tu nota en español quedó guardada. Revisala según el contexto.',
                          source: 'personal',
                        });
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {saved ? <Check size={16} /> : <BookmarkPlus size={16} />}{' '}
                  {saved ? 'Saved to vocabulary' : 'Save to vocabulary'}
                </Button>
                <button
                  className="text-link word-cloud-copy"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `Explicame en español la palabra o expresión «${entry.word}» en ${document.documentElement.lang === 'pt-BR' ? 'portugués de Brasil' : 'inglés'}. Traducila según este contexto, explicá su uso y dame dos ejemplos cotidianos:\n${lookup.context || entry.example}`,
                      );
                      setError('Question copied. Paste it in this chat.');
                    } catch {
                      setError('Could not copy. Select the word and context manually.');
                    }
                  }}
                >
                  <Copy size={14} />
                  Copy a question for this chat
                </button>
              </>
            )}
            {loading && <p role="status">Looking up the word…</p>}
            {error && (
              <p role="status" className="fine-print">
                {error}
              </p>
            )}
            <button
              className="text-link word-cloud-pick"
              onClick={() => {
                setLookup(null);
                request.current++;
                setArmed(true);
              }}
            >
              <MousePointer2 size={16} />
              Pick a word from the page
            </button>
          </aside>,
          document.body,
        )}
    </>
  );
}
