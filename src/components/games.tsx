'use client';
import { StudyCopy } from './study-copy';
import { isPortuguese } from '@/lib/workspace';
import { courseRoute } from '@/lib/course-route';
import {
  readGameDraft,
  writeGameDraft,
  clearGameDraft,
  gameDraftIdentity,
  type GameDraft,
} from '@/lib/browser/game-draft';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Puzzle as PuzzleIcon,
  RotateCcw,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import {
  makePuzzle,
  puzzleHint,
  exampleWithGap,
  letterMarks,
  normalizeAnswer,
  gameTitles,
  type GameMode,
  type Puzzle,
} from '@/lib/games';
import type { Snapshot } from '@/lib/types';
import { Button, Heading, Speak, api } from './ui';
import { Correction } from './correction';
import { matchWhy, sentenceWhy, trailWhy } from '@/locales/es/answer-help';
const modes: GameMode[] = ['match', 'sentence', 'trail'];
const tips: Record<GameMode, string> = {
  match: 'Picture a real situation for each word. Which one fits the meaning?',
  sentence:
    'Look for the capital letter and the ending punctuation. Then read your sentence aloud.',
  trail: 'Try different letters first. Use green letters again in the same place.',
};
const descriptions: Record<GameMode, string> = {
  match: 'One meaning. Four words. Find the connection.',
  sentence: 'Put the pieces together. Make an everyday sentence.',
  trail: 'A five-letter word. Six guesses. Follow the clues.',
};
export function Games({
  data,
  refresh,
  initialSeed = '',
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  initialSeed?: string;
}) {
  const [game, setGame] = useState<{
    id: string;
    seed: string;
    puzzle: Puzzle;
    draft?: GameDraft;
  } | null>(null);
  const [draftModes, setDraftModes] = useState<GameMode[]>([]);
  const [error, setError] = useState('');
  const history = data.results.filter((r) => r.activity_id.startsWith('game:'));
  const today = history.filter((r) => r.day === data.day);
  useEffect(() => {
    if (!game)
      setDraftModes(
        modes.filter((mode) => {
          const draft = readGameDraft(mode);
          return draft && !history.some((r) => r.activity_id === `game:${draft.id}`);
        }),
      );
  }, [game, data.results]);
  useEffect(() => {
    if (initialSeed) start('match', initialSeed);
  }, [initialSeed]);
  function start(mode: GameMode, suggestedSeed?: string) {
    setError('');
    const id = crypto.randomUUID();
    const seed =
      suggestedSeed ||
      (today.some((r) => r.title === gameTitles[mode])
        ? `${data.day}:${mode}:${id}`
        : `${data.day}:${mode}`);
    try {
      const draft = readGameDraft(mode);
      if (draft && !history.some((r) => r.activity_id === `game:${draft.id}`)) {
        setGame({
          id: draft.id,
          seed: draft.seed,
          puzzle: makePuzzle(mode, draft.seed, draft.level, draft.curriculum),
          draft,
        });
        return;
      }
      setGame({ id, seed, puzzle: makePuzzle(mode, seed, courseRoute(data).level, 2) });
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      {!game && (
        <Heading
          eyebrow="A LITTLE EVERY DAY"
          title="Play & learn."
          description="Pick a game. Hints are here when you need them."
        />
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {game ? (
        <GameSession key={game.id} game={game} refresh={refresh} close={() => setGame(null)} />
      ) : (
        <>
          <div className="game-grid">
            {modes.map((mode, i) => (
              <button key={mode} className={`game-card game-${mode}`} onClick={() => start(mode)}>
                <span className="game-number">
                  0{i + 1} ·{' '}
                  {today.some((r) => r.title === gameTitles[mode])
                    ? 'Played today'
                    : 'Your daily challenge'}
                </span>
                <div className={`game-cover cover-${mode}`} aria-hidden="true">
                  {mode === 'match' ? (
                    <>
                      <span>WORD</span>
                      <span>MEANING</span>
                    </>
                  ) : mode === 'sentence' ? (
                    <>
                      <span>one</span>
                      <span>small</span>
                      <span>step</span>
                    </>
                  ) : (
                    <>
                      {Array.from('TRAIL').map((letter, j) => (
                        <span key={j}>{letter}</span>
                      ))}
                    </>
                  )}
                </div>
                <h2>{gameTitles[mode]}</h2>
                <p>{descriptions[mode]}</p>
                <span className="game-start">
                  {draftModes.includes(mode) ? 'Resume game' : 'Play now'}{' '}
                  <ArrowUpRight size={18} />
                </span>
              </button>
            ))}
          </div>
          <details className="card game-history">
            <summary>
              <strong>Your playbook</strong>
              <span className="pill neutral">{history.length} games saved</span>
            </summary>
            {history.length ? (
              history
                .slice(-8)
                .reverse()
                .map((r) => (
                  <div className="game-history-row" key={r.id}>
                    <PuzzleIcon size={18} />
                    <div>
                      <strong>{r.title}</strong>
                      <span>{r.day}</span>
                    </div>
                    <b>
                      {r.correct} / {r.total}
                      {JSON.parse(r.answers).helpUsed && (
                        <small className="assisted-label">With hints</small>
                      )}
                    </b>
                  </div>
                ))
            ) : (
              <p className="muted">
                Finish a game to start your playbook. No result is added until you save it.
              </p>
            )}
          </details>
        </>
      )}
    </>
  );
}
function GameSession({
  game,
  refresh,
  close,
}: {
  game: { id: string; seed: string; puzzle: Puzzle; draft?: GameDraft };
  refresh: () => Promise<void>;
  close: () => void;
}) {
  const { puzzle } = game;
  const [initial] = useState(() => game.draft);
  const [answers, setAnswers] = useState<string[]>(initial?.answers || []),
    [picked, setPicked] = useState<number[]>(initial?.picked || []),
    [choice, setChoice] = useState(initial?.choice || ''),
    [checked, setChecked] = useState(initial?.checked || false),
    [guesses, setGuesses] = useState<string[]>(initial?.guesses || []),
    [guess, setGuess] = useState(initial?.guess || '');
  const [hint, setHint] = useState(initial?.hint || false),
    [helpUsed, setHelpUsed] = useState(initial?.helpUsed || false);
  const [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    const lookedUp = () => {
      // Checking vocabulary after locking an answer is feedback review, not test assistance.
      if (!checked && answers.length < puzzle.rounds.length) setHelpUsed(true);
    };
    window.addEventListener('study-word-looked-up', lookedUp);
    return () => window.removeEventListener('study-word-looked-up', lookedUp);
  }, [checked, answers.length, puzzle.rounds.length]);
  const seconds = useRef(initial?.seconds || 0),
    saving = useRef(false);
  const draftRef = useRef<GameDraft | undefined>(undefined),
    savedRef = useRef(false);
  savedRef.current = saved;
  draftRef.current = {
    ...gameDraftIdentity(game.id, game.seed, puzzle),
    answers,
    picked,
    choice,
    checked,
    guesses,
    guess,
    hint,
    helpUsed,
    seconds: seconds.current,
  };
  const [draftError, setDraftError] = useState('');
  function persistDraft() {
    try {
      if (savedRef.current) clearGameDraft(puzzle.mode);
      else if (draftRef.current)
        writeGameDraft(puzzle.mode, { ...draftRef.current, seconds: seconds.current });
    } catch {
      setDraftError(
        'Your game draft could not be saved on this device. Finish and save the result before leaving.',
      );
    }
  }
  useEffect(() => {
    persistDraft();
  }, [answers, picked, choice, checked, guesses, guess, hint, helpUsed, saved]);
  useEffect(() => {
    const flush = () => persistDraft();
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    const timer = setInterval(flush, 5000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', flush);
      flush();
    };
  }, [game.id]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (
        document.visibilityState === 'visible' &&
        document.hasFocus() &&
        answers.length < puzzle.rounds.length
      )
        seconds.current = Math.min(7200, seconds.current + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [answers.length, puzzle.rounds.length]);
  const complete = answers.length === puzzle.rounds.length;
  const round = puzzle.rounds[Math.min(answers.length, puzzle.rounds.length - 1)];
  const answer =
    puzzle.mode === 'sentence' ? picked.map((i) => round.choices[i]).join(' ') : choice;
  const correct = answers.filter(
    (value, i) => normalizeAnswer(value) === normalizeAnswer(puzzle.rounds[i].solution),
  ).length;
  function next() {
    setAnswers([...answers, answer]);
    setHint(false);
    setChoice('');
    setPicked([]);
    setChecked(false);
  }
  function submitGuess(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[\p{L}]{5}$/u.test(guess.trim())) {
      setError('Enter exactly five letters. Accents count as letters.');
      return;
    }
    setError('');
    const value = guess.trim().toLocaleLowerCase();
    const list = [...guesses, value];
    setGuesses(list);
    setGuess('');
    if (normalizeAnswer(value) === normalizeAnswer(round.solution) || list.length === 6)
      setAnswers([value]);
  }
  async function save() {
    if (saving.current || saved) return;
    saving.current = true;
    setBusy(true);
    setError('');
    try {
      await api('games/result', {
        id: game.id,
        mode: puzzle.mode,
        seed: game.seed,
        level: puzzle.level,
        curriculum: puzzle.curriculum,
        answers,
        helpUsed,
        seconds: seconds.current,
      });
      setSaved(true);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="card game-session">
      <div className="section-heading">
        <Button secondary disabled={busy} onClick={close}>
          <ArrowLeft size={16} /> Back to games
        </Button>
        <span className="pill neutral">{gameTitles[puzzle.mode]}</span>
      </div>
      {complete ? (
        <div className="game-finish">
          <Sparkles size={42} />
          <span className="eyebrow">A SMALL WIN FOR YOUR DAY</span>
          <h2>Game complete.</h2>
          <p className="game-score">
            {correct} / {puzzle.rounds.length}
          </p>
          <p>This is your result for this game, not a language-level assessment.</p>
          {helpUsed && <span className="pill neutral">Practised with hints</span>}
          <details className="game-takeaways">
            <summary>Take it into your day</summary>
            {puzzle.rounds.map((item, i) => (
              <div key={i}>
                <strong>{item.word}</strong>
                <p>{item.example}</p>
                <Speak text={item.example} />
                <p className="fine-print">Try saying this with one detail from your own life.</p>
              </div>
            ))}
          </details>
          {puzzle.mode === 'trail' && (
            <Correction
              explanation={
                normalizeAnswer(answers[0]) === normalizeAnswer(round.solution)
                  ? matchWhy(round.word, round.word)
                  : `Se terminaron los seis intentos. La palabra buscada significa: ${matchWhy(round.word, answers[0])}`
              }
              correction={round.solution}
            />
          )}
          <Button disabled={busy || saved} onClick={() => void save()}>
            {saved ? (
              <>
                <Check size={18} /> Saved to your progress
              </>
            ) : busy ? (
              'Saving your game…'
            ) : (
              'Save game result'
            )}
          </Button>
          {saved && (
            <Button secondary onClick={close}>
              Choose another game <RotateCcw size={16} />
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="game-round-heading">
            <span className="eyebrow">
              {puzzle.mode === 'trail'
                ? 'SIX CHANCES TO DISCOVER'
                : `Round ${answers.length + 1} / ${puzzle.rounds.length}`}
            </span>
            <h2>
              {puzzle.mode === 'sentence'
                ? 'Build the sentence.'
                : puzzle.mode === 'match'
                  ? 'Which word fits this meaning?'
                  : 'Find the five-letter word.'}
            </h2>
          </div>
          <progress
            className="game-round-progress"
            aria-label="Game progress"
            max={puzzle.rounds.length}
            value={answers.length}
          />
          <div className="game-help">
            <details>
              <summary>
                <Lightbulb size={16} /> How to play
              </summary>
              <p>{tips[puzzle.mode]}</p>
              <span className="study-spanish" lang="es">
                {puzzle.mode === 'match'
                  ? 'Elegí la palabra que coincide con el significado y la situación. La pista cuenta como ayuda.'
                  : puzzle.mode === 'sentence'
                    ? 'Tocá los bloques en orden; tocá un bloque elegido para devolverlo. Usá todas las piezas, luego comprobá tu oración.'
                    : 'Probá una palabra de cinco letras. Verde: letra y posición correctas; dorado: otra posición; gris: letra ausente. Tenés seis intentos.'}
              </span>
            </details>
            <button
              className="text-link"
              disabled={checked}
              onClick={() => {
                setHint(true);
                setHelpUsed(true);
              }}
            >
              Get a hint
            </button>
          </div>
          {hint && (
            <div className="game-hint" role="status">
              <strong>
                {puzzle.mode === 'sentence' ? 'Start with:' : 'First letter:'}{' '}
                {puzzleHint(round, puzzle.mode)}
              </strong>
              {puzzle.mode !== 'sentence' && exampleWithGap(round) && (
                <p>{exampleWithGap(round)}</p>
              )}
            </div>
          )}
          {puzzle.mode === 'trail' ? (
            <>
              <p className="game-clue">{round.meaning}</p>
              <div className="trail-board" aria-label="Your guesses">
                {Array.from({ length: 6 }, (_, i) => (
                  <div className="trail-row" key={i}>
                    {Array.from({ length: 5 }, (_, j) => (
                      <span
                        key={j}
                        className={guesses[i] ? letterMarks(round.solution, guesses[i])[j] : ''}
                      >
                        {Array.from(guesses[i] || '')[j] || ''}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <p className="trail-legend">
                <span>Green: right place</span>
                <span>Gold: another place</span>
                <span>Grey: not in the word</span>
              </p>
              {guesses.length > 0 && (
                <div role="status">
                  <StudyCopy as="p">
                    {trailWhy(letterMarks(round.solution, guesses.at(-1)!))}
                  </StudyCopy>
                  <p className="answer-correction-model">
                    {Array.from(guesses.at(-1)!)
                      .map((letter, i) =>
                        letterMarks(round.solution, guesses.at(-1)!)[i] === 'exact' ? letter : '_',
                      )
                      .join(' ')}
                  </p>
                </div>
              )}
              <form onSubmit={submitGuess} className="trail-input">
                <label className="field">
                  Your guess
                  <input
                    autoComplete="off"
                    autoCapitalize="none"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    maxLength={5}
                  />
                </label>
                <Button type="submit">Check word</Button>
              </form>
            </>
          ) : (
            <>
              {puzzle.mode === 'match' ? (
                <>
                  <p className="game-clue">{round.meaning}</p>
                  {exampleWithGap(round) && (
                    <div className="game-context">
                      <span className="eyebrow">
                        {isPortuguese ? 'UMA SITUAÇÃO REAL' : 'A REAL SITUATION'}
                      </span>
                      <p>{exampleWithGap(round)}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="muted">
                    Tap each piece in order. Tap a selected piece to return it.
                  </p>
                  <div className="sentence-answer" aria-label="Your sentence">
                    {picked.length ? (
                      picked.map((index, i) => (
                        <button
                          disabled={checked}
                          key={index}
                          onClick={() => setPicked(picked.filter((_, j) => j !== i))}
                        >
                          {round.choices[index]}
                        </button>
                      ))
                    ) : (
                      <span>Your sentence goes here…</span>
                    )}
                  </div>
                </>
              )}
              <div
                className={`game-choices ${puzzle.mode === 'sentence' ? 'sentence-pieces' : ''}`}
              >
                {round.choices.map((value, index) => (
                  <button
                    key={index}
                    disabled={checked || picked.includes(index)}
                    aria-pressed={puzzle.mode === 'match' ? choice === value : undefined}
                    className={choice === value ? 'selected' : ''}
                    onClick={() =>
                      puzzle.mode === 'match' ? setChoice(value) : setPicked([...picked, index])
                    }
                  >
                    {value}
                  </button>
                ))}
              </div>
              {checked ? (
                <div className="game-feedback" role="status">
                  <strong>
                    {normalizeAnswer(answer) === normalizeAnswer(round.solution)
                      ? 'You found it!'
                      : 'Keep this one for next time.'}
                  </strong>
                  <StudyCopy
                    native={
                      isPortuguese
                        ? 'Confira o significado, a ordem das palavras e o contexto antes de continuar. Depois, mude um detalhe para aplicar a ideia à sua vida.'
                        : 'Check meaning, word order and context before continuing. Then change one detail to use the idea in your own life.'
                    }
                  >
                    Compará el significado, el orden de las palabras y el contexto antes de
                    continuar. Después cambiá un detalle para usar la idea en tu vida.
                  </StudyCopy>
                  {
                    <Correction
                      explanation={
                        puzzle.mode === 'match'
                          ? matchWhy(round.word, answer)
                          : sentenceWhy(round.solution, answer)
                      }
                      correction={round.solution}
                    />
                  }
                  {puzzle.mode === 'match' && <p className="game-example">{round.example}</p>}
                  <Speak text={round.solution} />
                  <Button onClick={next}>
                    {answers.length + 1 === puzzle.rounds.length ? 'See my result' : 'Next round'}
                  </Button>
                </div>
              ) : (
                <Button
                  disabled={
                    !answer ||
                    (puzzle.mode === 'sentence' && picked.length !== round.choices.length)
                  }
                  onClick={() => setChecked(true)}
                >
                  Check answer
                </Button>
              )}
            </>
          )}
        </>
      )}
      {draftError && (
        <p role="alert" className="error">
          {draftError}
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </section>
  );
}
