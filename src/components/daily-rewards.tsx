'use client';
import { StudyCopy } from './study-copy';
import { useEffect, useState } from 'react';
import { Flame, Star, Check, Lock, Trophy } from 'lucide-react';
import { dailyRewards } from '@/lib/daily-rewards';
import { localDay } from '@/lib/learning';
import { isPortuguese } from '@/lib/workspace';
import { rewardHelp } from '@/locales/learning/reward-help';
import type { Snapshot } from '@/lib/types';

export function DailyRewards({ data }: { data: Snapshot }) {
  const [panel, setPanel] = useState<'streak' | 'achievements' | null>(null);
  const [today, setToday] = useState(data.day);
  useEffect(() => {
    const update = () => setToday(localDay());
    update();
    const timer = setInterval(update, 60000);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  const rewards = dailyRewards(data, today);
  const streakTitle = isPortuguese ? 'Sequência diária' : 'Daily streak';
  const achievementsTitle = isPortuguese ? 'Conquistas' : 'Achievements';
  function toggle(next: 'streak' | 'achievements') {
    setPanel((p) => (p === next ? null : next));
  }
  return (
    <section
      className="daily-rewards"
      aria-label={isPortuguese ? 'Sua prática e conquistas' : 'Your practice and achievements'}
      data-no-word-help
    >
      <div className="daily-rewards-bar">
        <button
          className={`reward-stat streak-stat ${rewards.todayDone ? 'is-lit' : ''}`}
          onClick={() => toggle('streak')}
          aria-expanded={panel === 'streak'}
          aria-controls="streak-details"
        >
          <Flame size={27} fill="currentColor" aria-hidden="true" />
          <span>
            <strong>{rewards.currentStreak}</strong>
            <small>{streakTitle}</small>
          </span>
        </button>
        <button
          className="reward-stat star-stat"
          onClick={() => toggle('achievements')}
          aria-expanded={panel === 'achievements'}
          aria-controls="achievement-details"
        >
          <Star size={27} fill="currentColor" aria-hidden="true" />
          <span>
            <strong>
              {rewards.earned}
              <i> / {rewards.badges.length}</i>
            </strong>
            <small>{achievementsTitle}</small>
          </span>
        </button>
        <span className={`reward-today ${rewards.todayDone ? 'is-done' : ''}`}>
          {rewards.todayDone ? <Check size={15} /> : <span className="reward-today-dot" />}
          {isPortuguese ? 'Hoje' : 'Today'}
        </span>
      </div>
      <StudyCopy
        as="p"
        className="reward-hint"
        native={
          rewards.todayDone
            ? isPortuguese
              ? 'Sua prática de hoje já conta. Toque no fogo ou na estrela para ver detalhes.'
              : 'Today’s practice already counts. Tap the flame or the star for details.'
            : rewards.currentStreak
              ? isPortuguese
                ? 'Sua sequência continua ativa. Salve uma prática hoje para somar outro dia.'
                : 'Your streak is still active. Save a practice today to add another day.'
              : isPortuguese
                ? 'Salve uma atividade para acender o fogo de hoje. Toque na estrela para ver suas conquistas.'
                : 'Save an activity to light today’s flame. Tap the star to see your achievements.'
        }
      >
        {rewards.todayDone
          ? 'Tu práctica de hoy ya cuenta. Tocá el fuego o la estrella para ver los detalles.'
          : rewards.currentStreak
            ? 'Tu racha sigue activa. Guardá una práctica hoy para sumar otro día.'
            : 'Guardá una actividad para encender el fuego de hoy. Tocá la estrella para ver tus logros.'}
      </StudyCopy>
      <div id="streak-details" className="reward-details" hidden={panel !== 'streak'}>
        <h3>
          <Flame size={20} />
          {streakTitle}
        </h3>
        <StudyCopy
          as="p"
          native={
            isPortuguese
              ? 'A sequência soma um dia ao salvar uma atividade, revisão, diagnóstico concluído ou resposta de PDF. Você não precisa acertar tudo. Abrir a app ou salvar uma palavra sem praticá-la não soma um dia.'
              : 'Your streak adds a day when you save an activity, review, completed diagnostic or PDF answer. You do not need to get everything right. Opening the app or saving a word without practising it does not add a day.'
          }
        >
          La racha suma un día cuando guardás una actividad, un repaso, un diagnóstico completado o
          una respuesta sobre un PDF. No necesitás acertar todo. Abrir la app o guardar una palabra
          sin practicarla no suma.
        </StudyCopy>
        <ol
          className="streak-week"
          aria-label={isPortuguese ? 'Últimos sete dias' : 'Last seven days'}
        >
          {rewards.week.map((d) => (
            <li
              key={d.day}
              className={d.done ? 'practised' : ''}
              aria-current={d.day === today ? 'date' : undefined}
            >
              <span>
                {new Intl.DateTimeFormat(isPortuguese ? 'pt-BR' : 'en', {
                  weekday: 'short',
                  timeZone: 'UTC',
                }).format(new Date(`${d.day}T12:00:00Z`))}
              </span>
              <Flame size={21} fill={d.done ? 'currentColor' : 'none'} aria-hidden="true" />
              <small>{Number(d.day.slice(-2))}</small>
              <span className="sr-only">
                {d.day} ·{' '}
                {d.done
                  ? isPortuguese
                    ? 'Prática guardada'
                    : 'Saved practice'
                  : isPortuguese
                    ? 'Sem prática guardada'
                    : 'No saved practice'}
              </span>
            </li>
          ))}
        </ol>
        <div className="streak-best">
          <Trophy size={17} />
          <span>
            {isPortuguese ? 'Melhor sequência' : 'Best streak'}:{' '}
            <strong>{rewards.bestStreak}</strong>{' '}
            {isPortuguese
              ? rewards.bestStreak === 1
                ? 'dia'
                : 'dias'
              : rewards.bestStreak === 1
                ? 'day'
                : 'days'}
          </span>
        </div>
        <StudyCopy
          as="p"
          className="fine-print"
          native={
            isPortuguese
              ? `Hoje você tem ${rewards.todayActivities} práticas salvas. O dia de estudo muda à meia-noite na Argentina. Se praticou ontem, tem o dia todo para continuar; uma pausa não apaga progresso nem conquistas.`
              : `Today you have ${rewards.todayActivities} saved practices. The study day changes at midnight in Argentina. If you practised yesterday, you have all of today to continue; a pause never erases progress or achievements.`
          }
        >
          Hoy tenés {rewards.todayActivities}{' '}
          {rewards.todayActivities === 1 ? 'práctica guardada' : 'prácticas guardadas'}. El día de
          estudio cambia a medianoche de Argentina. Si ayer practicaste, tenés todo hoy para
          continuar la racha; una pausa no borra tu progreso ni tus logros.
        </StudyCopy>
      </div>
      <div id="achievement-details" className="reward-details" hidden={panel !== 'achievements'}>
        <h3>
          <Trophy size={20} />
          {achievementsTitle} · {rewards.earned} / {rewards.badges.length}
        </h3>
        <StudyCopy
          as="p"
          native={
            isPortuguese
              ? 'Estas conquistas reconhecem sua prática salva neste idioma. Erros fazem parte da aprendizagem. Cada perfil tem suas próprias conquistas.'
              : 'These achievements recognise saved practice in this language. Mistakes are part of learning. Each profile has its own achievements.'
          }
        >
          Estos logros reconocen tu práctica guardada en este idioma. Los errores también son parte
          del aprendizaje. Cada perfil tiene sus propios logros.
        </StudyCopy>
        <ul className="reward-badges">
          {rewards.badges.map((b) => (
            <li key={b.id} className={b.earned ? 'earned' : ''}>
              <span className="reward-badge-icon">
                {b.earned ? <Star size={20} fill="currentColor" /> : <Lock size={18} />}
              </span>
              <div>
                <h4>{isPortuguese ? b.pt : b.en}</h4>
                <StudyCopy as="p" native={rewardHelp[b.id]?.[isPortuguese ? 'pt' : 'en']}>
                  {b.why}
                </StudyCopy>
                <StudyCopy
                  as="small"
                  native={
                    b.earned
                      ? isPortuguese
                        ? 'Conquistado'
                        : 'Earned'
                      : `${Math.min(b.value, b.target)} / ${b.target}`
                  }
                >
                  {b.earned ? 'Conseguido' : `${Math.min(b.value, b.target)} / ${b.target}`}
                </StudyCopy>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
