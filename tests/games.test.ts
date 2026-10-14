import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { makePuzzle, letterMarks, recallBand, puzzleHint, exampleWithGap } from '../src/lib/games';
import { saveGame } from '../src/lib/game-store';
import { initialize } from '../src/lib/schema';
import { createLearningService } from '../src/lib/domain';
import type { Word } from '../src/lib/types';

test('Word Trail counts duplicate letters once and preserves accents', () => {
  assert.deepEqual(letterMarks('apple', 'allee'), [
    'exact',
    'present',
    'absent',
    'absent',
    'exact',
  ]);
  assert.deepEqual(letterMarks('praça', 'praça'), Array(5).fill('exact'));
});
test('All games have solvable, deterministic rounds and match choices contain the correct word', () => {
  for (const mode of ['match', 'sentence', 'trail'] as const) {
    const puzzle = makePuzzle(mode, 'daily');
    assert.deepEqual(puzzle, makePuzzle(mode, 'daily'));
    assert.equal(puzzle.rounds.length, mode === 'trail' ? 1 : 4);
    for (const round of puzzle.rounds) {
      assert.ok(round.meaning);
      assert.ok(round.solution);
      if (mode === 'match') {
        assert.equal(new Set(round.choices).size, 4);
        assert.ok(round.choices.includes(round.solution));
      }
      if (mode === 'sentence')
        assert.deepEqual([...round.choices].sort(), round.solution.split(/\s+/).sort());
    }
  }
});
test('Game saves are scored from the puzzle, idempotent and appear in real progress without changing the daily plan or spaced reviews', () => {
  const db = new DatabaseSync(':memory:');
  try {
    initialize(db);
    const service = createLearningService({
      db: () => db,
      transaction: (fn) => fn(),
      uuid: randomUUID,
    });
    const before = service.snapshot();
    const plan = db.prepare('SELECT id FROM plans ORDER BY day DESC LIMIT 1').get()!.id as string;
    const puzzle = makePuzzle('match', 'test');
    const input = {
      id: randomUUID(),
      mode: 'match',
      seed: 'test',
      answers: puzzle.rounds.map((r, i) => (i === 0 ? 'wrong' : r.solution)),
      seconds: 17,
    };
    assert.throws(() => saveGame(db, { ...input, answers: [] }, plan), /Finish every round/);
    assert.equal(db.prepare('SELECT count(*) as n FROM results').get()!.n, 0);
    assert.deepEqual(saveGame(db, input, plan), { correct: 3, total: 4, repeated: false });
    assert.deepEqual(saveGame(db, input, plan), { correct: 3, total: 4, repeated: true });
    const after = service.snapshot();
    assert.equal(after.results.length, before.results.length + 1);
    assert.equal(after.results.at(-1)!.correct, 3);
    assert.equal(after.results.at(-1)!.active_seconds, 17);
    assert.deepEqual(after.plan.activities, before.plan.activities);
    assert.deepEqual(after.reviews, before.reviews);
    assert.equal(after.sessions.at(-1)!.ended_at !== null, true);
  } finally {
    db.close();
  }
});
test('Recall categories reflect the last self rating and need three consecutive known ratings for strong', () => {
  const word = { id: 'w' } as Word;
  const reviews = (values: number[]) =>
    values.map((known) => ({
      word_id: 'w',
      word: 'word',
      known,
      day: 'today',
      reviewed_at: 'today',
    }));
  assert.equal(recallBand(word, []), 'weak');
  assert.equal(recallBand(word, reviews([1])), 'growing');
  assert.equal(recallBand(word, reviews([1, 1, 1])), 'strong');
  assert.equal(recallBand(word, reviews([1, 1, 1, 0])), 'weak');
  assert.equal(recallBand(word, reviews([0, 1, 1])), 'growing');
});

test('Hints give an initial letter or opening word, and everyday examples hide the target word', () => {
  const match = makePuzzle('match', 'help').rounds[0];
  assert.equal(puzzleHint(match, 'match'), Array.from(match.word)[0].toUpperCase());
  const gap = exampleWithGap(match);
  if (gap) {
    assert.ok(gap.includes('____'));
    assert.ok(!gap.toLowerCase().includes(match.word.toLowerCase()));
  }
  const sentence = makePuzzle('sentence', 'help').rounds[0];
  assert.equal(puzzleHint(sentence, 'sentence'), sentence.solution.split(/\s+/)[0]);
});
test('New game editions follow the active vocabulary band while legacy puzzles stay reproducible', () => {
  const legacy = makePuzzle('match', 'edition-check', 'A2');
  assert.equal(legacy.curriculum, undefined);
  const current = makePuzzle('match', 'edition-check', 'A2', 2);
  assert.equal(current.curriculum, 2);
  assert.ok(
    current.rounds.every(
      (r) => !['assumptions', 'judgement', 'misleading', 'compound interest'].includes(r.word),
    ),
  );
  assert.deepEqual(makePuzzle('match', 'edition-check', 'A2'), legacy);
});
