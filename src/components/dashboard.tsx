'use client';
import { StudyCopy } from './study-copy';
import { HomeRoutine } from './home-routine';
import { DailyRewards } from './daily-rewards';
import { FirstSteps } from './first-steps';
import { studyStorage } from '@/lib/workspace';
import { readRoutineDraft, type RoutineDraft } from '@/lib/browser/routine-draft';
import { isPortuguese } from '@/lib/workspace';
import { learningJourney } from '@/lib/course-route';
import {
  dailyBudgetKey,
  studyBudget,
  studyBudgets,
  studyRecommendation,
} from '@/lib/study-recommendation';
import { evidenceSummary } from '@/lib/evidence-summary';
import { placementSummary } from '@/lib/placement';
import { oralTask } from '@/lib/oral-practice';
import { DailyGuide } from './daily-guide';
import { useEffect, useState } from 'react';
import { greetingForHour } from '@/lib/momentum';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Feather,
  Languages,
  CalendarDays,
  Clock3,
  FileText,
  Target,
  Headphones,
  ChevronRight,
} from 'lucide-react';
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
  onClass,
  onRoutine,
}: {
  data: Snapshot;
  onStart: (a: Activity) => void;
  navigate: (view: string) => void;
  onDiagnostic: () => void;
  onClass: (id: string) => void;
  onRoutine: (mode: 'vocabulary' | 'grammar' | 'reading' | 'writing') => void;
  onRead?: (doc: import('@/lib/types').Document) => void;
  onGame?: (seed: string) => void;
  refresh?: () => Promise<void>;
}) {
  const pt = isPortuguese;
  const [minutes, setMinutes] = useState<number | null>(null);
  const [savingError, setSavingError] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(studyStorage.getItem(dailyBudgetKey(data.day)) || 'null');
      setMinutes(studyBudget(stored, data.profile.daily_minutes));
      setSavingError(false);
    } catch {
      setMinutes(studyBudget(data.profile.daily_minutes));
      setSavingError(true);
    }
  }, [data.day, data.profile.daily_minutes]);
  const budget = minutes ?? studyBudget(data.profile.daily_minutes);
  const journey = learningJourney(data);
  const [pausedRoutine, setPausedRoutine] = useState<RoutineDraft | null>(null);
  useEffect(() => {
    const check = () => {
      try {
        setPausedRoutine(readRoutineDraft({ level: journey.level, block: journey.block }) || null);
      } catch {
        setPausedRoutine(null);
      }
    };
    check();
    window.addEventListener('english-os:routine-paused', check);
    return () => window.removeEventListener('english-os:routine-paused', check);
  }, [data, journey.level, journey.block]);
  const suggestion = studyRecommendation(data, budget, pausedRoutine);
  const allTasks = data.plan.activities.filter((a) => !a.payload.optional);
  const completed = allTasks.filter((a) => Boolean(a.completed_at)).length;
  const priorityActivityId = suggestion.action.kind === 'activity' ? suggestion.action.activity.id : '';
  const otherTasks = allTasks.filter((a) => a.id !== priorityActivityId).slice(0, budget >= 20 ? 2 : 0);
  const due = evidenceSummary(data).due;
  const currentLevel = learningJourney(data).level;
  function changeBudget(value: number) {
    setMinutes(value);
    try {
      studyStorage.setItem(dailyBudgetKey(data.day), JSON.stringify(value));
      setSavingError(false);
    } catch {
      setSavingError(true);
    }
  }
  function begin() {
    const action = suggestion.action;
    if (action.kind === 'activity') onStart(action.activity);
    else if (action.kind === 'class') onClass(action.id);
    else if (action.kind === 'review') navigate('Vocabulary');
    else onRoutine(action.mode);
  }
  return (
    <div className="today-screen" data-no-word-help>
      <header className="today-head">
        <div>
          <span className="today-overline">{pt ? 'MEU ESTUDO' : 'MY STUDY'}</span>
          <h1>{pt ? 'Hoje' : 'Today'}</h1>
          <p>{dateLabel(data.day)} <span aria-hidden="true">·</span> {pt ? 'Um passo de cada vez' : 'One step at a time'}</p>
        </div>
        <label className="today-duration">
          <span>{pt ? 'Tempo disponível' : 'Time available'}</span>
          <select value={budget} onChange={(event) => changeBudget(Number(event.target.value))}>
            {studyBudgets.map((m) => (
              <option value={m} key={m}>{m} min</option>
            ))}
          </select>
        </label>
      </header>
      {savingError && <p role="status" className="today-note">{pt ? 'O tempo escolhido não pôde ser guardado neste dispositivo.' : 'Your time choice could not be saved on this device.'}</p>}
      <section className="today-focus audit-continue" aria-label={pt ? 'Próximo passo' : 'Next step'}>
        <div className="today-focus-meta">
          <span>{pt ? 'PRÓXIMO PASSO' : 'UP NEXT'}</span>
          <span><Clock3 size={15} aria-hidden="true" /> {suggestion.sessionMinutes} min</span>
        </div>
        <h2>{suggestion.title}</h2>
        <p>{suggestion.reason}</p>
        <button className="button" onClick={begin}>
          {pt ? 'Começar' : 'Start'} <ArrowRight size={18} aria-hidden="true" />
        </button>
        {suggestion.partial && (
          <small>{pt ? 'Você pode pausar e continuar depois.' : 'You can pause and continue later.'}</small>
        )}
      </section>
      <section className="today-plan" aria-labelledby="today-plan-title">
        <div className="today-section-head">
          <h2 id="today-plan-title">{pt ? 'Seu plano de hoje' : "Today's plan"}</h2>
          <span>{completed} / {allTasks.length} {pt ? 'concluídas' : 'completed'}</span>
        </div>
        <div className="today-plan-list">
          {otherTasks.map((task) => {
            const Icon = activityIcons[task.kind];
            return (
              <button className="today-task" key={task.id} onClick={() => onStart(task)}>
                <span className={task.completed_at ? 'today-task-icon complete' : 'today-task-icon'}>
                  {task.completed_at ? <Check size={18}/> : <Icon size={18}/>}
                </span>
                <span className="today-task-text">
                  <strong>{task.title}</strong>
                  <small>{task.completed_at ? (pt ? 'Concluída · ver resultado' : 'Completed · view result') : `${task.minutes} min · ${task.kind === 'reading' ? (pt ? 'Leitura' : 'Reading') : task.kind === 'writing' ? (pt ? 'Escrita' : 'Writing') : task.kind === 'vocabulary' ? (pt ? 'Vocabulário' : 'Vocabulary') : (pt ? 'Gramática' : 'Grammar')}`}</small>
                </span>
                <ChevronRight size={18} className="today-task-arrow"/>
              </button>
            );
          })}
          {due > 0 && (
            <button className="today-task" onClick={() => navigate('Vocabulary')}>
              <span className="today-task-icon"><Feather size={18}/></span>
              <span className="today-task-text">
                <strong>{pt ? 'Revisar palavras' : 'Review words'}</strong>
                <small>{due} {pt ? 'palavras para revisar' : 'words due'}</small>
              </span>
              <ChevronRight size={18} className="today-task-arrow"/>
            </button>
          )}
          {budget >= 20 && (
            <button className="today-task" onClick={() => navigate('Oral practice')}>
              <span className="today-task-icon"><Headphones size={18}/></span>
              <span className="today-task-text">
                <strong>{pt ? 'Praticar a fala' : 'Speaking practice'}</strong>
                <small>{pt ? '3 min · fale com suas palavras' : '3 min · use your own words'}</small>
              </span>
              <ChevronRight size={18} className="today-task-arrow"/>
            </button>
          )}
          {otherTasks.length === 0 && due === 0 && budget < 20 && (
            <p className="today-note">{pt ? 'Por enquanto, concentre-se na atividade acima.' : 'For now, focus on the activity above.'}</p>
          )}
        </div>
      </section>
      <div className="today-foot">
        <button className="text-link" onClick={() => navigate('My Day')}>
          {pt ? 'Ver todas as atividades' : 'All activities'} <ArrowRight size={16}/>
        </button>
        <button className="text-link" onClick={() => navigate('Progress')}>
          {pt ? 'Meu progresso' : 'My progress'}
        </button>
      </div>
      {!data.diagnostic.completed_at && (
        <details className="today-first-check">
          <summary>{pt ? 'Ainda não fez o diagnóstico?' : 'New here? Take the level check'}</summary>
          <p>{pt ? 'É uma referência inicial, não uma certificação.' : 'This is a starting reference, not a qualification.'}</p>
          <button className="text-link" onClick={onDiagnostic}>{pt ? 'Fazer diagnóstico' : 'Take the level check'} <ArrowRight size={15}/></button>
        </details>
      )}
      <span className="today-path-caption">{pt ? 'Percurso atual' : 'Current course'}: {currentLevel}</span>
    </div>
  );
}
