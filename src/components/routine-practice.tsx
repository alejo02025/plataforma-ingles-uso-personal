'use client';
import { useEffect, useState } from 'react';
import { learningJourney } from '@/lib/course-route';
import { routineRecord, routineTitles, routineEdition, type RoutineMode } from '@/lib/routine';
import {
  readRoutineDraft,
  clearRoutineDraft,
  type RoutineDraft,
} from '@/lib/browser/routine-draft';
import { isPortuguese } from '@/lib/workspace';
import { writingChallenge } from '@/locales/learning/writing-challenges';
import type { Snapshot, Activity } from '@/lib/types';
import { api } from './ui';
import { RoutineSession } from './routine-session';
/** The compact instance owns global daily-task launches. Review owns only its own buttons. */
export function RoutinePractice({
  data,
  refresh,
  onStart,
  compact = false,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  onStart: (a: Activity) => void;
  onClass?: (id: string) => void;
  onGame?: (seed: string) => void;
  compact?: boolean;
}) {
  const journey = learningJourney(data);
  const [session, setSession] = useState<RoutineDraft | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  function open(mode: RoutineMode, level = journey.level, block = journey.block) {
    setError('');
    try {
      const pending = readRoutineDraft({ mode, level, block });
      if (pending && !data.results.some((r) => r.activity_id === `routine:${pending.id}`)) {
        setSession(pending);
        return;
      }
      if (pending) clearRoutineDraft(pending.id);
      const variants = data.results
        .map((r) => routineRecord(r))
        .filter(
          (r) =>
            r?.mode === mode &&
            r.level === level &&
            r.block === block &&
            r.edition === routineEdition,
        )
        .map((r) => r!.variant);
      setSession({
        id: crypto.randomUUID(),
        mode,
        level,
        block,
        edition: routineEdition,
        variant: Math.min(1000, Math.max(-1, ...variants) + 1),
        answers: [],
        choice: '',
        picked: [],
        checked: false,
        helpUsed: false,
        seconds: 0,
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function write() {
    setBusy(true);
    setError('');
    try {
      const activity = await api<Activity>('course/writing', {});
      await refresh();
      onStart(activity);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!compact) return;
    const start = (event: Event) => {
      const detail = (event as CustomEvent<{ mode: string; level?: string; block?: number }>)
        .detail;
      if (['vocabulary', 'grammar', 'reading'].includes(detail?.mode))
        open(
          detail.mode as RoutineMode,
          (detail.level || journey.level) as typeof journey.level,
          detail.block ?? journey.block,
        );
      else if (detail?.mode === 'writing') void write();
    };
    window.addEventListener('english-os:routine-start', start);
    return () => window.removeEventListener('english-os:routine-start', start);
  }, [data, compact, journey.level, journey.block]);
  function close() {
    setSession(null);
    window.dispatchEvent(new Event('english-os:routine-paused'));
  }
  const runner = session && (
    <RoutineSession
      key={session.id}
      initial={session}
      refresh={refresh}
      close={close}
      onAdvance={(passed) => {
        const mode = session.mode;
        if (passed) close();
        else open(mode, session.level as typeof journey.level, session.block);
      }}
      nextLabel={
        compact
          ? isPortuguese
            ? 'Voltar a hoje'
            : 'Back to today'
          : isPortuguese
            ? 'Voltar à revisão'
            : 'Back to review'
      }
    />
  );
  let paused: RoutineDraft | undefined;
  try {
    paused = readRoutineDraft();
    if (paused && data.results.some((r) => r.activity_id === `routine:${paused!.id}`))
      paused = undefined;
  } catch {}
  if (compact)
    return (
      <>
        {runner}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </>
    );
  return (
    <section className="review-practice">
      <p className="muted">
        {isPortuguese
          ? 'Uma prática curta para reforçar seu bloco atual.'
          : 'A short practice to strengthen your current block.'}
      </p>
      {paused && (
        <button className="activity-row paused-practice" onClick={() => setSession(paused!)}>
          <span>
            <strong>{isPortuguese ? 'Retomar prática salva' : 'Resume saved practice'}</strong>
            <small>
              {routineTitles[paused.mode]} · {paused.level} · {isPortuguese ? 'Bloco' : 'Block'}{' '}
              {paused.block + 1}
            </small>
          </span>
          <span aria-hidden>→</span>
        </button>
      )}
      <div className="practice-options">
        {(['vocabulary', 'grammar', 'reading'] as const).map((mode) => (
          <button className="activity-row" key={mode} onClick={() => open(mode)}>
            <span>
              <strong>{routineTitles[mode]}</strong>
              <small>
                {isPortuguese ? '4 min · prática contextualizada' : '4 min · contextual practice'}
              </small>
            </span>
            <span aria-hidden>→</span>
          </button>
        ))}
        <button className="activity-row" disabled={busy} onClick={() => void write()}>
          <span>
            <strong>
              {isPortuguese ? 'Escreva com suas palavras' : 'Write in your own words'}
            </strong>
            <small>
              {writingChallenge(journey.level, isPortuguese).minutes} min ·{' '}
              {isPortuguese ? 'proposta do seu nível' : 'a brief for your level'}
            </small>
          </span>
          <span aria-hidden>→</span>
        </button>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {runner}
    </section>
  );
}
