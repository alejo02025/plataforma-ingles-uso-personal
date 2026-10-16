'use client';
import { StudyCopy } from './study-copy';
import { useEffect, useRef, useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import {
  makeRoutine,
  routineTitles,
  routineScore,
  routinePassThreshold,
  routineFormat,
  routineVerdict,
  routineEvaluation,
} from '@/lib/routine';
import { isPortuguese } from '@/lib/workspace';
import {
  clearRoutineDraft,
  writeRoutineDraft,
  type RoutineDraft,
} from '@/lib/browser/routine-draft';
import { Button, Speak, api } from './ui';
import { ExerciseFrame, ChoiceOptions, SentenceTiles } from './exercise-player';
import { LearningInsight } from './learning-insight';
import { SpanishTranslation } from './study-copy';
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
  const [recordedScore, setRecordedScore] = useState<{
    correct: number;
    total: number;
    unverified: number;
  } | null>(null);
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
    format = routineFormat(round, initial.mode),
    answer =
      format === 'tiles' ? draft.picked.map((i) => round.choices[i]).join(' ') : draft.choice;
  const verdict = routineVerdict(round, answer);
  const evaluation = recordedScore || routineEvaluation(set, draft.answers);
  const independentPass =
    !draft.helpUsed &&
    !evaluation.unverified &&
    evaluation.total === set.rounds.length &&
    evaluation.correct / evaluation.total >= routinePassThreshold(initial.mode);
  function markHelp(kind: 'hint' | 'translation' | 'word', step = 1) {
    if (draft.checked) return;
    setDraft((d) => ({
      ...d,
      helpUsed: true,
      support: [
        ...(d.support || []).filter(
          (s) => !(s.questionId === round.id && s.kind === kind && s.step === step),
        ),
        { questionId: round.id, kind, step },
      ],
    }));
  }
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
        setDraft((d) => ({
          ...d,
          helpUsed: true,
          support: [
            ...(d.support || []),
            { questionId: set.rounds[d.answers.length].id, kind: 'word', step: 1 },
          ].slice(-100) as NonNullable<RoutineDraft['support']>,
        }));
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
    void api<{
      correct: number;
      total: number;
      unverified: number;
      responses: string[];
      helpUsed: boolean;
    }>('routine/result', {
      id: initial.id,
      mode: initial.mode,
      level: initial.level,
      block: initial.block,
      edition: initial.edition,
      variant: initial.variant ?? 0,
      answers: draft.answers,
      helpUsed: draft.helpUsed,
      support: draft.support || [],
      seconds: seconds.current,
    })
      .then(async (result) => {
        didSave.current = true;
        setRecordedScore({
          correct: result.correct,
          total: result.total,
          unverified: result.unverified || 0,
        });
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
              {evaluation.correct} / {evaluation.total}{' '}
              {isPortuguese ? 'respostas verificadas' : 'verified answers'}
            </p>
            {evaluation.unverified > 0 && (
              <StudyCopy
                native={
                  isPortuguese
                    ? `${evaluation.unverified} respostas abertas aguardam revisão. Elas não foram marcadas como erros nem usadas para liberar o percurso.`
                    : `${evaluation.unverified} open answers need review. They were not marked wrong or used to unlock the course.`
                }
              >{`${evaluation.unverified} respuestas abiertas quedan pendientes de revisión. No se marcaron como errores ni se usaron para desbloquear el recorrido.`}</StudyCopy>
            )}
            <StudyCopy
              as="p"
              native={`${saved ? (isPortuguese ? 'Salvo no seu progresso.' : 'Saved in your progress.') : isPortuguese ? 'Salvando suas respostas.' : 'Saving your answers.'} ${draft.helpUsed ? (isPortuguese ? 'Você usou ajuda. Sua prática é registrada; tente outra sequência sem ajuda para cumprir o requisito.' : 'You used help. Your practice is recorded; try a new sequence without help to meet the requirement.') : independentPass ? (isPortuguese ? 'Continue com a próxima etapa pendente.' : 'Continue with the next unfinished step.') : isPortuguese ? 'Reforce esta habilidade com outra sequência. Os erros continuam registrados.' : 'Reinforce this skill with a new sequence. Your errors remain recorded.'}`}
            >
              {saved ? 'Guardado en tu progreso.' : 'Estamos guardando tus respuestas.'}{' '}
              {draft.helpUsed
                ? 'Usaste ayuda durante la práctica: se conserva, pero repetila sin ayudas para acreditar el requisito.'
                : independentPass
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
                    correction={q.completedModel || q.solution}
                    correctionSpanish={q.solutionSpanish}
                  />
                </div>
              ))}
            </details>
            {saved && !busy && (
              <Button onClick={() => onAdvance(independentPass)}>
                {independentPass
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
            <ExerciseFrame
              key={round.id}
              count={draft.answers.length + 1}
              total={set.rounds.length}
              prompt={round.prompt}
              spanish={round.spanish}
              context={
                <>
                  {(round.text || set.text) && (
                    <div className="routine-reading" lang={native}>
                      <p>{round.text || set.text}</p>
                      <Speak text={round.text || set.text || ''} />
                      {round.textSpanish && (
                        <details
                          onToggle={(e) => {
                            if (e.currentTarget.open) markHelp('translation');
                          }}
                        >
                          <summary>
                            {isPortuguese
                              ? 'Tradução ao espanhol (ajuda)'
                              : 'Spanish translation (help)'}
                          </summary>
                          <p lang="es">{round.textSpanish}</p>
                        </details>
                      )}
                    </div>
                  )}
                  {round.context && (
                    <>
                      <p lang={native}>{round.context}</p>
                      {round.contextSpanish && (
                        <details
                          className="exercise-context-help"
                          onToggle={(e) => {
                            if (e.currentTarget.open) markHelp('translation');
                          }}
                        >
                          <summary>
                            {isPortuguese
                              ? 'Entender o contexto em espanhol (ajuda)'
                              : 'Context in Spanish (help)'}
                          </summary>
                          <p lang="es">{round.contextSpanish}</p>
                        </details>
                      )}
                    </>
                  )}
                </>
              }
            >
              {round.source && (
                <p className="exercise-stimulus" lang={native}>
                  {round.source}
                </p>
              )}
              {format === 'tiles' ? (
                <SentenceTiles
                  tokens={round.choices}
                  picked={draft.picked}
                  disabled={draft.checked}
                  onChange={(picked) => setDraft((d) => ({ ...d, picked }))}
                />
              ) : format === 'choice' ? (
                <ChoiceOptions
                  options={round.choices}
                  value={round.choices.indexOf(draft.choice)}
                  disabled={draft.checked}
                  onChange={(value) => setDraft((d) => ({ ...d, choice: round.choices[value] }))}
                />
              ) : (
                <label className="field exercise-text-answer">
                  <span>{isPortuguese ? 'Sua resposta' : 'Your answer'}</span>
                  <span className="field-hint" lang={native}>
                    {format === 'gap'
                      ? isPortuguese
                        ? 'Escreva a forma que falta.'
                        : 'Type the missing form.'
                      : format === 'recall'
                        ? isPortuguese
                          ? 'Recupere a palavra sem opções.'
                          : 'Recall the word without options.'
                        : isPortuguese
                          ? 'Escreva sua versão. Alternativas não verificáveis ficam pendentes de revisão.'
                          : 'Write your version. Unverified alternatives remain pending review.'}
                  </span>
                  <span className="study-spanish" lang="es">
                    {format === 'gap'
                      ? 'Escribí la forma que falta.'
                      : format === 'recall'
                        ? 'Recuperá la palabra sin mirar opciones.'
                        : 'Escribí tu versión. Las variantes no verificables quedan pendientes de revisión.'}
                  </span>
                  <input
                    autoComplete="off"
                    autoCapitalize="sentences"
                    spellCheck={false}
                    lang={native}
                    value={draft.choice}
                    maxLength={1000}
                    disabled={draft.checked}
                    onChange={(e) => setDraft((d) => ({ ...d, choice: e.target.value }))}
                  />
                </label>
              )}
              {!draft.checked && round.hints?.length && (
                <details
                  className="exercise-hint"
                  onToggle={(e) => {
                    if (e.currentTarget.open) markHelp('hint');
                  }}
                >
                  <summary>{isPortuguese ? 'Uma pista (ajuda)' : 'A hint (help)'}</summary>
                  <p lang={native}>{round.hints[0].native}</p>
                  <p lang="es" className="study-spanish">
                    {round.hints[0].spanish}
                  </p>
                </details>
              )}
              {draft.checked ? (
                <div className="routine-feedback">
                  {verdict === 'unverified' && (
                    <StudyCopy
                      native={
                        isPortuguese
                          ? 'Esta versão precisa de revisão. Pode haver outras respostas válidas; compare com o modelo. Ela fica salva sem uma nota automática de correção.'
                          : 'This version needs review. Other answers may be valid; compare with the model. It is saved without an automatic correctness grade.'
                      }
                    >
                      Esta versión necesita revisión. Puede haber otras respuestas válidas; compará
                      con el modelo. Se conserva sin una nota automática de corrección.
                    </StudyCopy>
                  )}
                  {verdict === 'correct' ? (
                    <>
                      <p className="exercise-correct-label">
                        <Check size={17} />
                        {isPortuguese ? 'Resposta conferida' : 'Answer checked'}
                      </p>
                      <p lang={native}>
                        {round.completedModel || round.solution}
                        <SpanishTranslation
                          text={round.completedModel || round.solution}
                          spanish={round.solutionSpanish}
                        />
                      </p>
                      <details>
                        <summary>{isPortuguese ? 'Por que essa forma?' : 'Why this form?'}</summary>
                        <LearningInsight
                          correct
                          explanation={round.why}
                          explanationNative={round.explanationNative}
                        />
                      </details>
                    </>
                  ) : (
                    <LearningInsight
                      correct={verdict === 'unverified' ? undefined : false}
                      explanation={round.why}
                      explanationNative={round.explanationNative}
                      response={answer}
                      model={round.completedModel || round.solution}
                      modelSpanish={round.solutionSpanish}
                    />
                  )}
                  <Button onClick={next}>{isPortuguese ? 'Continuar' : 'Continue'}</Button>
                </div>
              ) : (
                <Button
                  disabled={
                    !answer.trim() ||
                    (format === 'tiles' && draft.picked.length !== round.choices.length)
                  }
                  onClick={() => setDraft((d) => ({ ...d, checked: true }))}
                >
                  {isPortuguese ? 'Conferir' : 'Check'}
                </Button>
              )}
            </ExerciseFrame>
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
