import type { Snapshot } from './types';
import { localDay } from './learning';
export type PracticeDay = {
  day: string;
  score: number;
  minutes: number;
  activities: Snapshot['results'];
  reviews: Snapshot['reviews'];
  words: Snapshot['vocabulary'];
  attempts: Snapshot['tutorAttempts'];
  messages: Snapshot['tutorMessages'];
  course: NonNullable<Snapshot['cefr']>['attempts'];
  assessment: boolean;
  practised: boolean;
};
export function greetingForHour(hour: number) {
  return hour >= 5 && hour < 12
    ? 'Good morning'
    : hour >= 12 && hour < 18
      ? 'Good afternoon'
      : 'Good evening';
}
export function practiceDays(data: Snapshot, length = 30): PracticeDay[] {
  const records = new Map<string, Omit<PracticeDay, 'score' | 'practised'>>();
  const record = (day: string) => {
    if (!records.has(day))
      records.set(day, {
        day,
        minutes: 0,
        activities: [],
        reviews: [],
        words: [],
        attempts: [],
        messages: [],
        course: [],
        assessment: false,
      });
    return records.get(day)!;
  };
  for (const result of data.results) record(result.day).activities.push(result);
  for (const review of data.reviews) record(review.day).reviews.push(review);
  for (const word of data.vocabulary) record(localDay(new Date(word.created_at))).words.push(word);
  for (const attempt of data.tutorAttempts)
    record(localDay(new Date(attempt.created_at))).attempts.push(attempt);
  for (const message of data.tutorMessages)
    if (message.role === 'user')
      record(localDay(new Date(message.created_at))).messages.push(message);
  for (const attempt of data.cefr?.attempts || [])
    record(localDay(new Date(attempt.created_at))).course.push(attempt);
  for (const session of data.sessions)
    record(localDay(new Date(session.started_at))).minutes += session.active_seconds / 60;
  if (data.diagnostic.completed_at)
    record(localDay(new Date(data.diagnostic.completed_at))).assessment = true;
  const last = new Date(`${data.day}T12:00:00-03:00`),
    visibleFirst = new Date(last);
  visibleFirst.setUTCDate(visibleFirst.getUTCDate() - length + 1);
  const earliest = [...records.keys(), localDay(visibleFirst)]
    .filter((day) => day <= data.day)
    .sort()[0];
  const cursor = new Date(`${earliest}T12:00:00-03:00`);
  let score = 0;
  const result: PracticeDay[] = [];
  while (cursor <= last) {
    const day = localDay(cursor),
      details = record(day),
      units =
        details.activities.length +
        details.reviews.length +
        details.words.length +
        details.attempts.length +
        details.messages.length +
        details.course.length +
        Number(details.assessment);
    const practised = units > 0 || details.minutes >= 1;
    const gain = practised
      ? Math.min(20, 6 + Math.min(units, 6) * 2 + Math.min(details.minutes, 20) * 0.5)
      : 0;
    if (practised || day !== data.day) score = Math.min(100, score * 0.92 + gain);
    if (day >= localDay(visibleFirst))
      result.push({
        ...details,
        minutes: Math.round(details.minutes * 10) / 10,
        score: Math.round(score * 10) / 10,
        practised,
      });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return result;
}
