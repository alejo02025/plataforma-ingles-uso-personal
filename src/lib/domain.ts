import { levelLessons, reinforcement } from './course-route';
import { studyLevel, courseEvidence, preserveCourseProgress } from './course-store';
import { isPortuguese } from './workspace';
import { cefrCourse } from './cefr-curriculum';
import { answerWhy } from '@/locales/es/answer-help';
import type { db as nativeDb } from './db';
import {
  diagnosticQuestions,
  grammarQuestions,
  writingPrompts,
  glossary,
  type Question,
} from './content';
import { localDay, nextReview, estimate, weakestSkill } from './learning';
import type { Activity, Document, Word, Result, Snapshot } from './types';
type Row = Record<string, unknown>;
const now = () => new Date().toISOString();
export function publicQuestion(q: Question) {
  const { answer, explanation, explanationSpanish, ...rest } = q;
  void answer;
  void explanation;
  void explanationSpanish;
  return rest;
}
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function createLearningService({
  db,
  transaction,
  uuid,
  idFor = () => uuid(),
  aiAvailable = false,
  protectedAccess = false,
}: {
  db: typeof nativeDb;
  transaction: <T>(fn: () => T) => T;
  uuid: () => string;
  idFor?: (seed: string) => string;
  aiAvailable?: boolean;
  protectedAccess?: boolean;
}) {
  function documents(includeTrashed = false): Document[] {
    const rows = db()
      .prepare(
        `SELECT d.*,p.paragraph,p.draft,p.updated_at FROM documents d LEFT JOIN reading_progress p ON p.document_id=d.id WHERE d.source!='conversation' AND (? OR d.source NOT LIKE 'trash:%') ORDER BY d.created_at DESC`,
      )
      .all(Number(includeTrashed)) as Row[];
    return rows.map((r) => ({
      ...r,
      paragraph: r.paragraph || 0,
      draft: JSON.parse((r.draft as string) || '{}'),
      paragraphs: JSON.parse(r.paragraphs as string),
      pages: (JSON.parse(r.paragraphs as string) as string[]).map(
        (_, index) =>
          Number(
            db()
              .prepare('SELECT page FROM document_sections WHERE document_id=? AND paragraph=?')
              .get(r.id as string, index)?.page,
          ) || null,
      ),
      questions: JSON.parse(r.questions as string).map(publicQuestion),
    })) as Document[];
  }
  function diagnostic() {
    let d = db().prepare('SELECT * FROM diagnostics ORDER BY started_at DESC LIMIT 1').get() as
      | Row
      | undefined;
    if (!d) {
      const id = idFor('diagnostic');
      db().prepare('INSERT INTO diagnostics(id,started_at) VALUES(?,?)').run(id, now());
      d = { id, completed_at: null };
    }
    return {
      ...d,
      answers: db()
        .prepare('SELECT question_id,answer,correct FROM diagnostic_answers WHERE diagnostic_id=?')
        .all(d.id as string),
    } as Snapshot['diagnostic'];
  }
  function answerDiagnostic(questionId: string, answer: number) {
    const d = diagnostic();
    if (d.completed_at) throw new AppError('This assessment is already complete.');
    const q = diagnosticQuestions.find((q) => q.id === questionId);
    if (!q || answer < 0 || answer >= q.options.length) throw new AppError('Invalid answer.');
    return transaction(() => {
      if (
        db()
          .prepare(
            'SELECT question_id FROM diagnostic_answers WHERE diagnostic_id=? AND question_id=?',
          )
          .get(d.id, questionId)
      )
        throw new AppError('This answer has already been saved.');
      db()
        .prepare('INSERT INTO diagnostic_answers VALUES(?,?,?,?)')
        .run(d.id, q.id, answer, Number(q.answer === answer));
      const answers = db()
        .prepare('SELECT * FROM diagnostic_answers WHERE diagnostic_id=?')
        .all(d.id) as Row[];
      if (answers.length === diagnosticQuestions.length) {
        db().prepare('UPDATE diagnostics SET completed_at=? WHERE id=?').run(now(), d.id);
        for (const skill of ['reading', 'grammar', 'vocabulary']) {
          const sample = diagnosticQuestions
            .filter((q) => q.skill === skill)
            .map((q) => ({
              band: q.band,
              correct: Boolean(answers.find((a) => a.question_id === q.id)?.correct),
            }));
          const e = estimate(sample);
          db()
            .prepare('INSERT INTO evaluations VALUES(?,?,?,?,?,?,?,?)')
            .run(
              uuid(),
              d.id,
              skill,
              e.level,
              e.confidence,
              sample.filter((s) => s.correct).length,
              sample.length,
              now(),
            );
        }
        // El primer plan se prepara después de establecer esta línea de base.
        const plan = db().prepare('SELECT id FROM plans WHERE day=?').get(localDay());
        if (
          plan &&
          !db()
            .prepare(
              'SELECT id FROM sessions WHERE activity_id IN (SELECT id FROM activities WHERE plan_id=?)',
            )
            .get(plan.id as string)
        ) {
          db()
            .prepare('DELETE FROM activities WHERE plan_id=?')
            .run(plan.id as string);
          db()
            .prepare('DELETE FROM plans WHERE id=?')
            .run(plan.id as string);
        }
      }
      return {
        correct: q.answer === answer,
        explanation: q.explanation,
        explanationSpanish: q.explanationSpanish || answerWhy(q.id),
        answer: q.answer,
      };
    });
  }
  function dailyPlan() {
    const day = localDay();
    let plan = db().prepare('SELECT * FROM plans WHERE day=?').get(day) as Row | undefined;
    if (!plan) {
      const profile = db().prepare('SELECT * FROM profile WHERE id=1').get() as Row;
      const results = db()
        .prepare('SELECT skill,correct,total FROM results ORDER BY completed_at DESC LIMIT 30')
        .all() as { skill: string; correct: number; total: number }[];
      const evaluations = db()
        .prepare('SELECT skill,correct,total FROM evaluations')
        .all() as typeof results;
      const weak = weakestSkill(results.length ? results : evaluations);
      const due = Number(
        db().prepare('SELECT count(*) AS n FROM vocabulary WHERE due_at<=?').get(now())!.n,
      );
      const interests = JSON.parse(profile.interests as string) as string[];
      const targetLevel = studyLevel(db());
      const candidates = documents().filter((doc) => doc.level === targetLevel);
      const read = (candidates.length ? candidates : documents()).sort((a, b) => {
        const count = (d: Document) =>
          Number(
            db()
              .prepare(
                'SELECT count(*) AS n FROM results r JOIN activities a ON r.activity_id=a.id WHERE a.document_id=?',
              )
              .get(d.id)!.n,
          );
        return (
          count(a) - count(b) ||
          Number(b.level === targetLevel) - Number(a.level === targetLevel) ||
          Number(interests.includes(b.topic)) - Number(interests.includes(a.topic)) ||
          a.id.localeCompare(b.id)
        );
      })[0];
      const minutes = Number(profile.daily_minutes);
      const evidence = results.length || evaluations.length;
      const reason = evidence
        ? `Today we focus on ${weak} based on your lower recorded accuracy${due ? `, with ${due} word${due === 1 ? '' : 's'} due for review` : ''}.`
        : 'A balanced first journey. It will adapt when we have your results.';
      const items: {
        kind: string;
        title: string;
        minutes: number;
        document: string | null;
        payload: object;
      }[] = [];
      const recurring = db()
        .prepare(
          "SELECT pattern,count(*) AS n FROM mistakes WHERE category='grammar' GROUP BY pattern ORDER BY n DESC",
        )
        .all();
      const atLevel = grammarQuestions.filter((q) => q.band === targetLevel);
      const questionSet = [...atLevel]
        .sort((a, b) => {
          const n = (q: Question) => Number(recurring.find((m) => m.pattern === q.id)?.n || 0);
          return (
            n(b) - n(a) ||
            ((grammarQuestions.indexOf(a) + Number(day.slice(8))) % grammarQuestions.length) -
              ((grammarQuestions.indexOf(b) + Number(day.slice(8))) % grammarQuestions.length)
          );
        })
        .slice(0, 3);
      if (minutes === 5) {
        if (due)
          items.push({
            kind: 'vocabulary',
            title: 'Words to come back to',
            minutes: 5,
            document: null,
            payload: {},
          });
        else if (weak === 'grammar')
          items.push({
            kind: 'grammar',
            title: 'Three decisions in English',
            minutes: 5,
            document: null,
            payload: { questionIds: questionSet.map((q) => q.id) },
          });
        else
          items.push({
            kind: 'reading',
            title: read.title,
            minutes: 5,
            document: read.id,
            payload: {},
          });
      } else {
        items.push({
          kind: 'reading',
          title: read.title,
          minutes: 7,
          document: read.id,
          payload: {},
        });
        items.push({
          kind: 'grammar',
          title:
            weak === 'grammar' ? 'Your focus: questions and tenses' : 'English for real situations',
          minutes: 5,
          document: null,
          payload: { questionIds: questionSet.map((q) => q.id) },
        });
        if (due)
          items.push({
            kind: 'vocabulary',
            title: 'Recall, remember, use',
            minutes: 3,
            document: null,
            payload: {},
          });
        items.push({
          kind: 'writing',
          title: 'An idea, in your own words',
          minutes: minutes - 12 - (due ? 3 : 0),
          document: null,
          payload: {
            prompt: isPortuguese
              ? cefrCourse
                  .find((unit) => unit.level === targetLevel)!
                  .tasks.find((task) => task.skill === 'writing')!.prompt
              : writingPrompts[Number(day.replaceAll('-', '')) % writingPrompts.length],
          },
        });
        if (minutes === 40) {
          items[items.length - 1].minutes -= 12;
          items.push({
            kind: 'reading',
            title:
              'Second reading:' +
              (isPortuguese ? read.title : documents().find((d) => d.id !== read.id)!.title),
            minutes: 12,
            document: (
              (isPortuguese ? candidates : documents()).find((d) => d.id !== read.id) || read
            ).id,
            payload: {},
          });
        }
      }
      const id = idFor(`plan:${day}`);
      transaction(() => {
        db().prepare('INSERT INTO plans VALUES(?,?,?,?,?)').run(id, day, minutes, reason, now());
        for (const [index, item] of items.entries())
          db()
            .prepare(
              'INSERT INTO activities(id,plan_id,kind,title,minutes,document_id,payload) VALUES(?,?,?,?,?,?,?)',
            )
            .run(
              idFor(`${id}:${index}:${item.kind}:${item.document || ''}`),
              id,
              item.kind,
              item.title,
              item.minutes,
              item.document,
              JSON.stringify(item.payload),
            );
      });
      plan = { id, day, minutes, reason };
    }
    {
      const level = studyLevel(db());
      const unit = cefrCourse.find((item) => item.level === level)!;
      const atLevel = documents().filter((d) => d.level === level);
      const read = isPortuguese
        ? atLevel.find((d) => d.id === `cefr:${level}`) || atLevel[0]
        : atLevel[0];
      const pending = db()
        .prepare(
          'SELECT * FROM activities WHERE plan_id=? AND completed_at IS NULL AND NOT EXISTS (SELECT 1 FROM sessions WHERE activity_id=activities.id)',
        )
        .all(plan.id as string);
      for (const activity of pending) {
        const payload = JSON.parse(activity.payload as string);
        if (payload.optional || payload.draft) continue;
        if (activity.kind === 'reading') {
          const document = documents().find((doc) => doc.id === activity.document_id);
          if (document?.level !== level && read)
            db()
              .prepare('UPDATE activities SET document_id=?,title=? WHERE id=?')
              .run(read!.id, read!.title, activity.id as string);
        } else if (activity.kind === 'grammar') {
          const ids = grammarQuestions
            .filter((q) => q.band === level)
            .slice(0, 3)
            .map((q) => q.id);
          if (
            (payload.questionIds || []).some(
              (id: string) => grammarQuestions.find((q) => q.id === id)?.band !== level,
            )
          )
            db()
              .prepare('UPDATE activities SET payload=? WHERE id=?')
              .run(JSON.stringify({ ...payload, questionIds: ids }), activity.id as string);
        } else if (activity.kind === 'writing') {
          const focus = levelLessons(level)[0];
          const prompt = isPortuguese
            ? unit.tasks.find((task) => task.skill === 'writing')!.prompt
            : focus.practice;
          if (payload.prompt !== prompt)
            db()
              .prepare('UPDATE activities SET payload=? WHERE id=?')
              .run(JSON.stringify({ ...payload, prompt }), activity.id as string);
        }
      }
    }
    const activities = db()
      .prepare('SELECT * FROM activities WHERE plan_id=? ORDER BY rowid')
      .all(plan.id as string)
      .filter((r) => {
        const payload = JSON.parse(r.payload as string);
        return !payload.game && !payload.lesson;
      })
      .map((r) => {
        const payload = JSON.parse(r.payload as string);
        if (payload.questionIds)
          payload.questions = payload.questionIds.map((id: string) =>
            publicQuestion(grammarQuestions.find((q) => q.id === id)!),
          );
        return { ...r, payload };
      }) as Activity[];
    const repairs = reinforcement(courseEvidence(db()), studyLevel(db()));
    const focus = repairs
      .map((r) => r.id.split(':')[1])
      .map((skill) =>
        isPortuguese
          ? (
              { reading: 'leitura', grammar: 'gramática', vocabulary: 'vocabulário' } as Record<
                string,
                string
              >
            )[skill]
          : skill,
      )
      .join(', ');
    const reason = repairs.length
      ? isPortuguese
        ? `Seu percurso pede reforço em ${focus}. Abra Aulas para seguir a próxima prática antes de avançar.`
        : `Your learning path needs reinforcement in ${focus}. Open Classes for the next practice before moving on.`
      : plan.reason;
    return { ...plan, reason, activities } as Snapshot['plan'];
  }
  function startSession(activityId: string) {
    const activity = db().prepare('SELECT * FROM activities WHERE id=?').get(activityId);
    if (!activity || activity.completed_at) throw new AppError('This activity is not available.');
    const open = db()
      .prepare(
        'SELECT id,active_seconds FROM sessions WHERE activity_id=? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1',
      )
      .get(activityId);
    if (open) return open;
    const id = uuid();
    db()
      .prepare('INSERT INTO sessions(id,activity_id,started_at) VALUES(?,?,?)')
      .run(id, activityId, now());
    return { id, active_seconds: 0 };
  }
  function tickSession(sessionId: string, seconds: number) {
    const s = db().prepare('SELECT * FROM sessions WHERE id=?').get(sessionId);
    if (!s || s.ended_at) throw new AppError('The session has already ended.');
    const elapsed = Math.max(
      0,
      Math.floor((Date.now() - Date.parse(s.started_at as string)) / 1000),
    );
    db()
      .prepare('UPDATE sessions SET active_seconds=? WHERE id=?')
      .run(Math.min(elapsed, 7200, Math.max(Number(s.active_seconds), seconds)), sessionId);
  }
  function finishActivity(input: {
    activityId: string;
    sessionId: string;
    seconds: number;
    answers: Record<string, number>;
    text?: string;
  }) {
    const a = db().prepare('SELECT * FROM activities WHERE id=?').get(input.activityId) as
      | Row
      | undefined;
    if (!a) throw new AppError('Activity not found.', 404);
    const previous = db()
      .prepare('SELECT * FROM results WHERE activity_id=?')
      .get(input.activityId) as Result | undefined;
    if (previous)
      return {
        id: previous.id,
        correct: previous.correct,
        total: previous.total,
        feedback: JSON.parse(previous.answers).feedback,
        repeated: true,
      };
    const session = db()
      .prepare('SELECT * FROM sessions WHERE id=? AND activity_id=? AND ended_at IS NULL')
      .get(input.sessionId, input.activityId);
    if (!session) throw new AppError('Start the activity before recording a result.');
    let qs: Question[] = [];
    if (a.kind === 'reading')
      qs = JSON.parse(
        db()
          .prepare('SELECT questions FROM documents WHERE id=?')
          .get(a.document_id as string)!.questions as string,
      );
    if (a.kind === 'grammar')
      qs = JSON.parse(a.payload as string).questionIds.map((id: string) =>
        grammarQuestions.find((q) => q.id === id),
      );
    if (
      qs.some(
        (q) =>
          !Number.isInteger(input.answers[q.id]) ||
          input.answers[q.id] < 0 ||
          input.answers[q.id] >= q.options.length,
      )
    )
      throw new AppError('Answer every question before finishing.');
    if (a.kind === 'writing' && (input.text?.trim().length || 0) < 30)
      throw new AppError('Write at least 30 characters to save your practice.');
    if (a.kind === 'reading' && !qs.length && (input.text?.trim().length || 0) < 30)
      throw new AppError('Write a summary of at least 30 characters to record this reading.');
    let correct: number | null = qs.length
      ? qs.filter((q) => q.answer === input.answers[q.id]).length
      : null;
    let total: number | null = qs.length || null;
    if (a.kind === 'vocabulary') {
      const r = db()
        .prepare('SELECT count(*) AS n,sum(known) AS k FROM reviews WHERE reviewed_at>=?')
        .get(session.started_at as string)!;
      if (!Number(r.n)) throw new AppError('Review at least one word before finishing.');
      correct = Number(r.k);
      total = Number(r.n);
    }
    return transaction(() => {
      tickSession(input.sessionId, input.seconds);
      const id = uuid(),
        date = now();
      const feedback = qs.map((q) => ({
        id: q.id,
        correct: q.answer === input.answers[q.id],
        answer: q.answer,
        correction: q.options[q.answer],
        explanationSpanish: q.explanationLanguage === 'es' ? q.explanation : answerWhy(q.id),
        explanation: q.explanation,
      }));
      db()
        .prepare('INSERT INTO results VALUES(?,?,?,?,?,?,?,?,?)')
        .run(
          id,
          input.activityId,
          input.sessionId,
          a.kind as string,
          correct,
          total,
          JSON.stringify({ choices: input.answers, text: input.text, feedback }),
          date,
          localDay(),
        );
      db().prepare('UPDATE activities SET completed_at=? WHERE id=?').run(date, input.activityId);
      db().prepare('UPDATE sessions SET ended_at=? WHERE id=?').run(date, input.sessionId);
      if (total !== null && correct !== null)
        db()
          .prepare('INSERT INTO progress_history VALUES(?,?,?,?,?,?)')
          .run(uuid(), a.kind as string, correct, total, id, date);
      for (const q of qs.filter((q) => q.answer !== input.answers[q.id]))
        db()
          .prepare('INSERT INTO mistakes VALUES(?,?,?,?,?,?,?,?,?)')
          .run(
            uuid(),
            null,
            id,
            a.kind as string,
            q.options[input.answers[q.id]],
            q.options[q.answer],
            q.explanation,
            q.id,
            date,
          );
      return {
        id,
        correct,
        total,
        feedback: qs.map((q) => ({
          id: q.id,
          correct: q.answer === input.answers[q.id],
          answer: q.answer,
          correction: q.options[q.answer],
          explanationSpanish: q.explanationLanguage === 'es' ? q.explanation : answerWhy(q.id),
          explanation: q.explanation,
        })),
      };
    });
  }
  function saveWord(input: {
    word: string;
    sourceId?: string;
    meaning?: string;
    pronunciation?: string;
    example?: string;
  }): Word {
    const word = input.word.trim().toLowerCase();
    if (input.sourceId && !db().prepare('SELECT id FROM documents WHERE id=?').get(input.sourceId))
      throw new AppError('El documento no existe.');
    const existing = db()
      .prepare('SELECT * FROM vocabulary WHERE word=? COLLATE NOCASE')
      .get(word) as Word | undefined;
    if (existing) return existing;
    const entry = glossary[word];
    const id = uuid();
    db()
      .prepare(
        'INSERT INTO vocabulary(id,word,meaning,pronunciation,example,source_id,created_at,due_at) VALUES(?,?,?,?,?,?,?,?)',
      )
      .run(
        id,
        word,
        input.meaning || entry?.meaning || '',
        input.pronunciation || entry?.pronunciation || '',
        input.example || entry?.example || '',
        input.sourceId || null,
        now(),
        now(),
      );
    return db().prepare('SELECT * FROM vocabulary WHERE id=?').get(id) as Word;
  }
  function reviewWord(id: string, known: boolean) {
    const word = db().prepare('SELECT * FROM vocabulary WHERE id=?').get(id) as Word | undefined;
    if (!word) throw new AppError('Word not found.', 404);
    if (word.due_at > now())
      throw new AppError('This word has already been reviewed. It will return when it is due.');
    const next = nextReview(word, known);
    transaction(() => {
      db()
        .prepare('UPDATE vocabulary SET due_at=?,interval=?,ease=?,reviews=reviews+1 WHERE id=?')
        .run(next.due_at, next.interval, next.ease, id);
      db()
        .prepare('INSERT INTO reviews VALUES(?,?,?,?,?)')
        .run(uuid(), id, Number(known), now(), localDay());
    });
    return next;
  }
  function checkpoint(id: string, paragraph: number, draft: Record<string, number>) {
    const doc = documents().find((d) => d.id === id);
    if (!doc || paragraph >= doc.paragraphs.length) throw new AppError('Invalid reading position.');
    db()
      .prepare(
        'INSERT INTO reading_progress VALUES(?,?,?,?) ON CONFLICT(document_id) DO UPDATE SET paragraph=excluded.paragraph,draft=excluded.draft,updated_at=excluded.updated_at',
      )
      .run(id, paragraph, JSON.stringify(draft), now());
  }
  function snapshot(): Snapshot {
    preserveCourseProgress(db());
    const profile = db().prepare('SELECT * FROM profile WHERE id=1').get()!;
    const resume = db()
      .prepare(
        'SELECT a.* FROM activities a JOIN sessions s ON s.activity_id=a.id WHERE a.completed_at IS NULL AND s.ended_at IS NULL ORDER BY s.started_at DESC LIMIT 1',
      )
      .get();
    let resumeActivity: Activity | null = null;
    if (resume) {
      const payload = JSON.parse(resume.payload as string);
      if (payload.questionIds)
        payload.questions = payload.questionIds.map((id: string) =>
          publicQuestion(grammarQuestions.find((q) => q.id === id)!),
        );
      resumeActivity = { ...resume, payload } as Activity;
    }
    return {
      backlog: courseEvidence(db()).backlog,
      courseCheckpoints: courseEvidence(db()).courseCheckpoints,
      profile: {
        ...profile,
        interests: JSON.parse(profile.interests as string),
      } as Snapshot['profile'],
      day: localDay(),
      aiAvailable: aiAvailable,
      protected: protectedAccess,
      diagnostic: diagnostic(),
      resumeActivity,
      questions: diagnosticQuestions.map(publicQuestion),
      documents: documents(),
      trashedDocuments: documents(true).filter((doc) => doc.source.startsWith('trash:')),
      plan: dailyPlan(),
      vocabulary: db().prepare('SELECT * FROM vocabulary ORDER BY due_at').all() as Word[],
      results: db()
        .prepare(
          'SELECT r.*,s.active_seconds,a.title,a.document_id FROM results r JOIN activities a ON a.id=r.activity_id LEFT JOIN sessions s ON s.id=r.session_id ORDER BY r.completed_at',
        )
        .all() as Result[],
      evaluations: db()
        .prepare('SELECT * FROM evaluations ORDER BY created_at')
        .all() as Snapshot['evaluations'],
      corrections: db()
        .prepare('SELECT * FROM corrections ORDER BY created_at DESC')
        .all() as Snapshot['corrections'],
      mistakes: db()
        .prepare('SELECT * FROM mistakes ORDER BY created_at DESC')
        .all() as Snapshot['mistakes'],
      reviews: db()
        .prepare(
          'SELECT r.*,v.word FROM reviews r JOIN vocabulary v ON v.id=r.word_id ORDER BY reviewed_at',
        )
        .all() as Snapshot['reviews'],
      cefr: isPortuguese
        ? {
            level: studyLevel(db()),
            attempts: db()
              .prepare('SELECT * FROM cefr_attempts ORDER BY created_at,id')
              .all() as NonNullable<Snapshot['cefr']>['attempts'],
          }
        : undefined,
      tutorMessages: db()
        .prepare('SELECT * FROM tutor_messages ORDER BY created_at,id')
        .all() as Snapshot['tutorMessages'],
      tutorAttempts: db()
        .prepare('SELECT * FROM tutor_attempts ORDER BY created_at,id')
        .all() as Snapshot['tutorAttempts'],
      sessions: db()
        .prepare(
          'SELECT s.*,a.title,a.kind FROM sessions s JOIN activities a ON a.id=s.activity_id ORDER BY started_at',
        )
        .all() as Snapshot['sessions'],
    };
  }

  return {
    documents,
    diagnostic,
    answerDiagnostic,
    dailyPlan,
    startSession,
    tickSession,
    finishActivity,
    saveWord,
    reviewWord,
    checkpoint,
    snapshot,
  };
}
