'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { RotateCcw, Undo2 } from 'lucide-react';
import { isPortuguese } from '@/lib/workspace';

/** Shared interaction shell. Parents own first answers, drafts, assessment and persistence. */
export function ExerciseFrame({
  prompt,
  spanish,
  count,
  total,
  children,
  context,
}: {
  prompt: string;
  spanish: string;
  count: number;
  total: number;
  children: ReactNode;
  context?: ReactNode;
}) {
  const id = useId(),
    heading = useRef<HTMLHeadingElement>(null),
    frame = useRef<HTMLElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    const scroller = frame.current?.closest('.routine-session');
    if (scroller) scroller.scrollTo({ top: 0, behavior: 'instant' });
    else frame.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [count]);
  return (
    <section ref={frame} className="exercise-frame" aria-labelledby={id}>
      <div className="exercise-position">
        <span>{isPortuguese ? 'Prática' : 'Practice'}</span>
        <span>
          {count} / {total}
        </span>
      </div>
      {context && <div className="exercise-context">{context}</div>}
      <h3 id={id} ref={heading} tabIndex={-1} lang={isPortuguese ? 'pt-BR' : 'en'}>
        {prompt}
      </h3>
      <p className="exercise-instruction-es" lang="es">
        {spanish}
      </p>
      {children}
    </section>
  );
}

export function ChoiceOptions({
  options,
  value,
  onChange,
  disabled = false,
  order,
  translations,
}: {
  options: readonly string[];
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  order?: number[];
  translations?: (text: string) => ReactNode;
}) {
  const name = useId();
  return (
    <div
      className="options exercise-options"
      role="radiogroup"
      aria-label={isPortuguese ? 'Escolha uma resposta' : 'Choose one answer'}
    >
      {(order || options.map((_, i) => i)).map((i) => (
        <label className={`option ${value === i ? 'selected' : ''}`} key={i}>
          <input
            type="radio"
            name={name}
            value={i}
            checked={value === i}
            disabled={disabled}
            onChange={() => onChange(i)}
          />
          <span className="lesson-option-text" lang={isPortuguese ? 'pt-BR' : 'en'}>
            {options[i]}
            {translations?.(options[i])}
          </span>
        </label>
      ))}
    </div>
  );
}

export function SentenceTiles({
  tokens,
  picked,
  onChange,
  disabled,
}: {
  tokens: readonly string[];
  picked: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
}) {
  const pt = isPortuguese;
  return (
    <div className="sentence-interaction">
      <div
        className="routine-answer"
        aria-label={pt ? 'Sua frase' : 'Your sentence'}
        aria-live="polite"
      >
        {picked.length ? (
          picked.map((index, n) => (
            <button
              type="button"
              disabled={disabled}
              key={`${index}-${n}`}
              aria-label={`${pt ? 'Retirar bloco' : 'Remove block'} ${n + 1}`}
              onClick={() => onChange(picked.filter((_, i) => i !== n))}
            >
              {tokens[index]}
            </button>
          ))
        ) : (
          <span>
            {pt ? 'Toque nas palavras para montar sua frase.' : 'Tap words to build your sentence.'}
          </span>
        )}
      </div>
      <div className="sentence-tools">
        <button
          type="button"
          disabled={disabled || !picked.length}
          onClick={() => onChange(picked.slice(0, -1))}
        >
          <Undo2 size={15} />
          {pt ? 'Desfazer' : 'Undo'}
        </button>
        <button type="button" disabled={disabled || !picked.length} onClick={() => onChange([])}>
          <RotateCcw size={15} />
          {pt ? 'Recomeçar' : 'Clear'}
        </button>
      </div>
      <div className="routine-tiles">
        {tokens.map((token, i) => (
          <button
            type="button"
            disabled={disabled || picked.includes(i)}
            key={i}
            onClick={() => onChange([...picked, i])}
          >
            {token}
          </button>
        ))}
      </div>
    </div>
  );
}
