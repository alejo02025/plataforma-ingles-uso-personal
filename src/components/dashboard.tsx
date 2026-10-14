'use client';
import { DailyGuide } from './daily-guide';
import { EntryPhrase } from './entry-phrase';
import { courseRoute, levelLessons, passedLesson, learningJourney } from '@/lib/course-route';
import { isPortuguese } from '@/lib/workspace';
import { LearningTip } from './learning-tip';
import { Puzzle, Bookmark, Compass } from 'lucide-react';
import { StudySpaces } from './study-spaces';
import { useEffect, useState } from 'react';
import { greetingForHour } from '@/lib/momentum';
import { MomentumChart } from './momentum-chart';
import {
  ArrowUpRight,
  ArrowRight,
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
                  ? 'Completed · view result'
                  : a.kind === 'reading'
                    ? 'Read, discover words, and connect ideas.'
                    : a.kind === 'grammar'
                      ? 'Short decisions with an explanation.'
                      : a.kind === 'vocabulary'
                        ? 'Try to recall before looking at the answer.'
                        : 'Express an idea and save your practice.'}
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
  onRead,
  onClass,
  onGame,
}: {
  data: Snapshot;
  onStart: (a: Activity) => void;
  navigate: (view: string) => void;
  onDiagnostic: () => void;
  onRead: (doc: import('@/lib/types').Document) => void;
  onClass: (id: string) => void;
  onGame: (seed: string) => void;
}) {
  const route = courseRoute(data),
    journey = learningJourney(data);
  const courseItems = levelLessons(route.level);
  const classCount = courseItems.filter((l) => passedLesson(data, l.id)).length;
  const [greeting, setGreeting] = useState('Hello');
  useEffect(() => {
    const update = () => setGreeting(greetingForHour(new Date().getHours()));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);
  const today = data.results.filter((r) => r.day === data.day);
  const todaySessions = data.sessions.filter((s) => localDay(new Date(s.started_at)) === data.day);
  const minutes = Math.round(todaySessions.reduce((n, s) => n + s.active_seconds, 0) / 6) / 10;
  const activeDays = new Set(
    data.results
      .map((r) => r.day)
      .concat(
        data.reviews.map((r) => r.day),
        data.tutorAttempts.map((attempt) => localDay(new Date(attempt.created_at))),
      ),
  );
  const due = data.vocabulary.filter((w) => w.due_at <= new Date().toISOString()).length;
  const remaining = data.plan.activities.find((a) => !a.completed_at && !a.payload.optional);
  const resumeSession = [...data.sessions].reverse().find((s) => !s.ended_at);
  const resume = data.resumeActivity || remaining;
  const doc = data.documents.find((d) => d.id === remaining?.document_id) || data.documents[0];
  const diagnosed = Boolean(data.diagnostic.completed_at);
  const bands = [...new Set(data.evaluations.map((e) => e.level?.slice(0, 2)).filter(Boolean))];
  const currentLevel = bands.length ? bands.join(' / ') : 'Not assessed';
  return (
    <>
      <Heading
        eyebrow="YOUR DAILY ENGLISH EDITION"
        title={`${greeting}, ${data.profile.name}.`}
        description="Make yourself a little more at home in English."
      >
        <span className="date-chip">
          <CalendarDays size={16} />
          {dateLabel(data.day)}
        </span>
      </Heading>
      <DailyGuide
        data={data}
        onRead={onRead}
        onStart={onStart}
        onClass={onClass}
        onGame={onGame}
        navigate={navigate}
      />
      <section className="card course-dashboard">
        <span className="eyebrow">YOUR LEARNING PATH</span>
        <h2>
          {route.level} · {classCount} / {courseItems.length}
        </h2>
        <p>
          Classes, reading, games, review and conversation. Your practice moves one journey forward.
        </p>
        <progress max={courseItems.length} value={classCount} aria-label="Learning path classes" />
        {(data.backlog || []).length > 0 && (
          <p lang="es">
            Tenés una lectura pendiente. Podés retomarla desde Classes sin perder el borrador.
          </p>
        )}
        {journey.next && (
          <p className="journey-next" lang="es">
            {journey.next.explanation}
          </p>
        )}
        <Button secondary onClick={() => navigate('Classes')}>
          Continue my learning path <ArrowRight size={16} />
        </Button>
      </section>
      <EntryPhrase />
      <StudySpaces compact />

      <section className="pdf-home-hero">
        <div>
          <span className="eyebrow">YOUR READING CORNER</span>
          <h2>Your PDFs. Your stories.</h2>
          <p>Add a PDF. Discover words. Talk about what you read.</p>
          <Button onClick={() => navigate('PDF Studio')}>
            Open PDF Studio <ArrowUpRight size={18} />
          </Button>
        </div>
        <div className="pdf-hero-art" aria-hidden="true">
          <div className="pdf-hero-sheet">
            <BookOpen size={38} />
            <strong>Read it. Make it yours.</strong>
            <i />
            <i />
            <i />
          </div>
          <span className="pdf-hero-note">
            <Languages size={20} />
            Good reads, new words.
          </span>
          <span className="pdf-hero-spark">✦</span>
        </div>
      </section>
      <section className="quick-sections" aria-label="Quick practice">
        <button className="quick-play" onClick={() => navigate('Games')}>
          <Puzzle size={25} />
          <strong>Games</strong>
          <span>Play a little</span>
        </button>
        <button className="quick-review" onClick={() => navigate('Vocabulary')}>
          <Bookmark size={25} />
          <strong>Review</strong>
          <span>Keep your words</span>
        </button>
        <button className="quick-speaking" onClick={() => navigate('Classes')}>
          <BookOpen size={25} />
          <strong>Learning path</strong>
          <span>Follow your next step</span>
        </button>
        <button className="quick-plan" onClick={() => navigate('My Day')}>
          <Compass size={25} />
          <strong>My Day</strong>
          <span>One step at a time</span>
        </button>
      </section>
      <section className="classes-home card">
        <div className="classes-home-icon">
          <BookOpen size={28} />
        </div>
        <div>
          <span className="eyebrow">YOUR CLASSROOM</span>
          <h2>Learn it. Use it.</h2>
          <p>Clear explanations, everyday examples, and a little practice.</p>
        </div>
        <Button onClick={() => navigate('Classes')}>
          Open classes <ArrowRight size={16} />
        </Button>
      </section>
      <LearningTip day={data.day} />
      {isPortuguese && (
        <section className="cefr-home card">
          <div>
            <span className="eyebrow">MCER / QECR · SEU PERCURSO</span>
            <h2>{data.cefr?.level || 'A1'} · Um passo de cada vez</h2>
            <p>
              Pratique leitura, gramática, escrita e fala. Comece pelo básico e experimente os
              próximos níveis.
            </p>
          </div>
          <Button onClick={() => navigate('MCER')}>
            Continuar meu percurso <ArrowUpRight size={18} />
          </Button>
        </section>
      )}
      <div className="dashboard-top">
        <section className="hero-card">
          <div className="hero-content">
            <span className="pill">
              <span className="status-dot" />
              {diagnosed ? 'YOUR PERSONAL JOURNEY' : 'A GOOD PLACE TO START'}
            </span>
            <h2>
              {diagnosed ? (
                <>
                  Your next step <br />
                  is ready for you.{' '}
                </>
              ) : (
                <>
                  The English you want. <br />
                  One day at a time.{' '}
                </>
              )}
            </h2>
            <p>
              {diagnosed
                ? data.plan.reason
                : 'Interesting readings, purposeful practice, and a plan that adapts to you.'}
            </p>
            <Button
              onClick={() =>
                diagnosed ? (resume ? onStart(resume) : navigate('Progress')) : onDiagnostic()
              }
            >
              {diagnosed
                ? resumeSession
                  ? 'Continue my session'
                  : remaining
                    ? 'Start my day'
                    : 'See my progress'
                : 'Find my starting point'}
              <ArrowUpRight size={17} />
            </Button>
            <span className="hero-note">
              <Clock3 size={14} />
              {diagnosed
                ? `${data.plan.minutes} minutes at your pace`
                : 'A short assessment · pause and resume'}
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
        {isPortuguese ? (
          <section className="card level-card">
            <span className="eyebrow">SEU NÍVEL DE ESTUDO</span>
            <h2>{data.cefr?.level || 'A1'}</h2>
            <p>Ponto de partida informado por você. A1 → A2 → B1 → B2 → C1 → C2.</p>
            <ArrowLink onClick={() => navigate('MCER')}>Ver meu percurso MCER</ArrowLink>
          </section>
        ) : (
          <section className="card level-card">
            <div className="card-kicker">
              YOUR STARTING POINT <ArrowUpRight size={17} />
            </div>
            <div className="level-value">
              {diagnosed ? currentLevel : 'Ready to discover'}
              <span>{diagnosed ? 'An informal reference' : 'Let’s build your starting point'}</span>
            </div>
            <div className="level-track">
              <span />
            </div>
            <div className="level-scale">
              <span>Home</span>
              <span>Goal: B2</span>
            </div>
            <p>
              {diagnosed
                ? 'Skill estimates have low confidence. Your B2 goal needs broader assessments.'
                : 'A2/B1 is an initial assumption. You have not completed an assessment yet.'}
            </p>
            <ArrowLink onClick={() => (diagnosed ? navigate('Progress') : onDiagnostic())}>
              {diagnosed ? 'See evidence by skill' : 'Take the assessment'}
            </ArrowLink>
          </section>
        )}
      </div>
      <div className="stats-grid">
        <Stat value={String(today.length)} label="Activities today" note="Completed practice" />
        <Stat value={`${minutes}`} suffix="min" label="Time today" note="Recorded active time" />
        <Stat
          value={String(activeDays.size)}
          label="Days of practice"
          note="Your actual consistency"
        />
        <Stat
          value={String(due)}
          label="Words to review"
          note={`${data.vocabulary.length} in your library`}
        />
      </div>
      <MomentumChart data={data} compact />
      <div className="dashboard-bottom">
        <section className="card daily-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">STEP BY STEP</span>
              <h2>Your English today</h2>
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
              A READING FOR YOU <BookOpen size={18} />
            </div>
            <div className={`book-art ${doc.topic === 'Finance' ? 'gold' : ''}`} aria-hidden="true">
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
            <ArrowLink onClick={() => navigate('Library')}>Explore the library</ArrowLink>
          </section>
          <section className="card quiet-card">
            <span className="eyebrow">ONE IDEA FOR TODAY</span>
            <p>“You don’t have to see the whole staircase. Just take the first step.”</p>
            <span className="muted">What matters is coming back.</span>
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
