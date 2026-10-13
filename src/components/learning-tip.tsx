'use client';
import { Lightbulb } from 'lucide-react';
const ideas = [
  {
    title: 'Make it yours.',
    text: 'Choose one new word. Say a sentence about something you did today.',
  },
  {
    title: 'A tiny speaking break.',
    text: 'Look around. Name three things you can see, then describe one of them out loud.',
  },
  {
    title: 'Read it twice.',
    text: 'Read a short paragraph once for the idea. Read it again and keep just one useful expression.',
  },
  {
    title: 'Change one detail.',
    text: 'Take an example sentence and change the place, person, or time. Say your new version out loud.',
  },
];
export function LearningTip({ day }: { day: string }) {
  const idea = ideas[Number(day.replaceAll('-', '')) % ideas.length];
  return (
    <details className="daily-idea">
      <summary>
        <Lightbulb size={18} />
        <span>One small idea for today</span>
      </summary>
      <div>
        <strong>{idea.title}</strong>
        <p>{idea.text}</p>
      </div>
    </details>
  );
}
