'use client';
import { DailyGuide } from './daily-guide';
import { EntryPhrase } from './entry-phrase';
import { courseRoute, levelLessons, passedLesson, learningJourney } from '@/lib/course-route';
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
  Feather,
  Languages,
  CalendarDays,
} from 'lucide-react';
import type { Snapshot, Activity } from '@/lib/types';
import { localDay, skillNames } from '@/lib/learning';
import { Heading, Button, dateLabel } from './ui';
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
  const resume = data.resumeActivity || remaining;
  const diagnosed = Boolean(data.diagnostic.completed_at);
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
        <button
          className="quick-speaking"
          aria-label="Open classes"
          onClick={() => navigate('Classes')}
        >
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
      <LearningTip day={data.day} />
      <section className="card assessment-home">
        <div>
          <h2>{diagnosed ? 'Keep your next step close.' : 'Find your starting point.'}</h2>
          <p>
            {diagnosed
              ? 'Return to your saved practice whenever you are ready.'
              : 'An optional short assessment. Your learning path stays at its current level.'}
          </p>
        </div>
        <Button
          secondary
          onClick={() =>
            diagnosed ? (resume ? onStart(resume) : navigate('Progress')) : onDiagnostic()
          }
        >
          {diagnosed
            ? resume
              ? 'Continue my session'
              : 'See my progress'
            : 'Find my starting point'}
          <ArrowRight size={16} />
        </Button>
      </section>
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
