import { englishCourseReadings } from '@/locales/learning/course-readings';
import { cefrReadings } from './cefr-curriculum';
import { defaultName, initialInterests, isPortuguese } from './workspace';
import type { DatabaseSync } from 'node:sqlite';
import { readings, glossary } from './content';
export function initialize(connection: Pick<DatabaseSync, 'exec' | 'prepare'>) {
  connection.exec(
    'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)',
  );
  if (!connection.prepare('SELECT version FROM schema_migrations WHERE version=1').get()) {
    connection.exec(`BEGIN;
      CREATE TABLE profile (id INTEGER PRIMARY KEY CHECK(id=1), name TEXT NOT NULL DEFAULT '${defaultName}', daily_minutes INTEGER NOT NULL DEFAULT 20, interests TEXT NOT NULL DEFAULT '${JSON.stringify(initialInterests)}', theme TEXT NOT NULL DEFAULT 'light', created_at TEXT NOT NULL);
      CREATE TABLE diagnostics (id TEXT PRIMARY KEY, started_at TEXT NOT NULL, completed_at TEXT);
      CREATE TABLE diagnostic_answers (diagnostic_id TEXT REFERENCES diagnostics(id), question_id TEXT NOT NULL, answer INTEGER NOT NULL, correct INTEGER NOT NULL, PRIMARY KEY(diagnostic_id,question_id));
      CREATE TABLE documents (id TEXT PRIMARY KEY, title TEXT NOT NULL, topic TEXT NOT NULL, level TEXT NOT NULL, source TEXT NOT NULL, minutes INTEGER NOT NULL, intro TEXT NOT NULL, paragraphs TEXT NOT NULL, questions TEXT NOT NULL, filename TEXT, created_at TEXT NOT NULL);
      CREATE TABLE reading_progress (document_id TEXT PRIMARY KEY REFERENCES documents(id), paragraph INTEGER NOT NULL DEFAULT 0, draft TEXT NOT NULL DEFAULT '{}', updated_at TEXT NOT NULL);
      CREATE TABLE plans (id TEXT PRIMARY KEY, day TEXT UNIQUE NOT NULL, minutes INTEGER NOT NULL, reason TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE activities (id TEXT PRIMARY KEY, plan_id TEXT NOT NULL REFERENCES plans(id), kind TEXT NOT NULL, title TEXT NOT NULL, minutes INTEGER NOT NULL, document_id TEXT REFERENCES documents(id), payload TEXT NOT NULL, completed_at TEXT);
      CREATE TABLE sessions (id TEXT PRIMARY KEY, activity_id TEXT REFERENCES activities(id), started_at TEXT NOT NULL, ended_at TEXT, active_seconds INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE results (id TEXT PRIMARY KEY, activity_id TEXT UNIQUE REFERENCES activities(id), session_id TEXT REFERENCES sessions(id), skill TEXT NOT NULL, correct INTEGER, total INTEGER, answers TEXT NOT NULL, completed_at TEXT NOT NULL, day TEXT NOT NULL);
      CREATE TABLE vocabulary (id TEXT PRIMARY KEY, word TEXT UNIQUE COLLATE NOCASE NOT NULL, meaning TEXT NOT NULL DEFAULT '', pronunciation TEXT NOT NULL DEFAULT '', example TEXT NOT NULL DEFAULT '', source_id TEXT REFERENCES documents(id), created_at TEXT NOT NULL, due_at TEXT NOT NULL, interval INTEGER NOT NULL DEFAULT 0, ease REAL NOT NULL DEFAULT 2.5, reviews INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE reviews (id TEXT PRIMARY KEY, word_id TEXT NOT NULL REFERENCES vocabulary(id), known INTEGER NOT NULL, reviewed_at TEXT NOT NULL, day TEXT NOT NULL);
      CREATE TABLE corrections (id TEXT PRIMARY KEY, activity_id TEXT REFERENCES activities(id), original TEXT NOT NULL, revised TEXT NOT NULL, feedback TEXT NOT NULL, model TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE mistakes (id TEXT PRIMARY KEY, correction_id TEXT REFERENCES corrections(id), result_id TEXT REFERENCES results(id), category TEXT NOT NULL, original TEXT NOT NULL, corrected TEXT NOT NULL, explanation TEXT NOT NULL, pattern TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE evaluations (id TEXT PRIMARY KEY, diagnostic_id TEXT REFERENCES diagnostics(id), skill TEXT NOT NULL, level TEXT, confidence TEXT NOT NULL, correct INTEGER NOT NULL, total INTEGER NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE progress_history (id TEXT PRIMARY KEY, skill TEXT NOT NULL, correct INTEGER NOT NULL, total INTEGER NOT NULL, source_id TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE INDEX result_day ON results(day);
      CREATE INDEX review_due ON vocabulary(due_at);
      INSERT INTO schema_migrations VALUES(1,datetime('now'));
      COMMIT;`);
  }
  if (!connection.prepare('SELECT version FROM schema_migrations WHERE version=2').get()) {
    connection.exec(`BEGIN;
      CREATE TABLE document_sections (id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES documents(id), paragraph INTEGER NOT NULL, page INTEGER);
      CREATE TABLE tutor_messages (id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES documents(id), role TEXT NOT NULL, content TEXT NOT NULL, sources TEXT NOT NULL DEFAULT '[]', mode TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE tutor_attempts (id TEXT PRIMARY KEY, document_id TEXT NOT NULL REFERENCES documents(id), question_id TEXT NOT NULL, prompt TEXT NOT NULL, answer TEXT NOT NULL, correct INTEGER, feedback TEXT NOT NULL, source_paragraph INTEGER NOT NULL, created_at TEXT NOT NULL);
      CREATE INDEX tutor_document ON tutor_messages(document_id,created_at);
      INSERT INTO schema_migrations VALUES(2,datetime('now'));
      COMMIT;`);
  }
  connection
    .prepare('INSERT OR IGNORE INTO profile(id,created_at) VALUES(1,?)')
    .run(new Date().toISOString());
  const insert = connection.prepare(
    `INSERT INTO documents(id,title,topic,level,source,minutes,intro,paragraphs,questions,created_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET topic=excluded.topic,intro=excluded.intro,questions=excluded.questions WHERE documents.source='editorial'`,
  );
  for (const r of isPortuguese
    ? [...readings, ...cefrReadings]
    : [...readings, ...englishCourseReadings])
    insert.run(
      r.id,
      r.title,
      r.topic,
      r.level,
      'editorial',
      r.minutes,
      r.intro,
      JSON.stringify(r.paragraphs),
      JSON.stringify(r.questions),
      new Date().toISOString(),
    );
  if (!connection.prepare('SELECT version FROM schema_migrations WHERE version=3').get()) {
    const legacy: Record<string, string> = {
      Viajes: 'Travel',
      Finanzas: 'Finance',
      Historia: 'History',
      Tecnología: 'Technology',
      Trabajo: 'Work',
      'Vida cotidiana': 'Everyday Life',
      'Tu material': 'Your material',
      'Tres decisiones en inglés': 'Three decisions in English',
      'Tu foco: preguntas y tiempos': 'Your focus: questions and tenses',
      'Inglés para situaciones reales': 'English for real situations',
      'Palabras que necesitan volver': 'Words to come back to',
      'Recuperar, recordar, usar': 'Recall, remember, use',
      'Una idea, en tus palabras': 'An idea, in your own words',
      'B1 orientativo': 'B1 estimate',
      'A2 orientativo': 'A2 estimate',
      baja: 'low',
      insuficiente: 'insufficient',
    };
    const profile = connection.prepare('SELECT interests FROM profile WHERE id=1').get();
    if (profile)
      connection
        .prepare('UPDATE profile SET interests=? WHERE id=1')
        .run(
          JSON.stringify(
            (JSON.parse(profile.interests as string) as string[]).map(
              (value) => legacy[value] || value,
            ),
          ),
        );
    for (const [old, value] of Object.entries(legacy)) {
      connection.prepare('UPDATE documents SET topic=? WHERE topic=?').run(value, old);
      connection.prepare('UPDATE activities SET title=? WHERE title=?').run(value, old);
      connection.prepare('UPDATE evaluations SET level=? WHERE level=?').run(value, old);
      connection.prepare('UPDATE evaluations SET confidence=? WHERE confidence=?').run(value, old);
    }
    for (const row of connection.prepare('SELECT id,reason FROM plans').all()) {
      const reason = String(row.reason);
      if (reason.startsWith('Primer recorrido'))
        connection
          .prepare('UPDATE plans SET reason=? WHERE id=?')
          .run(
            'A balanced first journey. It will adapt when we have your results.',
            row.id as string,
          );
      else if (reason.startsWith('Priorizamos'))
        connection
          .prepare('UPDATE plans SET reason=? WHERE id=?')
          .run(
            `Your plan focuses on ${reason.includes('gramática') ? 'grammar' : reason.includes('vocabulario') ? 'vocabulary' : 'reading'} based on your recorded practice.`,
            row.id as string,
          );
    }
    connection
      .prepare('UPDATE activities SET title=replace(title,?,?) WHERE title LIKE ?')
      .run('Segunda lectura:', 'Second reading:', 'Segunda lectura:%');
    const oldMeanings: Record<string, string> = {
      'compound interest': 'interés compuesto',
      'out loud': 'en voz alta',
      'cut back on': 'reducir el consumo o gasto en algo',
      'travel guide': 'guía de viaje',
      'ask for clarification': 'pedir una aclaración',
      narrow: 'estrecho/a',
      curiosity: 'curiosidad',
      neighbourhood: 'barrio',
      savings: 'ahorros',
      fees: 'comisiones / cargos',
      growth: 'crecimiento',
      overnight: 'de la noche a la mañana',
      timetable: 'horario',
      shared: 'compartido/a',
      judgement: 'criterio / juicio',
      misleading: 'engañoso/a',
      assumptions: 'suposiciones',
      clarification: 'aclaración',
      hurried: 'apurado/a',
    };
    for (const [word, old] of Object.entries(oldMeanings))
      connection
        .prepare('UPDATE vocabulary SET meaning=? WHERE word=? COLLATE NOCASE AND meaning=?')
        .run(glossary[word]?.meaning || old, word, old);
    connection.prepare('INSERT INTO schema_migrations VALUES(3,?)').run(new Date().toISOString());
  }
  if (!connection.prepare('SELECT version FROM schema_migrations WHERE version=4').get()) {
    connection.exec(`BEGIN;
      CREATE TABLE cefr_state (id TEXT PRIMARY KEY,level TEXT NOT NULL,updated_at TEXT NOT NULL);
      CREATE TABLE cefr_attempts (id TEXT PRIMARY KEY,level TEXT NOT NULL,task TEXT NOT NULL,answer TEXT NOT NULL,correct INTEGER,created_at TEXT NOT NULL);
      INSERT INTO schema_migrations VALUES(4,datetime('now'));
      COMMIT;`);
  }
  if (isPortuguese)
    connection
      .prepare('INSERT OR IGNORE INTO cefr_state VALUES(?,?,?)')
      .run('route', 'A1', new Date().toISOString());
  if (!connection.prepare('SELECT version FROM schema_migrations WHERE version=5').get()) {
    connection.exec(`BEGIN;
      CREATE TABLE course_checkpoints (id TEXT PRIMARY KEY, level TEXT NOT NULL, completed_at TEXT NOT NULL);
      INSERT INTO schema_migrations VALUES(5,datetime('now'));
      COMMIT;`);
  }
}
