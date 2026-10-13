import { nextReview } from '../learning';
export const tables = [
  'profile',
  'diagnostics',
  'diagnostic_answers',
  'documents',
  'reading_progress',
  'plans',
  'activities',
  'sessions',
  'results',
  'vocabulary',
  'reviews',
  'corrections',
  'mistakes',
  'evaluations',
  'progress_history',
] as const;
export type Row = Record<string, string | number | null>;
export type Manifest = {
  version: 1;
  data: Record<string, Row[]>;
  clocks?: Record<string, Record<string, string>>;
  deletions?: Record<string, string>;
};
export function rowKey(table: string, row: Row) {
  return String(
    table === 'diagnostic_answers'
      ? `${row.diagnostic_id}:${row.question_id}`
      : table === 'reading_progress'
        ? row.document_id
        : row.id,
  );
}
export function validate(value: unknown): Manifest {
  const manifest = value as Manifest;
  if (
    !manifest ||
    manifest.version !== 1 ||
    !manifest.data ||
    Object.keys(manifest.data).some((t) => !tables.includes(t as (typeof tables)[number]))
  )
    throw new Error('El respaldo no tiene un formato compatible.');
  for (const table of tables) {
    if (!Array.isArray(manifest.data[table]) || manifest.data[table].length > 50000)
      throw new Error('El respaldo está incompleto o es demasiado grande.');
    for (const row of manifest.data[table]) {
      if (
        !row ||
        typeof row !== 'object' ||
        Object.values(row).some(
          (v) =>
            v !== null && typeof v !== 'string' && (typeof v !== 'number' || !Number.isFinite(v)),
        )
      )
        throw new Error('El respaldo contiene datos inválidos.');
    }
  }
  if (manifest.clocks && (typeof manifest.clocks !== 'object' || Array.isArray(manifest.clocks)))
    throw new Error('Marcas de sincronización inválidas.');
  for (const fields of Object.values(manifest.clocks || {})) {
    if (
      !fields ||
      typeof fields !== 'object' ||
      Object.values(fields).some((clock) => typeof clock !== 'string' || clock.length > 150)
    )
      throw new Error('Marcas de sincronización inválidas.');
  }
  if (
    manifest.deletions &&
    (typeof manifest.deletions !== 'object' ||
      Object.values(manifest.deletions).some(
        (clock) => typeof clock !== 'string' || clock.length > 150,
      ))
  )
    throw new Error('Marcas de borrado inválidas.');
  return manifest;
}
export function stamp(
  current: Manifest,
  previous: Manifest | undefined,
  device: string,
  time = Date.now(),
): Manifest {
  const clocks = structuredClone(previous?.clocks || {});
  const deletions = { ...previous?.deletions };
  for (const table of tables) {
    const old = new Map((previous?.data[table] || []).map((r) => [rowKey(table, r), r]));
    if (['plans', 'activities'].includes(table))
      for (const [key] of old) {
        if (!current.data[table].some((row) => rowKey(table, row) === key))
          deletions[`${table}/${key}`] = `${String(time).padStart(16, '0')}:${device}`;
      }
    for (const row of current.data[table]) {
      const key = `${table}/${rowKey(table, row)}`;
      const fields = (clocks[key] ||= {});
      for (const [field, value] of Object.entries(row)) {
        if (old.get(rowKey(table, row))?.[field] !== value || !fields[field]) {
          const prior = Number((fields[field] || '').split(':')[0]) || 0;
          fields[field] = `${String(Math.max(time, prior + 1)).padStart(16, '0')}:${device}`;
        }
      }
    }
  }
  return { ...current, clocks, deletions };
}
export function merge(left: Manifest, right: Manifest): Manifest {
  const deletions: Record<string, string> = {};
  for (const source of [left, right])
    for (const [key, clock] of Object.entries(source.deletions || {}))
      if (!deletions[key] || clock > deletions[key]) deletions[key] = clock;
  const result: Manifest = { version: 1, data: {}, clocks: {}, deletions };
  for (const table of tables) {
    const rows = new Map<string, Row>();
    for (const source of [left, right])
      for (const row of source.data[table]) {
        const key = rowKey(table, row),
          clockKey = `${table}/${key}`;
        const existing = rows.get(key) || {};
        const clocks = (result.clocks![clockKey] ||= {});
        for (const [field, value] of Object.entries(row)) {
          const clock =
            source.clocks?.[clockKey]?.[field] ||
            `0000000000000000:${String(row.created_at || row.started_at || '')}`;
          // Finalizations are monotonic; another device cannot reopen a completed activity.
          if (
            existing[field] != null &&
            value === null &&
            ['completed_at', 'ended_at'].includes(field)
          )
            continue;
          if (
            field === 'active_seconds' &&
            existing[field] != null &&
            Number(existing[field]) > Number(value)
          )
            continue;
          if (
            clocks[field] === undefined ||
            clock > clocks[field] ||
            (clock === clocks[field] && JSON.stringify(value) > JSON.stringify(existing[field]))
          ) {
            existing[field] = value;
            clocks[field] = clock;
          }
        }
        rows.set(key, existing);
      }
    result.data[table] = [...rows.values()].sort((a, b) =>
      rowKey(table, a).localeCompare(rowKey(table, b)),
    );
  }
  const deleted = (table: string, row: Row) => {
    const key = `${table}/${rowKey(table, row)}`,
      deletion = deletions[key];
    return (
      deletion &&
      deletion >
        Object.values(result.clocks![key] || {})
          .sort()
          .at(-1)!
    );
  };
  const referencedActivities = new Set(
    [...result.data.sessions, ...result.data.results].map((row) => row.activity_id),
  );
  result.data.activities = result.data.activities.filter(
    (row) => !deleted('activities', row) || referencedActivities.has(row.id),
  );
  const referencedPlans = new Set(result.data.activities.map((row) => row.plan_id));
  result.data.plans = result.data.plans.filter(
    (row) => !deleted('plans', row) || referencedPlans.has(row.id),
  );
  // Natural unique keys from existing native exports may have different UUIDs.
  function deduplicate(table: string, field: string, references: [string, string][]) {
    const groups = new Map<string, Row[]>();
    for (const row of result.data[table]) {
      const key = String(row[field]).toLowerCase();
      groups.set(key, [...(groups.get(key) || []), row]);
    }
    result.data[table] = [...groups.values()].map((group) => {
      const canonical = group[0];
      for (const duplicate of group.slice(1))
        for (const [child, fk] of references)
          for (const row of result.data[child])
            if (row[fk] === duplicate.id) row[fk] = canonical.id;
      return canonical;
    });
  }
  deduplicate('plans', 'day', [['activities', 'plan_id']]);
  deduplicate('vocabulary', 'word', [['reviews', 'word_id']]);
  // Two offline completions are both real attempts. Preserve the second under an optional activity.
  const used = new Set<string>();
  for (const row of result.data.results) {
    const activity = String(row.activity_id);
    if (used.has(activity)) {
      const original = result.data.activities.find((a) => a.id === activity);
      if (original) {
        const id = `attempt:${row.id}`;
        if (!result.data.activities.some((a) => a.id === id))
          result.data.activities.push({
            ...original,
            id,
            payload: JSON.stringify({ ...JSON.parse(String(original.payload)), optional: true }),
          });
        row.activity_id = id;
        for (const session of result.data.sessions)
          if (session.id === row.session_id) session.activity_id = id;
      }
    }
    used.add(String(row.activity_id));
  }
  for (const word of result.data.vocabulary) {
    const reviews = result.data.reviews
      .filter((review) => review.word_id === word.id)
      .sort(
        (a, b) =>
          String(a.reviewed_at).localeCompare(String(b.reviewed_at)) ||
          String(a.id).localeCompare(String(b.id)),
      );
    if (
      !reviews.length ||
      reviews.some((review) => !Number.isFinite(Date.parse(String(review.reviewed_at))))
    )
      continue;
    let schedule = { interval: 0, ease: 2.5, due_at: String(word.created_at) };
    for (const review of reviews)
      schedule = nextReview(schedule, Boolean(review.known), new Date(String(review.reviewed_at)));
    Object.assign(word, schedule, { reviews: reviews.length });
  }
  return result;
}
