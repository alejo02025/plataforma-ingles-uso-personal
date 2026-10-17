import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLocalBackup } from '../src/lib/browser/backup-format';
import { tables } from '../src/lib/browser/merge';
import { workspaceId } from '../src/lib/workspace';
function sample() {
  return {
    format: 'lingua-local-backup',
    version: 1,
    workspace: workspaceId,
    createdAt: '2026-10-17T14:30:00.000Z',
    manifest: {
      version: 1,
      workspace: workspaceId,
      data: Object.fromEntries(tables.map((t) => [t, []])),
    },
    attachments: [
      { key: 'file:123-test.pdf', kind: 'bytes', mime: 'application/pdf', base64: 'JVBERg==' },
    ],
  };
}
test('local backup validates workspace, PDF originals and recordings without network access', () => {
  const backup = sample();
  backup.attachments.push({
    key: 'oral-audio:123-test',
    kind: 'blob',
    mime: 'audio/webm',
    base64: 'AQID',
  });
  assert.equal(parseLocalBackup(backup).attachments.length, 2);
  assert.throws(() =>
    parseLocalBackup({ ...backup, workspace: workspaceId === 'en' ? 'pt' : 'en' }),
  );
  assert.throws(() =>
    parseLocalBackup({
      ...backup,
      manifest: { ...backup.manifest, workspace: workspaceId === 'en' ? 'pt' : 'en' },
    }),
  );
});
test('invalid versions, dangerous storage keys, corrupt base64 and duplicates are rejected', () => {
  const backup = sample();
  assert.throws(() => parseLocalBackup({ ...backup, version: 2 }));
  for (const key of ['database', 'manifest', '__proto__', 'file:../../original.pdf'])
    assert.throws(() =>
      parseLocalBackup({ ...backup, attachments: [{ ...backup.attachments[0], key }] }),
    );
  assert.throws(() =>
    parseLocalBackup({
      ...backup,
      attachments: [{ ...backup.attachments[0], base64: 'corrupt!' }],
    }),
  );
  assert.throws(() =>
    parseLocalBackup({ ...backup, attachments: [backup.attachments[0], backup.attachments[0]] }),
  );
  assert.throws(() => parseLocalBackup({ ...backup, manifest: { version: 1, data: {} } }));
});
