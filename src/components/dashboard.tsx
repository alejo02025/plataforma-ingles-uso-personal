'use client';
import { StudyCopy } from './study-copy';
import { HomeRoutine } from './home-routine';
import { DailyRewards } from './daily-rewards';
import { FirstSteps } from './first-steps';
import { studyStorage } from '@/lib/workspace';
import { isPortuguese } from '@/lib/workspace';
import { learningJourney, lessonRequirements } from '@/lib/course-route';
import { evidenceSummary } from '@/lib/evidence-summary';
import { DailyGuide } from './daily-guide';
import { useEffect, useState } from 'react';
import { greetingForHour } from '@/lib/momentum';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Feather,
  Languages,
  CalendarDays,
  Clock3,
  FileText,
  Target,
  Headphones,
} from 'lucide-react';
import type { Snapshot, Activity } from '@/lib/types';
import { skillNames } from '@/lib/learning';
import { Heading, dateLabel } from './ui';
export const activityIcons = {
  reading: BookOpen,
  grammar: Languages,
  vocabulary: Feather,
  writing: Feather,
};
export function ActivityList({
  data,
  onStart,
}: {
  data: Snapshot;
  onStart: (a: Activity) => void;
}) {
  const items = data.plan.activities.filter((a) => !a.payload.optional);
  return (
    <div className="activity-list">
      {items.map((a, index) => {
        const Icon = activityIcons[a.kind];
        return (
          <button
            key={a.id}
            className={`activity-row ${a.completed_at ? 'done' : ''}`}
            onClick={() => onStart(a)}
          >
            <span className={`activity-icon ${a.kind}`}>
              <Icon size={20} />
            </span>
            <div className="activity-copy">
              <span className="tiny-label">
                {String(index + 1).padStart(2, '0')} · {skillNames[a.kind]}
              </span>
              <h3>{a.title}</h3>
              <p>
                {a.completed_at
                  ? 'Completed · view result'
                  : a.kind === 'reading'
                    ? 'Read, discover words, and connect ideas.'
                    : a.kind === 'grammar'
                      ? 'Short decisions with an explanation.'
                      : a.kind === 'vocabulary'
                        ? 'Try to recall before looking at the answer.'
                        : 'Express an idea and save your practice.'}
              </p>
            </div>
            <span className="row-end">
              {a.completed_at ? (
                <Check size={18} />
              ) : (
                <>
                  <span>{a.minutes} min</span>
                  <ArrowUpRight size={18} />
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
export function Dashboard({
  data,
  onStart,
  navigate,
  onDiagnostic,
  onRead,
  onClass,
  onGame,
  refresh,
}: {
  data: Snapshot;
  onStart: (a: Activity) => void;
  navigate: (view: string) => void;
  onDiagnostic: () => void;
  onRead: (doc: import('@/lib/types').Document) => void;
  onClass: (id: string) => void;
  onGame: (seed: string) => void;
  refresh: () => Promise<void>;
}) {
  const [greeting, setGreeting] = useState('Hello');
  const [welcome, setWelcome] = useState(false);
  useEffect(() => {
    try {
      setWelcome(!studyStorage.getItem('first-steps:v1') && !data.results.length);
    } catch {
      setWelcome(true);
    }
  }, []);
  function finishWelcome(test = false) {
    try {
      studyStorage.setItem('first-steps:v1', 'seen');
    } catch {}
    setWelcome(false);
    if (test) onDiagnostic();
  }

  useEffect(() => {
    const update = () => setGreeting(greetingForHour(new Date().getHours()));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);
  const pt = isPortuguese;
  const journey = learningJourney(data);
  const summary = evidenceSummary(data);
  const pending = data.backlog?.find((a) => !a.completed_at) || data.resumeActivity;
  const repair = journey.repairs[0];
  const nextClass = journey.nextLesson;
  const canOpenClass = nextClass && !lessonRequirements(data, nextClass).some((r) => !r.done);
  const defaultMode = journey.tasks.find((t) => !t.done)?.id;
  const mode =
    defaultMode === 'reading' ? 'reading' : defaultMode === 'vocabulary' ? 'vocabulary' : 'grammar';
  const recommendation = pending
    ? {
        title: pending.title,
        reason: pt
          ? 'Retome de onde parou. Suas respostas anteriores foram preservadas.'
          : 'Pick up where you stopped. Your previous answers have been preserved.',
        es: 'Retomá desde donde dejaste. Tus respuestas anteriores están guardadas.',
        minutes: pending.minutes,
        start: () => onStart(pending),
      }
    : repair
      ? {
          title: pt ? 'Reforce o que precisa de atenção' : 'Strengthen what needs attention',
          reason: pt
            ? 'Seus resultados recentes indicam que vale rever este ponto antes de uma aula nova.'
            : 'Your recent results suggest revisiting this point before a new class.',
          es: 'Tus resultados recientes indican que conviene reforzar este punto antes de una clase nueva.',
          minutes: 5,
          start: () =>
            repair.lessonId
              ? onClass(repair.lessonId)
              : repair.activity
                ? onStart(repair.activity)
                : repair.view === 'Home'
                  ? window.dispatchEvent(
                      new CustomEvent('english-os:routine-start', {
                        detail: {
                          mode: repair.id.includes('reading')
                            ? 'reading'
                            : repair.id.includes('vocabulary')
                              ? 'vocabulary'
                              : 'grammar',
                        },
                      }),
                    )
                  : navigate(repair.view),
        }
      : summary.due
        ? {
            title: pt ? 'Recupere palavras da memória' : 'Recall your saved words',
            reason: pt
              ? `${summary.due} palavras estão prontas para revisão. Tente lembrar antes de mostrar a resposta.`
              : `${summary.due} words are ready for review. Try to recall them before revealing the answer.`,
            es: `${summary.due} palabras necesitan repaso. Intentá recordarlas antes de ver la respuesta.`,
            minutes: 4,
            start: () => navigate('Vocabulary'),
          }
        : canOpenClass
          ? {
              title: nextClass.title,
              reason: pt
                ? 'Esta é a próxima aula disponível no seu percurso. Pratique uma ideia em uma situação real.'
                : 'This is the next available class on your path. Practise one idea in a real situation.',
              es: 'Es la próxima clase disponible de tu recorrido. Practicá una idea en una situación real.',
              minutes: 8,
              start: () => onClass(nextClass.id),
            }
          : defaultMode === 'writing'
            ? {
                title: pt ? 'Use uma ideia em um texto seu' : 'Use an idea in your own writing',
                reason: pt
                  ? 'A próxima prática do bloco é expressar uma ideia com suas palavras. O texto fica no histórico, sem nota automática de qualidade.'
                  : 'The next practice in this block is to express an idea in your own words. Your text stays in history without an automatic quality score.',
                es: 'La próxima práctica del bloque es expresar una idea con tus palabras. El texto queda en el historial, sin una nota automática de calidad.',
                minutes: 5,
                start: () =>
                  window.dispatchEvent(
                    new CustomEvent('english-os:routine-start', { detail: { mode: 'writing' } }),
                  ),
              }
            : {
                title: pt ? 'Uma atividade curta, com contexto' : 'A short activity, with context',
                reason: pt
                  ? 'Conecte palavras, frases e compreensão. O percurso abaixo mostra o próximo passo do seu bloco.'
                  : 'Connect words, sentences and understanding. The path below shows the next step in your block.',
                es: 'Conectá palabras, oraciones y comprensión. El recorrido de abajo muestra el próximo paso del bloque.',
                minutes: 5,
                start: () =>
                  window.dispatchEvent(
                    new CustomEvent('english-os:routine-start', { detail: { mode } }),
                  ),
              };
  return (
    <div className="audit-dashboard">
      <Heading
        eyebrow={pt ? 'SEU ESPAÇO DE PORTUGUÊS' : 'YOUR ENGLISH SPACE'}
        title={`${greeting}, ${data.profile.name}.`}
        description={
          pt
            ? 'Um passo útil para se comunicar com mais independência.'
            : 'Build the English you can use with confidence.'
        }
      >
        <span className="date-chip">
          <CalendarDays size={16} />
          {dateLabel(data.day)}
        </span>
      </Heading>
      <div className="audit-home-context">
        <span className="pill neutral">
          {pt ? 'Português · Brasil' : 'English'} · {journey.level}{' '}
          {pt ? 'em estudo' : 'study path'}
        </span>
        <span>
          <Target size={15} /> {pt ? 'Objetivo: autonomia na comunicação' : 'Goal: a solid B2'}
        </span>
      </div>
      <StudyCopy
        as="small"
        className="audit-starting-context"
        native={
          pt
            ? 'Ponto de partida: A1. O percurso de aulas e sua capacidade avaliada são registros distintos.'
            : 'Approximate starting point: B1, with A2 foundations to consolidate. Your course path does not certify a level.'
        }
      >
        {pt
          ? 'Punto de partida: A1. El recorrido de clases y tu capacidad evaluada son registros distintos.'
          : 'Punto de partida aproximado: B1, con bases de A2 para consolidar. El recorrido de clases no certifica un nivel.'}
      </StudyCopy>
      <section
        className="card audit-continue"
        aria-label={pt ? 'Continuar aprendendo' : 'Continue learning'}
        data-no-word-help
      >
        <div className="audit-continue-top">
          <span className="eyebrow">{pt ? 'CONTINUAR APRENDENDO' : 'CONTINUE LEARNING'}</span>
          <span className="pill neutral">
            <Clock3 size={14} />
            {recommendation.minutes} min
          </span>
        </div>
        <h2>{recommendation.title}</h2>
        <StudyCopy native={recommendation.reason}>{recommendation.es}</StudyCopy>
        <button className="button" onClick={recommendation.start}>
          {pt ? 'Começar agora' : 'Start now'}
          <ArrowRight size={18} />
        </button>
        <small className="audit-choice-note">
          {pt
            ? 'Uma recomendação, não uma obrigação. Você pode escolher outra atividade abaixo.'
            : 'A recommendation, not an obligation. You can choose another activity below.'}
        </small>
      </section>
      {welcome && (
        <details className="audit-welcome" open>
          <summary>
            {pt
              ? 'Primeira vez por aqui? Veja como começar.'
              : 'First time here? See how to get started.'}
          </summary>
          <FirstSteps onTest={() => finishWelcome(true)} onDone={() => finishWelcome()} />
        </details>
      )}
      <section className="audit-week" aria-label={pt ? 'Sua semana' : 'Your week'}>
        <div className="section-heading">
          <h2>{pt ? 'Sua semana' : 'Your week'}</h2>
          <small>{pt ? 'Últimos 7 dias' : 'Last 7 days'}</small>
        </div>
        <div className="audit-week-stats">
          {[
            {
              value: `${summary.days}/7`,
              en: 'Study days',
              pt: 'Dias de prática',
              es: 'Días de estudio',
            },
            {
              value: `${summary.minutes} min`,
              en: 'Recorded time',
              pt: 'Tempo registrado',
              es: 'Tiempo registrado',
            },
            {
              value: summary.activities,
              en: 'Activities saved',
              pt: 'Atividades salvas',
              es: 'Actividades guardadas',
            },
            {
              value: summary.due,
              en: 'Words due',
              pt: 'Palavras para revisar',
              es: 'Palabras por repasar',
            },
          ].map((stat) => (
            <div key={stat.en}>
              <strong>{stat.value}</strong>
              <span>{pt ? stat.pt : stat.en}</span>
              <small lang="es">{stat.es}</small>
            </div>
          ))}
        </div>
        <DailyRewards data={data} />
      </section>
      <section
        className="card audit-skills"
        aria-label={pt ? 'Evidências por habilidade' : 'Skill evidence'}
      >
        <div className="section-heading">
          <h2>{pt ? 'O que suas respostas mostram' : 'What your answers show'}</h2>
          <button className="text-link" onClick={() => navigate('Progress')}>
            {pt ? 'Ver progresso' : 'See progress'} <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="audit-skill-grid">
          {summary.skills.map((skill) => (
            <div key={skill.skill}>
              <strong>
                {pt
                  ? { reading: 'Leitura', grammar: 'Gramática', vocabulary: 'Vocabulário' }[
                      skill.skill
                    ]
                  : skillNames[skill.skill]}
              </strong>
              <span>
                {skill.total
                  ? `${skill.correct}/${skill.total} ${pt ? 'respostas corretas' : 'correct answers'}`
                  : pt
                    ? 'Ainda sem respostas avaliadas'
                    : 'No scored answers yet'}
              </span>
              <small lang="es">
                {skill.total
                  ? `${skill.attempts} prácticas objetivas; no es un nivel MCER.`
                  : 'Todavía falta evidencia objetiva.'}
              </small>
            </div>
          ))}
          {[
            {
              en: 'Writing',
              pt: 'Escrita',
              es: `${summary.writing} textos guardados; calidad sin evaluar.`,
              native: summary.writing
                ? `${summary.writing} ${pt ? 'textos salvos · qualidade não avaliada' : 'saved texts · quality not assessed'}`
                : pt
                  ? 'Ainda não avaliada'
                  : 'Not assessed yet',
            },
            {
              en: 'Listening',
              pt: 'Compreensão oral',
              es: summary.listening.total
                ? 'Respuestas sobre una voz sintética; comprensión en otras situaciones pendiente.'
                : 'Todavía no hay preguntas de comprensión oral respondidas.',
              native: summary.listening.total
                ? `${summary.listening.correct}/${summary.listening.total} ${pt ? 'respostas · áudio sintético' : 'answers · synthetic audio'}`
                : pt
                  ? 'Ainda sem respostas avaliadas'
                  : 'No scored answers yet',
            },
            {
              en: 'Speaking',
              pt: 'Expressão oral',
              es: `${summary.recordings} grabaciones; pronunciación y fluidez sin evaluar.`,
              native: summary.recordings
                ? `${summary.recordings} ${pt ? 'gravações · qualidade não avaliada' : 'recordings · quality not assessed'}`
                : pt
                  ? 'Ainda não avaliada'
                  : 'Not assessed yet',
            },
          ].map((skill) => (
            <div key={skill.en}>
              <strong>{pt ? skill.pt : skill.en}</strong>
              <span>{skill.native}</span>
              <small lang="es">{skill.es}</small>
            </div>
          ))}
        </div>
      </section>
      <div className="audit-shortcuts" aria-label={pt ? 'Acessos rápidos' : 'Quick access'}>
        {[
          { view: 'PDF Studio', en: 'PDF Studio', pt: 'PDF Studio', icon: FileText },
          { view: 'Vocabulary', en: 'Vocabulary', pt: 'Vocabulário', icon: Feather },
          { view: 'Language help', en: 'Language help', pt: 'Ajuda com o idioma', icon: Languages },
          { view: 'Calendar', en: 'Calendar', pt: 'Calendário', icon: CalendarDays },
          { view: 'Oral practice', en: 'Oral practice', pt: 'Prática oral', icon: Headphones },
        ].map(({ view, en, pt: label, icon: Icon }) => (
          <button key={view} onClick={() => navigate(view)} data-no-word-help>
            <Icon size={20} />
            <span>{pt ? label : en}</span>
            <ArrowUpRight size={14} />
          </button>
        ))}
      </div>
      <HomeRoutine
        data={data}
        refresh={refresh}
        onStart={onStart}
        onClass={onClass}
        onGame={onGame}
      />
      <details className="audit-explore-day">
        <summary>{pt ? 'Outras ideias para explorar hoje' : 'More ideas to explore today'}</summary>
        <DailyGuide
          data={data}
          onRead={onRead}
          onStart={onStart}
          onClass={onClass}
          onGame={onGame}
          navigate={navigate}
        />
      </details>
      <div className="home-small-links">
        <button
          className="text-link"
          onClick={() => {
            setWelcome(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          How to start
        </button>
        <button className="text-link" onClick={() => navigate('Classes')}>
          Open classes
        </button>
        <button className="text-link" onClick={() => finishWelcome(true)}>
          Find my starting point
        </button>
      </div>
    </div>
  );
}
