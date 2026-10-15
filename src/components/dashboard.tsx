'use client';
import { StudyCopy } from './study-copy';
import { HomeRoutine } from './home-routine';
import { DailyRewards } from './daily-rewards';
import { FirstSteps } from './first-steps';
import { studyStorage } from '@/lib/workspace';
import { readRoutineDraft, type RoutineDraft } from '@/lib/browser/routine-draft';
import { isPortuguese } from '@/lib/workspace';
import { learningJourney } from '@/lib/course-route';
import {
  dailyBudgetKey,
  studyBudget,
  studyBudgets,
  studyRecommendation,
} from '@/lib/study-recommendation';
import { evidenceSummary } from '@/lib/evidence-summary';
import { placementSummary } from '@/lib/placement';
import { oralTask } from '@/lib/oral-practice';
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
  const [todayBudget, setTodayBudget] = useState<{ day: string; minutes: number } | null>(null);
  const [budgetError, setBudgetError] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(studyStorage.getItem(dailyBudgetKey(data.day)) || 'null');
      setTodayBudget({ day: data.day, minutes: studyBudget(stored, data.profile.daily_minutes) });
      setBudgetError(false);
    } catch {
      setTodayBudget(null);
      setBudgetError(true);
    }
  }, [data.day, data.profile.daily_minutes]);
  function changeBudget(minutes: number) {
    setTodayBudget({ day: data.day, minutes });
    try {
      studyStorage.setItem(dailyBudgetKey(data.day), JSON.stringify(minutes));
      setBudgetError(false);
    } catch {
      setBudgetError(true);
    }
  }
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
  const placement = placementSummary(data);
  const oralPrompt = oralTask(journey.level, pt).prompt;
  const [pausedRoutine, setPausedRoutine] = useState<RoutineDraft | null>(null);
  useEffect(() => {
    const readPaused = () => {
      try {
        setPausedRoutine(readRoutineDraft({ level: journey.level, block: journey.block }) || null);
      } catch {
        setPausedRoutine(null);
      }
    };
    readPaused();
    window.addEventListener('english-os:routine-paused', readPaused);
    return () => window.removeEventListener('english-os:routine-paused', readPaused);
  }, [data, journey.level, journey.block]);
  const budget =
    todayBudget?.day === data.day ? todayBudget.minutes : studyBudget(data.profile.daily_minutes);
  const recommendation = studyRecommendation(data, budget, pausedRoutine);
  function startRecommendation() {
    const action = recommendation.action;
    if (action.kind === 'activity') onStart(action.activity);
    else if (action.kind === 'class') onClass(action.id);
    else if (action.kind === 'review') navigate('Vocabulary');
    else
      window.dispatchEvent(
        new CustomEvent('english-os:routine-start', { detail: { mode: action.mode } }),
      );
  }
  return (
    <div className="audit-dashboard">
      <Heading
        eyebrow={pt ? 'SEU ESPAÇO DE PORTUGUÊS' : 'YOUR ENGLISH SPACE'}
        title={`${greeting}, ${data.profile.name}.`}
        description=""
      >
        <span className="date-chip">
          <CalendarDays size={16} />
          {dateLabel(data.day)}
        </span>
      </Heading>
      <details className="audit-path-details">
        <summary>{pt ? 'Sobre seu percurso e seu nível' : 'About your path and level'}</summary>
        <div className="audit-path-details-inner">
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
          data.diagnostic.completed_at
            ? pt
              ? `Diagnóstico orientativo: ${placement.label}. Avalia apenas leitura, gramática e vocabulário; seu percurso permanece em ${journey.level}.`
              : `Diagnostic reference: ${placement.label}. It covers reading, grammar and vocabulary only; your course path remains at ${journey.level}.`
            : pt
              ? `Percurso atual: ${journey.level}. Faça o diagnóstico para obter uma primeira referência; o percurso não certifica proficiência.`
              : `Current course path: ${journey.level}. Take the diagnostic for an initial reference; completing classes does not certify proficiency.`
        }
      >
        {data.diagnostic.completed_at
          ? `Diagnóstico orientativo: ${placement.label}. Evalúa solo lectura, gramática y vocabulario. Tu recorrido sigue en ${journey.level}.`
          : `Recorrido actual: ${journey.level}. Realizá el diagnóstico para obtener una referencia inicial; avanzar de clase no certifica tu nivel.`}
      </StudyCopy>
        </div>
      </details>
      <section
        className="card audit-continue"
        aria-label={pt ? 'Continuar aprendendo' : 'Continue learning'}
        data-no-word-help
      >
        <div className="audit-continue-top">
          <span className="eyebrow">{pt ? 'CONTINUAR APRENDENDO' : 'CONTINUE LEARNING'}</span>
          <span className="pill neutral">
            <Clock3 size={14} />
            {recommendation.sessionMinutes} min {pt ? 'aprox.' : 'approx.'}
          </span>
        </div>
        <h2>{recommendation.title}</h2>
        <StudyCopy native={recommendation.reason}>{recommendation.es}</StudyCopy>
        {recommendation.partial && (
          <StudyCopy
            as="small"
            className="audit-session-note"
            native={
              pt
                ? `A atividade completa leva cerca de ${recommendation.minutes} minutos. Hoje, dedique ${budget} minutos e retome depois; começar não conta como concluir.`
                : `The full activity takes about ${recommendation.minutes} minutes. Spend ${budget} minutes today and resume later; starting does not count as completing.`
            }
          >
            La actividad completa lleva aproximadamente {recommendation.minutes} minutos. Hoy dedicá{' '}
            {budget} minutos y retomá después; empezar no cuenta como completar.
          </StudyCopy>
        )}
        <button className="button" onClick={startRecommendation}>
          {pt ? 'Começar agora' : 'Start now'}
          <ArrowRight size={18} />
        </button>
        <details className="audit-time-choice">
          <summary>
            {budget} min · {pt ? 'Tempo para hoje' : 'Time for today'}{' '}
            <span lang="es">/ Tiempo para hoy</span>
          </summary>
          <label>
            {pt ? 'Quanto tempo você tem hoje?' : 'How much time do you have today?'}
            <small lang="es">¿Cuánto tiempo tenés hoy?</small>
            <select
              aria-label={pt ? 'Tempo para hoje' : 'Time for today'}
              value={budget}
              onChange={(event) => changeBudget(Number(event.target.value))}
            >
              {studyBudgets.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} min
                </option>
              ))}
            </select>
          </label>
          <StudyCopy
            as="small"
            native={
              pt
                ? 'Vale só para hoje, neste dispositivo. Não altera seu plano, suas respostas nem os requisitos das aulas.'
                : 'Just for today, on this device. Your plan, answers and class requirements stay unchanged.'
            }
          >
            Solo por hoy, en este dispositivo. Conserva el plan, tus respuestas y los requisitos de
            las clases.
          </StudyCopy>
          {budgetError && (
            <StudyCopy
              as="small"
              native={
                pt
                  ? 'Não foi possível salvar esta preferência. Ela vale enquanto esta tela estiver aberta.'
                  : 'This preference could not be saved. It applies while this screen stays open.'
              }
            >
              No se pudo guardar esta preferencia. Se aplica mientras esta pantalla siga abierta.
            </StudyCopy>
          )}
        </details>
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
      <section className="audit-speaking-step" aria-label={pt ? 'Prática oral sugerida' : 'Suggested speaking practice'}>
        <span className="audit-speaking-icon"><Headphones size={23} aria-hidden="true" /></span>
        <div className="audit-speaking-copy">
          <span className="eyebrow">{pt ? 'COLOQUE EM PALAVRAS' : 'PUT IT INTO WORDS'}</span>
          <h2>{pt ? 'Fale um pouco hoje' : 'Say something today'}</h2>
          <p lang={pt ? 'pt-BR' : 'en'}>{oralPrompt}</p>
          <small lang="es">
            {pt
              ? 'Practicá en voz alta y guardá una grabación si querés. La pronunciación todavía no se califica.'
              : 'Practicá en voz alta y, si querés, guardá una grabación. No se asigna una nota de pronunciación.'}
          </small>
        </div>
        <button className="button secondary" onClick={() => navigate('Oral practice')}>
          {pt ? 'Praticar fala' : 'Practise speaking'} <ArrowRight size={16}/>
        </button>
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
          availableMinutes={budget}
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
