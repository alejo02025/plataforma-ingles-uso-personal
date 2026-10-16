'use client';
import { Check, Lightbulb, X } from 'lucide-react';
import { isPortuguese } from '@/lib/workspace';
import { StudyCopy, SpanishTranslation } from './study-copy';

/** Inline feedback from authored content. No generated rationale and no overlay. */
export function LearningInsight({
  correct,
  explanation,
  explanationNative,
  model,
  modelSpanish,
  response,
  onDismiss,
}: {
  correct?: boolean;
  explanation: string;
  explanationNative?: string;
  model?: string;
  modelSpanish?: string;
  response?: string;
  onDismiss?: () => void;
}) {
  const pt = isPortuguese;
  return (
    <aside className={`learning-insight ${correct === false ? 'needs-review' : ''}`} role="status">
      <div className="insight-heading">
        {correct ? <Check size={17} aria-hidden /> : <Lightbulb size={17} aria-hidden />}
        <strong>
          {correct
            ? pt
              ? 'Resposta conferida'
              : 'Answer checked'
            : pt
              ? 'Observe a diferença'
              : 'Notice the difference'}
        </strong>
        {onDismiss && (
          <button
            className="icon-button"
            type="button"
            onClick={onDismiss}
            aria-label={pt ? 'Fechar dica' : 'Dismiss tip'}
          >
            <X size={16} />
          </button>
        )}
      </div>
      {response && correct === false && (
        <p className="insight-response">
          {pt ? 'Sua resposta: ' : 'Your answer: '}
          <span lang={pt ? 'pt-BR' : 'en'}>{response}</span>
        </p>
      )}
      <StudyCopy native={explanationNative}>{explanation}</StudyCopy>
      {model && (
        <div className="insight-model">
          <span className="tiny-label">{pt ? 'Modelo em contexto' : 'Model in context'}</span>
          <p className="answer-correction-model" lang={pt ? 'pt-BR' : 'en'}>
            {model}
            <SpanishTranslation text={model} spanish={modelSpanish} />
          </p>
        </div>
      )}
    </aside>
  );
}
