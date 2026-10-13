import { assetBase, workspaceId } from '../workspace';
import initSqlJs, { type Database, type SqlValue } from 'sql.js';
import type { db as nativeDb } from '../db';
import { initialize } from '../schema';
import { read, write } from './storage';
import { tables, type Manifest, stamp, validate } from './merge';
let connection: Database;
let createDatabase: (bytes: Uint8Array) => Database;
let ready: Promise<void> | undefined;
let device = '';
let previous: Manifest | undefined;
export const basePath = assetBase;
export function load() {
  return (ready ||= (async () => {
    const SQL = await initSqlJs({ locateFile: () => `${basePath}/assets/sql-wasm.wasm` });
    createDatabase = (bytes) => new SQL.Database(bytes);
    const saved = await read<Uint8Array>('database');
    connection = saved ? new SQL.Database(saved) : new SQL.Database();
    device = (await read<string>('device')) || crypto.randomUUID();
    await write('device', device);
    previous = await read<Manifest>('manifest');
    initialize(db());
    connection.exec('PRAGMA foreign_keys=ON');
    if (!saved) {
      previous = capture();
      for (const clocks of Object.values(previous.clocks || {}))
        for (const key of Object.keys(clocks)) clocks[key] = '0000000000000000:seed';
    }
    await persist();
  })());
}
export function db(): ReturnType<typeof nativeDb> {
  return {
    exec(sql: string) {
      connection.exec(sql);
    },
    prepare(sql: string) {
      return {
        all(...values: SqlValue[]) {
          const statement = connection.prepare(sql);
          try {
            statement.bind(values);
            const rows = [];
            while (statement.step()) rows.push(statement.getAsObject());
            return rows;
          } finally {
            statement.free();
          }
        },
        get(...values: SqlValue[]) {
          return this.all(...values)[0];
        },
        run(...values: SqlValue[]) {
          connection.run(sql, values);
          return { changes: connection.getRowsModified() };
        },
      };
    },
  } as unknown as ReturnType<typeof nativeDb>;
}
export function transaction<T>(fn: () => T): T {
  connection.run('BEGIN');
  try {
    const result = fn();
    connection.run('COMMIT');
    return result;
  } catch (error) {
    connection.run('ROLLBACK');
    throw error;
  }
}
export function capture(): Manifest {
  const current = {
    version: 1 as const,
    workspace: workspaceId,
    data: Object.fromEntries(
      tables.map((table) => [table, db().prepare(`SELECT * FROM ${table}`).all()]),
    ),
  } as Manifest;
  return stamp(current, previous, device);
}
export async function persist() {
  previous = capture();
  const bytes = connection.export();
  // sql.js export closes/reopens SQLite and resets connection pragmas.
  connection.exec('PRAGMA foreign_keys=ON');
  await write('database', bytes);
  await write('manifest', previous);
}
export function assertRestorable(input: unknown) {
  const original = connection,
    baseline = previous;
  const bytes = original.export();
  original.exec('PRAGMA foreign_keys=ON');
  connection = createDatabase(bytes);
  connection.exec('PRAGMA foreign_keys=ON');
  try {
    restore(input);
  } finally {
    connection.close();
    connection = original;
    previous = baseline;
  }
}
export function restore(input: unknown) {
  const manifest = validate(input);
  transaction(() => {
    for (const table of [...tables].reverse()) db().exec(`DELETE FROM ${table}`);
    for (const table of tables) {
      const columns = new Set(
        db()
          .prepare(`PRAGMA table_info(${table})`)
          .all()
          .map((r) => String(r.name)),
      );
      for (const row of manifest.data[table]) {
        const keys = Object.keys(row);
        if (!keys.length || keys.some((key) => !columns.has(key)))
          throw new Error('The backup contains unknown columns.');
        db()
          .prepare(
            `INSERT INTO ${table} (${keys.map((k) => `"${k}"`).join(',')}) VALUES (${keys.map(() => '?').join(',')})`,
          )
          .run(...Object.values(row));
      }
    }
  });
  if (workspaceId === 'pt')
    db()
      .prepare('INSERT OR IGNORE INTO cefr_state VALUES(?,?,?)')
      .run('route', 'A1', new Date().toISOString());
  previous = manifest;
}
let queue: Promise<unknown> = Promise.resolve();
export function exclusive<T>(fn: () => Promise<T> | T): Promise<T> {
  const next = queue.then(fn);
  queue = next.catch(() => {});
  return next;
}
