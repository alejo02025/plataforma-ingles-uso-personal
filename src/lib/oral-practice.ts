import { z } from 'zod';
import { oralScenarios } from '@/locales/learning/oral-scenarios';
import type { Snapshot } from './types';
import { voiceDocumentId } from './voice';
export const oralInput = z
  .object({
    id: z.string().uuid(),
    kind: z.literal('oral-v1'),
    mode: z.enum(['recording', 'listening']),
    level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
    duration: z.number().min(0).max(125),
    transcript: z.string().trim().max(1200).default(''),
    transcriptSource: z.enum(['manual']).nullable().default(null),
    heard: z.boolean().default(false),
    note: z.string().trim().max(450).default(''),
    answers: z.array(z.number().int().min(0).max(2)).max(2).default([]),
    helpUsed: z.boolean().default(false),
    mime: z.string().max(100).default(''),
  })
  .strict();
export type OralInput = z.infer<typeof oralInput>;
export type OralEvidence = OralInput & {
  correct: number | null;
  total: number | null;
  created_at: string;
};
export function oralEvidence(data: Pick<Snapshot, 'tutorMessages'>): OralEvidence[] {
  return data.tutorMessages.flatMap((m) => {
    if (m.document_id !== voiceDocumentId || m.role !== 'user') return [];
    try {
      const { correct: _c, total: _t, ...body } = JSON.parse(m.content);
      const input = oralInput.parse(body);
      if (
        input.id !== m.id ||
        (input.mode === 'recording' && input.duration <= 0) ||
        (input.mode === 'listening' && input.answers.length !== 2)
      )
        return [];
      return [
        {
          ...input,
          helpUsed: input.helpUsed || (input.mode === 'listening' && !input.heard),
          correct: input.mode === 'listening' ? input.answers.filter((a) => a === 0).length : null,
          total: input.mode === 'listening' ? 2 : null,
          created_at: m.created_at,
        },
      ];
    } catch {
      return [];
    }
  });
}
export function oralTask(level: OralInput['level'], pt: boolean) {
  const task = oralScenarios[level];
  return {
    ...task[pt ? 'pt' : 'en'],
    spanishStory: pt ? task.es.storyPT : task.es.storyEN,
    spanishModel: pt ? task.es.modelPT : task.es.modelEN,
    spanishPrompt: task.es.prompt,
    spanishQuestions: task.es.questions,
    whyNative: pt ? task.whyPT : task.whyEN,
    whySpanish: task.es.why,
  };
}
