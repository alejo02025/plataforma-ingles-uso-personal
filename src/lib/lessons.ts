import { isPortuguese } from './workspace';
import { englishClasses, portugueseClasses } from '@/locales/lessons/catalog';
export type Lesson = {
  id: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  title: string;
  goal: string;
  skill?: 'grammar' | 'reading' | 'vocabulary';
  explanation: string;
  pattern: string;
  examples: [string, string];
  tip: string;
  practice: string;
  model: string;
  checks: {
    prompt: string;
    options: [string, string, string];
    answer: number;
    correction: string;
    why: string;
  }[];
};
export const classRevision = 1;
export const lessons: Lesson[] = isPortuguese ? portugueseClasses : englishClasses;
