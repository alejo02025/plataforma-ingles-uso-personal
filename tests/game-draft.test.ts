import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makePuzzle } from '../src/lib/games';
import {
  readGameDraft,
  writeGameDraft,
  clearGameDraft,
  gameDraftIdentity,
} from '../src/lib/browser/game-draft';
test('Game drafts retain attempts and hints, reject malformed selections, and clear only the completed mode', () => {
  const items = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => items.get(k) || null,
      setItem: (k: string, v: string) => items.set(k, v),
    },
  });
  try {
    const puzzle = makePuzzle('match', 'draft-test', 'A2');
    const draft = {
      ...gameDraftIdentity('d34dbb99-6334-493d-af59-93e571912792', 'draft-test', puzzle),
      answers: [],
      picked: [],
      choice: puzzle.rounds[0].choices[0],
      checked: true,
      guesses: [],
      guess: '',
      hint: true,
      helpUsed: true,
      seconds: 28,
    };
    writeGameDraft('match', draft);
    assert.deepEqual(readGameDraft('match'), draft);
    const trail = makePuzzle('trail', 'trail-test', 'A2'),
      trailDraft = {
        ...draft,
        ...gameDraftIdentity(draft.id, 'trail-test', trail),
        choice: '',
        checked: false,
        guesses: ['aaaaa'],
        guess: 'bo',
      };
    writeGameDraft('trail', trailDraft);
    assert.equal(readGameDraft('trail')!.guesses[0], 'aaaaa');
    writeGameDraft('match', { ...draft, picked: [999] });
    assert.equal(readGameDraft('match'), undefined);
    writeGameDraft('match', { ...draft, puzzleKey: 'an obsolete puzzle' });
    assert.equal(readGameDraft('match'), undefined);
    clearGameDraft('match');
    assert.equal(readGameDraft('match'), undefined);
    assert.deepEqual(readGameDraft('trail'), trailDraft);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
