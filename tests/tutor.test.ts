import { test } from 'node:test';
import assert from 'node:assert/strict';
import { questions, references, guidedReply } from '../src/lib/tutor';
import { textSections } from '../src/lib/text-sections';
import { categoryFor, wordsForDay } from '../src/lib/daily-words';
const doc = {
  id: 'test',
  paragraphs: [
    'The local museum showed how people lived a hundred years ago. The small town is beside a wide river.',
    'Compound interest includes interest earned on earlier interest. Fees can reduce the real growth of savings.',
    'Railway workers used a shared time to coordinate train services. Passengers checked the timetable before leaving.',
  ],
  pages: [1, 2, 3],
};
test('PDF questions keep an unambiguous source and do not assign a score to open answers', () => {
  for (let round = 0; round < 9; round++)
    for (const question of questions(doc, round, 0)) {
      assert.equal(question.source.text, doc.paragraphs[question.source.paragraph]);
      assert.equal(question.source.page, doc.pages[question.source.paragraph]);
      if (question.kind === 'open') {
        assert.equal(question.answer, null);
        continue;
      }
      assert.equal(new Set(question.options).size, question.options.length);
      if (question.kind === 'word')
        assert.ok(
          new RegExp(`\\b${question.options[question.answer!]}\\b`, 'i').test(question.source.text),
        );
      else assert.ok(question.source.text.includes(question.options[question.answer!]));
    }
});
test('question retrieval returns the relevant paragraph with the original page reference', () => {
  const sources = references(doc, 'How can fees affect savings?', 0);
  assert.equal(sources[0].page, 2);
  assert.ok(sources[0].text.includes('Fees'));
  const reply = guidedReply(doc, 'What does the museum show?', 0);
  assert.ok(reply.content.includes(doc.paragraphs[0]));
  assert.equal(reply.sources[0].page, 1);
});
test('PDF chunking keeps page numbers for each section', () => {
  const sections = textSections([
    { page: 2, text: Array.from({ length: 230 }, (_, i) => `word${i}`).join(' ') },
    { page: 4, text: 'A new page with another short paragraph.' },
  ]);
  assert.deepEqual(
    sections.map((section) => section.page),
    [2, 2, 2, 4],
  );
  assert.equal(sections[0].text.split(' ').length, 100);
});
test('daily words are stable for the day and organized into practical categories', () => {
  assert.deepEqual(wordsForDay('2026-10-13'), wordsForDay('2026-10-13'));
  assert.equal(wordsForDay('2026-10-13').length, 5);
  assert.equal(categoryFor('refund'), 'Finance');
  assert.equal(categoryFor('boarding pass'), 'Travel');
  assert.equal(categoryFor('deadline'), 'Work');
  assert.ok(wordsForDay('2026-10-13').every((word) => word.meaning && word.usage && word.category));
});

test('the local reply guard catches names introduced outside the document', async () => {
  const { unverifiedNames, sourceAnswer } = await import('../src/lib/tutor');
  const sources = references(doc, 'Where is the town?', 0);
  assert.deepEqual(unverifiedNames('The town is called Ashwood in England.', sources), [
    'Ashwood',
    'England',
  ]);
  assert.match(sourceAnswer(sources, 'Where is the town?'), /wide river/);
});

test('factual local-model replies quote the source rather than repeat unsupported story details', async () => {
  const { checkedLocalReply } = await import('../src/lib/tutor');
  const sources = references(doc, 'Where is the town?', 0);
  const reply = checkedLocalReply(
    'The town has a hidden message and a long history. What would you like to learn about it?',
    sources,
    'Where is the town?',
  );
  assert.equal(reply.mode, 'guided');
  assert.match(reply.content, /wide river/);
  assert.doesNotMatch(reply.content, /hidden message|long history/);
  assert.match(reply.content, /What would you like to learn/);
  const discussion = checkedLocalReply(
    'You could talk about travel. What would you try?',
    sources,
    'Help me start a conversation about travel.',
  );
  assert.equal(discussion.mode, 'local');
});
