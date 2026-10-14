'use client';
import { useState } from 'react';
import { Check, ArrowRight, BookOpen, Mic } from 'lucide-react';
import { cefrCourse, cefrLevels } from '@/lib/cefr-curriculum';
import type { Snapshot } from '@/lib/types';
import { Button, api, Speak } from './ui';
import { Correction } from './correction';
import { questionFeedback } from '@/lib/answer-feedback';
export function CefrPath({
  data,
  refresh,
  navigate,
}: {
  data: Snapshot;
  refresh: () => Promise<void>;
  navigate: (view: string) => void;
}) {
  const current = data.cefr?.level || 'A1';
  const [preview, setPreview] = useState(current),
    [active, setActive] = useState('reading'),
    [answer, setAnswer] = useState(''),
    [feedback, setFeedback] = useState(''),
    [feedbackTask, setFeedbackTask] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const unit = cefrCourse.find((item) => item.level === preview)!;
  const task = unit.tasks.find((item) => item.id === active)!;
  const attempts = data.cefr?.attempts || [];
  const done = (id: string) =>
    attempts.some(
      (row) =>
        row.level === preview &&
        row.task === id &&
        (unit.tasks.find((t) => t.id === id)!.options ? row.correct === 1 : true),
    );
  const completed = unit.tasks.filter((item) => done(item.id)).length;
  async function save() {
    setBusy(true);
    setError('');
    try {
      const result = await api<{ correct: number | null; tip: string }>('cefr/answer', {
        id: crypto.randomUUID(),
        level: preview,
        task: task.id,
        answer,
      });
      setFeedback(
        result.correct === null
          ? 'Prática registrada. Esta resposta não recebeu uma nota automática.'
          : result.correct
            ? 'Você encontrou a resposta!'
            : `Vamos tentar novamente. ${result.tip}`,
      );
      setFeedbackTask(result.correct !== null ? `cefr:${preview}:${task.id}` : '');
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function advance() {
    setBusy(true);
    setError('');
    try {
      const result = await api<{ level: string }>('cefr/advance', {});
      await refresh();
      setPreview(result.level);
      setActive('reading');
      setAnswer('');
      setFeedback('');
      setFeedbackTask('');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PORTUGUÊS DO BRASIL · MCER / QECR</span>
          <h1>Um passo de cada vez.</h1>
          <p>
            Jazmín começa em A1. Seu percurso continua até C2, com desafios cada vez mais exigentes.
          </p>
        </div>
        <span className="pill">Nível de estudo: {current}</span>
      </div>
      <div className="cefr-levels" aria-label="Níveis do MCER">
        {cefrCourse.map((item) => (
          <button
            key={item.level}
            aria-pressed={preview === item.level}
            onClick={() => {
              setPreview(item.level);
              setActive('reading');
              setAnswer('');
              setFeedback('');
              setFeedbackTask('');
            }}
          >
            <strong>{item.level}</strong>
            <span>{item.name}</span>
            {current === item.level && <small>Seu passo atual</small>}
          </button>
        ))}
      </div>
      <section className="card cefr-unit">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{unit.level} · UNIDADE DE PRÁTICA</span>
            <h2>{unit.title}</h2>
          </div>
          <span className="pill neutral">{completed} / 4 práticas</span>
        </div>
        <p className="muted">{unit.canDo}</p>
        <progress aria-label="Práticas da unidade" max={4} value={completed} />
        <div className="cefr-tasks">
          {unit.tasks.map((item) => (
            <button
              key={item.id}
              aria-pressed={active === item.id}
              onClick={() => {
                setActive(item.id);
                setAnswer('');
                setFeedback('');
                setFeedbackTask('');
              }}
            >
              {done(item.id) ? (
                <Check size={17} />
              ) : item.skill === 'speaking' ? (
                <Mic size={17} />
              ) : (
                <BookOpen size={17} />
              )}
              {
                { reading: 'Leitura', grammar: 'Gramática', writing: 'Escrita', speaking: 'Fala' }[
                  item.skill
                ]
              }
            </button>
          ))}
        </div>
        {task.skill === 'reading' && (
          <blockquote className="cefr-reading">
            {unit.text}
            <Speak text={unit.text} />
          </blockquote>
        )}
        <h3 className="cefr-task-prompt">{task.prompt}</h3>
        <details className="daily-idea">
          <summary>Uma ajuda para começar</summary>
          <p>{task.tip}</p>
        </details>
        {task.options ? (
          <fieldset className="cefr-options">
            <legend>Escolha uma resposta</legend>
            {task.options.map((option, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name="cefr-answer"
                  value={index}
                  checked={answer === String(index)}
                  onChange={() => setAnswer(String(index))}
                />
                {option}
              </label>
            ))}
          </fieldset>
        ) : (
          <label className="field">
            {task.skill === 'speaking' ? 'Anote o que você praticou em voz alta' : 'Sua resposta'}
            <textarea
              aria-label="Resposta da prática"
              value={answer}
              maxLength={6000}
              onChange={(event) => setAnswer(event.target.value)}
            />
            <span className="fine-print">
              {task.skill === 'speaking'
                ? 'Este é um registro declarado por você. Não certifica fluência nem pronúncia.'
                : 'Mínimo de 30 caracteres. O texto será salvo sem avaliação automática.'}
            </span>
          </label>
        )}
        {task.skill === 'speaking' && (
          <Button secondary onClick={() => navigate('Speaking')}>
            Abrir conversação <Mic size={17} />
          </Button>
        )}
        <Button
          disabled={
            busy ||
            !answer ||
            (task.options === undefined &&
              answer.trim().length < (task.skill === 'writing' ? 30 : 10))
          }
          onClick={() => void save()}
        >
          Salvar prática
        </Button>
        {feedback && (
          <div className="cefr-feedback" role="status">
            {feedbackTask ? <Correction {...questionFeedback(feedbackTask)} /> : feedback}
          </div>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {preview === current && (
          <div className="cefr-next">
            <p>
              Estas quatro práticas são um primeiro contato com o nível. Concluí-las permite
              experimentar o próximo passo; não comprova domínio completo nem substitui uma
              avaliação MCER.
            </p>
            {current !== 'C2' ? (
              <Button disabled={completed !== 4 || busy} onClick={() => void advance()}>
                Experimentar {cefrLevels[cefrLevels.indexOf(unit.level) + 1]}{' '}
                <ArrowRight size={17} />
              </Button>
            ) : (
              <p>
                Continue aprofundando os temas e busque uma avaliação abrangente para verificar suas
                competências.
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
