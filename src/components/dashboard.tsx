'use client';
import { DailyGuide } from './daily-guide';
import { useEffect, useState } from 'react';
import { greetingForHour } from '@/lib/momentum';
import { ArrowUpRight, BookOpen, Check, Feather, Languages, CalendarDays } from 'lucide-react';
import type { Snapshot, Activity } from '@/lib/types';
import { skillNames } from '@/lib/learning';
import { Heading, dateLabel } from './ui';
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
  const [greeting, setGreeting] = useState('Hello');
  useEffect(() => {
    const update = () => setGreeting(greetingForHour(new Date().getHours()));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);
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
      <div className="home-small-links">
        <button className="text-link" onClick={() => navigate('Classes')}>
          Open classes
        </button>
        <button className="text-link" onClick={onDiagnostic}>
          Find my starting point
        </button>
      </div>
    </>
  );
}
