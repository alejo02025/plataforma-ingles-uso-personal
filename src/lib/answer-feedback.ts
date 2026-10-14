import { englishCourseReadings } from '@/locales/learning/course-readings';
import { lessons } from './lessons';
import { diagnosticQuestions, grammarQuestions, readings } from './content';
import { cefrCourse } from './cefr-curriculum';
import { answerWhy } from '@/locales/es/answer-help';
export function questionFeedback(id: string) {
  const lessonCheck = lessons
    .flatMap((lesson) => lesson.checks.map((q, i) => ({ id: `${lesson.id}:${i}`, q })))
    .find((check) => check.id === id)?.q;
  if (lessonCheck) return { explanation: lessonCheck.why, correction: lessonCheck.correction };
  const question = [
    ...diagnosticQuestions,
    ...grammarQuestions,
    ...readings.flatMap((doc) => doc.questions),
    ...englishCourseReadings.flatMap((doc) => doc.questions),
  ].find((q) => q.id === id);
  const task = cefrCourse
    .flatMap((unit) =>
      unit.tasks
        .filter((t) => t.options)
        .map((t) => ({ id: `cefr:${unit.level}:${t.id}`, task: t })),
    )
    .find((t) => t.id === id)?.task;
  return {
    explanation: id.startsWith('course-reading:')
      ? question?.explanation || answerWhy(id)
      : answerWhy(id),
    correction: question ? question.options[question.answer] : task?.options?.[task.answer!] || '',
  };
}
