import { studyStorage } from '../workspace';
import { makeRoutine, routineEdition, type RoutineMode } from '../routine';
export type RoutineDraft = {
  id: string;
  mode: RoutineMode;
  level: string;
  block: number;
  edition: 1;
  answers: string[];
  choice: string;
  picked: number[];
  checked: boolean;
  helpUsed: boolean;
  seconds: number;
};
const key = 'routine-draft:v1';
export function readRoutineDraft(): RoutineDraft | undefined {
  try {
    const raw = studyStorage.getItem(key);
    if (!raw) return;
    const x = JSON.parse(raw);
    if (
      typeof x.id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x.id) ||
      !['vocabulary', 'grammar', 'reading'].includes(x.mode) ||
      x.edition !== routineEdition ||
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
    const set = makeRoutine(x.mode, x.level, x.block);
    if (
      x.answers.length > set.rounds.length ||
      x.answers.some((a: unknown) => typeof a !== 'string' || a.length > 1000)
    )
      return;
    for (let i = 0; i < x.answers.length; i++) {
      const q = set.rounds[i],
        answer = x.answers[i];
      if (x.mode === 'grammar') {
        const normalize = (value: string) =>
          value.toLowerCase().trim().split(/\s+/).sort().join('|');
        if (normalize(answer) !== normalize(q.solution)) return;
      } else if (!q.choices.includes(answer)) return;
    }
    const round = set.rounds[Math.min(x.answers.length, set.rounds.length - 1)];
    if (
      new Set(x.picked).size !== x.picked.length ||
      x.picked.some(
        (n: unknown) => !Number.isInteger(n) || Number(n) < 0 || Number(n) >= round.choices.length,
      )
    )
      return;
    if (x.choice && x.mode !== 'grammar' && !round.choices.includes(x.choice)) return;
    if (
      x.checked &&
      x.answers.length < set.rounds.length &&
      (x.mode === 'grammar' ? x.picked.length !== round.choices.length : !x.choice)
    )
      return;
    return x as RoutineDraft;
  } catch {
    return;
  }
}
export function writeRoutineDraft(value: RoutineDraft) {
  studyStorage.setItem(key, JSON.stringify(value));
}
export function clearRoutineDraft(id: string) {
  if (readRoutineDraft()?.id === id) studyStorage.setItem(key, '');
}
