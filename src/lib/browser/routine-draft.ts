import { studyStorage } from '../workspace';
import { makeRoutine, routineFormat, validRoutineResponse, type RoutineMode } from '../routine';
export type RoutineDraft = {
  id: string;
  mode: RoutineMode;
  level: string;
  block: number;
  edition: 1 | 2 | 3;
  variant?: number;
  answers: string[];
  choice: string;
  picked: number[];
  checked: boolean;
  helpUsed: boolean;
  seconds: number;
  support?: { questionId: string; kind: 'hint' | 'translation' | 'word'; step: number }[];
};
const key = 'routine-draft:v1';
const indexKey = 'routine-drafts:v2';
function storedIds(): string[] {
  try {
    const ids = JSON.parse(studyStorage.getItem(indexKey) || '[]');
    return Array.isArray(ids)
      ? ids.filter((id) => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id))
      : [];
  } catch {
    return [];
  }
}
function validateDraft(raw: string | null): RoutineDraft | undefined {
  try {
    if (!raw) return;
    const x = JSON.parse(raw);
    if (
      typeof x.id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x.id) ||
      !['vocabulary', 'grammar', 'reading'].includes(x.mode) ||
      ![1, 2, 3].includes(x.edition) ||
      (x.variant !== undefined &&
        (!Number.isInteger(x.variant) || x.variant < 0 || x.variant > 1000)) ||
      !Number.isInteger(x.block) ||
      x.block < 0 ||
      x.block > 100 ||
      !Array.isArray(x.answers) ||
      typeof x.choice !== 'string' ||
      !Array.isArray(x.picked) ||
      typeof x.checked !== 'boolean' ||
      typeof x.helpUsed !== 'boolean' ||
      !Number.isInteger(x.seconds) ||
      x.seconds < 0 ||
      x.seconds > 7200
    )
      return;
    const set = makeRoutine(x.mode, x.level, x.block, undefined, {
      edition: x.edition,
      variant: x.variant,
    });
    if (
      x.answers.length > set.rounds.length ||
      x.answers.some((a: unknown) => typeof a !== 'string' || a.length > 1000)
    )
      return;
    for (let i = 0; i < x.answers.length; i++) {
      const q = set.rounds[i],
        answer = x.answers[i];
      if (!validRoutineResponse(q, x.mode, answer)) return;
    }
    const round = set.rounds[Math.min(x.answers.length, set.rounds.length - 1)];
    if (
      new Set(x.picked).size !== x.picked.length ||
      x.picked.some(
        (n: unknown) => !Number.isInteger(n) || Number(n) < 0 || Number(n) >= round.choices.length,
      )
    )
      return;
    const format = routineFormat(round, x.mode);
    if (x.choice && format === 'choice' && !round.choices.includes(x.choice)) return;
    if (x.choice.length > 1000) return;
    if (
      x.support !== undefined &&
      (!Array.isArray(x.support) ||
        x.support.length > 100 ||
        x.support.some(
          (s: { questionId?: unknown; kind?: unknown; step?: unknown }) =>
            typeof s?.questionId !== 'string' ||
            !set.rounds.some((q) => q.id === s.questionId) ||
            !['hint', 'translation', 'word'].includes(String(s.kind)) ||
            !Number.isInteger(s.step) ||
            Number(s.step) < 0 ||
            Number(s.step) > 8,
        ))
    )
      return;
    if (
      x.checked &&
      x.answers.length < set.rounds.length &&
      (format === 'tiles' ? x.picked.length !== round.choices.length : !x.choice.trim())
    )
      return;
    return x as RoutineDraft;
  } catch {
    return;
  }
}
export function readRoutineDraft(selector?: {
  mode?: RoutineMode;
  level?: string;
  block?: number;
}): RoutineDraft | undefined {
  const drafts = [...storedIds()]
    .reverse()
    .map((id) => validateDraft(studyStorage.getItem(`routine-draft:v2:${id}`)));
  drafts.push(validateDraft(studyStorage.getItem(key)));
  return drafts.find(
    (d) =>
      d &&
      (!selector ||
        ((!selector.mode || d.mode === selector.mode) &&
          (!selector.level || d.level === selector.level) &&
          (selector.block === undefined || d.block === selector.block))),
  );
}
export function writeRoutineDraft(value: RoutineDraft) {
  // The stable v1 key remains readable. New attempts are independent so changing activity never replaces an unfinished one.
  studyStorage.setItem(`routine-draft:v2:${value.id}`, JSON.stringify(value));
  const ids = storedIds().filter((id) => id !== value.id);
  studyStorage.setItem(indexKey, JSON.stringify([...ids, value.id]));
}
export function clearRoutineDraft(id: string) {
  studyStorage.setItem(`routine-draft:v2:${id}`, '');
  studyStorage.setItem(indexKey, JSON.stringify(storedIds().filter((value) => value !== id)));
  if (validateDraft(studyStorage.getItem(key))?.id === id) studyStorage.setItem(key, '');
}
