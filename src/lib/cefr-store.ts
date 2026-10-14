import { studyLevel, courseEvidence } from './course-store';
import { courseRoute } from './course-route';
import { z } from 'zod';
import type { DatabaseSync } from 'node:sqlite';
import { cefrCourse, cefrLevels } from './cefr-curriculum';
export function cefrMutation(db: Pick<DatabaseSync, 'prepare'>, endpoint: string, input: unknown) {
  if (endpoint === 'cefr/answer') {
    const x = z
      .object({
        id: z.string().uuid(),
        level: z.enum(cefrLevels),
        task: z.string().max(30),
        answer: z.string().trim().min(1).max(6000),
      })
      .parse(input);
    if (x.level !== studyLevel(db))
      throw new Error(
        'Ese nivel está bloqueado. Completá el recorrido conectado de Classes antes de avanzar.',
      );
    const task = cefrCourse
      .find((unit) => unit.level === x.level)!
      .tasks.find((item) => item.id === x.task);
    if (!task) throw new Error('Atividade não encontrada.');
    let correct: number | null = null;
    if (task.options) {
      const choice = Number(x.answer);
      if (!/^\d+$/.test(x.answer) || !task.options[choice])
        throw new Error('Escolha uma resposta válida.');
      correct = Number(choice === task.answer);
    } else if (x.answer.length < (task.skill === 'writing' ? 30 : 10))
      throw new Error('Escreva um pouco mais para registrar sua prática.');
    db.prepare('INSERT OR IGNORE INTO cefr_attempts VALUES(?,?,?,?,?,?)').run(
      x.id,
      x.level,
      x.task,
      x.answer,
      correct,
      new Date().toISOString(),
    );
    return { correct, tip: task.tip };
  }
  if (endpoint === 'cefr/advance') {
    const current = db.prepare("SELECT level FROM cefr_state WHERE id='route'").get()!
      .level as string;
    if (!courseRoute(courseEvidence(db)).completed.includes(current as (typeof cefrLevels)[number]))
      throw new Error(
        'Las cuatro prácticas no bastan para subir de nivel. Completá las clases y las tareas conectadas de lectura, vocabulario, escritura y conversación.',
      );
    const unit = cefrCourse.find((item) => item.level === current)!;
    const rows = db
      .prepare('SELECT * FROM cefr_attempts WHERE level=? ORDER BY created_at,id')
      .all(current);
    if (
      !unit.tasks.every((task) =>
        rows.some((row) => row.task === task.id && (task.options ? row.correct === 1 : true)),
      )
    )
      throw new Error('Conclua as quatro práticas antes de avançar.');
    const next = cefrLevels[cefrLevels.indexOf(unit.level) + 1];
    if (!next) return { level: current };
    db.prepare("UPDATE cefr_state SET level=?,updated_at=? WHERE id='route'").run(
      next,
      new Date().toISOString(),
    );
    return { level: next };
  }
  throw new Error('Ação não encontrada.');
}
