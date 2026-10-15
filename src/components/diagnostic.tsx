'use client';
import { StudyCopy } from './study-copy';
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
  const copy = (en: string, pt: string) => (isPortuguese ? pt : en);
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
            ? copy('Your first reference is ready.', 'Sua primeira referência está pronta.')
            : copy('Find your starting point.', 'Descubra seu ponto de partida.')
        }
        description={copy(
          'Context-based questions about reading, grammar and vocabulary. No timer and no certificate.',
          'Questões em contexto sobre leitura, gramática e vocabulário. Sem cronômetro e sem certificado.',
        )}
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
              <StudyCopy
                as="p"
                native={copy(
                  `An initial reference from ${placement.correct} / ${placement.total} correct answers. This is a small sample of reading, grammar and vocabulary. It does not evaluate conversation, listening or writing.`,
                  `Uma referência inicial de ${placement.correct} / ${placement.total} respostas corretas. É uma amostra pequena de leitura, gramática e vocabulário. Não avalia conversa, compreensão oral nem escrita.`,
                )}
              >
                Estimación orientativa a partir de {placement.correct} / {placement.total}{' '}
                respuestas correctas. Si cuesta el tramo A1, conviene empezar por las primeras
                bases. No es una certificación ni mide conversación, escucha o escritura.
              </StudyCopy>
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
              <StudyCopy
                native={copy(
                  'Confidence: low. A few questions per skill and band can reveal areas to revisit, but do not establish overall proficiency. Writing, listening and speaking remain unassessed.',
                  'Confiança: baixa. Poucas questões por habilidade e faixa podem indicar pontos para retomar, mas não estabelecem proficiência global. Escrita, compreensão oral e fala ainda não foram avaliadas.',
                )}
                className="fine-print"
              >
                Confianza baja. Dos preguntas por habilidad y tramo orientan el repaso, pero no
                demuestran dominio global. Escritura, escucha y habla siguen pendientes de
                evaluación.
              </StudyCopy>
              <details>
                <summary>How this estimate works</summary>
                <StudyCopy
                  native={
                    placement.legacy
                      ? copy(
                          'This is your previously completed assessment. Its answers and original band rule are preserved. The smaller historical sample remains a low-confidence reference; adding questions does not reopen it or change your course.',
                          'Esta é sua avaliação concluída anteriormente. As respostas e a regra original das faixas foram preservadas. A amostra histórica menor continua sendo uma referência de baixa confiança; acrescentar questões não a reabre nem muda seu percurso.',
                        )
                      : copy(
                          'The current check has 24 questions, six per band from A1 to B2: two per skill. At least five correct answers out of six in a band are required before considering the next one. Unanswered or weaker earlier bands cannot be skipped. The upper result is B1–B2; C1 and C2 require broader assessment.',
                          'A avaliação atual tem 24 questões, seis por faixa de A1 a B2: duas por habilidade. São necessárias pelo menos cinco respostas corretas em seis para considerar a próxima faixa. Faixas anteriores incompletas ou frágeis não podem ser ignoradas. O resultado superior é B1–B2; C1 e C2 exigem avaliação mais ampla.',
                        )
                  }
                >
                  {placement.legacy
                    ? 'Este es tu diagnóstico ya completado: sus respuestas y el criterio original se conservan. La muestra histórica más pequeña tiene confianza baja. Los ítems nuevos no reabren la evaluación ni cambian tu recorrido.'
                    : 'El diagnóstico actual tiene 24 preguntas: seis por tramo de A1 a B2 y dos por habilidad. Buscamos al menos cinco aciertos de seis por tramo antes de considerar el siguiente. No se compensan bases incompletas o débiles con aciertos de tramos posteriores. B1–B2 es el resultado superior orientativo; C1 y C2 requieren una evaluación más amplia.'}
                </StudyCopy>
                <div className="placement-band-results">
                  {placement.bands
                    .filter((band) => band.total > 0)
                    .map((band) => (
                      <p key={band.band}>
                        <strong>{band.band}</strong> · {band.correct} / {band.total}{' '}
                        {copy('correct', 'corretas')}
                      </p>
                    ))}
                </div>
              </details>
              <StudyCopy
                as="p"
                native={copy(
                  `A useful next focus: ${placement.focus}. Return to Home for your next suggested task, or open Language help to check a structure.`,
                  `Um próximo foco útil: ${{ reading: 'leitura', grammar: 'gramática', vocabulary: 'vocabulário' }[placement.focus as 'reading' | 'grammar' | 'vocabulary']}. Volte ao Início para uma sugestão ou abra Ajuda com o idioma para conferir uma estrutura.`,
                )}
              >
                Primer foco:{' '}
                {placement.focus === 'grammar'
                  ? 'armar afirmaciones, negativas y preguntas'
                  : placement.focus === 'vocabulary'
                    ? 'repasar palabras frecuentes y sus ejemplos'
                    : 'leer un texto corto y localizar información explícita'}
                . Usá Language help / Ajuda com o idioma y después la guía de Inicio.
              </StudyCopy>
              <StudyCopy
                as="p"
                native={copy(
                  `Your class journey stays at ${courseRoute(data).level}. This check guides practice without skipping classes or deleting completed work.`,
                  `Seu percurso de aulas continua em ${courseRoute(data).level}. Esta avaliação orienta a prática sem pular aulas nem apagar o que você concluiu.`,
                )}
              >
                Tu recorrido de clases sigue en {courseRoute(data).level}. Este test te orienta; no
                saltea clases ni elimina lo que ya completaste.
              </StudyCopy>
            </div>
            <Button onClick={close}>Go to my journey</Button>
          </>
        )}
        {!data.diagnostic.completed_at && (
          <StudyCopy
            as="p"
            className="fine-print"
            native={copy(
              'Answer without looking up solutions or opening hints. If you are unsure, choose “I don’t know yet”. Feedback appears after the first answer is saved. Translations are study support; using them makes this an assisted reference.',
              'Responda sem pesquisar respostas nem abrir dicas. Se não souber, escolha “Ainda não sei”. A explicação aparece depois de salvar a primeira resposta. As traduções são apoio de estudo; usá-las torna esta referência assistida.',
            )}
          >
            Respondé sin buscar las respuestas ni abrir las ayudas. Si no sabés, podés marcar “I
            don’t know yet” / “Ainda não sei”. Vas a ver una explicación al guardar cada respuesta.
          </StudyCopy>
        )}
        <p className="fine-print">Every answer is saved. You can continue another day. </p>
      </section>
    </div>
  );
}
