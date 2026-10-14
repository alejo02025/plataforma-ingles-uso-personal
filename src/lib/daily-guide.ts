import { glossary } from './content';
import { learningJourney, lessonRequirements, passedLesson, levelLessons } from './course-route';
import { makePuzzle } from './games';
import type { Snapshot } from './types';
export type NewsStory = {
  id: string;
  language: string;
  topic: string;
  source: string;
  title: string;
  url: string;
  published: string;
};
const ignored = new Set(
  'the and with this that your from have about uma para como você vocês seus suas mais está são que por dos das com'.split(
    ' ',
  ),
);
function tokens(text: string) {
  return new Set(
    text
      .toLocaleLowerCase()
      .match(/[\p{L}]{4,}/gu)
      ?.filter((w) => !ignored.has(w)) || [],
  );
}
function overlap(a: string, b: string) {
  const words = tokens(a);
  return [...tokens(b)].filter((w) => words.has(w)).length;
}
/** Suggestions never create activities, award credit or change access requirements. */
export function dailyGuide(data: Snapshot, stories: NewsStory[] = []) {
  const journey = learningJourney(data);
  const next = journey.nextLesson;
  const repair = journey.repairs.find((r) => r.lessonId)?.lessonId;
  const items = levelLessons(journey.level);
  const lesson =
    items.find((l) => l.id === repair) ||
    (next && !lessonRequirements(data, next).some((r) => !r.done)
      ? next
      : [...items].reverse().find((l) => passedLesson(data, l.id)) || next || items.at(-1)!);
  const lessonText = `${lesson.goal} ${lesson.pattern} ${lesson.examples.join(' ')}`;
  const pending = data.backlog?.find((a) => a.kind === 'reading' && !a.completed_at);
  const reading =
    data.documents.find((d) => d.id === pending?.document_id) ||
    data.documents
      .filter((d) => d.level === journey.level && !d.filename)
      .sort(
        (a, b) =>
          overlap(`${b.intro} ${b.paragraphs.join(' ')}`, lessonText) -
            overlap(`${a.intro} ${a.paragraphs.join(' ')}`, lessonText) || a.id.localeCompare(b.id),
      )[0];
  const text = `${reading?.paragraphs.join(' ') || ''} ${lessonText}`;
  const candidates = Object.keys(glossary).filter((w) =>
    text.toLocaleLowerCase().includes(w.toLocaleLowerCase()),
  );
  let seed = `${data.day}:guide:0`,
    puzzle = makePuzzle('match', seed, journey.level, 2);
  for (let i = 1; i < 100 && !puzzle.rounds.some((r) => candidates.includes(r.word)); i++) {
    seed = `${data.day}:guide:${i}`;
    puzzle = makePuzzle('match', seed, journey.level, 2);
  }
  const linkedWords = puzzle.rounds.filter((r) => candidates.includes(r.word)).map((r) => r.word);
  const ranked = [...stories].sort(
    (a, b) => overlap(b.title, text) - overlap(a.title, text) || a.id.localeCompare(b.id),
  );
  const linkedStory = ranked.find((s) => overlap(s.title, text) > 0);
  const dayIndex = [...data.day].reduce((n, c) => n + c.charCodeAt(0), 0);
  const story = linkedStory || ranked[dayIndex % Math.max(1, ranked.length)];
  return {
    journey,
    lesson,
    reading,
    pending,
    story,
    relatedStory: Boolean(linkedStory),
    seed,
    puzzle,
    linkedWords,
    minutes: Math.min(5, reading?.minutes || 3) + 8 + 4 + 3,
  };
}
