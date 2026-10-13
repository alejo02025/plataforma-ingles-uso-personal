'use client';
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Clock3,
  Feather,
  Languages,
  MoveUpRight,
  CalendarDays,
} from 'lucide-react';
import type { Snapshot, Activity } from '@/lib/types';
import { localDay, skillNames } from '@/lib/learning';
import { Heading, Button, ArrowLink, dateLabel } from './ui';
export const activityIcons = {
  reading: BookOpen,
  grammar: Languages,
  vocabulary: Feather,
  writing: Feather,
};
export function ActivityList({
  data,
  onStart,
}: {
  data: Snapshot;
  onStart: (a: Activity) => void;
}) {
  const items = data.plan.activities.filter((a) => !a.payload.optional);
  return (
    <div className="activity-list">
      {items.map((a, index) => {
        const Icon = activityIcons[a.kind];
        return (
          <button
            key={a.id}
            className={`activity-row ${a.completed_at ? 'done' : ''}`}
            onClick={() => onStart(a)}
          >
            <span className={`activity-icon ${a.kind}`}>
              <Icon size={20} />
            </span>
            <div className="activity-copy">
              <span className="tiny-label">
                {String(index + 1).padStart(2, '0')} · {skillNames[a.kind]}
              </span>
              <h3>{a.title}</h3>
              <p>
                {a.completed_at
                  ? 'Completado · ver resultado'
                  : a.kind === 'reading'
                    ? 'Leé, descubrí palabras y conectá ideas.'
                    : a.kind === 'grammar'
                      ? 'Decisiones breves con explicación.'
                      : a.kind === 'vocabulary'
                        ? 'Recordá antes de mirar la respuesta.'
                        : 'Expresá una idea y guardá tu práctica.'}
              </p>
            </div>
            <span className="row-end">
              {a.completed_at ? (
                <Check size={18} />
              ) : (
                <>
                  <span>{a.minutes} min</span>
                  <ArrowUpRight size={18} />
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
export function Dashboard({
  data,
  onStart,
  navigate,
  onDiagnostic,
}: {
  data: Snapshot;
  onStart: (a: Activity) => void;
  navigate: (view: string) => void;
  onDiagnostic: () => void;
}) {
  const today = data.results.filter((r) => r.day === data.day);
  const todaySessions = data.sessions.filter((s) => localDay(new Date(s.started_at)) === data.day);
  const minutes = Math.round(todaySessions.reduce((n, s) => n + s.active_seconds, 0) / 6) / 10;
  const activeDays = new Set(data.results.map((r) => r.day).concat(data.reviews.map((r) => r.day)));
  const due = data.vocabulary.filter((w) => w.due_at <= new Date().toISOString()).length;
  const remaining = data.plan.activities.find((a) => !a.completed_at && !a.payload.optional);
  const resumeSession = [...data.sessions].reverse().find((s) => !s.ended_at);
  const resume = data.resumeActivity || remaining;
  const doc = data.documents.find((d) => d.id === remaining?.document_id) || data.documents[0];
  const diagnosed = Boolean(data.diagnostic.completed_at);
  const bands = [...new Set(data.evaluations.map((e) => e.level?.slice(0, 2)).filter(Boolean))];
  const currentLevel = bands.length ? bands.join(' / ') : 'Sin estimar';
  return (
    <>
      <Heading
        eyebrow="TU ESPACIO DE APRENDIZAJE"
        title={`Buen día, ${data.profile.name}.`}
        description="Un poco de inglés. Un mundo de posibilidades."
      >
        <span className="date-chip">
          <CalendarDays size={16} />
          {dateLabel(data.day)}
        </span>
      </Heading>
      <div className="dashboard-top">
        <section className="hero-card">
          <div className="hero-content">
            <span className="pill">
              <span className="status-dot" />
              {diagnosed ? 'TU RECORRIDO PERSONAL' : 'UN BUEN LUGAR PARA EMPEZAR'}
            </span>
            <h2>
              {diagnosed ? (
                <>
                  Tu próximo paso
                  <br />
                  ya está preparado.
                </>
              ) : (
                <>
                  El inglés que querés.
                  <br />
                  Un día a la vez.
                </>
              )}
            </h2>
            <p>
              {diagnosed
                ? data.plan.reason
                : 'Lecturas que te interesan, práctica con propósito y un plan que se adapta a vos.'}
            </p>
            <Button
              onClick={() =>
                diagnosed ? (resume ? onStart(resume) : navigate('Progreso')) : onDiagnostic()
              }
            >
              {diagnosed
                ? resumeSession
                  ? 'Continuar mi sesión'
                  : remaining
                    ? 'Empezar mi día'
                    : 'Ver mi progreso'
                : 'Conocer mi punto de partida'}
              <ArrowUpRight size={17} />
            </Button>
            <span className="hero-note">
              <Clock3 size={14} />
              {diagnosed
                ? `${data.plan.minutes} minutos a tu ritmo`
                : 'Diagnóstico breve · podés retomarlo'}
            </span>
          </div>
          <div className="orbit-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="orbit orbit-three" />
            <div className="orbit-center">
              <MoveUpRight size={55} strokeWidth={1} />
            </div>
            <span className="orbit-label">
              small steps,
              <br />
              real progress.
            </span>
          </div>
        </section>
        <section className="card level-card">
          <div className="card-kicker">
            TU PUNTO DE PARTIDA
            <ArrowUpRight size={17} />
          </div>
          <div className="level-value">
            {diagnosed ? currentLevel : 'Por descubrir'}
            <span>
              {diagnosed ? 'Referencia orientativa' : 'Vamos a construir tu línea de base'}
            </span>
          </div>
          <div className="level-track">
            <span />
          </div>
          <div className="level-scale">
            <span>Inicio</span>
            <span>Objetivo B2</span>
          </div>
          <p>
            {diagnosed
              ? 'Estimaciones por competencia, con confianza baja. Tu objetivo B2 necesita evaluaciones más amplias.'
              : 'Tu nivel estimado A2/B1 es una hipótesis inicial. Todavía no hay una evaluación.'}
          </p>
          <ArrowLink onClick={() => (diagnosed ? navigate('Progreso') : onDiagnostic())}>
            {diagnosed ? 'Ver evidencia por habilidad' : 'Hacer diagnóstico'}
          </ArrowLink>
        </section>
      </div>
      <div className="stats-grid">
        <Stat value={String(today.length)} label="Actividades hoy" note="Práctica completada" />
        <Stat
          value={`${minutes}`}
          suffix="min"
          label="Tiempo de hoy"
          note="Tiempo activo registrado"
        />
        <Stat value={String(activeDays.size)} label="Días de práctica" note="Tu continuidad real" />
        <Stat
          value={String(due)}
          label="Palabras para repasar"
          note={`${data.vocabulary.length} en tu biblioteca`}
        />
      </div>
      <div className="dashboard-bottom">
        <section className="card daily-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PASO A PASO</span>
              <h2>Tu inglés de hoy</h2>
            </div>
            <span className="muted">{data.plan.minutes} min</span>
          </div>
          <ActivityList data={data} onStart={onStart} />
          <div className="card-footer">
            <span className="status-dot" />
            {data.plan.reason}
          </div>
        </section>
        <div className="right-stack">
          <section className="card reading-recommendation">
            <div className="card-kicker">
              UNA LECTURA PARA VOS
              <BookOpen size={18} />
            </div>
            <div
              className={`book-art ${doc.topic === 'Finanzas' ? 'gold' : ''}`}
              aria-hidden="true"
            >
              <span>FIELD NOTES</span>
              <div className="book-line" />
              <BookOpen size={45} strokeWidth={1} />
              <small>{doc.topic.toUpperCase()}</small>
            </div>
            <div className="reading-meta">
              {doc.topic}
              <span>·</span>
              {doc.level}
              <span>·</span>
              {doc.minutes} min
            </div>
            <h3>{doc.title}</h3>
            <p>{doc.intro}</p>
            <ArrowLink onClick={() => navigate('Biblioteca')}>Explorar la biblioteca</ArrowLink>
          </section>
          <section className="card quiet-card">
            <span className="eyebrow">UNA IDEA PARA HOY</span>
            <p>“You don’t have to see the whole staircase. Just take the first step.”</p>
            <span className="muted">Lo importante es volver.</span>
          </section>
        </div>
      </div>
    </>
  );
}
function Stat({
  value,
  suffix,
  label,
  note,
}: {
  value: string;
  suffix?: string;
  label: string;
  note: string;
}) {
  return (
    <div className="card stat">
      <span>{label}</span>
      <strong>
        {value}
        <small>{suffix}</small>
      </strong>
      <p>{note}</p>
    </div>
  );
}
