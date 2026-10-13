'use client';
import { useState } from 'react';
import type { Snapshot } from '@/lib/types';
import { Button, Heading, QuestionForm, api } from './ui';
export function Diagnostic({
  data,
  refresh,
  close,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  close: () => void;
}) {
  const next = data.questions.find(
    (q) => !data.diagnostic.answers.some((a) => a.question_id === q.id),
  );
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
        eyebrow="TU PUNTO DE PARTIDA"
        title={
          data.diagnostic.completed_at
            ? 'Ya tenemos una primera referencia.'
            : 'Conozcamos tu inglés.'
        }
        description="Nueve situaciones breves de lectura, gramática y vocabulario. Sin reloj ni presión."
      />
      <section className="card diagnostic-card">
        <div className="section-heading">
          <span>{data.diagnostic.answers.length} de 9 guardadas</span>
          <Button secondary onClick={close}>
            Guardar y salir
          </Button>
        </div>
        <div className="progress-bar">
          <span style={{ width: `${(data.diagnostic.answers.length / 9) * 100}%` }} />
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
                <strong>{feedback.correct ? 'Bien pensado.' : 'Una pista para la próxima.'}</strong>
                <p>{feedback.explanation}</p>
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
              {busy ? 'Guardando…' : feedback ? 'Siguiente' : 'Guardar respuesta'}
            </Button>
          </>
        ) : (
          <>
            <h2>Tu línea de base está guardada.</h2>
            <p className="muted">
              Las estimaciones son orientativas y tienen confianza baja: este diagnóstico breve no
              certifica un nivel MCER. Speaking, listening y writing necesitan otras evaluaciones.
            </p>
            <Button onClick={close}>Ir a mi recorrido</Button>
          </>
        )}
        <p className="fine-print">
          Cada respuesta queda guardada en tu base de datos. Podés continuar otro día.
        </p>
      </section>
    </div>
  );
}
