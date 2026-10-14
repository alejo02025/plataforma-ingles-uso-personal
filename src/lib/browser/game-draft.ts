import { z } from 'zod';
import { studyStorage } from '../workspace';
import { makePuzzle, type GameMode, type Puzzle } from '../games';
const schema = z.object({
  version: z.literal(1),
  curriculum: z.literal(2).optional(),
  id: z.string().uuid(),
  seed: z.string().min(1).max(100),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  puzzleKey: z.string().max(20000),
  answers: z.array(z.string().max(1500)).max(4),
  picked: z.array(z.number().int().min(0).max(40)).max(40),
  choice: z.string().max(100),
  checked: z.boolean(),
  guesses: z.array(z.string().regex(/^[\p{L}]{5}$/u)).max(6),
  guess: z.string().max(5),
  hint: z.boolean(),
  helpUsed: z.boolean(),
  seconds: z.number().int().min(0).max(7200),
});
export type GameDraft = z.infer<typeof schema>;
const key = (mode: GameMode) => `game-draft:v1:${mode}`;
export function readGameDraft(mode: GameMode): GameDraft | undefined {
  try {
    const parsed = schema.safeParse(JSON.parse(studyStorage.getItem(key(mode)) || 'null'));
    if (!parsed.success) return;
    const draft = parsed.data,
      puzzle = makePuzzle(mode, draft.seed, draft.level, draft.curriculum);
    if (JSON.stringify(puzzle) !== draft.puzzleKey) return;
    const round = puzzle.rounds[Math.min(draft.answers.length, puzzle.rounds.length - 1)];
    if (
      draft.answers.length > puzzle.rounds.length ||
      new Set(draft.picked).size !== draft.picked.length ||
      draft.picked.some((i) => i >= round.choices.length)
    )
      return;
    if (mode === 'match' && draft.choice && !round.choices.includes(draft.choice)) return;
    return draft;
  } catch {
    return;
  }
}
export function writeGameDraft(mode: GameMode, draft: GameDraft) {
  studyStorage.setItem(key(mode), JSON.stringify(draft));
}
export function clearGameDraft(mode: GameMode) {
  studyStorage.setItem(key(mode), '');
}
export function gameDraftIdentity(id: string, seed: string, puzzle: Puzzle) {
  return {
    version: 1 as const,
    ...(puzzle.curriculum ? { curriculum: puzzle.curriculum } : {}),
    id,
    seed,
    level: puzzle.level as GameDraft['level'],
    puzzleKey: JSON.stringify(puzzle),
  };
}
