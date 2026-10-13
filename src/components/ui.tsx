'use client';
import { ArrowRight, ArrowUpRight, Check, Volume2 } from 'lucide-react';
import type { PublicQuestion } from '@/lib/types';
export async function api<T = Record<string, unknown>>(
  endpoint: string,
  body?: unknown,
): Promise<T> {
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
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la operación.');
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
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
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
  return (
    <div className="questions">
      {questions.map((q, i) => (
        <fieldset key={q.id} disabled={disabled}>
          <legend>
            <span className="question-number">{i + 1}</span>
            {q.prompt}
          </legend>
          <div className="options">
            {q.options.map((option, index) => (
              <label key={option} className={`option ${answers[q.id] === index ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === index}
                  onChange={() => onAnswer(q.id, index)}
                />
                <span>{option}</span>
                {answers[q.id] === index && <Check size={16} />}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
export function Speak({ text }: { text: string }) {
  return (
    <button
      className="icon-button"
      aria-label={`Escuchar ${text}`}
      title="Pronunciación con la voz disponible en tu navegador"
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
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: 'numeric',
    month: short ? 'short' : 'long',
  }).format(new Date(`${day}T12:00:00-03:00`));
}
