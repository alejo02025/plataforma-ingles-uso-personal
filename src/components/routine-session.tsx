'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { makeRoutine, routineTitles, routineScore } from '@/lib/routine';
import { normalizeAnswer } from '@/lib/games';
import { isPortuguese } from '@/lib/workspace';
import {
  clearRoutineDraft,
  writeRoutineDraft,
  type RoutineDraft,
} from '@/lib/browser/routine-draft';
import { Button, Speak, api } from './ui';
import { Correction } from './correction';
import { useDialog } from './use-dialog';
export function RoutineSession({
  initial,
  refresh,
  close,
}: {
  initial: RoutineDraft;
  refresh: () => Promise<void>;
  close: () => void;
}) {
  const [draft, setDraft] = useState(initial),
    [error, setError] = useState(''),
    [storageError, setStorageError] = useState(false),
    [saved, setSaved] = useState(false),
    [busy, setBusy] = useState(false),
    [retry, setRetry] = useState(0);
  const [recordedScore, setRecordedScore] = useState<{ correct: number; total: number } | null>(
    null,
  );
  const ref = useDialog(close, busy),
    seconds = useRef(initial.seconds),
    current = useRef(draft),
    didSave = useRef(false),
    saving = useRef(false);
  current.current = draft;
  const set = makeRoutine(initial.mode, initial.level, initial.block),
    complete = draft.answers.length === set.rounds.length,
    round = set.rounds[Math.min(draft.answers.length, set.rounds.length - 1)],
    answer =
      initial.mode === 'grammar'
        ? draft.picked.map((i) => round.choices[i]).join(' ')
        : draft.choice;
  const isCorrect = normalizeAnswer(answer) === normalizeAnswer(round.solution);
  function persist() {
    if (didSave.current) return;
    try {
      writeRoutineDraft({ ...current.current, seconds: seconds.current });
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  useEffect(() => {
    persist();
  }, [draft]);
  useEffect(() => {
    const flush = () => persist();
    const timer = setInterval(() => {
      if (
        !didSave.current &&
        current.current.answers.length < set.rounds.length &&
        document.visibilityState === 'visible' &&
        document.hasFocus()
      )
        seconds.current = Math.min(7200, seconds.current + 1);
      if (seconds.current % 5 === 0) persist();
    }, 1000);
    const lookedUp = () => {
      if (!current.current.checked && current.current.answers.length < set.rounds.length)
        setDraft((d) => ({ ...d, helpUsed: true }));
    };
    window.addEventListener('study-word-looked-up', lookedUp);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      clearInterval(timer);
      window.removeEventListener('study-word-looked-up', lookedUp);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flush);
      persist();
    };
  }, [initial.id]);
  useEffect(() => {
    if (!complete || didSave.current || saving.current) return;
    saving.current = true;
    setBusy(true);
    setError('');
    void api<{ correct: number; total: number; responses: string[]; helpUsed: boolean }>(
      'routine/result',
      {
        id: initial.id,
        mode: initial.mode,
        level: initial.level,
        block: initial.block,
        edition: initial.edition,
        answers: draft.answers,
        helpUsed: draft.helpUsed,
        seconds: seconds.current,
      },
    )
      .then(async (result) => {
        didSave.current = true;
        setRecordedScore({ correct: result.correct, total: result.total });
        setDraft((d) => ({ ...d, answers: result.responses, helpUsed: result.helpUsed }));
        setSaved(true);
        try {
          clearRoutineDraft(initial.id);
        } catch {}
        await refresh();
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => {
        saving.current = false;
        setBusy(false);
      });
  }, [complete, retry, initial.id, refresh]);
  function next() {
    setDraft((d) => ({
      ...d,
      answers: [...d.answers, answer],
      choice: '',
      picked: [],
      checked: false,
      seconds: seconds.current,
    }));
  }
  const native = isPortuguese ? 'pt-BR' : 'en';
  return (
    <div className="modal-backdrop routine-backdrop">
      <section
        ref={ref}
        className="card routine-session"
        role="dialog"
        aria-modal="true"
        aria-label={isPortuguese ? 'Atividade guiada' : 'Guided activity'}
      >
        <div className="section-heading">
          <span className="pill neutral">
            {initial.level} · {initial.block + 1}
          </span>
          <button
            className="icon-button"
            disabled={busy}
            aria-label={isPortuguese ? 'Pausar atividade' : 'Pause activity'}
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        <h2>{routineTitles[initial.mode]}</h2>
        <div
          className="routine-meter"
          aria-label={isPortuguese ? 'Exercícios respondidos' : 'Exercises answered'}
        >
          <span style={{ width: `${(draft.answers.length / set.rounds.length) * 100}%` }} />
        </div>
        {complete ? (
          <div className="routine-finish">
            <Check size={32} />
            <h3>{isPortuguese ? 'Uma etapa praticada.' : 'One step practised.'}</h3>
            <p className="routine-score">
              {recordedScore?.correct ?? routineScore(set, draft.answers)} /{' '}
              {recordedScore?.total ?? set.rounds.length}
            </p>
            <p lang="es">
              {saved ? 'Guardado en tu progreso.' : 'Estamos guardando tus respuestas.'}{' '}
              {draft.helpUsed
                ? 'Usaste la ayuda de palabras: la práctica se conserva, pero repetila sin ayudas para acreditar el requisito.'
                : (recordedScore?.correct ?? routineScore(set, draft.answers)) /
                      (recordedScore?.total ?? set.rounds.length) >=
                    0.8
                  ? 'Ahora podés seguir con el siguiente paso del recorrido.'
                  : 'Volvé a practicar este paso: los errores se conservan para orientar el repaso.'}
            </p>
            <details>
              <summary>{isPortuguese ? 'Revisar respostas' : 'Review answers'}</summary>
              {set.rounds.map((q, i) => (
                <div className="routine-review" key={q.id}>
                  <p lang={native}>{draft.answers[i]}</p>
                  <Correction explanation={q.why} correction={q.solution} />
                </div>
              ))}
            </details>
            {saved && (
              <Button onClick={close}>
                {isPortuguese ? 'Voltar ao percurso' : 'Back to the path'}
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="fine-print">
              {draft.answers.length + 1} / {set.rounds.length}
            </p>
            {set.text && (
              <div className="routine-reading" lang={native}>
                {set.text}
                <Speak text={set.text} />
              </div>
            )}
            <h3 lang={native}>{round.prompt}</h3>
            <p className="routine-spanish" lang="es">
              {round.spanish}
            </p>
            <p className="fine-print" lang="es">
              {initial.mode === 'grammar'
                ? 'Tocá los bloques en orden. Podés tocar uno elegido para devolverlo.'
                : 'Elegí una opción y comprobá tu respuesta.'}
            </p>
            {initial.mode === 'grammar' ? (
              <>
                <div
                  className="routine-answer"
                  aria-label={isPortuguese ? 'Sua frase' : 'Your sentence'}
                >
                  {draft.picked.length ? (
                    draft.picked.map((index, n) => (
                      <button
                        disabled={draft.checked}
                        key={`${index}-${n}`}
                        aria-label={`${isPortuguese ? 'Retirar bloco' : 'Remove block'} ${n + 1}`}
                        onClick={() =>
                          setDraft((d) => ({ ...d, picked: d.picked.filter((_, i) => i !== n) }))
                        }
                      >
                        {round.choices[index]}
                      </button>
                    ))
                  ) : (
                    <span>
                      {isPortuguese ? 'Sua frase aparece aqui.' : 'Your sentence appears here.'}
                    </span>
                  )}
                </div>
                <div className="routine-tiles">
                  {round.choices.map((token, i) => (
                    <button
                      disabled={draft.checked || draft.picked.includes(i)}
                      key={i}
                      onClick={() => setDraft((d) => ({ ...d, picked: [...d.picked, i] }))}
                    >
                      {token}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div
                className={`routine-choices ${initial.mode === 'vocabulary' ? 'picture-choices' : ''}`}
                role="group"
                aria-label={isPortuguese ? 'Opções' : 'Choices'}
              >
                {round.choices.map((option) => (
                  <button
                    key={option}
                    disabled={draft.checked}
                    aria-pressed={draft.choice === option}
                    className={draft.choice === option ? 'selected' : ''}
                    onClick={() => setDraft((d) => ({ ...d, choice: option }))}
                  >
                    {round.illustrations?.[option] && (
                      <span className="routine-picture" aria-hidden="true">
                        {round.illustrations[option]}
                      </span>
                    )}
                    <strong lang={native}>{option}</strong>
                  </button>
                ))}
              </div>
            )}
            {draft.checked ? (
              <div className={`routine-feedback ${isCorrect ? 'correct' : 'retry'}`}>
                <strong>
                  {isCorrect
                    ? isPortuguese
                      ? 'Isso mesmo!'
                      : 'That’s right!'
                    : isPortuguese
                      ? 'Vamos entender.'
                      : 'Let’s understand.'}
                </strong>
                <Correction explanation={round.why} correction={round.solution} />
                <Button onClick={next}>{isPortuguese ? 'Continuar' : 'Continue'}</Button>
              </div>
            ) : (
              <Button
                disabled={
                  !answer ||
                  (initial.mode === 'grammar' && draft.picked.length !== round.choices.length)
                }
                onClick={() => setDraft((d) => ({ ...d, checked: true }))}
              >
                {isPortuguese ? 'Conferir' : 'Check'}
              </Button>
            )}
            <p className="fine-print" lang="es">
              Podés pausar: tus respuestas y los bloques elegidos quedan guardados en este
              dispositivo. La nota usa tu primera respuesta de cada ejercicio.
            </p>
          </>
        )}
        {storageError && (
          <p className="error" role="alert" lang="es">
            No se pudo guardar el borrador. Terminá esta actividad y verificá que diga guardado
            antes de salir.
          </p>
        )}
        {error && (
          <div role="alert" className="error">
            <p>{error}</p>
            <Button
              secondary
              disabled={busy}
              onClick={() => {
                if (didSave.current) {
                  void refresh()
                    .then(() => setError(''))
                    .catch((e) => setError(e.message));
                } else setRetry((n) => n + 1);
              }}
            >
              <RotateCcw size={16} />
              {isPortuguese ? 'Tentar salvar de novo' : 'Try saving again'}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
