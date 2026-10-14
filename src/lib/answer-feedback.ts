import { diagnosticQuestions, grammarQuestions, readings } from './content';
import { cefrCourse } from './cefr-curriculum';
import { answerWhy } from '@/locales/es/answer-help';
export function questionFeedback(id: string) {
  const question = [
    ...diagnosticQuestions,
    ...grammarQuestions,
    ...readings.flatMap((doc) => doc.questions),
  ].find((q) => q.id === id);
  const task = cefrCourse
    .flatMap((unit) =>
      unit.tasks
        .filter((t) => t.options)
        .map((t) => ({ id: `cefr:${unit.level}:${t.id}`, task: t })),
    )
    .find((t) => t.id === id)?.task;
  return {
    explanation: answerWhy(id),
    correction: question ? question.options[question.answer] : task?.options?.[task.answer!] || '',
  };
}
