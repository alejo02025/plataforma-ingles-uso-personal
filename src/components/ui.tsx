'use client';
import { useState, createContext, useContext } from 'react';
import { isPortuguese } from '@/lib/workspace';
import { ExerciseFrame, ChoiceOptions } from './exercise-player';
import { SpanishTranslation } from './study-copy';
const EmbeddedHeading = createContext(false);
export function EmbeddedHeadings({ children }: { children: React.ReactNode }) {
  return <EmbeddedHeading.Provider value={true}>{children}</EmbeddedHeading.Provider>;
}
import { ArrowRight, ArrowUpRight, Check, Volume2 } from 'lucide-react';
import type { PublicQuestion } from '@/lib/types';
export async function api<T = Record<string, unknown>>(
  endpoint: string,
  body?: unknown,
): Promise<T> {
  if (process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github') {
    const { browserApi } = await import('@/lib/browser/api');
    return (await browserApi(endpoint, body)) as T;
  }
  const response = await fetch(
    `/api/${endpoint}`,
    body === undefined
      ? { cache: 'no-store' }
      : body instanceof FormData
        ? { method: 'POST', body }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'The action could not be completed.');
  return data as T;
}
export function Button({
  children,
  secondary,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) {
  return (
    <button className={`button ${secondary ? 'secondary' : ''} ${className}`} {...props}>
      {children}
    </button>
  );
}
export function Empty({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-mark">
        <ArrowUpRight size={24} />
      </span>
      <h3>{title}</h3>
      <p>{detail}</p>
      {children}
    </div>
  );
}
export function Heading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  const nested = useContext(EmbeddedHeading);
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        {nested ? <h2>{title}</h2> : <h1>{title}</h1>}
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function QuestionForm({
  questions,
  answers,
  onAnswer,
  disabled,
}: {
  questions: PublicQuestion[];
  answers: Record<string, number>;
  onAnswer: (id: string, value: number) => void;
  disabled?: boolean;
}) {
  const [index, setIndex] = useState(() =>
    Math.max(
      0,
      questions.findIndex((q) => answers[q.id] === undefined),
    ),
  );
  const at = Math.min(index, Math.max(0, questions.length - 1));
  const q = questions[at];
  if (!q) return null;
  return (
    <div className="questions question-player">
      <ExerciseFrame
        key={q.id}
        count={at + 1}
        total={questions.length}
        prompt={
          isPortuguese
            ? 'Escolha uma resposta para esta situação.'
            : 'Choose an answer for this situation.'
        }
        spanish="Elegí una respuesta para esta situación."
      >
        <fieldset disabled={disabled}>
          <legend>
            {q.prompt}
            <SpanishTranslation text={q.prompt} />
          </legend>
          <ChoiceOptions
            options={q.options}
            value={answers[q.id] ?? -1}
            disabled={disabled}
            onChange={(value) => onAnswer(q.id, value)}
          />
        </fieldset>
      </ExerciseFrame>
      {questions.length > 1 && (
        <div className="question-player-navigation">
          <button
            className="text-link"
            disabled={at === 0}
            onClick={() => setIndex((n) => Math.max(0, n - 1))}
          >
            {isPortuguese ? 'Pergunta anterior' : 'Previous question'}
          </button>
          <span className="fine-print">
            {Object.keys(answers).filter((id) => questions.some((q) => q.id === id)).length} /{' '}
            {questions.length} {isPortuguese ? 'respondidas' : 'answered'}
          </span>
          <button
            className="text-link"
            disabled={at === questions.length - 1 || answers[q.id] === undefined}
            onClick={() => setIndex((n) => n + 1)}
          >
            {isPortuguese ? 'Próxima pergunta' : 'Next question'}
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

export function Speak({ text }: { text: string }) {
  return (
    <button
      className="icon-button"
      aria-label={`Listen to ${text}`}
      title="Pronunciation with your browser’s available voice"
      onClick={() => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }}
    >
      <Volume2 size={18} />
    </button>
  );
}
export function ArrowLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowRight size={16} />
    </button>
  );
}
export function dateLabel(day: string, short = false) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: 'numeric',
    month: short ? 'short' : 'long',
  }).format(new Date(`${day}T12:00:00-03:00`));
}

export function DownloadLink({
  endpoint,
  children,
  className = 'text-link',
}: {
  endpoint: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [error, setError] = useState('');
  return (
    <>
      <a
        className={className}
        href={process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github' ? '#' : `/api/${endpoint}`}
        onClick={async (event) => {
          if (process.env.NEXT_PUBLIC_DEPLOY_TARGET !== 'github') return;
          event.preventDefault();
          setError('');
          try {
            let blob: Blob;
            if (endpoint === 'export')
              blob = new Blob([JSON.stringify(await api('export'), null, 2)], {
                type: 'application/json',
              });
            else {
              const { pdfBytes } = await import('@/lib/browser/sync');
              const bytes = await pdfBytes(endpoint.slice(6));
              blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
            }
            const url = URL.createObjectURL(blob),
              link = document.createElement('a');
            link.href = url;
            link.download = endpoint === 'export' ? 'english-os-data.json' : 'document.pdf';
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 10000);
          } catch (error) {
            setError(error instanceof Error ? error.message : 'The file could not be downloaded.');
          }
        }}
      >
        {children}
      </a>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
