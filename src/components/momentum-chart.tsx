'use client';
import { StudyCopy } from './study-copy';
import { OralEvidenceRecord } from './oral-evidence-record';
import { oralEvidence } from '@/lib/oral-practice';
import { isPortuguese } from '@/lib/workspace';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, BookOpen, Check, Clock3, MessageCircle, Sparkles } from 'lucide-react';
import type { Snapshot } from '@/lib/types';
import { practiceDays } from '@/lib/momentum';
import { dateLabel } from './ui';
import { Correction } from './correction';
import { questionFeedback } from '@/lib/answer-feedback';
import { pdfWhy } from '@/locales/es/answer-help';
import { questions } from '@/lib/tutor';
import { lessons } from '@/lib/lessons';
export function MomentumChart({ data, compact = false }: { data: Snapshot; compact?: boolean }) {
  const pt = isPortuguese;
  const oral = new Map(oralEvidence(data).map((a) => [a.id, a]));
  const [length, setLength] = useState(14),
    [selected, setSelected] = useState<string | null>(null);
  const days = useMemo(() => practiceDays(data, length), [data, length]);
  const item = days.find((day) => day.day === selected) || days[days.length - 1];
  const graph = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(880);
  useEffect(() => {
    const element = graph.current;
    if (!element) return;
    const measure = () =>
      setWidth(Math.max(300, Math.round(element.getBoundingClientRect().width)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const height = 235,
    left = 42,
    right = 18,
    top = 20,
    bottom = 39,
    inner = width - left - right;
  const points = days.map((day, index) => ({
    x: left + (index / Math.max(days.length - 1, 1)) * inner,
    y: top + ((100 - day.score) / 100) * (height - top - bottom),
    day,
  }));
  const line = points.map((p, index) => `${index ? 'L' : 'M'} ${p.x} ${p.y}`).join(' '),
    area = `${line} L ${points.at(-1)?.x} ${height - bottom} L ${left} ${height - bottom} Z`;
  const at = points.find((p) => p.day.day === item.day)!;
  const choose = (x: number) => {
    const relative = Math.min(1, Math.max(0, (x - left) / inner));
    setSelected(days[Math.round(relative * (days.length - 1))].day);
  };
  return (
    <section className={`momentum-card card ${compact ? 'compact' : ''}`}>
      <div className="momentum-heading">
        <div>
          <span className="eyebrow">{pt ? 'CONSTÂNCIA, NÃO NÍVEL' : 'CONSISTENCY, NOT LEVEL'}</span>
          <h2>{pt ? 'Seu ritmo de prática.' : 'Your practice momentum.'}</h2>
          <StudyCopy
            native={
              pt
                ? 'Baseado nos seus registros. Toque em um dia para ver o que fez.'
                : 'Built from your saved records. Tap a day to see what you did.'
            }
          >
            Se construye con tus registros. Tocá un día para ver lo que hiciste.
          </StudyCopy>
        </div>
        <div className="tabs">
          {[7, 14, 30].map((range) => (
            <button
              key={range}
              className={length === range ? 'active' : ''}
              onClick={() => {
                setLength(range);
                setSelected(null);
              }}
            >
              {range} {pt ? 'dias' : 'days'}
            </button>
          ))}
        </div>
      </div>
      <div className="momentum-legend">
        <span>
          <i />
          {pt ? 'Ritmo de prática' : 'Practice momentum'}
        </span>
        <span>
          <b />
          {pt ? 'Dia com registros' : 'Day with saved records'}
        </span>
        <small>
          {pt
            ? 'Índice de constância de 0 a 100 · não é uma nota de idioma'
            : '0–100 consistency index · not a language score'}
        </small>
      </div>
      <div className="momentum-graph" ref={graph}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-label={
            pt ? 'Gráfico interativo de constância' : 'Interactive practice momentum chart'
          }
          onPointerDown={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            choose(((event.clientX - bounds.left) / bounds.width) * width);
          }}
        >
          <defs>
            <linearGradient
              id={`momentum-fill-${compact ? 'home' : 'progress'}`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor="var(--brand)" stopOpacity=".22" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity=".02" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100].map((value) => (
            <g key={value}>
              <line
                x1={left}
                x2={width - right}
                y1={top + ((100 - value) / 100) * (height - top - bottom)}
                y2={top + ((100 - value) / 100) * (height - top - bottom)}
                stroke="var(--line)"
              />
              <text
                x={left - 12}
                y={top + ((100 - value) / 100) * (height - top - bottom) + 4}
                textAnchor="end"
              >
                {value}
              </text>
            </g>
          ))}
          <path d={area} fill={`url(#momentum-fill-${compact ? 'home' : 'progress'})`} />
          <path
            d={line}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <line
            x1={at.x}
            x2={at.x}
            y1={top}
            y2={height - bottom}
            stroke="var(--brand)"
            strokeDasharray="4 5"
            opacity=".5"
          />
          {points.map((point, index) => (
            <g key={point.day.day}>
              <circle
                cx={point.x}
                cy={point.y}
                r={point.day.day === item.day ? 6 : point.day.practised ? 4 : 2.5}
                fill={
                  point.day.day === item.day
                    ? 'var(--brand)'
                    : point.day.practised
                      ? 'var(--orange)'
                      : 'var(--surface)'
                }
                stroke="var(--brand)"
                strokeWidth="1.5"
              />
              {(index === 0 ||
                index === points.length - 1 ||
                index % Math.ceil(points.length / (width < 500 ? 4 : 7)) === 0) && (
                <text x={point.x} y={height - 12} textAnchor="middle">
                  {dateLabel(point.day.day, true)}
                </text>
              )}
              <circle
                cx={point.x}
                cy={point.y}
                r="17"
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={`${pt ? 'Ver prática em' : 'View practice on'} ${point.day.day}`}
                onClick={() => setSelected(point.day.day)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelected(point.day.day);
                  }
                  if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    setSelected(days[Math.min(days.length - 1, index + 1)].day);
                  }
                  if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    setSelected(days[Math.max(0, index - 1)].day);
                  }
                }}
              >
                <title>
                  {dateLabel(point.day.day)} · momentum {point.day.score}
                </title>
              </circle>
            </g>
          ))}
        </svg>
      </div>
      <div className="momentum-details" aria-live="polite">
        <div className="momentum-day">
          <span className="eyebrow">
            {item.day === data.day ? (pt ? 'HOJE' : 'TODAY') : dateLabel(item.day).toUpperCase()}
          </span>
          <h3>
            {item.score}
            <small> / 100</small>
          </h3>
          <p>
            {item.practised
              ? pt
                ? 'Você reservou um tempo para o idioma.'
                : 'You made room for your language.'
              : item.day === data.day
                ? pt
                  ? 'Ainda sem prática salva. O dia continua aberto.'
                  : 'No practice saved yet. Today is still open.'
                : pt
                  ? 'Sem prática salva neste dia. O índice diminuiu.'
                  : 'No practice saved on this day. Momentum eased down.'}
          </p>
        </div>
        <div className="momentum-records">
          <div className="momentum-counts">
            <span>
              <Clock3 size={14} />
              {item.minutes} min
            </span>
            <span>
              <Check size={14} />
              {item.activities.length} {pt ? 'atividades' : 'activities'}
            </span>
            <span>
              <Sparkles size={14} />
              {item.attempts.length} {pt ? 'respostas de PDF' : 'PDF answers'}
            </span>
            <span>
              <BookOpen size={14} />
              {item.words.length} {pt ? 'palavras novas' : 'new words'}
            </span>
            <span>
              <Activity size={14} />
              {item.reviews.length} {pt ? 'revisões' : 'reviews'}
            </span>
            <span>
              <MessageCircle size={14} />
              {item.messages.length} {pt ? 'mensagens' : 'messages'}
            </span>
          </div>
          {item.course.map((attempt) => (
            <details className="momentum-entry" key={attempt.id}>
              <summary>
                MCER · {attempt.level} · {attempt.task}
              </summary>
              <p>{attempt.answer}</p>
              {attempt.correct === 0 && (
                <Correction {...questionFeedback(`cefr:${attempt.level}:${attempt.task}`)} />
              )}
              <p>
                {attempt.correct === null
                  ? pt
                    ? 'Prática sem nota automática'
                    : 'Practice without an automatic score'
                  : attempt.correct
                    ? pt
                      ? 'Resposta correta'
                      : 'Correct answer'
                    : pt
                      ? 'Prática para revisar'
                      : 'Practice to review'}
              </p>
            </details>
          ))}
          {item.assessment && (
            <p className="momentum-entry">
              {pt ? 'Diagnóstico inicial concluído.' : 'Starting assessment completed.'}
            </p>
          )}
          {item.activities.map((result) =>
            result.activity_id.startsWith('class:') ? (
              (() => {
                let saved: {
                  lessonId?: string;
                  practice?: string;
                  feedback?: { correct: boolean; explanationSpanish: string; correction: string }[];
                } = {};
                try {
                  saved = JSON.parse(result.answers);
                } catch {
                  /* Legacy or incomplete record: keep the activity visible. */
                }
                const lesson = lessons.find((lesson) => lesson.id === saved.lessonId);
                return (
                  <details className="momentum-entry" key={result.id}>
                    <summary>
                      {pt ? 'Aula' : 'Class'} · {result.title} · {result.correct}/{result.total}
                    </summary>
                    {lesson && (
                      <p>
                        {lesson.level} · {lesson.goal}
                      </p>
                    )}
                    {saved.practice && <blockquote>{saved.practice}</blockquote>}
                    {saved.feedback?.map(
                      (
                        feedback: {
                          correct: boolean;
                          explanationSpanish: string;
                          correction: string;
                        },
                        index: number,
                      ) =>
                        !feedback.correct && (
                          <Correction
                            key={index}
                            explanation={feedback.explanationSpanish}
                            correction={feedback.correction}
                          />
                        ),
                    )}
                  </details>
                );
              })()
            ) : (
              <p className="momentum-entry" key={result.id}>
                <strong>{result.title}</strong>
                {result.total !== null && ` · ${result.correct}/${result.total} correct`}
              </p>
            ),
          )}
          {item.attempts.map((attempt) => (
            <details className="momentum-entry" key={attempt.id}>
              <summary>
                {pt ? 'Prática com PDF' : 'PDF practice'} ·{' '}
                {data.documents.find((doc) => doc.id === attempt.document_id)?.title ||
                  (pt ? 'Seu documento' : 'Your document')}
              </summary>
              <p>{attempt.prompt}</p>
              <blockquote>{attempt.answer}</blockquote>
              {attempt.correct === 0 ? (
                (() => {
                  const doc = data.documents.find((doc) => doc.id === attempt.document_id);
                  const parts = attempt.question_id.split(':');
                  const q =
                    doc &&
                    questions(doc, Number(parts.at(-1)), Number(parts.at(-2))).find(
                      (q) => q.id === attempt.question_id,
                    );
                  return (
                    <Correction
                      explanation={pdfWhy(
                        q?.kind || (attempt.question_id.includes(':word:') ? 'word' : 'detail'),
                      )}
                      correction={q?.options[q.answer!] || attempt.feedback.split('\n\n').at(-1)!}
                    />
                  );
                })()
              ) : (
                <p>{attempt.feedback}</p>
              )}
            </details>
          ))}
          {item.words.length > 0 && (
            <p className="momentum-entry">
              {pt ? 'Palavras salvas:' : 'Words saved:'}{' '}
              {item.words.map((word) => word.word).join(', ')}
            </p>
          )}
          {item.reviews.length > 0 && (
            <p className="momentum-entry">
              {pt ? 'Revisadas:' : 'Reviewed:'}{' '}
              {item.reviews.map((review) => review.word).join(', ')}
            </p>
          )}
          {item.messages.map((message) =>
            oral.has(message.id) ? (
              <div className="momentum-entry" key={message.id}>
                <OralEvidenceRecord attempt={oral.get(message.id)!} />
              </div>
            ) : (
              <details className="momentum-entry" key={message.id}>
                <summary>
                  {pt ? 'Conversa sobre PDF' : 'PDF conversation'} ·{' '}
                  {data.documents.find((doc) => doc.id === message.document_id)?.title ||
                    (pt ? 'Seu documento' : 'Your document')}
                </summary>
                <p>{message.content}</p>
              </details>
            ),
          )}
        </div>
      </div>
      <StudyCopy
        className="fine-print momentum-note"
        native={
          pt
            ? 'Dias com registros aumentam este índice de hábito. Cada dia encerrado sem registros reduz o índice anterior em 8%. Isso não representa perda de capacidade no idioma.'
            : 'Days with records add to this habit index. Each completed day without records reduces the previous index by 8%. This does not represent a loss of language ability.'
        }
      >
        Los días con registros suman al índice de hábito. Cada día cerrado sin registros reduce el
        índice anterior un 8 %. Eso no representa una pérdida de capacidad en el idioma.
      </StudyCopy>
    </section>
  );
}
