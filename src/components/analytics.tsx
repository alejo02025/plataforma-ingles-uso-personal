'use client';
import { StudyCopy } from './study-copy';
import { OralEvidenceRecord } from './oral-evidence-record';
import { oralEvidence } from '@/lib/oral-practice';
import { courseRoute, levelLessons, passedLesson } from '@/lib/course-route';
import { DailyRewards } from './daily-rewards';
import { ProgressPath } from './progress-path';
import { dailyRewards } from '@/lib/daily-rewards';
import { DownloadLink } from './ui';

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
      <section className="progress-week">
        <h2>{pt ? 'Sua semana' : 'Your week'}</h2>
        <div className="week-days">
          {dailyRewards(data).week.map((day) => (
            <button
              key={day.day}
              aria-label={`${dateLabel(day.day)} · ${day.done ? (pt ? 'com prática' : 'practice recorded') : pt ? 'sem prática' : 'no practice'}`}
              className={day.done ? 'studied' : ''}
              onClick={() => navigate('Calendar')}
            >
              <small>
                {new Date(`${day.day}T12:00:00`).toLocaleDateString(pt ? 'pt-BR' : 'en-US', {
                  weekday: 'short',
                })}
              </small>
              <strong>{new Date(`${day.day}T12:00:00`).getDate()}</strong>
              <span aria-hidden>{day.done ? '●' : '·'}</span>
            </button>
          ))}
        </div>
        <p className="muted">
          {summary.days}/7 {pt ? 'dias de estudo' : 'study days'} · {summary.minutes} min ·{' '}
          {summary.activities} {pt ? 'atividades salvas' : 'saved activities'}
        </p>
      </section>
      <section className="progress-overview">
        <div>
          <strong>
            {levelLessons(courseRoute(data).level).filter((l) => passedLesson(data, l.id)).length}
          </strong>
          <span>
            {pt ? 'Aulas aprovadas no nível de estudo' : 'Classes passed at your study level'}
          </span>
        </div>
        <div>
          <strong>{data.vocabulary.filter((w) => w.reviews > 0 && w.interval > 1).length}</strong>
          <span>{pt ? 'Palavras lembradas · autoavaliação' : 'Words recalled · self-rated'}</span>
        </div>
        <div>
          <strong>{summary.due}</strong>
          <span>{pt ? 'Palavras para revisar' : 'Words due for review'}</span>
          <button className="text-link" onClick={() => navigate('Vocabulary')}>
            {pt ? 'Revisar' : 'Review'}
          </button>
        </div>
      </section>
      <section className="progress-evidence">
        <h2>{pt ? 'Resultados e evidências' : 'Results & evidence'}</h2>
        <p>
          {pt
            ? 'Acertos se referem a estes exercícios, sem ajuda. Não são uma certificação de nível.'
            : 'Correct answers refer to these exercises, without help. They are not a level certificate.'}
        </p>
        <div className="evidence-table">
          {summary.skills.map((skill) => (
            <div key={skill.skill}>
              <strong>
                {pt
                  ? { reading: 'Leitura', grammar: 'Gramática', vocabulary: 'Vocabulário' }[
                      skill.skill
                    ]
                  : skillNames[skill.skill]}
              </strong>
              <span>
                {skill.total
                  ? `${skill.correct}/${skill.total} · ${skill.attempts} ${pt ? 'práticas' : 'attempts'}`
                  : pt
                    ? 'Ainda sem respostas avaliadas'
                    : 'No scored answers yet'}
              </span>
            </div>
          ))}
          <div>
            <strong>{pt ? 'Compreensão oral' : 'Listening'}</strong>
            <span>
              {summary.listening.total
                ? `${summary.listening.correct}/${summary.listening.total} · ${pt ? 'voz sintética' : 'synthetic voice'}`
                : pt
                  ? 'Ainda sem respostas avaliadas'
                  : 'No scored answers yet'}
            </span>
          </div>
          <div>
            <strong>{pt ? 'Escrita' : 'Writing'}</strong>
            <span>
              {writing.length}{' '}
              {pt
                ? 'textos · qualidade pendente de avaliação'
                : 'texts · quality awaiting assessment'}
            </span>
          </div>
          <div>
            <strong>{pt ? 'Expressão oral' : 'Speaking'}</strong>
            <span>
              {summary.recordings}{' '}
              {pt
                ? 'gravações · pronúncia e fluência não avaliadas'
                : 'recordings · pronunciation and fluency not assessed'}
            </span>
          </div>
        </div>
        <details>
          <summary>{pt ? 'Limites destas evidências' : 'Limits of this evidence'}</summary>
          <p lang="es">
            Completar actividades acredita práctica. Los resultados objetivos describen esas tareas;
            no demuestran todavía transferencia a situaciones nuevas. Los repasos de palabras son
            autoevaluados. Guardar un texto o audio no demuestra su calidad. Listening usa voz
            sintética, no evalúa pronunciación ni comprensión de voces reales.
          </p>
          {data.evaluations.map((e, i) => (
            <p key={i}>
              {skillNames[e.skill]} · {e.correct}/{e.total} ·{' '}
              {e.level || (pt ? 'Evidência insuficiente' : 'Insufficient evidence')}
            </p>
          ))}
        </details>
      </section>
      <details className="progress-path-panel">
        <summary>{pt ? 'Percurso e requisitos' : 'Course path & requirements'}</summary>
        <ProgressPath data={data} navigate={navigate} />
      </details>
      <details className="progress-milestones">
        <summary>{pt ? 'Marcos de prática' : 'Practice milestones'}</summary>
        <DailyRewards data={data} />
      </details>
      <details className="progress-oral-history">
        <summary>{pt ? 'Histórico oral' : 'Oral history'}</summary>
        {oralEvidence(data).map((a) => (
          <OralEvidenceRecord key={a.id} attempt={a} />
        ))}
      </details>
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
