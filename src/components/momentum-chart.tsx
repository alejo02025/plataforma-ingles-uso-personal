'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, BookOpen, Check, Clock3, MessageCircle, Sparkles } from 'lucide-react';
import type { Snapshot } from '@/lib/types';
import { practiceDays } from '@/lib/momentum';
import { dateLabel } from './ui';
export function MomentumChart({ data, compact = false }: { data: Snapshot; compact?: boolean }) {
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
          <span className="eyebrow">SMALL STEPS, REAL CONSISTENCY</span>
          <h2>Your practice momentum.</h2>
          <p>Built from your saved practice. Tap a day to see what happened.</p>
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
              {range} days
            </button>
          ))}
        </div>
      </div>
      <div className="momentum-legend">
        <span>
          <i />
          Practice momentum
        </span>
        <span>
          <b />
          Day with saved practice
        </span>
        <small>0–100 consistency index · not a language score</small>
      </div>
      <div className="momentum-graph" ref={graph}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-label="Interactive practice momentum chart"
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
              <stop offset="0%" stopColor="#6382ff" stopOpacity=".22" />
              <stop offset="100%" stopColor="#6382ff" stopOpacity=".02" />
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
          <path d={line} fill="none" stroke="#7185ff" strokeWidth="2.5" strokeLinejoin="round" />
          <line
            x1={at.x}
            x2={at.x}
            y1={top}
            y2={height - bottom}
            stroke="#7185ff"
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
                    ? '#7185ff'
                    : point.day.practised
                      ? '#f69b76'
                      : 'var(--surface)'
                }
                stroke="#7185ff"
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
                aria-label={`View practice on ${point.day.day}`}
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
            {item.day === data.day ? 'TODAY' : dateLabel(item.day).toUpperCase()}
          </span>
          <h3>
            {item.score}
            <small> / 100</small>
          </h3>
          <p>
            {item.practised
              ? 'You made room for English.'
              : item.day === data.day
                ? 'No practice saved yet. Today is still open.'
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
              {item.activities.length} activities
            </span>
            <span>
              <Sparkles size={14} />
              {item.attempts.length} PDF answers
            </span>
            <span>
              <BookOpen size={14} />
              {item.words.length} new words
            </span>
            <span>
              <Activity size={14} />
              {item.reviews.length} reviews
            </span>
            <span>
              <MessageCircle size={14} />
              {item.messages.length} messages
            </span>
          </div>
          {item.assessment && <p className="momentum-entry">Starting assessment completed.</p>}
          {item.activities.map((result) => (
            <p className="momentum-entry" key={result.id}>
              <strong>{result.title}</strong>
              {result.total !== null && ` · ${result.correct}/${result.total} correct`}
            </p>
          ))}
          {item.attempts.map((attempt) => (
            <details className="momentum-entry" key={attempt.id}>
              <summary>
                PDF practice ·{' '}
                {data.documents.find((doc) => doc.id === attempt.document_id)?.title ||
                  'Your document'}
              </summary>
              <p>{attempt.prompt}</p>
              <blockquote>{attempt.answer}</blockquote>
              <p>{attempt.feedback}</p>
            </details>
          ))}
          {item.words.length > 0 && (
            <p className="momentum-entry">
              Words saved: {item.words.map((word) => word.word).join(', ')}
            </p>
          )}
          {item.reviews.length > 0 && (
            <p className="momentum-entry">
              Reviewed: {item.reviews.map((review) => review.word).join(', ')}
            </p>
          )}
          {item.messages.map((message) => (
            <details className="momentum-entry" key={message.id}>
              <summary>
                PDF conversation ·{' '}
                {data.documents.find((doc) => doc.id === message.document_id)?.title ||
                  'Your document'}
              </summary>
              <p>{message.content}</p>
            </details>
          ))}
        </div>
      </div>
      <p className="fine-print momentum-note">
        Days with practice add momentum. Each completed day without practice reduces the previous
        index by 8%. This tracks your habit, not a loss of English ability.
      </p>
    </section>
  );
}
