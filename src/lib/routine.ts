import {
  routineWords,
  routineSentences,
  routineReadings,
} from '@/locales/learning/routine-content';
import { isPortuguese } from './workspace';
import { normalizeAnswer } from './games';
import type { Result } from './types';
export type RoutineMode = 'vocabulary' | 'grammar' | 'reading';
export const routineEdition = 1;
export const routineTitles: Record<RoutineMode, string> = isPortuguese
  ? {
      vocabulary: 'Descobrir palavras',
      grammar: 'Montar uma frase',
      reading: 'Entender uma situação',
    }
  : {
      vocabulary: 'Discover words',
      grammar: 'Build a sentence',
      reading: 'Understand a situation',
    };
export type RoutineQuestion = {
  id: string;
  prompt: string;
  spanish: string;
  solution: string;
  choices: string[];
  why: string;
  icon?: string;
  illustrations?: Record<string, string>;
};
export type RoutineSet = {
  mode: RoutineMode;
  level: string;
  block: number;
  edition: number;
  text?: string;
  rounds: RoutineQuestion[];
};
function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let state = seed + 13;
  for (let i = out.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
export function makeRoutine(
  mode: RoutineMode,
  level: string,
  block: number,
  pt = isPortuguese,
): RoutineSet {
  if (!Object.hasOwn(routineWords, level) || !Number.isInteger(block) || block < 0)
    throw new Error('Rutina no disponible.');
  const rounds: RoutineQuestion[] = [];
  let text: string | undefined;
  if (mode === 'vocabulary') {
    const bank = routineWords[level];
    for (let n = 0; n < 3; n++) {
      const index = (block * 3 + n) % bank.length,
        word = bank[index],
        others = bank.filter((_, i) => i !== index);
      const choices = shuffle(
        [word, ...shuffle(others, block * 31 + n).slice(0, 3)],
        block * 17 + n,
      );
      const solution = pt ? word.pt : word.en;
      rounds.push({
        id: `v-${index}`,
        prompt: pt ? 'Qual palavra corresponde?' : 'Which word matches?',
        spanish: word.es,
        solution,
        choices: choices.map((w) => (pt ? w.pt : w.en)),
        icon: word.icon,
        illustrations: Object.fromEntries(choices.map((w) => [pt ? w.pt : w.en, w.icon])),
        why: `«${solution}» significa «${word.es}». Compará los significados: ${choices.map((w) => `${pt ? w.pt : w.en}: ${w.es}`).join('; ')}.`,
      });
    }
  } else if (mode === 'grammar') {
    const bank = routineSentences[level];
    for (let n = 0; n < 3; n++) {
      const index = (block * 3 + n) % bank.length,
        s = bank[index],
        pieces = pt ? s.pt : s.en;
      rounds.push({
        id: `g-${index}`,
        prompt: pt ? 'Monte a frase.' : 'Build the sentence.',
        spanish: s.es,
        solution: pieces.join(' '),
        choices: shuffle(pieces, block * 19 + n),
        why: pt ? s.whyPT : s.whyEN,
      });
    }
  } else {
    const index = block % routineReadings[level].length,
      story = routineReadings[level][index];
    text = pt ? story.pt : story.en;
    story.checks.forEach((q, n) =>
      rounds.push({
        id: `r-${index}-${n}`,
        prompt: pt ? q.pt : q.en,
        spanish: q.es,
        solution: (pt ? q.optionsPT : q.optionsEN)[q.answer],
        choices: pt ? q.optionsPT : q.optionsEN,
        why: q.why,
      }),
    );
  }
  return { mode, level, block, edition: routineEdition, text, rounds };
}
export function routineRecord(
  r: Result,
):
  | { mode: RoutineMode; level: string; block: number; edition: number; helpUsed: boolean }
  | undefined {
  if (!r.activity_id.startsWith('routine:')) return;
  try {
    const x = JSON.parse(r.answers);
    if (
      x.edition === routineEdition &&
      ['vocabulary', 'grammar', 'reading'].includes(x.mode) &&
      Object.hasOwn(routineWords, x.level) &&
      Number.isInteger(x.block) &&
      x.block >= 0 &&
      x.mode === r.skill
    )
      return {
        mode: x.mode,
        level: x.level,
        block: x.block,
        edition: x.edition,
        helpUsed: x.helpUsed === true,
      };
  } catch {}
}
export function routineScore(set: RoutineSet, answers: string[]) {
  return answers.filter((s, i) => normalizeAnswer(s) === normalizeAnswer(set.rounds[i].solution))
    .length;
}
