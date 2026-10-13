import { randomUUID } from 'node:crypto';
import { db, transaction } from './db';
import { createLearningService } from './domain';
export { AppError, publicQuestion } from './domain';
export const {
  documents,
  diagnostic,
  answerDiagnostic,
  dailyPlan,
  startSession,
  tickSession,
  finishActivity,
  saveWord,
  reviewWord,
  checkpoint,
  snapshot,
} = createLearningService({
  db,
  transaction,
  uuid: randomUUID,
  aiAvailable: Boolean(process.env.ENGLISH_AI_API_KEY),
  protectedAccess: Boolean(process.env.APP_ACCESS_TOKEN),
});
