'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, TrendingUp } from 'lucide-react';
import type { Snapshot } from '@/lib/types';
import type { Skill } from '@/lib/content';
import { localDay, skillNames } from '@/lib/learning';
import { Heading, Empty, dateLabel } from './ui';
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
        eyebrow="EVIDENCIA, NO SOLO NÚMEROS"
        title="Lo que está cambiando."
        description="Tu práctica registrada, tus aciertos y las preguntas que siguen abiertas."
      >
        <a className="button secondary" href="/api/export">
          <Download size={16} />
          Exportar mis datos
        </a>
      </Heading>
      <div className="evidence-banner">
        <TrendingUp size={20} />
        <p>
          {data.results.length
            ? `Completaste ${data.results.length} actividades en ${new Set(data.results.map((r) => r.day)).size} días. Esto muestra continuidad; todavía no demuestra un cambio de nivel MCER.`
            : 'Tu progreso empieza con evidencia. Completá el diagnóstico y tu primera actividad para construir una línea de base.'}
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
                <span className="tag">{evaluated ? 'Confianza baja' : 'Sin estimar'}</span>
              </div>
              <h2>
                {evaluated?.level?.replace(' orientativo', '') || '—'}
                <span>
                  {evaluated ? 'Referencia inicial orientativa' : 'Necesitamos una evaluación'}
                </span>
              </h2>
              <div className="skill-numbers">
                <div>
                  <strong>{results.length}</strong>
                  <span>Actividades</span>
                </div>
                <div>
                  <strong>{precision === null ? '—' : `${precision}%`}</strong>
                  <span>
                    {skill === 'vocabulary' ? 'Recuerdo declarado' : 'Precisión en práctica'}
                  </span>
                </div>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${precision || 0}%` }} />
              </div>
              <p className="fine-print">
                {total
                  ? `${correct}/${total} respuestas${skill === 'vocabulary' ? ' autorreportadas' : ' en actividades'}; no equivale a un nivel MCER.`
                  : skill === 'writing'
                    ? 'La escritura se conserva sin una nota automática.'
                    : skill === 'speaking' || skill === 'listening'
                      ? 'Evaluación e integración previstas en fase 2.'
                      : 'Todavía no hay respuestas en actividades.'}
                {evaluated && ` Diagnóstico: ${evaluated.correct}/${evaluated.total} ítems.`}
              </p>
            </section>
          );
        })}
      </div>
      <div className="analytics-grid">
        <section className="card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ÚLTIMOS 14 DÍAS</span>
              <h2>Hacer espacio para el inglés</h2>
            </div>
            <span className="muted">Actividades completadas</span>
          </div>
          <div
            className="bar-chart"
            role="img"
            aria-label={`Actividades por día: ${days.map((d, i) => `${d}: ${dailyCounts[i]}`).join(', ')}`}
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
          <p className="fine-print">
            Los días sin registros se muestran vacíos. No son datos simulados.
          </p>
        </section>
        <section className="card">
          <span className="eyebrow">TU PRÓXIMO FOCO</span>
          <h2>Patrones para volver a mirar</h2>
          {patterns.length ? (
            patterns.map(([pattern, count]) => {
              const m = data.mistakes.find((m) => m.pattern === pattern)!;
              return (
                <div className="pattern-row" key={pattern}>
                  <div>
                    <strong>{m.explanation}</strong>
                    <p lang="en">
                      {m.original} → {m.corrected}
                    </p>
                  </div>
                  <span className="tag">
                    {count} registro{count !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="muted">
              Los errores detectados en ejercicios y las sugerencias de IA aparecerán acá. Las
              sugerencias de naturalidad no implican necesariamente un error.
            </p>
          )}
        </section>
      </div>
      <section className="card correction-history">
        <div className="section-heading">
          <h2>Tu historial de devoluciones</h2>
          <span className="muted">{data.corrections.length} textos revisados</span>
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
                Devolución generada por {c.model}. Puede requerir revisión.
              </span>
            </details>
          ))
        ) : (
          <p className="muted">Todavía no solicitaste una devolución por IA.</p>
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
        eyebrow="CADA DÍA DEJA UNA HUELLA"
        title="Tu calendario."
        description="Un registro automático de lo que hiciste. Sin cargar nada a mano."
      />
      <div className="calendar-stats">
        <div className="card stat">
          <span>Últimos 7 días</span>
          <strong>
            {mins(weekSessions)}
            <small>min</small>
          </strong>
        </div>
        <div className="card stat">
          <span>Mes seleccionado</span>
          <strong>
            {mins(monthSessions)}
            <small>min</small>
          </strong>
        </div>
        <div className="card stat">
          <span>Actividades este mes</span>
          <strong>{data.results.filter((r) => r.day.startsWith(month)).length}</strong>
        </div>
      </div>
      <div className="calendar-layout">
        <section className="card calendar-card">
          <div className="section-heading">
            <h2>
              {new Intl.DateTimeFormat('es-AR', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC',
              }).format(first)}
            </h2>
            <div className="button-row">
              <button className="icon-button" aria-label="Mes anterior" onClick={() => move(-1)}>
                <ChevronLeft size={20} />
              </button>
              <button className="icon-button" aria-label="Mes siguiente" onClick={() => move(1)}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
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
                  aria-label={`${dateLabel(date)}: ${count} registros`}
                >
                  <span>{i + 1}</span>
                  {count > 0 && <span className="day-dot" />}
                </button>
              );
            })}
          </div>
          <p className="fine-print">● Día con actividades o repasos · Horario de Buenos Aires.</p>
        </section>
        <section className="card day-detail">
          <span className="eyebrow">{dateLabel(selected).toUpperCase()}</span>
          <h2>{completed.length ? 'Un día para recordar.' : 'Tu día, en detalle.'}</h2>
          <div className="day-summary">
            <span>{mins(sessions)} min registrados</span>
            <span>{completed.length} actividades</span>
          </div>
          {completed.map((r) => (
            <div className="day-event" key={r.id}>
              <span className="status-dot" />
              <div>
                <h3>{r.title}</h3>
                <p>
                  {skillNames[r.skill as Skill]}
                  {r.total !== null ? ` · ${r.correct}/${r.total} respuestas` : ' · Sin puntuación'}
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
                  <p>Pendiente · sesión iniciada</p>
                </div>
              </div>
            ))}
          {words.length > 0 && (
            <p>
              <strong>{words.length} palabras nuevas:</strong> {words.map((w) => w.word).join(', ')}
            </p>
          )}
          {reviews.length > 0 && (
            <p>
              <strong>{reviews.length} repasos:</strong> {reviews.filter((r) => r.known).length}{' '}
              recordados según tu valoración.
            </p>
          )}
          {mistakes.length > 0 && (
            <p>
              <strong>{mistakes.length} errores o sugerencias registrados.</strong> Mirá las
              explicaciones en Progreso.
            </p>
          )}
          {!completed.length && !sessions.length && !words.length && !reviews.length && (
            <Empty
              title="Todavía no hay registros."
              detail="Cuando practiques, tus actividades aparecerán acá automáticamente."
            />
          )}
        </section>
      </div>
    </>
  );
}
