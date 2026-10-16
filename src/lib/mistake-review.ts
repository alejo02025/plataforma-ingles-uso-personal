import type { Snapshot } from './types';
import { routineRecord } from './routine';

type Feedback = {
  id?: string;
  correct?: boolean | null;
  verdict?: string;
  category?: string;
  context?: string;
  explanationNative?: string;
};
function payload(answers: string): Record<string, unknown> {
  try {
    return JSON.parse(answers);
  } catch {
    return {};
  }
}
/** Read-only reconstruction from saved first answers; no schema migration or invented mastery. */
export function mistakeReview(data: Snapshot) {
  const grouped = new Map<string, Snapshot['mistakes']>();
  for (const mistake of data.mistakes) {
    const key = mistake.pattern || mistake.id;
    grouped.set(key, [...(grouped.get(key) || []), mistake]);
  }
  return [...grouped.values()]
    .map((items) => {
      const ordered = items.toSorted(
        (a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id),
      );
      const first = ordered[0],
        last = ordered.at(-1)!;
      const result = data.results.find((r) => r.id === first.result_id);
      const source = payload(result?.answers || '{}');
      const originFeedback = (Array.isArray(source.feedback) ? source.feedback : []).find(
        (f: Feedback) => f.id && first.pattern.endsWith(f.id),
      );
      const category = originFeedback?.category || first.category;
      const trials = data.results
        .filter(
          (r) =>
            r.completed_at > last.created_at &&
            ['grammar', 'reading', 'vocabulary'].includes(r.skill),
        )
        .flatMap((r) => {
          const body = payload(r.answers);
          const helpUsed = body.helpUsed === true;
          const rows = Array.isArray(body.feedback) ? (body.feedback as Feedback[]) : [];
          return rows
            .filter((f) => f.id && (f.id === originFeedback?.id || f.category === category))
            .map((f) => ({
              resultId: r.id,
              date: r.completed_at,
              itemId: f.id!,
              correct: f.correct === true,
              verified: typeof f.correct === 'boolean' && f.verdict !== 'unverified',
              helped: helpUsed,
              differentItem: !!originFeedback?.id && f.id !== originFeedback.id,
              differentContext:
                !!originFeedback?.context && !!f.context && f.context !== originFeedback.context,
            }));
        })
        .toSorted((a, b) => a.date.localeCompare(b.date));
      // One successful unaided day in a different authored item can lengthen the interval.
      // Same-item repetition and a self-rating never count as transfer or competence.
      const successes = trials.filter(
        (t) => t.verified && !t.helped && t.correct && t.differentItem,
      );
      const transfer = successes.filter((t) => t.differentContext);
      const days = new Set(transfer.map((t) => t.date.slice(0, 10))).size;
      const interval = [1, 3, 7, 14][Math.min(days, 3)];
      const latestFailure = trials.findLast((t) => t.verified && !t.helped && !t.correct);
      const latestSuccess = transfer.at(-1);
      const reset = !!latestFailure && (!latestSuccess || latestFailure.date >= latestSuccess.date);
      const anchor = (reset ? latestFailure?.date : latestSuccess?.date) || last.created_at;
      const dueAt = new Date(Date.parse(anchor) + (reset ? 1 : interval) * 86400000).toISOString();
      return {
        id: first.pattern || first.id,
        category,
        first,
        latest: last,
        occurrences: items.length,
        origin: result?.title || '',
        lessonId: typeof source.lessonId === 'string' ? source.lessonId : undefined,
        mode:
          (result ? routineRecord(result)?.mode : undefined) ||
          (['grammar', 'vocabulary', 'reading'].includes(first.category)
            ? (first.category as 'grammar' | 'vocabulary' | 'reading')
            : 'grammar'),
        helpUsed: source.helpUsed === true,
        support: Array.isArray(source.support) ? source.support : [],
        explanationNative: originFeedback?.explanationNative as string | undefined,
        trials,
        differentItemsPractised: successes.length,
        differentContextsPractised: transfer.length,
        dueAt,
      };
    })
    .toSorted((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export const mistakeCategoryLabels: Record<string, [string, string, string]> = {
  tense: ['Verb tense', 'Tempo verbal', 'Tiempo verbal'],
  auxiliary: ['Auxiliary verbs', 'Verbos auxiliares', 'Auxiliares'],
  'word-order': ['Word order', 'Ordem das palavras', 'Orden de palabras'],
  preposition: ['Prepositions', 'Preposições', 'Preposiciones'],
  agreement: ['Agreement', 'Concordância', 'Concordancia'],
  contraction: ['Contractions', 'Contrações', 'Contracciones'],
  'sentence-structure': ['Sentence structure', 'Estrutura da frase', 'Estructura de oración'],
  scope: ['Meaning & scope', 'Sentido e alcance', 'Significado y alcance'],
  modality: ['Certainty & possibility', 'Certeza e possibilidade', 'Certeza y posibilidad'],
  register: ['Register', 'Registro', 'Registro'],
  'spanish-interference': [
    'Spanish interference',
    'Interferência do espanhol',
    'Interferencia del español',
  ],
  grammar: ['Grammar', 'Gramática', 'Gramática'],
  vocabulary: ['Vocabulary', 'Vocabulário', 'Vocabulario'],
  reading: ['Reading', 'Leitura', 'Lectura'],
};

export function pendingProductions(data: Snapshot) {
  return data.results
    .flatMap((result) => {
      const body = payload(result.answers);
      const responses = Array.isArray(body.responses) ? body.responses : [];
      return (
        Array.isArray(body.feedback)
          ? (body.feedback as (Feedback & {
              correction?: string;
              explanationSpanish?: string;
              explanationNative?: string;
            })[])
          : []
      ).flatMap((f, i) =>
        f.verdict === 'unverified' && typeof responses[i] === 'string'
          ? [
              {
                id: `${result.id}:${f.id}`,
                title: result.title,
                date: result.completed_at,
                response: responses[i] as string,
                model: f.correction || '',
                explanation: f.explanationSpanish || '',
                explanationNative: f.explanationNative,
              },
            ]
          : [],
      );
    })
    .toSorted((a, b) => b.date.localeCompare(a.date));
}
