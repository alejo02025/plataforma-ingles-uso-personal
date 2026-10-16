import {
  routineWords,
  routineSentences,
  routineReadings,
} from '@/locales/learning/routine-content';
import {
  wordContexts,
  sentenceContexts,
  sentenceReasons,
} from '@/locales/learning/routine-context';
import { contextualReadings } from '@/locales/learning/routine-reading-v2';
import { isPortuguese } from './workspace';
import { sentenceWorkshop } from '@/locales/learning/sentence-workshop';
import { normalizeAnswer } from './games';
import type { Result } from './types';
export type RoutineMode = 'vocabulary' | 'grammar' | 'reading';
export const routinePassThreshold = (mode: RoutineMode) => (mode === 'reading' ? 0.6 : 0.8);
export const routineEdition = 3;
export type RoutineEdition = 1 | 2 | 3;
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
  explanationNative?: string;
  context?: string;
  contextSpanish?: string;
  text?: string;
  textSpanish?: string;
  scene?: 'home' | 'travel' | 'ideas';
  icon?: string;
  illustrations?: Record<string, string>;
  format?: 'tiles' | 'choice' | 'gap' | 'transform' | 'correct' | 'recall';
  source?: string;
  solutionSpanish?: string;
  completedModel?: string;
  accepted?: string[];
  incorrect?: string[];
  category?: string;
  hints?: { native: string; spanish: string }[];
};
export type RoutineSet = {
  mode: RoutineMode;
  level: string;
  block: number;
  edition: number;
  variant?: number;
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
  options: { edition?: RoutineEdition; variant?: number } = {},
): RoutineSet {
  if (!Object.hasOwn(routineWords, level) || !Number.isInteger(block) || block < 0)
    throw new Error('Rutina no disponible.');
  const edition = options.edition ?? routineEdition;
  const variant = options.variant ?? 0;
  if (![1, 2, 3].includes(edition) || !Number.isInteger(variant) || variant < 0 || variant > 1000)
    throw new Error('Edición de rutina no disponible.');
  if (edition === 3) {
    if (mode === 'grammar')
      return {
        mode,
        level,
        block,
        edition,
        variant,
        rounds: sentenceWorkshop(level, block, variant, pt),
      };
    const set = contextualRoutine(mode, level, block, pt, variant);
    return {
      ...set,
      edition,
      rounds: set.rounds.map((q, i) => ({
        ...q,
        ...(mode === 'vocabulary' && i >= 3
          ? {
              format: 'recall' as const,
              prompt: pt
                ? 'Recupere e escreva a palavra que falta.'
                : 'Recall and type the missing word.',
              spanish: 'Recuperá y escribí la palabra que falta. No hay opciones para elegir.',
              choices: [],
              why: q.why.split('. Las otras opciones significan:')[0].replace(/[.\s]+$/, '') + '.',
              completedModel: q.context?.replace('___', q.solution),
            }
          : { format: 'choice' as const }),
      })),
    };
  }
  if (edition === 2) return contextualRoutine(mode, level, block, pt, variant);
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
  return { mode, level, block, edition: 1, text, rounds };
}
export function routineRecord(r: Result):
  | {
      mode: RoutineMode;
      level: string;
      block: number;
      edition: number;
      variant: number;
      helpUsed: boolean;
      needsReview: boolean;
    }
  | undefined {
  if (!r.activity_id.startsWith('routine:')) return;
  try {
    const x = JSON.parse(r.answers);
    if (
      [1, 2, 3].includes(x.edition) &&
      (x.variant === undefined ||
        (Number.isInteger(x.variant) && x.variant >= 0 && x.variant <= 1000)) &&
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
        variant: x.variant ?? 0,
        helpUsed: x.helpUsed === true,
        needsReview: Number(x.unverified || 0) > 0,
      };
  } catch {}
}
export function routineScore(set: RoutineSet, answers: string[]) {
  return answers.filter((s, i) => set.rounds[i] && routineVerdict(set.rounds[i], s) === 'correct')
    .length;
}

/** Deliberately bounded comparison: accents, negation and meaning are never stripped. */
export function normalizeProduction(text: string): string {
  const contractions: Record<string, string> = {
    "i'm": 'i am',
    "you're": 'you are',
    "he's": 'he is',
    "she's": 'she is',
    "we're": 'we are',
    "they're": 'they are',
    "don't": 'do not',
    "doesn't": 'does not',
    "didn't": 'did not',
    "isn't": 'is not',
    "aren't": 'are not',
    "wasn't": 'was not',
    "weren't": 'were not',
    "haven't": 'have not',
    "hasn't": 'has not',
    "hadn't": 'had not',
    "won't": 'will not',
    "wouldn't": 'would not',
    "can't": 'cannot',
    "couldn't": 'could not',
  };
  return normalizeAnswer(
    text
      .normalize('NFC')
      .replace(/[‘’]/g, "'")
      .replace(/[.!?]+\s*$/, '')
      .replace(/,/g, ''),
  ).replace(/\b[a-z]+(?:'[a-z]+)\b/g, (word) => contractions[word] || word);
}
export function routineFormat(q: RoutineQuestion, mode: RoutineMode) {
  return q.format || (mode === 'grammar' ? 'tiles' : 'choice');
}
export function routineVerdict(
  q: RoutineQuestion,
  answer: string,
): 'correct' | 'incorrect' | 'unverified' {
  if (!q.format)
    return normalizeAnswer(answer) === normalizeAnswer(q.solution) ? 'correct' : 'incorrect';
  const normalized = normalizeProduction(answer);
  if (
    [q.solution, ...(q.accepted || [])].some((value) => normalizeProduction(value) === normalized)
  ) {
    // In pt-BR, an unchanged declarative word order needs a written question mark.
    if (
      q.solution.endsWith('?') &&
      /^(Você|Poderíamos)/.test(q.solution) &&
      !answer.trim().endsWith('?')
    )
      return 'unverified';
    return 'correct';
  }
  if (q.format === 'transform' || q.format === 'correct' || q.format === 'recall') {
    return q.incorrect?.some((value) => normalizeProduction(value) === normalized)
      ? 'incorrect'
      : 'unverified';
  }
  return 'incorrect';
}
export function routineEvaluation(set: RoutineSet, answers: string[]) {
  const verdicts = set.rounds.map((q, i) => routineVerdict(q, answers[i] || ''));
  const unverified = verdicts.filter((v) => v === 'unverified').length;
  return {
    correct: verdicts.filter((v) => v === 'correct').length,
    total: verdicts.length - unverified,
    unverified,
    verdicts,
  };
}

/** Input validity is separate from linguistic correctness; an error must still be saved. */
export function validRoutineResponse(
  q: RoutineQuestion,
  mode: RoutineMode,
  answer: string,
): boolean {
  const format = routineFormat(q, mode);
  if (!answer.trim() || answer.length > 1000) return false;
  if (format === 'tiles') {
    const bag = (s: string) => normalizeAnswer(s).split(' ').sort().join('|');
    return bag(answer) === bag(q.solution);
  }
  if (format === 'choice') return q.choices.includes(answer);
  return true;
}

function contextualRoutine(
  mode: RoutineMode,
  level: string,
  block: number,
  pt: boolean,
  variant: number,
): RoutineSet {
  const rounds: RoutineQuestion[] = [];
  const scene = level === 'A1' ? 'home' : level === 'A2' || level === 'B1' ? 'travel' : 'ideas';
  const offset = block * 3 + variant * 3;
  const seed = block * 101 + variant * 47;
  if (mode === 'vocabulary') {
    const bank = routineWords[level];
    for (let n = 0; n < 6; n++) {
      const index = (offset + n) % bank.length,
        word = bank[index];
      const choices = shuffle(
        [
          word,
          ...shuffle(
            bank.filter((_, i) => i !== index),
            seed + n,
          ).slice(0, 3),
        ],
        seed + n * 13,
      );
      const context = wordContexts[level][index];
      const solution = pt ? word.pt : word.en;
      const recognition = n < 3;
      const completed = (pt ? context.pt : context.en).replace('___', solution);
      rounds.push({
        id: `v2-v-${index}-${recognition ? 'meaning' : 'context'}`,
        prompt: recognition
          ? pt
            ? 'Qual palavra completa esta situação?'
            : 'Which word completes this situation?'
          : pt
            ? 'Escolha a palavra que faz sentido no contexto.'
            : 'Choose the word that makes sense in context.',
        spanish: recognition
          ? `¿Qué palabra completa esta situación? Pista: ${word.es}.`
          : 'Elegí según la situación, no solo por la imagen.',
        context: pt ? context.pt : context.en,
        contextSpanish: context.es,
        solution,
        solutionSpanish: context.es.replace('___', word.es),
        completedModel: completed,
        choices: choices.map((w) => (pt ? w.pt : w.en)),
        illustrations: recognition
          ? Object.fromEntries(choices.map((w) => [pt ? w.pt : w.en, w.icon]))
          : undefined,
        scene,
        why: `«${solution}» significa «${word.es}». En esta situación: ${context.es.replace('___', word.es)}. Las otras opciones significan: ${choices
          .filter((w) => w !== word)
          .map((w) => `${pt ? w.pt : w.en}: ${w.es}`)
          .join(
            '; ',
          )}. Leé la frase completa antes de elegir: una palabra relacionada con el tema no siempre completa la idea.`,
        explanationNative: pt
          ? `Use “${solution}” nesta situação: ${completed} Confira a frase inteira; uma palavra do mesmo tema pode não completar a ideia.`
          : `Use “${solution}” in this situation: ${completed} Check the whole sentence; a word from the same topic may not complete its meaning.`,
      });
    }
  } else if (mode === 'grammar') {
    for (let n = 0; n < 6; n++) {
      const index = (offset + n) % routineSentences[level].length;
      const sentence = routineSentences[level][index],
        context = sentenceContexts[level][index],
        reason = sentenceReasons[level][index];
      const pieces = pt ? sentence.pt : sentence.en;
      rounds.push({
        id: `v2-g-${index}`,
        prompt: pt
          ? 'Monte a frase para responder à situação.'
          : 'Build a sentence to respond to the situation.',
        spanish: sentence.es,
        solution: pieces.join(' '),
        choices: shuffle(pieces, seed + n * 19),
        context: pt ? context.pt : context.en,
        contextSpanish: context.es,
        why: `${pt ? sentence.whyPT : sentence.whyEN} ${reason.es} Antes de responder, identificá quién habla, cuándo sucede y si se afirma, niega o pregunta.`,
        explanationNative: pt ? reason.pt : reason.en,
        scene,
      });
    }
  } else {
    const bank = contextualReadings[level];
    for (let n = 0; n < bank.length; n++) {
      const index = (block + variant + n) % bank.length,
        story = bank[index];
      story.checks.forEach((q, i) => {
        const options = pt ? q.optionsPT : q.optionsEN;
        rounds.push({
          id: `v2-r-${index}-${i}`,
          prompt: pt ? q.pt : q.en,
          spanish: q.es,
          text: pt ? story.pt : story.en,
          textSpanish: story.es,
          solution: options[q.answer],
          choices: shuffle(options, seed + n * 17 + i),
          why: `${q.why} Buscá la frase que sostiene tu respuesta y descartá las opciones que agregan información no mencionada.`,
          explanationNative: pt ? q.whyPT : q.whyEN,
          scene,
        });
      });
    }
  }
  return { mode, level, block, edition: 2, variant, rounds };
}
