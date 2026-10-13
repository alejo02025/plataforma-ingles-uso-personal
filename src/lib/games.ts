import { glossary } from './content';
import type { Word, Snapshot } from './types';
export type GameMode = 'match' | 'sentence' | 'trail';
export type Puzzle = {
  mode: GameMode;
  rounds: { word: string; meaning: string; solution: string; choices: string[] }[];
};
export const gameTitles: Record<GameMode, string> = {
  match: 'Meaning Match',
  sentence: 'Sentence Shuffle',
  trail: 'Word Trail',
};
export function normalizeAnswer(text: string) {
  return text.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}
export function makePuzzle(mode: GameMode, seed: string): Puzzle {
  let state = Array.from(seed).reduce((n, c) => (Math.imul(n, 31) + c.charCodeAt(0)) >>> 0, 7);
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  function shuffle<T>(items: T[]) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  const entries = Object.entries(glossary).filter(
    ([word, item]) =>
      item.meaning &&
      item.example &&
      (mode !== 'trail' || /^[\p{L}]{5}$/u.test(word)) &&
      (mode !== 'sentence' || item.example.split(/\s+/).length <= 14),
  );
  const picked = shuffle(entries).slice(0, mode === 'trail' ? 1 : 4);
  if (!picked.length) throw new Error('No words are available for this game.');
  return {
    mode,
    rounds: picked.map(([word, item]) => {
      const solution = mode === 'sentence' ? item.example : word;
      return {
        word,
        meaning: item.meaning,
        solution,
        choices:
          mode === 'sentence'
            ? shuffle(solution.split(/\s+/))
            : mode === 'match'
              ? shuffle([
                  word,
                  ...shuffle(
                    entries.filter(
                      ([other, meaning]) => other !== word && meaning.meaning !== item.meaning,
                    ),
                  )
                    .slice(0, 3)
                    .map(([other]) => other),
                ])
              : [],
      };
    }),
  };
}
export function letterMarks(answer: string, guess: string): ('exact' | 'present' | 'absent')[] {
  const remaining = Array.from(normalizeAnswer(answer)),
    letters = Array.from(normalizeAnswer(guess));
  const marks: ('exact' | 'present' | 'absent')[] = letters.map((letter, i) =>
    letter === remaining[i] ? 'exact' : 'absent',
  );
  marks.forEach((mark, i) => {
    if (mark === 'exact') remaining[i] = '';
  });
  letters.forEach((letter, i) => {
    if (marks[i] === 'exact') return;
    const at = remaining.indexOf(letter);
    if (at >= 0) {
      marks[i] = 'present';
      remaining[at] = '';
    }
  });
  return marks;
}
export function recallBand(word: Word, reviews: Snapshot['reviews']) {
  const recent = reviews.filter((r) => r.word_id === word.id).slice(-3);
  if (!recent.length || !recent.at(-1)?.known) return 'weak';
  return recent.length >= 3 && recent.every((r) => r.known) ? 'strong' : 'growing';
}
