import { routineRecord } from './routine';
import { lessons, type Lesson } from './lessons';
import { grammarQuestions } from './content';
import { cefrLevels, type CefrLevel } from './cefr-curriculum';
import { isPortuguese } from './workspace';
import type { Snapshot, Result, Activity } from './types';
export type Requirement = {
  id: string;
  done: boolean;
  explanation: string;
  view: string;
  activity?: Activity;
  lessonId?: string;
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
      !body(r).helpUsed &&
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
  const blockIndex = Math.floor(
    levelLessons(block[0]?.level).findIndex((l) => l.id === block[0]?.id) / blockSize,
  );
  const starters = data.results.filter((r) => {
    const record = routineRecord(r);
    return record?.level === block[0]?.level && record?.block === blockIndex;
  });
  const began = [
    ...passes.filter(Boolean).map((r) => r!.completed_at),
    ...starters.map((r) => r.completed_at),
  ].sort()[0];
  const recent = data.results.filter((r) => began && r.completed_at >= began && !lessonRecord(r));
  const target = block[0]?.level;
  const reading =
    starters.some((r) => {
      const record = routineRecord(r);
      return (
        r.skill === 'reading' &&
        !record?.helpUsed &&
        !record?.needsReview &&
        Number(r.total) > 0 &&
        Number(r.correct) / Number(r.total) >= 0.6
      );
    }) ||
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
  const starterVocabulary = starters.some((r) => {
    const record = routineRecord(r);
    return (
      r.skill === 'vocabulary' &&
      !record?.helpUsed &&
      !record?.needsReview &&
      Number(r.total) > 0 &&
      Number(r.correct) / Number(r.total) >= 0.8
    );
  });
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
        'Completá la lectura breve de Actividades o una lectura de tu nivel con al menos 60 % de aciertos, sin ayudas en la rutina; también sirve una pregunta correcta sobre uno de tus PDF. La práctica debe pertenecer a este bloque.',
      view: 'Library',
    },
    {
      id: 'vocabulary',
      done: game || starterVocabulary,
      explanation:
        'Completá Descubrir palabras de este bloque con al menos 80 % sin ayudas o guardá un juego con al menos 75 % sin ayudas durante este bloque. Los repasos autoevaluados programan memoria, pero no son una prueba objetiva.',
      view: 'Vocabulary',
    },
    {
      id: 'writing',
      done: writing,
      explanation:
        'Guardá una práctica de escritura de al menos 30 caracteres en My Day. La extensión acredita la práctica, no la calidad ni el nivel de tu texto.',
      view: 'My Day',
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
      (reinforcement(data, level).length > 0 ||
        Boolean(data.backlog?.some((a) => !a.completed_at)) ||
        !items.length ||
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
  requirements.push(...reinforcement(data, route.level).filter((r) => r.lessonId !== lesson.id));
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

/** Recent exercise evidence pauses new work without removing previously earned checkpoints. */
export function reinforcement(data: CourseEvidence, level: string): Requirement[] {
  const cutoff = new Date(`${data.day}T12:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - 14);
  const recent = data.results.filter(
    (r) => r.day >= cutoff.toISOString().slice(0, 10) && r.correct !== null && Number(r.total) > 0,
  );
  const documents = [...data.documents, ...(data.trashedDocuments || [])];
  const atLevel = (r: Result) => {
    const starter = routineRecord(r);
    if (starter)
      return (
        cefrLevels.indexOf(starter.level as CefrLevel) >= cefrLevels.indexOf(startLevel) &&
        cefrLevels.indexOf(starter.level as CefrLevel) <= cefrLevels.indexOf(level as CefrLevel)
      );
    const record = lessonRecord(r);
    if (record) {
      const band = lessons.find((l) => l.id === record.lessonId)?.level;
      return (
        band &&
        cefrLevels.indexOf(band) >= cefrLevels.indexOf(startLevel) &&
        cefrLevels.indexOf(band) <= cefrLevels.indexOf(level as CefrLevel)
      );
    }
    if (r.skill === 'reading')
      return documents.some(
        (d) =>
          d.id === r.document_id &&
          ((cefrLevels.indexOf(d.level as CefrLevel) >= 0 &&
            cefrLevels.indexOf(d.level as CefrLevel) <= cefrLevels.indexOf(level as CefrLevel)) ||
            Boolean(d.filename)),
      );
    if (r.skill === 'grammar') {
      try {
        const ids = Object.keys(JSON.parse(r.answers).choices || {});
        return ids.some((id) =>
          grammarQuestions.some(
            (q) =>
              q.id === id &&
              cefrLevels.indexOf(q.band as CefrLevel) >= 0 &&
              cefrLevels.indexOf(q.band as CefrLevel) <= cefrLevels.indexOf(level as CefrLevel),
          ),
        );
      } catch {
        return false;
      }
    }
    return r.skill === 'vocabulary';
  };
  const scored = recent
    .filter(atLevel)
    .filter((r) => !routineRecord(r)?.needsReview)
    .filter(
      (r) =>
        !(
          (r.skill === 'vocabulary' || Boolean(routineRecord(r))) &&
          body(r).helpUsed &&
          Number(r.correct) / Number(r.total) >= 0.8
        ),
    );
  for (const attempt of data.tutorAttempts.filter(
    (a) => a.correct !== null && a.created_at.slice(0, 10) >= cutoff.toISOString().slice(0, 10),
  )) {
    if (documents.some((d) => d.id === attempt.document_id && (d.filename || d.level === level)))
      scored.push({
        id: `pdf-check:${attempt.id}`,
        activity_id: `pdf-check:${attempt.id}`,
        skill: 'reading',
        correct: attempt.correct,
        total: 1,
        answers: '{}',
        completed_at: attempt.created_at,
        day: attempt.created_at.slice(0, 10),
        active_seconds: 0,
        title: attempt.prompt,
        document_id: attempt.document_id,
      });
  }
  const pending: Requirement[] = [];
  for (const skill of ['reading', 'grammar', 'vocabulary'] as const) {
    const rows = scored
      .filter((r) => (lessonRecord(r) ? skill === 'grammar' : r.skill === skill))
      .sort((a, b) => a.completed_at.localeCompare(b.completed_at) || a.id.localeCompare(b.id))
      .slice(-3);
    if (rows.length < 2) continue;
    const latest = rows.at(-1)!,
      correct = rows.reduce((n, r) => n + Number(r.correct), 0),
      total = rows.reduce((n, r) => n + Number(r.total), 0);
    if (
      correct / total >= 0.7 ||
      (Number(latest.correct) / Number(latest.total) >= 0.8 &&
        !(skill === 'vocabulary' && body(latest).helpUsed))
    )
      continue;
    const lessonId = lessonRecord(latest)?.lessonId;
    pending.push({
      id: `reinforce:${skill}`,
      done: false,
      view: routineRecord(latest)
        ? 'Home'
        : lessonId
          ? 'Classes'
          : skill === 'reading'
            ? 'Library'
            : skill === 'vocabulary'
              ? 'Games'
              : 'My Day',
      lessonId,
      explanation: `Necesitás reforzar ${skill === 'reading' ? 'lectura' : skill === 'grammar' ? 'gramática' : 'vocabulario'}: tus últimos ${rows.length} ejercicios de esta competencia registran ${correct} de ${total} respuestas correctas. Completá una nueva práctica de esa competencia con al menos 80 % de aciertos${skill === 'vocabulary' ? ' sin ayudas' : ''} para habilitar nuevas clases. Tus niveles, hitos e intentos anteriores se conservan.`,
    });
  }
  return pending;
}
export function learningJourney(data: CourseEvidence) {
  const route = courseRoute(data),
    items = levelLessons(route.level);
  const blocks = Array.from({ length: Math.ceil(items.length / blockSize) }, (_, i) =>
    items.slice(i * blockSize, (i + 1) * blockSize),
  );
  const block = Math.max(
    0,
    blocks.findIndex((items) => !integration(data, items).every((r) => r.done)),
  );
  const repairs = reinforcement(data, route.level),
    backlog = data.backlog?.find((a) => !a.completed_at);
  const tasks = integration(data, blocks[block] || []);
  const pending: Requirement[] = [
    ...(backlog
      ? [
          {
            id: 'backlog',
            done: false,
            view: 'My Day',
            activity: backlog,
            explanation: `Retomá la lectura pendiente «${backlog.title}». Conserva tu sesión y tus respuestas.`,
          },
        ]
      : []),
    ...repairs,
    ...tasks.filter((r) => !r.done),
  ];
  const nextLesson = items.find((l) => !passedLesson(data, l.id));
  return { ...route, block, tasks, repairs, pending, nextLesson, next: pending[0] };
}
