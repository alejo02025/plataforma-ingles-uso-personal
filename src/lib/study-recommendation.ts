import { learningJourney, lessonRequirements } from './course-route';
import { evidenceSummary } from './evidence-summary';
import { isPortuguese } from './workspace';
import type { Activity, Snapshot } from './types';
import { routineTitles, type RoutineMode } from './routine';

export const studyBudgets = [15, 20, 30, 45] as const;
const supportedBudgets = [5, 15, 20, 30, 40, 45] as const;
export function studyBudget(value: unknown, fallback = 20): number {
  return supportedBudgets.includes(value as (typeof supportedBudgets)[number])
    ? Number(value)
    : supportedBudgets.includes(fallback as (typeof supportedBudgets)[number])
      ? fallback
      : 20;
}
export function dailyBudgetKey(day: string) {
  return `study-budget:v1:${day}`;
}

type Action =
  | { kind: 'activity'; activity: Activity }
  | { kind: 'class'; id: string }
  | { kind: 'review' }
  | { kind: 'routine'; mode: 'reading' | 'grammar' | 'vocabulary' | 'writing' };

/** Read-only suggestions: never award credit, rebuild a plan or relax course requirements. */
export function studyRecommendation(
  data: Snapshot,
  available = data.profile.daily_minutes,
  paused?: { id: string; mode: RoutineMode; level: string; block: number } | null,
) {
  const pt = isPortuguese;
  const budget = studyBudget(available, data.profile.daily_minutes);
  const journey = learningJourney(data);
  const due = evidenceSummary(data).due;
  const pending =
    data.backlog?.find((a) => !a.completed_at) ||
    (data.resumeActivity && !data.resumeActivity.completed_at ? data.resumeActivity : null);
  const repair = journey.repairs[0];
  const nextClass = journey.nextLesson;
  const canOpenClass = nextClass && !lessonRequirements(data, nextClass).some((r) => !r.done);
  const resumable =
    paused &&
    paused.level === journey.level &&
    paused.block === journey.block &&
    !data.results.some((r) => r.activity_id === `routine:${paused.id}`)
      ? paused
      : null;
  const shortMode = (['vocabulary', 'reading', 'writing'] as const).find(
    (mode) => !journey.tasks.find((t) => t.id === mode)?.done,
  );
  const shortPractice = (
    mode: 'reading' | 'grammar' | 'vocabulary' | 'writing',
    brief: boolean,
  ) => ({
    title:
      mode === 'writing'
        ? pt
          ? 'Use uma ideia em um texto seu'
          : 'Use an idea in your own writing'
        : mode === 'vocabulary'
          ? pt
            ? 'Descubra palavras em contexto'
            : 'Discover words in context'
          : mode === 'reading'
            ? pt
              ? 'Entenda uma situação curta'
              : 'Understand a short situation'
            : pt
              ? 'Monte uma frase com sentido'
              : 'Build a meaningful sentence',
    reason: brief
      ? pt
        ? 'Você tem uma pausa curta. Esta prática contribui para seu bloco atual; as aulas e seus requisitos continuam no mesmo lugar.'
        : 'You have a short break. This practice contributes to your current block; classes and their requirements stay in place.'
      : mode === 'writing'
        ? pt
          ? 'Expresse uma ideia com suas palavras. Seu texto fica no histórico, sem nota automática de qualidade.'
          : 'Express an idea in your own words. Your text stays in history without an automatic quality score.'
        : pt
          ? 'Conecte palavras, frases e compreensão. Esta é uma prática pendente do seu bloco.'
          : 'Connect words, sentences and understanding. This practice is still pending in your block.',
    es: brief
      ? 'Tenés una pausa corta. Esta práctica suma al bloque actual; las clases y sus requisitos siguen en el mismo lugar.'
      : mode === 'writing'
        ? 'Expresá una idea con tus palabras. El texto queda en tu historial, sin una nota automática de calidad.'
        : 'Conectá palabras, oraciones y comprensión. Es una práctica pendiente de tu bloque.',
    minutes: 5,
    action: { kind: 'routine', mode } as Action,
    priority: 'practice' as const,
  });
  const recommendation = pending
    ? {
        title: pending.title,
        reason: pt
          ? 'Retome de onde parou. Suas respostas anteriores foram preservadas.'
          : 'Pick up where you stopped. Your previous answers have been preserved.',
        es: 'Retomá desde donde dejaste. Tus respuestas anteriores están guardadas.',
        minutes: Math.max(1, pending.minutes),
        action: { kind: 'activity', activity: pending } as Action,
        priority: 'pending' as const,
      }
    : repair
      ? {
          title: pt ? 'Reforce o que precisa de atenção' : 'Strengthen what needs attention',
          reason: pt
            ? 'Seus resultados recentes indicam que vale rever este ponto antes de uma aula nova.'
            : 'Your recent results suggest revisiting this point before a new class.',
          es: repair.explanation,
          minutes: repair.lessonId ? 8 : Math.max(1, repair.activity?.minutes || 5),
          action: (repair.lessonId
            ? { kind: 'class', id: repair.lessonId }
            : repair.activity
              ? { kind: 'activity', activity: repair.activity }
              : {
                  kind: 'routine',
                  mode: repair.id.includes('reading')
                    ? 'reading'
                    : repair.id.includes('vocabulary')
                      ? 'vocabulary'
                      : 'grammar',
                }) as Action,
          priority: 'repair' as const,
        }
      : resumable
        ? {
            title: routineTitles[resumable.mode],
            reason: pt
              ? 'Você pausou esta atividade. Retome a mesma sequência, com suas respostas preservadas.'
              : 'You paused this activity. Resume the same sequence with your answers preserved.',
            es: 'Pausaste esta actividad. Retomá la misma secuencia con tus respuestas guardadas.',
            minutes: 5,
            action: { kind: 'routine', mode: resumable.mode } as Action,
            priority: 'paused' as const,
          }
        : due
          ? {
              title: pt ? 'Recupere palavras da memória' : 'Recall your saved words',
              reason: pt
                ? `${due} palavras estão prontas para revisão. Tente lembrar antes de mostrar a resposta.`
                : `${due} words are ready for review. Try to recall them before revealing the answer.`,
              es: `${due} palabras necesitan repaso. Intentá recordarlas antes de ver la respuesta.`,
              minutes: 4,
              action: { kind: 'review' } as Action,
              priority: 'review' as const,
            }
          : budget < 8 && shortMode
            ? shortPractice(shortMode, true)
            : canOpenClass
              ? {
                  title: nextClass.title,
                  reason: pt
                    ? 'Esta é a próxima aula disponível no seu percurso. Pratique uma ideia em uma situação real.'
                    : 'This is the next available class on your path. Practise one idea in a real situation.',
                  es: 'Es la próxima clase disponible de tu recorrido. Practicá una idea en una situación real.',
                  minutes: 8,
                  action: { kind: 'class', id: nextClass.id } as Action,
                  priority: 'class' as const,
                }
              : shortPractice(shortMode || 'grammar', false);
  return {
    ...recommendation,
    budget,
    sessionMinutes: Math.min(budget, recommendation.minutes),
    partial: recommendation.minutes > budget,
  };
}
