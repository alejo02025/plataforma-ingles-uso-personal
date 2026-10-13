import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { nextReview, localDay, estimate } from '../src/lib/learning';
import { diagnosticQuestions } from '../src/lib/content';
import { makePdf } from './pdf-fixture';
const directory = mkdtempSync(path.join(tmpdir(), 'english-os-unit-'));
process.env.ENGLISH_DATA_DIR = directory;
const service = await import('../src/lib/service');
const { db, closeDb } = await import('../src/lib/db');
const { importDocument } = await import('../src/lib/import');
after(() => {
  closeDb();
  rmSync(directory, { recursive: true, force: true });
});
test('fechas de Buenos Aires y repetición espaciada sin evaluar MCER por flashcards', () => {
  assert.equal(localDay(new Date('2026-10-14T01:00:00Z')), '2026-10-13');
  const first = nextReview({ interval: 0, ease: 2.5 }, true, new Date('2026-01-01T12:00:00Z'));
  assert.equal(first.interval, 1);
  const forgotten = nextReview(
    { interval: 20, ease: 2.5 },
    false,
    new Date('2026-01-01T12:00:00Z'),
  );
  assert.equal(forgotten.interval, 1);
  assert.equal(forgotten.ease, 2.3);
  assert.equal(estimate([{ band: 'B2', correct: true }]).level, null);
  assert.equal(
    estimate([
      { band: 'A2', correct: true },
      { band: 'B1', correct: true },
      { band: 'B2', correct: true },
    ]).level,
    'B1 orientativo',
  );
});
test('diagnóstico parcial, estimación conservadora y persistencia al reabrir la base', () => {
  const initial = service.snapshot();
  assert.equal(initial.results.length, 0);
  assert.equal(initial.vocabulary.length, 0);
  assert.equal(
    initial.plan.activities.reduce((n, a) => n + a.minutes, 0),
    20,
  );
  assert.ok(initial.questions.every((q) => !('answer' in q)));
  service.answerDiagnostic('d1', 1);
  closeDb();
  assert.equal(service.diagnostic().answers.length, 1);
  assert.throws(() => service.answerDiagnostic('d1', 0), /ya fue guardada/);
  diagnosticQuestions.slice(1).forEach((q) => service.answerDiagnostic(q.id, q.answer));
  assert.ok(service.diagnostic().completed_at);
  assert.equal(service.snapshot().evaluations.length, 3);
  assert.ok(
    service.snapshot().evaluations.every((e) => e.confidence === 'baja' && e.level !== 'B2'),
  );
  assert.throws(() => service.answerDiagnostic('d2', 1), /ya está cerrado/);
});
test('lectura: checkpoints, resultado validado e idempotente, errores y tiempo real', () => {
  const a = service.dailyPlan().activities.find((a) => a.kind === 'reading')!;
  const doc = service.documents().find((d) => d.id === a.document_id)!;
  service.checkpoint(doc.id, 1, {});
  closeDb();
  assert.equal(service.documents().find((d) => d.id === doc.id)!.paragraph, 1);
  const session = service.startSession(a.id);
  const sessionId = session.id as string;
  assert.throws(
    () => service.finishActivity({ activityId: a.id, sessionId, seconds: 10000, answers: {} }),
    /todas las preguntas/,
  );
  const answers = Object.fromEntries(doc.questions.map((q) => [q.id, 0]));
  const result = service.finishActivity({ activityId: a.id, sessionId, seconds: 500, answers });
  assert.equal(result.total, 2);
  assert.ok(
    Number(
      db().prepare('SELECT active_seconds FROM sessions WHERE id=?').get(sessionId)!.active_seconds,
    ) < 500,
  );
  const again = service.finishActivity({ activityId: a.id, sessionId, seconds: 500, answers });
  assert.equal(again.id, result.id);
  assert.equal(service.snapshot().results.length, 1);
  assert.ok(service.snapshot().mistakes.length >= 1);
});
test('vocabulario sin duplicados, historial y prevención de repaso duplicado', () => {
  const word = service.saveWord({ word: 'narrow', sourceId: 'city' });
  const duplicate = service.saveWord({ word: 'NARROW', sourceId: 'city' });
  assert.equal(word.id, duplicate.id);
  service.reviewWord(word.id as string, false);
  assert.equal(service.snapshot().reviews.length, 1);
  assert.equal(service.snapshot().vocabulary[0].interval, 1);
  assert.throws(() => service.reviewWord(word.id as string, true), /ya fue repasada/);
});
test('importación real de PDF, archivo privado y resumen sin nota inventada', async () => {
  await assert.rejects(
    () => importDocument('Archivo falso', undefined, new File(['not a pdf'], 'fake.pdf')),
    /cabecera/,
  );
  const imported = await importDocument(
    'A small journey',
    undefined,
    new File([makePdf()], 'journey.pdf', { type: 'application/pdf' }),
  );
  const doc = service.documents().find((d) => d.id === imported.id)!;
  assert.match(doc.paragraphs.join(' '), /Last summer I travelled/);
  assert.equal(doc.level, 'Sin estimar');
  assert.equal(doc.source, 'pdf');
  assert.ok(doc.filename);
  assert.equal(doc.questions.length, 0);
});
test('plan persistente, 5/40 minutos y adaptación al error registrado', () => {
  const first = service.dailyPlan();
  assert.deepEqual(service.dailyPlan(), first);
  // Simula un día nuevo en la base de prueba sin cambiar el reloj de producción.
  db().prepare('UPDATE plans SET day=? WHERE day=?').run('2000-01-01', first.day);
  db().prepare('UPDATE profile SET daily_minutes=5 WHERE id=1').run();
  const short = service.dailyPlan();
  assert.equal(
    short.activities.reduce((n, a) => n + a.minutes, 0),
    5,
  );
  db().prepare('UPDATE plans SET day=? WHERE day=?').run('2000-01-02', short.day);
  db().prepare('UPDATE profile SET daily_minutes=40 WHERE id=1').run();
  db()
    .prepare('INSERT INTO mistakes VALUES(?,?,?,?,?,?,?,?,?)')
    .run(
      'focus-test',
      null,
      null,
      'grammar',
      'is the station',
      'the station is',
      'Orden de preguntas indirectas',
      'g5',
      new Date().toISOString(),
    );
  const long = service.dailyPlan();
  assert.equal(
    long.activities.reduce((n, a) => n + a.minutes, 0),
    40,
  );
  assert.ok(
    long.activities
      .find((a) => a.kind === 'grammar')!
      .payload.questions!.some((q) => q.id === 'g5'),
  );
});
test('retomar una actividad del día anterior conserva su sesión y borrador', () => {
  const oldPlan = service.dailyPlan();
  const writing = oldPlan.activities.find((a) => a.kind === 'writing')!;
  service.startSession(writing.id);
  db()
    .prepare('UPDATE activities SET payload=? WHERE id=?')
    .run(
      JSON.stringify({
        ...writing.payload,
        draft: 'I would like to visit Edinburgh because I enjoy history.',
      }),
      writing.id,
    );
  db().prepare('UPDATE plans SET day=? WHERE day=?').run('2000-01-03', oldPlan.day);
  closeDb();
  const state = service.snapshot();
  assert.equal(state.resumeActivity?.id, writing.id);
  assert.match(state.resumeActivity!.payload.draft!, /Edinburgh/);
  assert.notEqual(state.resumeActivity?.plan_id, state.plan.activities[0].plan_id);
});
test('contrato IA: validación, correcciones persistentes y preguntas de PDF con proveedor simulado', async () => {
  const oldFetch = globalThis.fetch,
    key = process.env.ENGLISH_AI_API_KEY;
  process.env.ENGLISH_AI_API_KEY = 'mock-provider-no-network';
  const { correctWriting, generateQuestions } = await import('../src/lib/ai');
  try {
    globalThis.fetch = async (input, options) => {
      assert.equal(input, 'https://api.openai.com/v1/chat/completions');
      const body = JSON.parse(options!.body as string);
      assert.ok(body.messages[0].content.includes('untrusted'));
      const content = body.messages[0].content.includes('comprehension')
        ? {
            questions: Array.from({ length: 3 }, () => ({
              prompt: 'Where did the traveller visit a museum?',
              options: ['A town beside a river', 'A large airport', 'A mountain village'],
              answer: 0,
              explanation: 'El pasaje menciona un pueblo junto a un río.',
            })),
          }
        : {
            revised: 'I have lived in Buenos Aires since 2022.',
            feedback: 'Conectá la experiencia pasada con el presente.',
            corrections: [
              {
                original: 'I live in Buenos Aires since 2022.',
                corrected: 'I have lived in Buenos Aires since 2022.',
                explanation: 'Usá present perfect con since para una situación que continúa.',
                category: 'grammar',
                pattern: 'present-perfect-since',
              },
            ],
          };
      return new Response(
        JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }),
        { status: 200 },
      );
    };
    const correction = await correctWriting('I live in Buenos Aires since 2022.');
    assert.equal(correction.corrections.length, 1);
    closeDb();
    assert.equal(service.snapshot().corrections[0].id, correction.id);
    assert.ok(service.snapshot().mistakes.some((m) => m.pattern === 'present-perfect-since'));
    const doc = service.documents().find((d) => d.source === 'pdf')!;
    await generateQuestions(doc.id);
    assert.equal(service.documents().find((d) => d.id === doc.id)!.questions.length, 3);
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: '{"revised": 42}' } }] }));
    await assert.rejects(
      () => correctWriting('I like walking through a city and visiting its museums.'),
      /formato esperado/,
    );
    assert.equal(service.snapshot().corrections.length, 1);
  } finally {
    globalThis.fetch = oldFetch;
    if (key) process.env.ENGLISH_AI_API_KEY = key;
    else delete process.env.ENGLISH_AI_API_KEY;
  }
});
test('IA sin credencial falla de manera explícita sin guardar correcciones falsas', async () => {
  const original = process.env.ENGLISH_AI_API_KEY;
  const previousCount = service.snapshot().corrections.length;
  delete process.env.ENGLISH_AI_API_KEY;
  try {
    const { correctWriting } = await import('../src/lib/ai');
    await assert.rejects(
      () => correctWriting('I enjoy reading about history and travelling.'),
      /ENGLISH_AI_API_KEY/,
    );
    assert.equal(service.snapshot().corrections.length, previousCount);
  } finally {
    if (original) process.env.ENGLISH_AI_API_KEY = original;
  }
});
