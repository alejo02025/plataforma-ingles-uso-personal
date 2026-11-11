import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exclusive } from '../src/lib/browser/database';
test('local persistence queue never passes a previous operation result as storage arguments', async () => {
  await exclusive(() => ({ result: 'saved', modified: true }));
  await exclusive((...args: unknown[]) => assert.deepEqual(args, []));
  await assert.rejects(
    exclusive(() => {
      throw new Error('write failed');
    }),
    /write failed/,
  );
  assert.equal(await exclusive(() => 'retry saved'), 'retry saved');
});
