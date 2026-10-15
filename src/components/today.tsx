'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Clock3 } from 'lucide-react';
import { isPortuguese, studyStorage } from '@/lib/workspace';
import { readRoutineDraft } from '@/lib/browser/routine-draft';
import { readStudyDay, studyTaskDone, type StudyDay, type StudyTask } from '@/lib/daily-study';
import { studyBudgets, studyBudget, dailyBudgetKey } from '@/lib/study-recommendation';
import type { Snapshot } from '@/lib/types';
import { api, dateLabel } from './ui';
export function Today({
  data,
  onTask,
  navigate,
  refresh,
}: {
  data: Snapshot;
  onTask: (task: StudyTask) => void;
  navigate: (view: string) => void;
  refresh: () => Promise<void>;
}) {
  const pt = isPortuguese;
  const [agenda, setAgenda] = useState<StudyDay | undefined>(() => readStudyDay(data));
  const [paused, setPaused] = useState<ReturnType<typeof readRoutineDraft> | null>(null);
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function load(minutes: number) {
    setBusy(true);
    setError('');
    try {
      const draft = readRoutineDraft();
      const saved = await api<StudyDay>('study-day', {
        minutes,
        paused: draft
          ? { id: draft.id, mode: draft.mode, level: draft.level, block: draft.block }
          : null,
      });
      setAgenda(saved);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const saved = readStudyDay(data);
    if (saved) setAgenda(saved);
    else {
      let minutes = data.profile.daily_minutes;
      try {
        minutes = studyBudget(
          JSON.parse(studyStorage.getItem(dailyBudgetKey(data.day)) || 'null'),
          minutes,
        );
      } catch {}
      void load(minutes);
    }
  }, [data.day]);
  useEffect(() => {
    const saved = readStudyDay(data);
    if (saved) setAgenda(saved);
  }, [data]);
  useEffect(() => {
    const check = () => {
      try {
        setPaused(readRoutineDraft() || null);
      } catch {
        setPaused(null);
      }
    };
    check();
    window.addEventListener('english-os:routine-paused', check);
    return () => window.removeEventListener('english-os:routine-paused', check);
  }, [data]);
  const completed = agenda?.tasks.filter((t) => studyTaskDone(t, agenda, data)).length || 0;
  const remaining =
    agenda?.tasks
      .filter((t) => !studyTaskDone(t, agenda, data))
      .sort((a, b) => {
        const match = (t: StudyTask) =>
          t.action.kind === 'routine' &&
          t.action.mode === paused?.mode &&
          t.action.level === paused.level &&
          t.action.block === paused.block;
        return Number(match(b)) - Number(match(a));
      }) || [];
  const primary = remaining[0];
  const finished = !!agenda && remaining.length === 0;
  return (
    <div className="today-screen" data-no-word-help>
      <header className="today-head">
        <div>
          <h1>{pt ? 'Hoje' : 'Today'}</h1>
          <p>{dateLabel(data.day)}</p>
        </div>
        <label className="today-duration">
          <span>{pt ? 'Tempo de estudo' : 'Study time'}</span>
          <select
            aria-label={pt ? 'Tempo de estudo' : 'Study time'}
            disabled={busy}
            value={agenda?.minutes || data.profile.daily_minutes}
            onChange={(e) => void load(Number(e.target.value))}
          >
            {![15, 20, 30, 45].includes(agenda?.minutes || data.profile.daily_minutes) && (
              <option value={agenda?.minutes || data.profile.daily_minutes}>
                {agenda?.minutes || data.profile.daily_minutes} min
              </option>
            )}
            {studyBudgets.map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
        </label>
      </header>
      {error && (
        <p role="alert" className="error">
          {error}{' '}
          <button onClick={() => void load(data.profile.daily_minutes)}>
            {pt ? 'Tentar novamente' : 'Try again'}
          </button>
        </p>
      )}
      {!agenda ? (
        <div className="study-loading" role="status">
          {pt ? 'Preparando seu estudo…' : 'Preparing your study…'}
        </div>
      ) : finished ? (
        <section className="today-finished">
          <Check size={30} />
          <h2>{pt ? 'Você terminou por hoje.' : "You're done for today."}</h2>
          <div className="actions">
            <button className="button secondary" onClick={() => navigate('Practice')}>
              {pt ? 'Continuar praticando' : 'Keep practising'}
            </button>
            <button className="text-link" onClick={() => navigate('Progress')}>
              {pt ? 'Ver progresso' : 'View progress'}
            </button>
          </div>
        </section>
      ) : (
        <div className="today-workspace">
          <section
            className="today-focus"
            aria-label={pt ? 'Atividade principal' : 'Main activity'}
          >
            <div className="today-focus-meta">
              <span>{pt ? 'AGORA' : 'UP NEXT'}</span>
              <span>
                <Clock3 size={15} />
                {primary!.minutes} min
              </span>
            </div>
            <h2>{primary!.title}</h2>
            <p>{primary!.purpose}</p>
            <button
              className="button start-button"
              disabled={busy}
              onClick={() => onTask(primary!)}
            >
              {pt ? 'Começar' : 'Start'}
              <ArrowRight size={19} />
            </button>
          </section>
          {remaining.length > 1 && (
            <section className="today-next" aria-labelledby="next-title">
              <h2 id="next-title">{pt ? 'Depois' : 'Then'}</h2>
              {remaining.slice(1, 4).map((task, i) => (
                <button className="today-task" key={task.id} onClick={() => onTask(task)}>
                  <span className="task-number">{String(i + 2).padStart(2, '0')}</span>
                  <span>
                    <strong>{task.title}</strong>
                    <small>{task.minutes} min</small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}
            </section>
          )}
        </div>
      )}
      {agenda && (
        <p className="today-completion" role="status">
          {pt
            ? `${completed} de ${agenda.tasks.length} atividades concluídas`
            : `${completed} of ${agenda.tasks.length} activities completed`}
        </p>
      )}
    </div>
  );
}
