import type { Lesson } from '@/lib/lessons';
import {
  englishVerbs,
  portugueseVerbs,
  englishSubjects,
  portugueseSubjects,
  buildSentence,
  verbPart,
  type Tense,
} from './foundations';
export function verbLessons(pt: boolean): Lesson[] {
  const verbs = pt ? portugueseVerbs : englishVerbs,
    subjects = pt ? portugueseSubjects : englishSubjects;
  return (['present', 'past', 'future'] as Tense[]).flatMap((tense) =>
    verbs.map((verb, index) => {
      const subject = subjects[(index + 2) % subjects.length];
      const model = buildSentence(pt, verb, subject, tense, 'statement');
      const negative = buildSentence(pt, verb, subject, tense, 'negative');
      const question = buildSentence(pt, verb, subject, tense, 'question');
      const contrast = buildSentence(
        pt,
        verb,
        subject,
        tense === 'present' ? 'past' : 'present',
        'statement',
      );
      const wrongSubject = buildSentence(
        pt,
        verb,
        subjects[(index + 3) % subjects.length],
        tense,
        'statement',
      );
      const goal = pt
        ? 'Use este verbo para falar de uma situação real e fazer uma pergunta.'
        : 'Use this verb in a real situation and ask a question.';
      const time = pt
        ? ({ present: 'Hoje', past: 'Ontem', future: 'Amanhã' } as const)[
            tense as 'present' | 'past' | 'future'
          ]
        : ({ present: 'Today', past: 'Yesterday', future: 'Tomorrow' } as const)[
            tense as 'present' | 'past' | 'future'
          ];
      return {
        id: `${pt ? 'pt' : 'en'}-verb-${tense}-${verb.id}`,
        level: tense === 'present' ? 'A1' : 'A2',
        title: `${time} · ${verb.word}`,
        goal,
        explanation: `${model.explanation} En esta clase practicás «${verb.word}», que significa «${verb.es}». Observá el sujeto, el momento de la acción y cómo cambia el verbo: «${verbPart(pt, verb, subject, tense)}». La forma negativa y la pregunta mantienen la misma situación, pero cambian su intención.`,
        pattern: `${model.text} / ${negative.text} / ${question.text}`,
        examples: [model.text, question.text],
        tip: `${negative.explanation} No traduzcas palabra por palabra desde el español: tomá la oración completa como modelo y cambiá un detalle que sea verdadero para vos.`,
        practice: pt
          ? `Escreva uma afirmação, uma negativa e uma pergunta com “${verb.word}”. Depois use uma delas ao conversar.`
          : `Write a statement, a negative and a question with “${verb.word}”. Then use one in a conversation.`,
        model: `${model.text} ${negative.text} ${question.text}`,
        checks: [
          {
            prompt: `${time} · ${model.translation}`,
            options: [
              `${time}: ${model.text}`,
              `${tense === 'present' ? (pt ? 'Ontem' : 'Yesterday') : pt ? 'Hoje' : 'Today'}: ${contrast.text}`,
              `${time}: ${wrongSubject.text}`,
            ],
            answer: 0,
            correction: model.text,
            why: `${model.explanation} El sujeto y el momento deben coincidir con la consigna en español: «${model.translation}». La otra oración cambia el tiempo o la persona.`,
          },
          {
            prompt: pt
              ? 'Qual opção faz uma pergunta sobre essa mesma situação?'
              : 'Which option asks about that same situation?',
            options: [negative.text, question.text, model.text],
            answer: 1,
            correction: question.text,
            why:
              question.explanation +
              ' La pregunta pide información; la afirmación y la negativa no preguntan.',
          },
        ],
      } satisfies Lesson;
    }),
  );
}
