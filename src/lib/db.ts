import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { readings } from './content';
export const dataDir = process.env.ENGLISH_DATA_DIR || path.join(process.cwd(), 'data');
let connection: DatabaseSync | undefined;
export function db() {
  if (connection) return connection;
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  connection = new DatabaseSync(path.join(dataDir, 'english-os.sqlite'));
  connection.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  connection.exec(
    'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)',
  );
  if (!connection.prepare('SELECT version FROM schema_migrations WHERE version=1').get()) {
    connection.exec(`BEGIN;
      CREATE TABLE profile (id INTEGER PRIMARY KEY CHECK(id=1), name TEXT NOT NULL DEFAULT 'Alejo', daily_minutes INTEGER NOT NULL DEFAULT 20, interests TEXT NOT NULL DEFAULT '["Viajes","Finanzas","Tecnología"]', theme TEXT NOT NULL DEFAULT 'light', created_at TEXT NOT NULL);
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
  connection
    .prepare('INSERT OR IGNORE INTO profile(id,created_at) VALUES(1,?)')
    .run(new Date().toISOString());
  const insert = connection.prepare(
    'INSERT OR IGNORE INTO documents(id,title,topic,level,source,minutes,intro,paragraphs,questions,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
  );
  for (const r of readings)
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
  return connection;
}
export function transaction<T>(fn: () => T): T {
  const conn = db();
  conn.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    conn.exec('COMMIT');
    return result;
  } catch (error) {
    conn.exec('ROLLBACK');
    throw error;
  }
}
export function closeDb() {
  connection?.close();
  connection = undefined;
}
