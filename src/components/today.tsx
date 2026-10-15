'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Clock3 } from 'lucide-react';
import { spanishCopy } from '@/lib/study-copy';
import { isPortuguese, studyStorage } from '@/lib/workspace';
import { readRoutineDraft } from '@/lib/browser/routine-draft';
import { readStudyDay, studyTaskDone, type StudyDay, type StudyTask } from '@/lib/daily-study';
import { studyBudgets, studyBudget, dailyBudgetKey } from '@/lib/study-recommendation';
import type { Snapshot } from '@/lib/types';
import { api, dateLabel } from './ui';
/** Spanish is an intentionally authored learning aid, not a translation of user files. */
function spanishTaskHelp(task: StudyTask): string {
  const source = task.purpose;
  if (/continue where you stopped|continue de onde parou/i.test(source))
    return 'Retomá la actividad pendiente. Tus respuestas anteriores se conservaron.';
  if (/needs reinforcement|precisa de reforço|revisit a point|reveja um ponto/i.test(source))
    return 'Repasá el punto que necesitás reforzar antes de avanzar.';
  if (task.action.kind === 'class')
    return 'Aprendé una estructura, mirá ejemplos y usala en una situación real.';
  if (task.action.kind === 'review')
    return 'Recordá las palabras sin mirar la respuesta y después comprobá.';
  if (task.action.kind === 'activity')
    return 'Leé, comprendé y respondé las preguntas de esta actividad.';
  return {
    vocabulary: 'Recordá palabras útiles y practicá cómo usarlas en una oración.',
    grammar: 'Observá cómo se forma la oración y después construí la tuya.',
    reading: 'Leé una situación cotidiana y buscá la información importante.',
    writing: 'Escribí tus propias oraciones con las estructuras que aprendiste.',
  }[task.action.mode];
}
function taskEmoji(task: StudyTask): string {
  if (task.action.kind === 'class') return '📘';
  if (task.action.kind === 'review') return '🧠';
  if (task.action.kind === 'activity') return '📖';
  return { vocabulary: '🗣️', grammar: '🧩', reading: '📚', writing: '✍️' }[task.action.mode];
}

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
      let draft: ReturnType<typeof readRoutineDraft>;
      try {
        draft = readRoutineDraft();
      } catch {}
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
  const total = agenda?.tasks.length || 0;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="today-screen" data-no-word-help>
      <header className="today-head">
        <div>
          <h1>{pt ? 'Hoje' : 'Today'} <span className="today-title-spark" aria-hidden="true">✳</span></h1>
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
      {agenda && (
        <div className="today-journey-progress" aria-label={pt ? 'Progresso do dia' : 'Daily progress'}>
          <div className="today-journey-copy">
            <span>{pt ? 'Seu ritmo de hoje' : "Today's progress"}</span>
            <strong>{completed}/{total} <span lang="es">completadas</span></strong>
          </div>
          <div className="today-journey-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed} aria-label={pt ? 'Atividades concluídas' : 'Completed activities'}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
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
          <span className="finished-emoji" aria-hidden="true">🎉</span>
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
            <span className="today-primary-art" aria-hidden="true">{taskEmoji(primary!)}</span>
            <h2>{primary!.title}</h2>
            <p lang={pt ? 'pt-BR' : 'en'}>{primary!.purpose}</p>
            <p className="today-primary-spanish" lang="es">{spanishCopy(primary!.purpose) || spanishTaskHelp(primary!)}</p>
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
              <h2 id="next-title">{pt ? 'Depois' : 'Then'} <span aria-hidden="true">✨</span></h2>
              <p className="today-next-subtitle" lang="es">Después de esta actividad, seguí con:</p>
              {remaining.slice(1, 4).map((task, i) => (
                <button className="today-task" key={task.id} onClick={() => onTask(task)}>
                  <span className="task-number" aria-hidden="true">{taskEmoji(task)}</span>
                  <span>
                    <strong>{task.title}</strong>
                    <small>{task.minutes} min</small>
                    <small className="task-spanish" lang="es">{spanishCopy(task.purpose) || spanishTaskHelp(task)}</small>
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
