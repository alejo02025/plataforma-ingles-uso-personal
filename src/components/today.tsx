'use client';
import { useEffect, useState } from 'react';
import { ArrowRight, Check, Clock3 } from 'lucide-react';
import { spanishCopy } from '@/lib/study-copy';
import { SpanishTranslation } from './study-copy';
import { isPortuguese, studyStorage, languageConfig } from '@/lib/workspace';
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
  if (task.action.kind === 'oral')
    return 'Escuchá el modelo y respondé sobre el contenido. La pronunciación no se califica.';
  return {
    vocabulary: 'Recordá palabras útiles y practicá cómo usarlas en una oración.',
    grammar: 'Observá cómo se forma la oración y después construí la tuya.',
    reading: 'Leé una situación cotidiana y buscá la información importante.',
    writing: 'Escribí tus propias oraciones con las estructuras que aprendiste.',
  }[task.action.mode];
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
        canListen:
          'speechSynthesis' in window &&
          window.speechSynthesis
            .getVoices()
            .some((v) => v.localService && v.lang.toLowerCase().startsWith(pt ? 'pt' : 'en')),
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
  const support = (task: StudyTask) => task.purposeSpanish || spanishCopy(task.purpose);
  const todayMistakes = data.mistakes.filter((m) =>
    data.results.some((r) => r.day === data.day && r.id === m.result_id),
  );
  const practicedModel = data.results
    .filter((r) => r.day === data.day && !agenda?.baseline.includes(r.id))
    .flatMap((r) => {
      try {
        const feedback = JSON.parse(r.answers).feedback;
        return Array.isArray(feedback)
          ? feedback
              .filter((f) => f.correct === true && typeof f.correction === 'string')
              .map((f) => f.correction as string)
          : [];
      } catch {
        return [];
      }
    })[0];
  return (
    <div className="today-screen" data-no-word-help>
      <header className="today-head">
        <div>
          <h1>{pt ? 'Seu plano de hoje' : 'Your plan for today'}</h1>
          <p>
            {dateLabel(data.day)}{' '}
            <span className="today-learning-goal">
              · {pt ? 'Objetivo' : 'Goal'} {languageConfig.goal}
            </span>
          </p>
          <p className="today-intro" lang="es">
            Una actividad a la vez. Empezá por la primera y seguí a tu ritmo.
          </p>
        </div>
        <label className="today-duration">
          <span>{pt ? 'Tempo disponível' : 'Time available'}</span>
          <select
            aria-label={pt ? 'Tempo disponível' : 'Time available'}
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
          <ul className="today-done-list">
            {agenda.tasks.map((task) => (
              <li key={task.id}>
                <Check size={16} aria-hidden />
                {task.title}
              </li>
            ))}
          </ul>
          {practicedModel && (
            <div className="today-reflection">
              <span>{pt ? 'Um modelo que você praticou' : 'A model you practised'}</span>
              <p lang={pt ? 'pt-BR' : 'en'}>
                {practicedModel}
                <SpanishTranslation text={practicedModel} />
              </p>
            </div>
          )}
          {todayMistakes.length > 0 && (
            <p className="today-reflection">
              {pt
                ? `${todayMistakes.length} respostas para retomar na revisão. Seus erros ficaram salvos.`
                : `${todayMistakes.length} answers to revisit in review. Your mistakes are saved.`}
            </p>
          )}
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
              <span>{pt ? 'Comece por aqui' : 'Start here'}</span>
              <span>
                <Clock3 size={15} />
                {primary!.minutes} min
              </span>
            </div>
            <div className="today-focus-copy">
              <p className="today-session-count" role="status">
                {pt
                  ? `${remaining.length} atividades restantes`
                  : `${remaining.length} activities left`}
              </p>
              <h2>{primary!.title}</h2>
              <p lang={pt ? 'pt-BR' : 'en'}>{primary!.purpose}</p>
              <p className="today-primary-spanish" lang="es">
                {support(primary!) || `Orientación: ${spanishTaskHelp(primary!)}`}
              </p>
            </div>
            <button
              className="button start-button"
              disabled={busy}
              onClick={() => onTask(primary!)}
            >
              {paused && primary?.action.kind === 'routine'
                ? pt
                  ? 'Retomar'
                  : 'Resume'
                : pt
                  ? 'Começar agora'
                  : 'Start now'}
              <ArrowRight size={19} />
            </button>
          </section>
          {remaining.length > 1 && (
            <section className="today-next" aria-labelledby="next-title">
              <h2 id="next-title">{pt ? 'Próximos passos' : 'Up next'}</h2>
              <div className="today-task-list">
                {remaining.slice(1, 4).map((task, i) => (
                  <button className="today-task" key={task.id} onClick={() => onTask(task)}>
                    <span className="task-number" aria-hidden>
                      {String(i + 2).padStart(2, '0')}
                    </span>
                    <span>
                      <strong>{task.title}</strong>
                      <small>{task.minutes} min</small>
                      <small className="task-spanish" lang="es">
                        {support(task) || `Orientación: ${spanishTaskHelp(task)}`}
                      </small>
                    </span>
                    <ArrowRight size={17} />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      {agenda && (
        <p className="today-completion" role="status">
          <span
            className="completion-dots today-journey-bar"
            role="progressbar"
            aria-label={pt ? 'Atividades concluídas' : 'Completed activities'}
            aria-valuemin={0}
            aria-valuemax={agenda.tasks.length}
            aria-valuenow={completed}
          >
            {agenda.tasks.map((task) => (
              <span key={task.id} className={studyTaskDone(task, agenda, data) ? 'done' : ''} />
            ))}
          </span>
          {pt
            ? `${completed} de ${agenda.tasks.length} atividades concluídas`
            : `${completed} of ${agenda.tasks.length} activities completed`}
        </p>
      )}
    </div>
  );
}
