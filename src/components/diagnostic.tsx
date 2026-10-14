'use client';
import { useState } from 'react';
import { placementSummary } from '@/lib/placement';
import { courseRoute } from '@/lib/course-route';
import { isPortuguese } from '@/lib/workspace';
import type { Snapshot } from '@/lib/types';
import { Button, Heading, QuestionForm, api } from './ui';
import { Correction } from './correction';
import { questionFeedback } from '@/lib/answer-feedback';
export function Diagnostic({
  data,
  refresh,
  close,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  close: () => void;
}) {
  const total = data.diagnostic.completed_at
    ? data.diagnostic.answers.length
    : data.questions.length;
  const placement = placementSummary(data);
  const next = data.diagnostic.completed_at
    ? undefined
    : data.questions.find((q) => !data.diagnostic.answers.some((a) => a.question_id === q.id));
  const [answer, setAnswer] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function save() {
    if (!next) return;
    setBusy(true);
    setError('');
    try {
      setFeedback(await api('diagnostic', { questionId: next.id, answer: answer[next.id] }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function advance() {
    setBusy(true);
    setError('');
    try {
      await refresh();
      setFeedback(null);
      setAnswer({});
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="narrow-page">
      <Heading
        eyebrow="YOUR STARTING POINT"
        title={
          data.diagnostic.completed_at
            ? 'Ya tenemos una primera referencia.'
            : 'Let’s get to know your English.'
        }
        description="A short level check. Reading, grammar and vocabulary, without a timer."
      />
      <section className="card diagnostic-card">
        <div className="section-heading">
          <span>
            {data.diagnostic.answers.length} / {total} ·{' '}
            {isPortuguese ? 'respostas salvas' : 'answers saved'}
          </span>
          <Button secondary onClick={close}>
            Save and leave{' '}
          </Button>
        </div>
        <div className="progress-bar">
          <span
            style={{ width: `${(data.diagnostic.answers.length / Math.max(1, total)) * 100}%` }}
          />
        </div>
        {next ? (
          <>
            <QuestionForm
              key={next.id}
              questions={[next]}
              answers={answer}
              onAnswer={(id, value) => setAnswer({ [id]: value })}
              disabled={busy || Boolean(feedback)}
            />
            {feedback && (
              <div className={`feedback ${feedback.correct ? 'positive' : ''}`}>
                <strong>{feedback.correct ? 'Well done.' : 'A clue for next time.'}</strong>
                <Correction {...questionFeedback(next.id)} />
              </div>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <Button
              disabled={busy || (!feedback && answer[next.id] === undefined)}
              onClick={feedback ? advance : save}
            >
              {busy ? 'Saving…' : feedback ? 'Next' : 'Save answer'}
            </Button>
          </>
        ) : (
          <>
            <div className="placement-result">
              <span className="eyebrow">YOUR INITIAL REFERENCE</span>
              <h2>{placement.label}</h2>
              <p lang="es">
                Estimación orientativa a partir de {placement.correct} / {placement.total}{' '}
                respuestas correctas. Si cuesta el tramo A1, conviene empezar por las primeras
                bases. No es una certificación ni mide conversación, escucha o escritura.
              </p>
              <div className="placement-skills">
                {placement.skills.map((s) => (
                  <div key={s.skill}>
                    <strong>
                      {isPortuguese
                        ? (
                            {
                              reading: 'Leitura',
                              grammar: 'Gramática',
                              vocabulary: 'Vocabulário',
                            } as Record<string, string>
                          )[s.skill]
                        : s.skill}
                    </strong>
                    <span>
                      {s.correct} / {s.total}
                    </span>
                  </div>
                ))}
              </div>
              <details>
                <summary>How this estimate works</summary>
                <p lang="es">
                  Buscamos al menos dos aciertos de tres en cada tramo antes de considerar el
                  siguiente. La muestra es pequeña y las preguntas incluyen ayuda después de
                  responder, así que la confianza es baja. El resultado superior se expresa como
                  B1–B2; C1 y C2 requieren una evaluación más amplia.
                </p>
              </details>
              <p lang="es">
                Primer foco:{' '}
                {placement.focus === 'grammar'
                  ? 'armar afirmaciones, negativas y preguntas'
                  : placement.focus === 'vocabulary'
                    ? 'repasar palabras frecuentes y sus ejemplos'
                    : 'leer un texto corto y localizar información explícita'}
                . Usá Language help / Ajuda com o idioma y después la guía de Inicio.
              </p>
              <p lang="es">
                Tu recorrido de clases sigue en {courseRoute(data).level}. Este test te orienta; no
                saltea clases ni elimina lo que ya completaste.
              </p>
            </div>
            <Button onClick={close}>Go to my journey</Button>
          </>
        )}
        {!data.diagnostic.completed_at && (
          <p lang="es" className="fine-print">
            Respondé sin buscar las respuestas ni abrir las ayudas. Si no sabés, podés marcar “I
            don’t know yet” / “Ainda não sei”. Vas a ver una explicación al guardar cada respuesta.
          </p>
        )}
        <p className="fine-print">Every answer is saved. You can continue another day. </p>
      </section>
    </div>
  );
}
