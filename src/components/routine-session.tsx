'use client';
import { StudyCopy } from './study-copy';
import { useEffect, useRef, useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { makeRoutine, routineTitles, routineScore, routinePassThreshold } from '@/lib/routine';
import { normalizeAnswer } from '@/lib/games';
import { isPortuguese } from '@/lib/workspace';
import {
  clearRoutineDraft,
  writeRoutineDraft,
  type RoutineDraft,
} from '@/lib/browser/routine-draft';
import { Button, Speak, api } from './ui';
import { RoutineScene } from './routine-scene';
import { Correction } from './correction';
import { useDialog } from './use-dialog';
export function RoutineSession({
  initial,
  refresh,
  close,
  onAdvance,
  nextLabel,
}: {
  initial: RoutineDraft;
  refresh: () => Promise<void>;
  close: () => void;
  onAdvance: (independentPass: boolean) => void;
  nextLabel: string;
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
  const set = makeRoutine(initial.mode, initial.level, initial.block, undefined, {
      edition: initial.edition,
      variant: initial.variant,
    }),
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
        variant: initial.variant ?? 0,
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
            <StudyCopy
              as="p"
              native={`${saved ? (isPortuguese ? 'Salvo no seu progresso.' : 'Saved in your progress.') : isPortuguese ? 'Salvando suas respostas.' : 'Saving your answers.'} ${draft.helpUsed ? (isPortuguese ? 'Você usou ajuda. Sua prática é registrada; tente outra sequência sem ajuda para cumprir o requisito.' : 'You used help. Your practice is recorded; try a new sequence without help to meet the requirement.') : (recordedScore?.correct ?? routineScore(set, draft.answers)) / (recordedScore?.total ?? set.rounds.length) >= routinePassThreshold(initial.mode) ? (isPortuguese ? 'Continue com a próxima etapa pendente.' : 'Continue with the next unfinished step.') : isPortuguese ? 'Reforce esta habilidade com outra sequência. Os erros continuam registrados.' : 'Reinforce this skill with a new sequence. Your errors remain recorded.'}`}
            >
              {saved ? 'Guardado en tu progreso.' : 'Estamos guardando tus respuestas.'}{' '}
              {draft.helpUsed
                ? 'Usaste la ayuda de palabras: la práctica se conserva, pero repetila sin ayudas para acreditar el requisito.'
                : (recordedScore?.correct ?? routineScore(set, draft.answers)) /
                      (recordedScore?.total ?? set.rounds.length) >=
                    routinePassThreshold(initial.mode)
                  ? 'Ahora podés seguir con el siguiente paso del recorrido.'
                  : 'Volvé a practicar este paso: los errores se conservan para orientar el repaso.'}
            </StudyCopy>
            <details>
              <summary>{isPortuguese ? 'Revisar respostas' : 'Review answers'}</summary>
              {set.rounds.map((q, i) => (
                <div className="routine-review" key={q.id}>
                  <p lang={native}>{draft.answers[i]}</p>
                  <Correction
                    explanation={q.why}
                    explanationNative={q.explanationNative}
                    correction={q.solution}
                  />
                </div>
              ))}
            </details>
            {saved && !busy && (
              <Button
                onClick={() =>
                  onAdvance(
                    !draft.helpUsed &&
                      (recordedScore?.correct ?? 0) / (recordedScore?.total ?? 1) >=
                        routinePassThreshold(initial.mode),
                  )
                }
              >
                {!draft.helpUsed &&
                (recordedScore?.correct ?? 0) / (recordedScore?.total ?? 1) >=
                  routinePassThreshold(initial.mode)
                  ? nextLabel
                  : isPortuguese
                    ? 'Reforçar com outra sequência'
                    : 'Reinforce with a new sequence'}
              </Button>
            )}
            {saved && (
              <Button secondary disabled={busy} onClick={close}>
                {isPortuguese ? 'Voltar ao percurso' : 'Back to the path'}
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="fine-print">
              {draft.answers.length + 1} / {set.rounds.length}
            </p>
            {round.scene && <RoutineScene scene={round.scene} />}
            {(round.text || set.text) && (
              <div className="routine-reading" lang={native}>
                <p>{round.text || set.text}</p>
                <Speak text={round.text || set.text || ''} />
                {round.textSpanish && (
                  <details
                    onToggle={(e) => {
                      if (e.currentTarget.open && !draft.checked)
                        setDraft((d) => ({ ...d, helpUsed: true }));
                    }}
                  >
                    <summary>
                      {isPortuguese ? 'Tradução ao espanhol (ajuda)' : 'Spanish translation (help)'}
                    </summary>
                    <p lang="es">{round.textSpanish}</p>
                  </details>
                )}
              </div>
            )}
            {round.context && (
              <div className="routine-reading">
                <p lang={native}>{round.context}</p>
                <p lang="es" className="study-spanish">
                  {round.contextSpanish}
                </p>
                <Speak text={round.context} />
              </div>
            )}
            <h3 lang={native}>{round.prompt}</h3>
            <p className="routine-spanish" lang="es">
              {round.spanish}
            </p>
            <StudyCopy
              as="p"
              className="fine-print"
              native={
                initial.mode === 'grammar'
                  ? isPortuguese
                    ? 'Toque nos blocos na ordem. Toque em um bloco escolhido para devolvê-lo.'
                    : 'Tap the blocks in order. Tap a chosen block to put it back.'
                  : isPortuguese
                    ? 'Escolha uma opção e confira sua resposta.'
                    : 'Choose an option and check your answer.'
              }
            >
              {initial.mode === 'grammar'
                ? 'Tocá los bloques en orden. Podés tocar uno elegido para devolverlo.'
                : 'Elegí una opción y comprobá tu respuesta.'}
            </StudyCopy>
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
                <Correction
                  explanation={round.why}
                  explanationNative={round.explanationNative}
                  correction={round.solution}
                />
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
            <StudyCopy
              as="p"
              className="fine-print"
              native={
                isPortuguese
                  ? 'Você pode pausar: suas respostas e os blocos escolhidos ficam salvos neste dispositivo. O resultado usa a primeira resposta de cada exercício.'
                  : 'You can pause: answers and chosen blocks are saved on this device. The result uses your first answer to each exercise.'
              }
            >
              Podés pausar: tus respuestas y los bloques elegidos quedan guardados en este
              dispositivo. La nota usa tu primera respuesta de cada ejercicio.
            </StudyCopy>
          </>
        )}
        {storageError && (
          <StudyCopy as="p" className="error" role="alert">
            No se pudo guardar el borrador. Terminá esta actividad y verificá que diga guardado
            antes de salir.
          </StudyCopy>
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
