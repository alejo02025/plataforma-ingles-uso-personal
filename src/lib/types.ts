import type { Skill, Question } from './content';
export type PublicQuestion = Omit<Question, 'answer' | 'explanation'>;
export type Document = {
  id: string;
  title: string;
  topic: string;
  level: string;
  source: string;
  minutes: number;
  intro: string;
  paragraphs: string[];
  pages: (number | null)[];
  questions: PublicQuestion[];
  filename: string | null;
  paragraph: number;
  draft: Record<string, number>;
  updated_at: string | null;
  created_at: string;
};
export type Activity = {
  id: string;
  plan_id: string;
  kind: Skill;
  title: string;
  minutes: number;
  document_id: string | null;
  payload: {
    questions?: PublicQuestion[];
    prompt?: string;
    optional?: boolean;
    draft?: string;
    studyDay?: import('./daily-study').StudyDay;
    writingBrief?: ReturnType<
      typeof import('../locales/learning/writing-challenges').writingChallenge
    >;
    writingLevel?: string;
  };
  completed_at: string | null;
};
export type Word = {
  id: string;
  word: string;
  meaning: string;
  pronunciation: string;
  example: string;
  source_id: string | null;
  created_at: string;
  due_at: string;
  interval: number;
  ease: number;
  reviews: number;
};
export type Result = {
  id: string;
  activity_id: string;
  skill: Skill;
  correct: number | null;
  total: number | null;
  answers: string;
  completed_at: string;
  day: string;
  active_seconds: number;
  title: string;
  document_id: string | null;
};
export type Evaluation = {
  skill: Skill;
  level: string | null;
  confidence: string;
  correct: number;
  total: number;
  created_at: string;
};
export type Correction = {
  id: string;
  original: string;
  revised: string;
  feedback: string;
  model: string;
  created_at: string;
};
export type Mistake = {
  id: string;
  correction_id: string | null;
  result_id: string | null;
  category: string;
  original: string;
  corrected: string;
  explanation: string;
  pattern: string;
  created_at: string;
};
export type Snapshot = {
  backlog?: Activity[];
  courseCheckpoints?: { id: string; level: string; completed_at: string }[];
  cefr?: {
    level: string;
    attempts: {
      id: string;
      level: string;
      task: string;
      answer: string;
      correct: number | null;
      created_at: string;
    }[];
  };
  profile: { name: string; daily_minutes: number; interests: string[]; theme: string };
  day: string;
  aiAvailable: boolean;
  protected: boolean;
  diagnostic: {
    id: string;
    completed_at: string | null;
    answers: { question_id: string; answer: number; correct: number }[];
  };
  questions: PublicQuestion[];
  documents: Document[];
  trashedDocuments?: Document[];
  resumeActivity: Activity | null;
  plan: { day: string; minutes: number; reason: string; activities: Activity[] };
  vocabulary: Word[];
  results: Result[];
  evaluations: Evaluation[];
  corrections: Correction[];
  mistakes: Mistake[];
  reviews: { word_id: string; word: string; known: number; day: string; reviewed_at: string }[];
  tutorMessages: {
    id: string;
    document_id: string;
    role: 'user' | 'assistant';
    content: string;
    sources: string;
    mode: string;
    created_at: string;
  }[];
  tutorAttempts: {
    id: string;
    document_id: string;
    question_id: string;
    prompt: string;
    answer: string;
    correct: number | null;
    feedback: string;
    source_paragraph: number;
    created_at: string;
  }[];
  sessions: {
    id: string;
    activity_id: string;
    started_at: string;
    active_seconds: number;
    ended_at: string | null;
    title: string;
    kind: string;
  }[];
};
