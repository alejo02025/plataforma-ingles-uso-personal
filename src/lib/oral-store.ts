import type { DatabaseSync } from 'node:sqlite';
import { oralInput } from './oral-practice';
import { voiceMutation } from './voice-store';
import { courseRoute } from './course-route';
import { courseEvidence } from './course-store';
import { cefrLevels } from './cefr-curriculum';
import { AppError } from './domain';
export function saveOralAttempt(db: Pick<DatabaseSync, 'prepare'>, input: unknown) {
  const x = oralInput.parse(input);
  const previous = db.prepare('SELECT content FROM tutor_messages WHERE id=?').get(x.id);
  if (previous) {
    const old = JSON.parse(previous.content as string);
    if (old.kind !== x.kind || old.mode !== x.mode || old.level !== x.level)
      throw new AppError('This attempt belongs to a different activity.');
    const { correct, total, ...body } = old;
    return { correct, total, evidence: oralInput.parse(body), repeated: true };
  }
  const route = courseRoute(courseEvidence(db));
  if (cefrLevels.indexOf(x.level) > cefrLevels.indexOf(route.level))
    throw new AppError('Continue your current level before opening this task.');
  if (
    x.mode === 'recording' &&
    (x.duration <= 0 || !/^audio\/(webm|ogg|mp4|mpeg|wav)(;|$)/.test(x.mime))
  )
    throw new AppError('Record audio before saving this practice.');
  if (x.mode === 'listening' && x.answers.length !== 2)
    throw new AppError('Answer both listening questions before saving.');
  const correct = x.mode === 'listening' ? x.answers.filter((a) => a === 0).length : null,
    total = x.mode === 'listening' ? 2 : null;
  const evidence = { ...x, helpUsed: x.helpUsed || (x.mode === 'listening' && !x.heard) };
  voiceMutation(db, {
    id: x.id,
    role: 'user',
    mode: 'user',
    content: JSON.stringify({ ...evidence, correct, total }),
  });
  return { correct, total, evidence, repeated: false };
}
