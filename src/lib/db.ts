import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { initialize } from './schema';
export const dataDir = process.env.ENGLISH_DATA_DIR || path.join(process.cwd(), 'data');
let connection: DatabaseSync | undefined;
export function db() {
  if (connection) return connection;
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  connection = new DatabaseSync(path.join(dataDir, 'english-os.sqlite'));
  connection.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
  initialize(connection);
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
