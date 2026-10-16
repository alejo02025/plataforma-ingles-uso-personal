'use client';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { isPortuguese } from '@/lib/workspace';
import { mistakeReview, mistakeCategoryLabels, pendingProductions } from '@/lib/mistake-review';
import type { Snapshot } from '@/lib/types';
import { LearningInsight } from './learning-insight';
import { StudyCopy } from './study-copy';
import { Button, dateLabel } from './ui';

export function MistakeNotebook({
  data,
  onLesson,
}: {
  data: Snapshot;
  onLesson: (id: string) => void;
}) {
  const pt = isPortuguese;
  const [category, setCategory] = useState('all'),
    [limit, setLimit] = useState(12);
  const entries = mistakeReview(data);
  const pending = pendingProductions(data);
  const visible = entries.filter((e) => category === 'all' || e.category === category);
  const label = (id: string) =>
    mistakeCategoryLabels[id]?.[pt ? 1 : 0] || (pt ? 'Outros padrões' : 'Other patterns');
  return (
    <section className="mistake-notebook">
      <h2>{pt ? 'Seus erros, com um próximo passo' : 'Your mistakes, with a next step'}</h2>
      <StudyCopy
        native={
          pt
            ? 'Compare sua primeira resposta com o modelo e volte a praticar em outro contexto. O histórico não é apagado quando você melhora.'
            : 'Compare your first answer with the model, then practise in another context. Your history is kept when you improve.'
        }
      >
        Compará tu primera respuesta con el modelo y volvé a practicar en otro contexto. El
        historial se conserva cuando mejorás.
      </StudyCopy>
      {pending.length > 0 && (
        <details className="pending-productions">
          <summary>
            {pt
              ? `${pending.length} respostas abertas aguardando revisão`
              : `${pending.length} open answers awaiting review`}
          </summary>
          <p className="fine-print" lang="es">
            Estas versiones no se calificaron como errores. Comparalas con el modelo y su
            explicación; el sistema no valida todas las reformulaciones posibles.
          </p>
          {pending.slice(0, 12).map((item) => (
            <div key={item.id}>
              <p className="fine-print">
                {item.title} · {dateLabel(item.date.slice(0, 10), true)}
              </p>
              <p lang={pt ? 'pt-BR' : 'en'}>{item.response}</p>
              <LearningInsight
                explanation={item.explanation}
                explanationNative={item.explanationNative}
                model={item.model}
              />
            </div>
          ))}
        </details>
      )}
      {entries.length ? (
        <>
          <label className="field mistake-filter">
            {pt ? 'Revisar um padrão' : 'Review a pattern'}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setLimit(12);
              }}
            >
              <option value="all">{pt ? 'Todos os padrões' : 'All patterns'}</option>
              {[...new Set(entries.map((e) => e.category))].map((id) => (
                <option key={id} value={id}>
                  {label(id)}
                </option>
              ))}
            </select>
          </label>
          <div className="mistake-list">
            {visible.slice(0, limit).map((entry) => (
              <details className="mistake-entry" key={entry.id}>
                <summary>
                  <span>
                    <strong>{label(entry.category)}</strong>
                    <small>
                      {entry.origin || (pt ? 'Prática salva' : 'Saved practice')} ·{' '}
                      {dateLabel(entry.first.created_at.slice(0, 10), true)}
                    </small>
                  </span>
                  <span className="tag">
                    {entry.occurrences} {pt ? 'registros' : 'records'}
                  </span>
                </summary>
                <LearningInsight
                  correct={false}
                  explanation={entry.first.explanation}
                  explanationNative={entry.explanationNative}
                  response={entry.first.original}
                  model={entry.first.corrected}
                />
                <p className="fine-print">
                  {entry.helpUsed
                    ? pt
                      ? 'Primeira tentativa com ajuda.'
                      : 'First attempt used help.'
                    : pt
                      ? 'Primeira tentativa sem ajuda registrada.'
                      : 'No help recorded for the first attempt.'}
                </p>
                <p className="fine-print">
                  {pt
                    ? `${entry.trials.length} respostas posteriores relacionadas · ${entry.differentItemsPractised} acertos sem ajuda em outros itens.`
                    : `${entry.trials.length} later related responses · ${entry.differentItemsPractised} unaided correct answers on different items.`}
                </p>
                <p className="fine-print">
                  {pt ? 'Próximo repasso sugerido: ' : 'Suggested next review: '}
                  {dateLabel(entry.dueAt.slice(0, 10), true)}
                </p>
                {entry.trials.length > 0 && (
                  <details>
                    <summary>{pt ? 'Ver tentativas posteriores' : 'View later attempts'}</summary>
                    {entry.trials.slice(-10).map((t, i) => (
                      <p key={`${t.resultId}:${t.itemId}:${i}`} className="fine-print">
                        {dateLabel(t.date.slice(0, 10), true)} ·{' '}
                        {t.verified
                          ? t.correct
                            ? pt
                              ? 'modelo conferido'
                              : 'model matched'
                            : pt
                              ? 'erro registrado'
                              : 'recorded error'
                          : pt
                            ? 'pendente de revisão'
                            : 'pending review'}{' '}
                        ·{' '}
                        {t.helped
                          ? pt
                            ? 'com ajuda'
                            : 'with help'
                          : pt
                            ? 'sem ajuda'
                            : 'without help'}{' '}
                        ·{' '}
                        {t.differentItem
                          ? pt
                            ? 'outro item'
                            : 'different item'
                          : pt
                            ? 'mesmo item'
                            : 'same item'}
                      </p>
                    ))}
                  </details>
                )}
                <Button
                  secondary
                  onClick={() =>
                    entry.lessonId
                      ? onLesson(entry.lessonId)
                      : window.dispatchEvent(
                          new CustomEvent('english-os:routine-start', {
                            detail: { mode: entry.mode },
                          }),
                        )
                  }
                >
                  {entry.lessonId
                    ? pt
                      ? 'Rever a aula de origem'
                      : 'Review the original class'
                    : pt
                      ? 'Praticar no bloco atual'
                      : 'Practise in your current block'}
                  <ArrowRight size={15} />
                </Button>
              </details>
            ))}
          </div>
          {visible.length > limit && (
            <button className="text-link" onClick={() => setLimit((n) => n + 12)}>
              {pt ? 'Mostrar mais' : 'Show more'}
            </button>
          )}
          <details className="review-policy">
            <summary>{pt ? 'Como o repasso é sugerido' : 'How review is scheduled'}</summary>
            <StudyCopy
              native={
                pt
                  ? 'O primeiro retorno é após um dia. Acertos objetivos sem ajuda, em contextos diferentes e dias diferentes, podem levar a 3, 7 e 14 dias. Um novo erro volta a um dia. Repetir o mesmo item ou marcar “lembrei” não demonstra transferência.'
                  : 'The first return is after one day. Objective, unaided correct answers in different contexts and on different days can extend this to 3, 7 and 14 days. A new error returns it to one day. Repeating the same item or rating “remembered” does not demonstrate transfer.'
              }
            >
              El primer regreso es al día siguiente. Los aciertos objetivos sin ayuda, en otros
              contextos y en días distintos, pueden llevar a 3, 7 y 14 días. Un nuevo error vuelve a
              un día. Repetir el mismo ítem o marcar «lo recordé» no demuestra transferencia.
            </StudyCopy>
          </details>
        </>
      ) : (
        <div className="empty">
          <h3>
            {pt
              ? 'Seu histórico começa com uma tentativa.'
              : 'Your history starts with an attempt.'}
          </h3>
          <p>
            {pt
              ? 'Os erros dos exercícios aparecem aqui com explicação e origem. Não haver registros ainda não comprova domínio.'
              : 'Exercise mistakes will appear here with their explanation and origin. No records yet does not demonstrate mastery.'}
          </p>
        </div>
      )}
    </section>
  );
}
