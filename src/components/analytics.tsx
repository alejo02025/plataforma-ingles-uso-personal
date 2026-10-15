'use client';
import { StudyCopy } from './study-copy';
import { OralEvidenceRecord } from './oral-evidence-record';
import { oralEvidence } from '@/lib/oral-practice';
import { ProgressPath } from './progress-path';
import { DownloadLink } from './ui';
import { MomentumChart } from './momentum-chart';
import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Activity as ActivityIcon,
  Target,
  BarChart3,
} from 'lucide-react';
import type { Snapshot } from '@/lib/types';
import type { Skill } from '@/lib/content';
import { localDay, skillNames } from '@/lib/learning';
import { isPortuguese } from '@/lib/workspace';
import { evidenceSummary } from '@/lib/evidence-summary';
import { Heading, Empty, dateLabel } from './ui';
import { Correction } from './correction';
import { questionFeedback } from '@/lib/answer-feedback';

export function Progress({ data, navigate }: { data: Snapshot; navigate: (view: string) => void }) {
  const pt = isPortuguese;
  const summary = evidenceSummary(data);
  const patterns = Object.entries(
    data.mistakes.reduce<Record<string, number>>((acc, m) => {
      acc[m.pattern] = (acc[m.pattern] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const writing = data.results.filter((r) => r.skill === 'writing');
  function writingText(answers: string) {
    try {
      const a = JSON.parse(answers);
      return typeof a.text === 'string' ? a.text : typeof a.practice === 'string' ? a.practice : '';
    } catch {
      return '';
    }
  }
  return (
    <div className="audit-progress">
      <Heading
        eyebrow={pt ? 'PRÁTICA, RESULTADOS E EVIDÊNCIAS' : 'PRACTICE, RESULTS AND EVIDENCE'}
        title={pt ? 'Seu progresso, com clareza.' : 'Your progress, made clear.'}
        description={
          pt
            ? 'Veja o que praticou, como respondeu e o que ainda precisa ser avaliado.'
            : 'See what you practised, how you answered, and what still needs assessment.'
        }
      >
        <DownloadLink className="button secondary" endpoint="export">
          <Download size={16} />
          {pt ? 'Exportar meus dados' : 'Export my data'}
        </DownloadLink>
      </Heading>
      <StudyCopy
        native={
          pt
            ? 'Constância é estudar. Desempenho é responder exercícios. Competência é usar o idioma em diferentes situações com evidência suficiente. Não são a mesma medida.'
            : 'Consistency means studying. Performance means answering exercises. Competence means using the language across situations with enough evidence. These are different measures.'
        }
      >
        Constancia es estudiar. Rendimiento es responder ejercicios. Competencia es usar el idioma
        en situaciones diversas con evidencia suficiente. Son medidas distintas.
      </StudyCopy>
      <section
        className="card audit-progress-section"
        aria-label={pt ? 'Constância' : 'Consistency'}
      >
        <div className="audit-section-title">
          <ActivityIcon size={20} />
          <div>
            <span className="eyebrow">01 · {pt ? 'CONSTÂNCIA' : 'CONSISTENCY'}</span>
            <h2>{pt ? 'Seu hábito de estudo' : 'Your study habit'}</h2>
          </div>
        </div>
        <div className="audit-week-stats">
          {[
            {
              v: `${summary.days}/7`,
              en: 'Study days this week',
              pt: 'Dias de prática na semana',
              es: 'Días de estudio esta semana',
            },
            {
              v: `${summary.minutes} min`,
              en: 'Recorded time this week',
              pt: 'Tempo registrado na semana',
              es: 'Tiempo registrado esta semana',
            },
            {
              v: summary.activities,
              en: 'Activities saved this week',
              pt: 'Atividades salvas na semana',
              es: 'Actividades guardadas esta semana',
            },
            {
              v: data.vocabulary.length,
              en: 'Words saved',
              pt: 'Palavras salvas',
              es: 'Palabras guardadas',
            },
          ].map((s) => (
            <div key={s.en}>
              <strong>{s.v}</strong>
              <span>{pt ? s.pt : s.en}</span>
              <small lang="es">{s.es}</small>
            </div>
          ))}
        </div>
        <button className="text-link" onClick={() => navigate('Calendar')}>
          {pt ? 'Abrir calendário interativo' : 'Open interactive calendar'}
        </button>
      </section>
      <MomentumChart data={data} />
      <section
        className="card audit-progress-section"
        aria-label={pt ? 'Desempenho' : 'Performance'}
      >
        <div className="audit-section-title">
          <BarChart3 size={20} />
          <div>
            <span className="eyebrow">02 · {pt ? 'DESEMPENHO' : 'PERFORMANCE'}</span>
            <h2>{pt ? 'Resultados em tarefas específicas' : 'Results in specific tasks'}</h2>
          </div>
        </div>
        <StudyCopy
          native={
            pt
              ? 'Apenas respostas objetivas sem ajuda entram nos números abaixo. Resultados acumulados incluem repetições e não estimam seu nível MCER.'
              : 'Only objective answers without help enter these numbers. Accumulated results include repeated practice and do not estimate your CEFR level.'
          }
        >
          Solo se incluyen respuestas objetivas sin ayuda. Los resultados acumulados incluyen
          repeticiones y no estiman tu nivel MCER.
        </StudyCopy>
        <div className="audit-performance-grid">
          {summary.skills.map((skill) => (
            <section key={skill.skill} className="audit-performance-skill">
              <h3>
                {pt
                  ? { reading: 'Leitura', grammar: 'Gramática', vocabulary: 'Vocabulário' }[
                      skill.skill
                    ]
                  : skillNames[skill.skill]}
              </h3>
              <strong>{skill.total ? `${skill.correct}/${skill.total}` : '—'}</strong>
              <span>
                {skill.total
                  ? `${skill.accuracy}% · ${skill.attempts} ${pt ? 'práticas registradas' : 'recorded attempts'}`
                  : pt
                    ? 'Ainda sem respostas avaliadas'
                    : 'No scored answers yet'}
              </span>
              <small lang="es">
                {skill.total
                  ? 'Respuestas correctas en estas tareas; no porcentaje de dominio.'
                  : 'Falta evidencia objetiva en esta habilidad.'}
              </small>
              {skill.total > 0 && (
                <progress
                  value={skill.correct}
                  max={skill.total}
                  aria-label={
                    pt
                      ? 'Respostas corretas nestes exercícios'
                      : 'Correct answers in these exercises'
                  }
                />
              )}
            </section>
          ))}
          <section className="audit-performance-skill">
            <h3>{pt ? 'Compreensão oral' : 'Listening'}</h3>
            <strong>
              {summary.listening.total
                ? `${summary.listening.correct}/${summary.listening.total}`
                : '—'}
            </strong>
            <span>
              {summary.listening.total
                ? `${summary.listening.attempts} ${pt ? 'práticas · voz sintética' : 'attempts · synthetic voice'}`
                : pt
                  ? 'Ainda sem respostas avaliadas'
                  : 'No scored answers yet'}
            </span>
            <small lang="es">
              Solo comprensión de estos audios sintéticos, sin ayudas. No evalúa pronunciación ni
              nivel.
            </small>
          </section>
        </div>
        <StudyCopy
          native={
            pt
              ? `${data.reviews.length} revisões de vocabulário usam sua própria avaliação de memória e aparecem no histórico, não na precisão objetiva. ${summary.due} palavras estão prontas para revisão.`
              : `${data.reviews.length} vocabulary reviews use your own memory rating and appear in history, not objective accuracy. ${summary.due} words are ready for review.`
          }
        >
          {data.reviews.length} repasos usan tu propia valoración de memoria: quedan en el
          historial, no en la precisión objetiva. {summary.due} palabras están listas para repasar.
        </StudyCopy>
        <button className="text-link" onClick={() => navigate('Vocabulary')}>
          {pt ? 'Revisar vocabulário' : 'Review vocabulary'}
        </button>
      </section>
      <section
        className="card audit-progress-section"
        aria-label={pt ? 'Competência' : 'Competence'}
      >
        <div className="audit-section-title">
          <Target size={20} />
          <div>
            <span className="eyebrow">03 · {pt ? 'COMPETÊNCIA' : 'COMPETENCE'}</span>
            <h2>{pt ? 'O que pode ser observado' : 'What can be observed'}</h2>
          </div>
        </div>
        <StudyCopy
          native={
            pt
              ? 'Acertos em atividades mostram desempenho nesses itens. Ainda não comprovam transferência para situações novas, qualidade da escrita, fluência oral ou domínio integral de um nível.'
              : 'Correct exercise answers show performance on those items. They do not yet demonstrate transfer to new situations, writing quality, oral fluency, or mastery of a whole level.'
          }
        >
          Los aciertos muestran desempeño en esos ítems. Todavía no prueban transferencia a
          situaciones nuevas, calidad de escritura, fluidez oral ni dominio integral de un nivel.
        </StudyCopy>
        <div className="audit-observation-list">
          <div>
            <strong>{pt ? 'Leitura e uso das estruturas' : 'Reading and use of structures'}</strong>
            <span>
              {pt
                ? 'Evidência limitada a tarefas objetivas'
                : 'Evidence limited to objective tasks'}
            </span>
            <small lang="es">
              Los resultados de arriba son observaciones de práctica, no certificaciones.
            </small>
          </div>
          <div>
            <strong>{pt ? 'Escrita' : 'Writing'}</strong>
            <span>
              {writing.length}{' '}
              {pt
                ? 'textos registrados · qualidade pendente de avaliação'
                : 'recorded texts · quality awaiting assessment'}
            </span>
            <small lang="es">
              Guardar un texto acredita práctica; su extensión no demuestra que esté bien escrito.
            </small>
          </div>
          <div>
            <strong>{pt ? 'Compreensão oral' : 'Listening'}</strong>
            <span>
              {summary.listening.total
                ? `${summary.listening.correct}/${summary.listening.total} ${pt ? 'respostas objetivas sobre áudio sintético' : 'objective answers about synthetic audio'}`
                : pt
                  ? 'Ainda sem respostas avaliadas'
                  : 'No scored answers yet'}
            </span>
            <small lang="es">
              Las preguntas observan comprensión de estos audios sintéticos. No prueban comprensión
              de voces reales o situaciones nuevas.
            </small>
          </div>
          <div>
            <strong>{pt ? 'Expressão oral' : 'Speaking'}</strong>
            <span>
              {summary.recordings}{' '}
              {pt
                ? 'gravações · pronúncia e fluência não avaliadas'
                : 'recordings · pronunciation and fluency not assessed'}
            </span>
            <small lang="es">
              Un audio o una transcripción no reciben una nota automática de pronunciación.
            </small>
          </div>
        </div>
        {data.evaluations.length > 0 && (
          <details>
            <summary>
              {pt ? 'Referência inicial orientativa' : 'Initial indicative reference'}
            </summary>
            <StudyCopy
              native={
                pt
                  ? 'O diagnóstico é uma amostra curta com incerteza. Não modifica automaticamente seu percurso e não certifica um nível.'
                  : 'The diagnostic is a short sample with uncertainty. It does not automatically change your path and does not certify a level.'
              }
            >
              El diagnóstico es una muestra corta con incertidumbre. No modifica automáticamente el
              recorrido ni certifica un nivel.
            </StudyCopy>
            {data.evaluations.map((e, i) => (
              <p key={i}>
                {skillNames[e.skill]} · {e.correct}/{e.total} ·{' '}
                {e.level || (pt ? 'Evidência insuficiente' : 'Insufficient evidence')}
              </p>
            ))}
          </details>
        )}
      </section>
      <ProgressPath data={data} navigate={navigate} />
      <details className="progress-details">
        <summary>
          {pt ? 'Erros, escrita e histórico de feedback' : 'Mistakes, writing and feedback history'}
        </summary>
        <section className="card">
          <h2>{pt ? 'Padrões para revisitar' : 'Patterns to revisit'}</h2>
          {patterns.length ? (
            patterns.map(([pattern, count]) => {
              const m = data.mistakes.find((m) => m.pattern === pattern)!;
              return (
                <div className="pattern-row" key={pattern}>
                  <Correction
                    explanation={
                      m.correction_id ? m.explanation : questionFeedback(m.pattern).explanation
                    }
                    correction={m.corrected}
                  />
                  <span className="tag">
                    {count} {pt ? 'registros' : 'records'}
                  </span>
                </div>
              );
            })
          ) : (
            <StudyCopy
              native={
                pt
                  ? 'Ainda não há erros registrados. Isso não comprova ausência de dificuldades.'
                  : 'There are no recorded mistakes yet. This does not prove that no difficulties exist.'
              }
            >
              Todavía no hay errores registrados. Eso no demuestra que no haya dificultades.
            </StudyCopy>
          )}
        </section>
        <section className="card">
          <h2>{pt ? 'Histórico de escrita' : 'Writing history'}</h2>
          {writing.length ? (
            writing.map((r) => (
              <details key={r.id}>
                <summary>
                  {dateLabel(r.day)} · {r.title}
                </summary>
                <blockquote lang={pt ? 'pt-BR' : 'en'}>{writingText(r.answers)}</blockquote>
                <StudyCopy
                  native={
                    pt
                      ? 'Prática salva sem nota automática de qualidade.'
                      : 'Saved practice without an automatic quality score.'
                  }
                >
                  Práctica guardada sin nota automática de calidad.
                </StudyCopy>
              </details>
            ))
          ) : (
            <StudyCopy
              native={
                pt
                  ? 'Seus textos aparecerão aqui quando você praticar.'
                  : 'Your texts will appear here when you practise.'
              }
            >
              Tus textos aparecerán acá cuando practiques.
            </StudyCopy>
          )}
        </section>
        <section className="card correction-history">
          <h2>{pt ? 'Histórico de sugestões' : 'Suggestion history'}</h2>
          {data.corrections.length ? (
            data.corrections.map((c) => (
              <details key={c.id}>
                <summary>
                  {dateLabel(localDay(new Date(c.created_at)))} · {c.original.slice(0, 85)}…
                </summary>
                <p>{c.feedback}</p>
                <p lang={pt ? 'pt-BR' : 'en'}>
                  <strong>{pt ? 'Original:' : 'Original:'}</strong> {c.original}
                </p>
                <blockquote lang={pt ? 'pt-BR' : 'en'}>{c.revised}</blockquote>
                {data.mistakes
                  .filter((m) => m.correction_id === c.id)
                  .map((m) => (
                    <p key={m.id}>{m.explanation}</p>
                  ))}
                <StudyCopy
                  native={
                    pt
                      ? `Sugestão gerada por ${c.model}; pode conter erros e precisa de revisão.`
                      : `Suggestion generated by ${c.model}; it can contain errors and needs review.`
                  }
                >
                  Sugerencia generada por {c.model}; puede contener errores y necesita revisión.
                </StudyCopy>
              </details>
            ))
          ) : (
            <StudyCopy
              native={
                pt
                  ? 'Você ainda não pediu sugestões de revisão.'
                  : 'You have not requested revision suggestions yet.'
              }
            >
              Todavía no pediste sugerencias de revisión.
            </StudyCopy>
          )}
        </section>
      </details>
    </div>
  );
}
export function Calendar({ data }: { data: Snapshot }) {
  const pt = isPortuguese;
  const oral = oralEvidence(data);
  const [month, setMonth] = useState(data.day.slice(0, 7)),
    [selected, setSelected] = useState(data.day);
  const oralDay = oral.filter((a) => localDay(new Date(a.created_at)) === selected);
  const oralSeconds = (matching: (day: string) => boolean) =>
    oral
      .filter((a) => matching(localDay(new Date(a.created_at))))
      .reduce((n, a) => n + a.duration, 0);
  const first = new Date(`${month}-01T12:00:00Z`);
  const length = new Date(first.getUTCFullYear(), first.getUTCMonth() + 1, 0).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  function move(amount: number) {
    const date = new Date(first);
    date.setUTCMonth(date.getUTCMonth() + amount);
    setMonth(date.toISOString().slice(0, 7));
  }
  const sessions = data.sessions.filter((s) => localDay(new Date(s.started_at)) === selected);
  const completed = data.results.filter((r) => r.day === selected);
  const words = data.vocabulary.filter((w) => localDay(new Date(w.created_at)) === selected);
  const reviews = data.reviews.filter((r) => r.day === selected);
  const mistakes = data.mistakes.filter((m) => localDay(new Date(m.created_at)) === selected);
  const mins = (items: typeof sessions, audioSeconds = 0) =>
    ((items.reduce((n, s) => n + s.active_seconds, 0) + audioSeconds) / 60).toFixed(1);
  const monthSessions = data.sessions.filter((s) =>
    localDay(new Date(s.started_at)).startsWith(month),
  );
  const weekStart = new Date(`${data.day}T12:00:00-03:00`);
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  const weekSessions = data.sessions.filter(
    (s) => localDay(new Date(s.started_at)) >= localDay(weekStart),
  );
  return (
    <>
      <Heading
        eyebrow="EVERY DAY LEAVES A TRACE"
        title="Your calendar."
        description="An automatic record of your practice. No manual logging needed."
      />
      <div className="calendar-stats">
        <div className="card stat">
          <span>Last 7 days</span>
          <strong>
            {mins(
              weekSessions,
              oralSeconds((day) => day >= localDay(weekStart) && day <= data.day),
            )}
            <small>min</small>
          </strong>
        </div>
        <div className="card stat">
          <span>Selected month</span>
          <strong>
            {mins(
              monthSessions,
              oralSeconds((day) => day.startsWith(month)),
            )}
            <small>min</small>
          </strong>
        </div>
        <div className="card stat">
          <span>Activities this month</span>
          <strong>{data.results.filter((r) => r.day.startsWith(month)).length}</strong>
        </div>
      </div>
      <div className="calendar-layout">
        <section className="card calendar-card">
          <div className="section-heading">
            <h2>
              {new Intl.DateTimeFormat('en-US', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              }).format(first)}
            </h2>
            <div className="button-row">
              <button className="icon-button" aria-label="Previous month" onClick={() => move(-1)}>
                <ChevronLeft size={20} />
              </button>
              <button className="icon-button" aria-label="Next month" onClick={() => move(1)}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span className="calendar-weekday" key={d}>
                {d}
              </span>
            ))}
            {Array.from({ length: offset }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length }, (_, i) => {
              const date = `${month}-${String(i + 1).padStart(2, '0')}`;
              const count =
                data.results.filter((r) => r.day === date).length +
                data.reviews.filter((r) => r.day === date).length +
                oral.filter((a) => localDay(new Date(a.created_at)) === date).length;
              return (
                <button
                  key={date}
                  className={`calendar-day ${selected === date ? 'selected' : ''} ${date === data.day ? 'current' : ''}`}
                  onClick={() => setSelected(date)}
                  aria-label={`${dateLabel(date)}: ${count} records`}
                >
                  <span>{i + 1}</span>
                  {count > 0 && <span className="day-dot" />}
                </button>
              );
            })}
          </div>
          <p className="fine-print">
            {pt
              ? '● Dia com atividades, prática oral ou revisões · Horário de Buenos Aires.'
              : '● Day with activities, oral practice or reviews · Buenos Aires time zone.'}
          </p>
        </section>
        <section className="card day-detail">
          <span className="eyebrow">{dateLabel(selected).toUpperCase()}</span>
          <h2>
            {completed.length + oralDay.length ? 'A day to remember.' : 'Your day, in detail.'}
          </h2>
          <div className="day-summary">
            <span>
              {mins(
                sessions,
                oralDay.reduce((n, a) => n + a.duration, 0),
              )}{' '}
              recorded min
            </span>
            <span>
              {completed.length + oralDay.length} {pt ? 'atividades' : 'activities'}
            </span>
          </div>
          {completed.map((r) => (
            <div className="day-event" key={r.id}>
              <span className="status-dot" />
              <div>
                <h3>{r.title}</h3>
                <p>
                  {skillNames[r.skill as Skill]}
                  {r.total !== null ? ` · ${r.correct}/${r.total} answers` : '· No score'}
                </p>
              </div>
            </div>
          ))}
          {oralDay.map((a) => (
            <div className="day-event" key={a.id}>
              <OralEvidenceRecord attempt={a} />
            </div>
          ))}
          {sessions
            .filter((s) => !s.ended_at)
            .map((s) => (
              <div className="day-event" key={s.id}>
                <div>
                  <h3>{s.title}</h3>
                  <p>Pending · session started</p>
                </div>
              </div>
            ))}
          {words.length > 0 && (
            <p>
              <strong>{words.length} new words:</strong> {words.map((w) => w.word).join(', ')}
            </p>
          )}
          {reviews.length > 0 && (
            <p>
              <strong>{reviews.length} reviews:</strong> {reviews.filter((r) => r.known).length}{' '}
              remembered according to your own rating.{' '}
            </p>
          )}
          {mistakes.length > 0 && (
            <p>
              <strong>{mistakes.length} recorded mistakes or suggestions.</strong> See the
              explanations in Progress.{' '}
            </p>
          )}
          {!completed.length &&
            !oralDay.length &&
            !sessions.length &&
            !words.length &&
            !reviews.length && (
              <Empty
                title="No records yet."
                detail="Your activities will appear here automatically when you practise."
              />
            )}
        </section>
      </div>
    </>
  );
}
