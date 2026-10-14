'use client';
import { DownloadLink } from './ui';
import { MomentumChart } from './momentum-chart';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, TrendingUp } from 'lucide-react';
import type { Snapshot } from '@/lib/types';
import type { Skill } from '@/lib/content';
import { localDay, skillNames } from '@/lib/learning';
import { Heading, Empty, dateLabel } from './ui';
import { Correction } from './correction';
import { questionFeedback } from '@/lib/answer-feedback';
const allSkills = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary'];
const labels: Record<string, string> = {
  ...skillNames,
  listening: 'Listening',
  speaking: 'Speaking',
};
export function Progress({ data }: { data: Snapshot }) {
  const counts = allSkills.map((skill) => ({
    skill,
    results: data.results.filter((r) => r.skill === skill),
  }));
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(`${data.day}T12:00:00-03:00`);
    d.setUTCDate(d.getUTCDate() - 13 + i);
    return localDay(d);
  });
  const dailyCounts = days.map((d) => data.results.filter((r) => r.day === d).length);
  const max = Math.max(1, ...dailyCounts);
  const patterns = Object.entries(
    data.mistakes.reduce<Record<string, number>>((acc, m) => {
      acc[m.pattern] = (acc[m.pattern] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  return (
    <>
      <Heading
        eyebrow="EVIDENCE, NOT JUST NUMBERS"
        title="What is changing."
        description="Your recorded practice, your answers, and the questions still open."
      >
        <DownloadLink className="button secondary" endpoint="export">
          <Download size={16} />
          Export my data{' '}
        </DownloadLink>
      </Heading>
      <MomentumChart data={data} />
      <div className="evidence-banner">
        <TrendingUp size={20} />
        <p>
          {data.results.length
            ? `You completed ${data.results.length} activities on ${new Set(data.results.map((r) => r.day)).size} days. This shows consistency, not a confirmed change in CEFR level.`
            : 'Your progress starts with evidence. Complete the assessment and your first activity to build a starting point.'}
        </p>
      </div>
      <div className="skills-grid">
        {counts.map(({ skill, results }) => {
          const evaluated = data.evaluations.find((e) => e.skill === skill);
          const scored = results.filter((r) => r.total !== null && r.correct !== null);
          const total = scored.reduce((n, r) => n + r.total!, 0),
            correct = scored.reduce((n, r) => n + r.correct!, 0);
          const precision = total ? Math.round((correct / total) * 100) : null;
          return (
            <section className="card skill-card" key={skill}>
              <div className="card-kicker">
                {labels[skill]}
                <span className="tag">{evaluated ? 'Confianza baja' : 'Not assessed'}</span>
              </div>
              <h2>
                {evaluated?.level?.replace(' orientativo', '') || '—'}
                <span>
                  {evaluated ? 'Referencia inicial orientativa' : 'An assessment is needed'}
                </span>
              </h2>
              <div className="skill-numbers">
                <div>
                  <strong>{results.length}</strong>
                  <span>Activities</span>
                </div>
                <div>
                  <strong>{precision === null ? '—' : `${precision}%`}</strong>
                  <span>
                    {skill === 'vocabulary' ? 'Review & game results' : 'Practice accuracy'}
                  </span>
                </div>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${precision || 0}%` }} />
              </div>
              <p className="fine-print">
                {total
                  ? `${correct}/${total} answers${skill === 'vocabulary' ? ' (self-rated reviews and scored games)' : ' in activities'}; it is not a CEFR level.`
                  : skill === 'writing'
                    ? 'Writing is saved without an automatic score.'
                    : skill === 'speaking' || skill === 'listening'
                      ? 'Assessment and integration are planned for a later phase.'
                      : 'No activity answers yet.'}
                {evaluated && ` Assessment: ${evaluated.correct}/${evaluated.total} items.`}
              </p>
            </section>
          );
        })}
      </div>
      <div className="analytics-grid">
        <section className="card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LAST 14 DAYS</span>
              <h2>Make room for English</h2>
            </div>
            <span className="muted">Completed activities</span>
          </div>
          <div
            className="bar-chart"
            role="img"
            aria-label={`Activities per day: ${days.map((d, i) => `${d}: ${dailyCounts[i]}`).join(', ')}`}
          >
            {days.map((day, i) => (
              <div key={day} className="bar-column">
                <span className="bar-number">{dailyCounts[i] || ''}</span>
                <div className="bar-track">
                  <div
                    className={`bar ${day === data.day ? 'today' : ''}`}
                    style={{ height: `${(dailyCounts[i] / max) * 100}%` }}
                    title={`${dateLabel(day)}: ${dailyCounts[i]} actividades`}
                  />
                </div>
                <span>{day.slice(8)}</span>
              </div>
            ))}
          </div>
          <p className="fine-print">Days without records are empty. No simulated data is shown. </p>
        </section>
        <section className="card">
          <span className="eyebrow">TU PRÓXIMO FOCO</span>
          <h2>Patterns to revisit</h2>
          {patterns.length ? (
            patterns.map(([pattern, count]) => {
              const m = data.mistakes.find((m) => m.pattern === pattern)!;
              return (
                <div className="pattern-row" key={pattern}>
                  <div>
                    <Correction
                      explanation={
                        m.correction_id ? m.explanation : questionFeedback(m.pattern).explanation
                      }
                      correction={m.corrected}
                    />
                  </div>
                  <span className="tag">
                    {count} registro{count !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="muted">
              Exercise mistakes and AI suggestions appear here. Naturalness suggestions are not
              necessarily errors.{' '}
            </p>
          )}
        </section>
      </div>
      <section className="card correction-history">
        <div className="section-heading">
          <h2>Your feedback history</h2>
          <span className="muted">{data.corrections.length} texts reviewed</span>
        </div>
        {data.corrections.length ? (
          data.corrections.map((c) => (
            <details key={c.id}>
              <summary>
                {dateLabel(localDay(new Date(c.created_at)))} · {c.original.slice(0, 85)}…
              </summary>
              <p>{c.feedback}</p>
              <p lang="en">
                <strong>Original:</strong> {c.original}
              </p>
              <blockquote lang="en">{c.revised}</blockquote>
              {data.mistakes
                .filter((m) => m.correction_id === c.id)
                .map((m) => (
                  <p key={m.id}>{m.explanation}</p>
                ))}
              <span className="fine-print">
                Feedback generated by {c.model}. It may need review.{' '}
              </span>
            </details>
          ))
        ) : (
          <p className="muted">You have not requested AI feedback yet.</p>
        )}
      </section>
    </>
  );
}
export function Calendar({ data }: { data: Snapshot }) {
  const [month, setMonth] = useState(data.day.slice(0, 7)),
    [selected, setSelected] = useState(data.day);
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
  const mins = (items: typeof sessions) =>
    (items.reduce((n, s) => n + s.active_seconds, 0) / 60).toFixed(1);
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
            {mins(weekSessions)}
            <small>min</small>
          </strong>
        </div>
        <div className="card stat">
          <span>Selected month</span>
          <strong>
            {mins(monthSessions)}
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
                data.reviews.filter((r) => r.day === date).length;
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
          <p className="fine-print">● Day with activities or reviews · Buenos Aires time zone.</p>
        </section>
        <section className="card day-detail">
          <span className="eyebrow">{dateLabel(selected).toUpperCase()}</span>
          <h2>{completed.length ? 'A day to remember.' : 'Your day, in detail.'}</h2>
          <div className="day-summary">
            <span>{mins(sessions)} recorded min</span>
            <span>{completed.length} actividades</span>
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
          {!completed.length && !sessions.length && !words.length && !reviews.length && (
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
