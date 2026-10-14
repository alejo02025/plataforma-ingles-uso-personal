'use client';
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
  const next = cefrLevels[cefrLevels.indexOf(journey.level) + 1];
  return (
    <section className="card progress-path">
      <span className="eyebrow">YOUR NEXT MILESTONE</span>
      <h2>
        {journey.level}
        {next ? ` → ${next}` : ''}
      </h2>
      <p lang="es">
        Tu nivel de estudio actual es {journey.level}. Para habilitar{' '}
        {next || 'el cierre del recorrido'}, completá las clases y las prácticas de todos los
        bloques de este nivel.
      </p>
      <progress value={passed} max={items.length} aria-label="Completed level classes" />
      <div className="path-achievements">
        <Trophy size={19} />
        <strong>
          {passed} / {items.length} {isPortuguese ? 'aulas' : 'classes'} · {doneBlocks} /{' '}
          {blocks.length} {isPortuguese ? 'blocos' : 'blocks'}
        </strong>
      </div>
      <details className="path-bases" open>
        <summary>What you need to know</summary>
        <ul lang="es">
          {(isPortuguese ? levelBases[journey.level].pt : levelBases[journey.level].en).map(
            (line) => (
              <li key={line}>{line}</li>
            ),
          )}
        </ul>
        <small lang="es">
          Son objetivos de estudio; el cumplimiento de la app registra práctica, no certifica por sí
          solo que dominás todas estas capacidades.
        </small>
      </details>
      <details className="path-requirements">
        <summary>What is still needed</summary>
        <p lang="es">
          Bloque actual: {journey.block + 1}. Cada bloque combina clases (80 %), lectura (60 % o una
          pregunta objetiva de PDF), vocabulario (tres palabras recordadas o un juego con 75 % sin
          ayudas) y escritura guardada. La escritura se registra sin evaluar automáticamente su
          calidad.
        </p>
        <ul>
          {journey.tasks.map((t) => (
            <li key={t.id} className={t.done ? 'done' : ''}>
              <Check size={16} />
              <span lang="es">
                {t.done ? 'Completado: ' : 'Pendiente: '}
                {t.explanation}
              </span>
            </li>
          ))}
        </ul>
      </details>
      <div className="path-reinforcement">
        <h3>Where to focus now</h3>
        <p lang="es">
          {journey.next?.explanation ||
            'Completaste los requisitos actuales. Podés repasar o continuar el recorrido.'}
        </p>
        {journey.repairs
          .filter((r) => r.id !== journey.next?.id)
          .map((r) => (
            <p lang="es" key={r.id}>
              {r.explanation}
            </p>
          ))}
        <button className="button secondary" onClick={() => navigate('Classes')}>
          Open my learning path <ArrowRight size={15} />
        </button>
        <button className="text-link" onClick={() => navigate('Language help')}>
          Open language help
        </button>
      </div>
      <details>
        <summary>Achievements</summary>
        <ul lang="es">
          <li>
            {passed} clases aprobadas en este nivel y {doneBlocks} bloques integrados completados.
          </li>
          <li>
            {
              data.results.filter(
                (r) => r.skill === 'reading' && !r.activity_id.startsWith('class:'),
              ).length
            }{' '}
            lecturas terminadas y {data.vocabulary.length} palabras guardadas.
          </li>
          <li>
            {journey.completed.length
              ? `Niveles del recorrido completados: ${journey.completed.join(', ')}.`
              : 'Todavía no hay un nivel completo del recorrido. Cada práctica guardada queda en tu historial.'}
          </li>
        </ul>
      </details>
    </section>
  );
}
