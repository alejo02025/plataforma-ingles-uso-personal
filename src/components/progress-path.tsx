'use client';
import { StudyCopy } from './study-copy';
import { Check, ArrowRight, Trophy } from 'lucide-react';
import {
  learningJourney,
  levelLessons,
  passedLesson,
  blockSize,
  integration,
} from '@/lib/course-route';
import { cefrLevels } from '@/lib/cefr-curriculum';
import { isPortuguese } from '@/lib/workspace';
import { levelBases } from '@/locales/learning/level-bases';
import type { Snapshot } from '@/lib/types';
export function ProgressPath({
  data,
  navigate,
}: {
  data: Snapshot;
  navigate: (view: string) => void;
}) {
  const journey = learningJourney(data),
    items = levelLessons(journey.level);
  const passed = items.filter((l) => passedLesson(data, l.id)).length;
  const blocks = Array.from({ length: Math.ceil(items.length / blockSize) }, (_, i) =>
    items.slice(i * blockSize, (i + 1) * blockSize),
  );
  const doneBlocks = blocks.filter((b) => integration(data, b).every((r) => r.done)).length;
  const pt = isPortuguese;
  const nativeRequirement = (id: string) => {
    if (id === 'classes')
      return pt
        ? 'Conclua as aulas deste bloco com pelo menos 80% de acertos. Tentativas anteriores são preservadas.'
        : 'Complete this block’s classes with at least 80% correct answers. Previous attempts are preserved.';
    if (id === 'reading')
      return pt
        ? 'Conclua uma leitura deste bloco com pelo menos 60% de acertos sem ajuda, ou uma resposta objetiva correta sobre seu PDF.'
        : 'Complete a reading in this block with at least 60% correct answers without help, or one correct objective answer about your PDF.';
    if (id === 'vocabulary')
      return pt
        ? 'Pratique o vocabulário do bloco: atividade de palavras com 80% sem ajuda, jogo com 75% sem ajuda ou três palavras distintas lembradas na revisão.'
        : 'Practise this block’s vocabulary: a word activity at 80% without help, a game at 75% without help, or three distinct words recalled in review.';
    if (id === 'writing')
      return pt
        ? 'Salve um texto de pelo menos 30 caracteres. Isso registra prática, não qualidade ou nível.'
        : 'Save a text of at least 30 characters. This records practice, not quality or level.';
    if (id === 'backlog')
      return pt
        ? 'Retome a atividade pendente para preservar suas respostas e continuar o percurso.'
        : 'Resume your unfinished activity to preserve your answers and continue your path.';
    return pt
      ? 'Reveja esta habilidade antes de abrir novas aulas. Seus resultados anteriores continuam salvos.'
      : 'Revisit this skill before opening new classes. Your previous results remain saved.';
  };
  const next = cefrLevels[cefrLevels.indexOf(journey.level) + 1];
  return (
    <section className="card progress-path">
      <span className="eyebrow">{pt ? 'SEU PRÓXIMO MARCO' : 'YOUR NEXT MILESTONE'}</span>
      <h2>
        {journey.level}
        {next ? ` → ${next}` : ''}
      </h2>
      <StudyCopy
        as="p"
        native={
          pt
            ? `Seu nível de estudo atual é ${journey.level}. Para liberar ${next || 'o fechamento do percurso'}, complete aulas e práticas de todos os blocos deste nível.`
            : `Your current study level is ${journey.level}. To unlock ${next || 'the end of the path'}, complete classes and practice in all blocks at this level.`
        }
      >
        Tu nivel de estudio actual es {journey.level}. Para habilitar{' '}
        {next || 'el cierre del recorrido'}, completá las clases y las prácticas de todos los
        bloques de este nivel.
      </StudyCopy>
      <progress
        value={passed}
        max={items.length}
        aria-label={pt ? 'Aulas concluídas neste nível' : 'Completed level classes'}
      />
      <div className="path-achievements">
        <Trophy size={19} />
        <strong>
          {passed} / {items.length} {isPortuguese ? 'aulas' : 'classes'} · {doneBlocks} /{' '}
          {blocks.length} {isPortuguese ? 'blocos' : 'blocks'}
        </strong>
      </div>
      <details className="path-bases" open>
        <summary>{pt ? 'O que você precisa saber' : 'What you need to know'}</summary>
        <ul>
          {(isPortuguese ? levelBases[journey.level].pt : levelBases[journey.level].en).map(
            (line) => (
              <li key={line}>{line}</li>
            ),
          )}
        </ul>
        <StudyCopy
          as="small"
          native={
            pt
              ? 'São objetivos de estudo. Os registros da app não certificam que você domina todas essas capacidades.'
              : 'These are study goals. App records do not certify that you have mastered all these abilities.'
          }
        >
          Son objetivos de estudio; el cumplimiento de la app registra práctica, no certifica por sí
          solo que dominás todas estas capacidades.
        </StudyCopy>
      </details>
      <details className="path-requirements">
        <summary>{pt ? 'O que ainda falta' : 'What is still needed'}</summary>
        <StudyCopy
          as="p"
          native={
            pt
              ? `Bloco atual: ${journey.block + 1}. Cada bloco conecta aulas (80%), leitura (60% ou uma resposta objetiva de PDF), vocabulário e escrita registrada. A qualidade da escrita não é avaliada automaticamente.`
              : `Current block: ${journey.block + 1}. Each block connects classes (80%), reading (60% or an objective PDF answer), vocabulary and recorded writing. Writing quality is not assessed automatically.`
          }
        >
          Bloque actual: {journey.block + 1}. Cada bloque combina clases (80 %), lectura (60 % o una
          pregunta objetiva de PDF), vocabulario (tres palabras recordadas o un juego con 75 % sin
          ayudas) y escritura guardada. La escritura se registra sin evaluar automáticamente su
          calidad.
        </StudyCopy>
        <ul>
          {journey.tasks.map((t) => (
            <li key={t.id} className={t.done ? 'done' : ''}>
              <Check size={16} />
              <StudyCopy
                as="span"
                native={`${pt ? (t.done ? 'Concluído: ' : 'Pendente: ') : t.done ? 'Completed: ' : 'Pending: '}${nativeRequirement(t.id)}`}
              >
                {t.done ? 'Completado: ' : 'Pendiente: '}
                {t.explanation}
              </StudyCopy>
            </li>
          ))}
        </ul>
      </details>
      <div className="path-reinforcement">
        <h3>{pt ? 'Onde focar agora' : 'Where to focus now'}</h3>
        <StudyCopy
          as="p"
          native={
            journey.next
              ? nativeRequirement(journey.next.id)
              : pt
                ? 'Você concluiu os requisitos atuais. Revise ou continue o percurso.'
                : 'You completed the current requirements. Review or continue your path.'
          }
        >
          {journey.next?.explanation ||
            'Completaste los requisitos actuales. Podés repasar o continuar el recorrido.'}
        </StudyCopy>
        {journey.repairs
          .filter((r) => r.id !== journey.next?.id)
          .map((r) => (
            <StudyCopy as="p" key={r.id} native={nativeRequirement(r.id)}>
              {r.explanation}
            </StudyCopy>
          ))}
        <button className="button secondary" onClick={() => navigate('Classes')}>
          {pt ? 'Abrir meu percurso' : 'Open my learning path'} <ArrowRight size={15} />
        </button>
        <button className="text-link" onClick={() => navigate('Language help')}>
          {pt ? 'Abrir ajuda com o idioma' : 'Open language help'}
        </button>
      </div>
      <details>
        <summary>{pt ? 'Marcos de prática' : 'Practice milestones'}</summary>
        <ul>
          <StudyCopy
            as="li"
            native={
              pt
                ? `${passed} aulas aprovadas neste nível e ${doneBlocks} blocos integrados concluídos.`
                : `${passed} classes passed at this level and ${doneBlocks} integrated blocks completed.`
            }
          >
            {passed} clases aprobadas en este nivel y {doneBlocks} bloques integrados completados.
          </StudyCopy>
          <StudyCopy
            as="li"
            native={
              pt
                ? `${data.results.filter((r) => r.skill === 'reading' && !r.activity_id.startsWith('class:')).length} leituras concluídas e ${data.vocabulary.length} palavras salvas.`
                : `${data.results.filter((r) => r.skill === 'reading' && !r.activity_id.startsWith('class:')).length} readings completed and ${data.vocabulary.length} words saved.`
            }
          >
            {
              data.results.filter(
                (r) => r.skill === 'reading' && !r.activity_id.startsWith('class:'),
              ).length
            }{' '}
            lecturas terminadas y {data.vocabulary.length} palabras guardadas.
          </StudyCopy>
          <StudyCopy
            as="li"
            native={
              journey.completed.length
                ? pt
                  ? `Níveis do percurso concluídos: ${journey.completed.join(', ')}.`
                  : `Completed course levels: ${journey.completed.join(', ')}.`
                : pt
                  ? 'Ainda não há um nível completo. Cada prática salva permanece no histórico.'
                  : 'There is no completed course level yet. Every saved practice remains in history.'
            }
          >
            {journey.completed.length
              ? `Niveles del recorrido completados: ${journey.completed.join(', ')}.`
              : 'Todavía no hay un nivel completo del recorrido. Cada práctica guardada queda en tu historial.'}
          </StudyCopy>
        </ul>
      </details>
    </section>
  );
}
