import { lessons, type Lesson } from './lessons';
import { cefrLevels, type CefrLevel } from './cefr-curriculum';
import { isPortuguese } from './workspace';
import type { Snapshot, Result, Activity } from './types';
export type Requirement = {
  id: string;
  done: boolean;
  explanation: string;
  view: string;
  activity?: Activity;
};
export type CourseEvidence = Pick<
  Snapshot,
  'results' | 'reviews' | 'tutorMessages' | 'tutorAttempts' | 'documents' | 'day'
> & {
  backlog?: Activity[];
  courseCheckpoints?: Snapshot['courseCheckpoints'];
  trashedDocuments?: Snapshot['documents'];
};
export const startLevel: CefrLevel = isPortuguese ? 'A1' : 'A2';
export function lessonRecord(result: Result) {
  if (!result.activity_id.startsWith('class:')) return undefined;
  try {
    return JSON.parse(result.answers) as { lessonId: string; practice?: string; revision?: number };
  } catch {
    return undefined;
  }
}
export function passedLesson(data: CourseEvidence, id: string) {
  return data.results.find(
    (r) =>
      lessonRecord(r)?.lessonId === id &&
      Number(r.total) > 0 &&
      Number(r.correct) / Number(r.total) >= 0.8,
  );
}
export function levelLessons(level: string): Lesson[] {
  return lessons.filter((l) => l.level === level);
}
function body(result: Result) {
  try {
    return JSON.parse(result.answers) as { text?: string; practice?: string; helpUsed?: boolean };
  } catch {
    return {};
  }
}
/** Evidence belongs to this workspace and the current block's study window. A class score is not reused as a reading task. */
export function integration(data: CourseEvidence, block: Lesson[]): Requirement[] {
  const passes = block.map((l) => passedLesson(data, l.id));
  const began = passes
    .filter(Boolean)
    .map((r) => r!.completed_at)
    .sort()[0];
  const recent = data.results.filter((r) => began && r.completed_at >= began && !lessonRecord(r));
  const target = block[0]?.level;
  const reading =
    recent.some(
      (r) =>
        r.skill === 'reading' &&
        Number(r.total) > 0 &&
        Number(r.correct) / Number(r.total) >= 0.6 &&
        [...data.documents, ...(data.trashedDocuments || [])].some(
          (d) => d.id === r.document_id && (d.level === target || Boolean(d.filename)),
        ),
    ) ||
    data.tutorAttempts.some(
      (r) =>
        began &&
        r.created_at >= began &&
        r.correct === 1 &&
        [...data.documents, ...(data.trashedDocuments || [])].some(
          (d) => d.id === r.document_id && d.filename,
        ),
    );
  const reviews = new Set(
    data.reviews
      .filter((r) => began && r.reviewed_at >= began && r.known === 1)
      .map((r) => r.word_id),
  ).size;
  const game = recent.some(
    (r) =>
      r.activity_id.startsWith('game:') &&
      Number(r.total) > 0 &&
      Number(r.correct) / Number(r.total) >= 0.75 &&
      !body(r).helpUsed,
  );
  const writing = recent.some(
    (r) => r.skill === 'writing' && (body(r).text?.trim().length || 0) >= 30,
  );
  const speaking =
    data.tutorMessages.some(
      (r) =>
        began &&
        r.created_at >= began &&
        r.document_id === 'voice-room' &&
        r.role === 'user' &&
        r.content.trim().length >= 20,
    ) ||
    recent.some((r) => String(r.skill) === 'speaking' && (body(r).text?.trim().length || 0) >= 20);
  const stored = data.courseCheckpoints?.some((r) => r.id === `block:${block[0]?.id}`);
  return [
    {
      id: 'classes',
      done: passes.every(Boolean),
      explanation:
        'Completá las clases de este bloque con al menos 80 % de respuestas correctas. Podés volver a intentarlo; los intentos anteriores se conservan.',
      view: 'Classes',
    },
    {
      id: 'reading',
      done: reading,
      explanation:
        'Desde que comenzaste este bloque, completá una lectura de tu nivel con al menos 60 % de aciertos, o respondé correctamente una pregunta sobre uno de tus PDF.',
      view: 'Library',
    },
    {
      id: 'vocabulary',
      done: reviews >= 3 || game,
      explanation:
        'Repasá correctamente tres palabras distintas o completá y guardá un juego con al menos 75 % de aciertos sin ayudas, después de comenzar este bloque.',
      view: 'Vocabulary',
    },
    {
      id: 'writing',
      done: writing,
      explanation:
        'Guardá una práctica de escritura de al menos 30 caracteres en My Day. La extensión acredita la práctica, no la calidad ni el nivel de tu texto.',
      view: 'My Day',
    },
    {
      id: 'speaking',
      done: speaking,
      explanation:
        'Guardá una intervención de al menos 20 caracteres en Speaking. Podés hablar o escribir si tu dispositivo no tiene micrófono disponible. Se registra la práctica; no certifica pronunciación.',
      view: 'Speaking',
    },
  ].map((r) => (stored ? { ...r, done: true } : r));
}
export const blockSize = 4;
export function courseRoute(data: CourseEvidence) {
  let active = startLevel;
  const completed: CefrLevel[] = [];
  for (const level of cefrLevels.slice(cefrLevels.indexOf(startLevel))) {
    const items = levelLessons(level);
    const preserved = data.courseCheckpoints?.some((r) => r.id === `level:${level}`);
    if (
      !preserved &&
      (!items.length ||
        !Array.from({ length: Math.ceil(items.length / blockSize) }, (_, i) =>
          integration(data, items.slice(i * blockSize, (i + 1) * blockSize)).every((r) => r.done),
        ).every(Boolean))
    ) {
      active = level;
      break;
    }
    completed.push(level);
    active = cefrLevels[Math.min(cefrLevels.indexOf(level) + 1, cefrLevels.length - 1)];
  }
  return { level: active, completed };
}
export function lessonRequirements(data: CourseEvidence, lesson: Lesson): Requirement[] {
  const route = courseRoute(data);
  if (route.completed.includes(lesson.level)) return [];
  if (lesson.level !== route.level)
    return [
      {
        id: 'level',
        done: false,
        explanation: `Tu recorrido empieza en ${startLevel}. El nivel activo es ${route.level}. Los demás niveles se habilitan al completar las clases y prácticas del recorrido; no se pueden saltar desde Preferencias ni desde el diagnóstico.`,
        view: 'Classes',
      },
    ];
  const items = levelLessons(lesson.level),
    index = items.findIndex((l) => l.id === lesson.id),
    block = Math.floor(index / blockSize);
  const requirements: Requirement[] = [];
  // Previously completed classes remain available for review, even when old reading work is outstanding.
  if (passedLesson(data, lesson.id)) return [];
  if (index > 0)
    requirements.push({
      id: 'previous',
      done: Boolean(passedLesson(data, items[index - 1].id)),
      explanation: `Primero completá «${items[index - 1].title}» con al menos 80 % de aciertos.`,
      view: 'Classes',
    });
  if (block > 0)
    requirements.push(
      ...integration(data, items.slice((block - 1) * blockSize, block * blockSize)),
    );
  const pending = data.backlog?.find((a) => a.kind === 'reading' && !a.completed_at);
  if (pending)
    requirements.push({
      id: 'backlog',
      done: false,
      explanation: `Tenés una lectura pendiente de un día anterior: «${pending.title}». Terminala antes de abrir una clase nueva.`,
      view: 'My Day',
      activity: pending,
    });
  return requirements;
}
