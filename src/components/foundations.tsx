'use client';
import { useState, useEffect } from 'react';
import { ArrowRight, Lightbulb, BookOpen } from 'lucide-react';
import { isPortuguese, studyStorage } from '@/lib/workspace';
import {
  englishVerbs,
  portugueseVerbs,
  englishSubjects,
  portugueseSubjects,
  buildSentence,
  verbPart,
  type Tense,
  type SentenceKind,
} from '@/locales/learning/foundations';
import { requestWordHelp } from '@/lib/word-help';
import { Button, Speak } from './ui';
export function Foundations({
  mode,
  onOpenLesson,
  referenceOnly = false,
}: {
  mode: 'verbs' | 'sentences';
  onOpenLesson: (id: string) => void;
  referenceOnly?: boolean;
}) {
  const verbs = isPortuguese ? portugueseVerbs : englishVerbs,
    subjects = isPortuguese ? portugueseSubjects : englishSubjects;
  const [verbId, setVerbId] = useState(verbs.find((v) => v.es === 'estudiar')!.id),
    [subjectId, setSubjectId] = useState(subjects[0].id),
    [tense, setTense] = useState<Tense>('present'),
    [kind, setKind] = useState<SentenceKind>('statement'),
    [draft, setDraft] = useState('');
  const verb = verbs.find((v) => v.id === verbId)!,
    subject = subjects.find((s) => s.id === subjectId)!;
  const sentence = buildSentence(isPortuguese, verb, subject, tense, kind);
  useEffect(() => {
    try {
      setDraft(studyStorage.getItem('foundation-sentence-draft') || '');
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (draft) studyStorage.setItem('foundation-sentence-draft', draft);
    } catch {}
  }, [draft]);
  const tenses: { id: Tense; label: string }[] = [
    { id: 'present', label: 'Present' },
    { id: 'past', label: 'Past · completed action' },
    { id: 'future', label: isPortuguese ? 'Futuro · vou + verbo' : 'Future · will' },
    { id: 'plans', label: isPortuguese ? 'Futuro formal' : 'Future · going to' },
  ];
  const form = (subjectId: string, tense: Tense) =>
    verbPart(isPortuguese, verb, subjects.find((s) => s.id === subjectId)!, tense);
  return (
    <section className="foundations card">
      <div className="foundation-heading">
        <BookOpen size={26} />
        <div>
          <span className="eyebrow">LANGUAGE, PIECE BY PIECE</span>
          <h2>{mode === 'verbs' ? 'Verbs for everyday life' : 'Build your own sentence'}</h2>
          <p>Present, past, future. One useful idea at a time.</p>
        </div>
      </div>
      <div className="foundation-day" lang="es">
        <strong>Tu práctica de hoy · 5 minutos</strong>
        <p>
          {mode === 'verbs'
            ? 'Elegí un verbo. Leé un ejemplo de hoy, uno de ayer y uno de mañana. Después decilos sin mirar y cambiá un detalle para que sean sobre vos.'
            : 'Elegí una acción y armá una afirmación. Cambiala a negativa y a pregunta. Después repetí el proceso en pasado y en futuro. Compará cada modelo y escribí tu propia versión.'}
        </p>
      </div>
      <div className="foundation-selectors">
        <label className="field">
          Verb
          <select
            aria-label="Choose a verb"
            value={verbId}
            onChange={(e) => setVerbId(e.target.value)}
          >
            {verbs.map((v) => (
              <option key={v.id} value={v.id}>
                {v.word} · {v.es}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Subject
          <select
            aria-label="Choose a subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.text} · {s.es}
              </option>
            ))}
          </select>
        </label>
      </div>
      {mode === 'verbs' && (
        <div className="verb-table-wrap">
          <table className="verb-table">
            <caption>
              {verb.word} · {verb.es}
            </caption>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Present</th>
                <th>Past</th>
                <th>Future</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id}>
                  <th scope="row">{s.text}</th>
                  {(['present', 'past', 'future'] as Tense[]).map((time) => (
                    <td key={time}>
                      <button
                        onClick={() =>
                          requestWordHelp(
                            form(s.id, time),
                            buildSentence(isPortuguese, verb, s, time, 'statement').text,
                          )
                        }
                      >
                        {form(s.id, time)}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="foundation-selectors">
        <label className="field">
          Time
          <select
            aria-label="Choose a time"
            value={tense}
            onChange={(e) => setTense(e.target.value as Tense)}
          >
            {tenses.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Sentence type
          <select
            aria-label="Choose a sentence type"
            value={kind}
            onChange={(e) => setKind(e.target.value as SentenceKind)}
          >
            <option value="statement">Statement</option>
            <option value="negative">Negative</option>
            <option value="question">Question</option>
          </select>
        </label>
      </div>
      <div className="foundation-model">
        <span className="eyebrow">YOUR SENTENCE</span>
        <div className="section-heading">
          <h3 lang={isPortuguese ? 'pt-BR' : 'en'}>{sentence.text}</h3>
          <Speak text={sentence.text} />
        </div>
        <p lang="es">{sentence.translation}</p>
        <p lang="es">{sentence.explanation}</p>
      </div>
      <details className="lesson-tip">
        <summary>
          <Lightbulb size={16} />A sentence has a shape
        </summary>
        <p lang="es">
          El modelo combina sujeto, verbo y un complemento adecuado para ese verbo. En inglés, el
          sujeto normalmente se expresa; en portugués puede omitirse cuando está claro. En las
          preguntas, fijate dónde va el auxiliar o el verbo. La traducción usa voseo argentino;
          «you» puede referirse a vos o a ustedes, según el contexto.
        </p>
        <p lang="es">
          No toda oración válida tiene exactamente el orden del modelo. Para portugués, el cuadro de
          pasado usa pretérito perfeito; los hábitos pasados también pueden necesitar imperfeito.
          Para inglés, «be» no sigue el mismo patrón de preguntas y negativas que un verbo de
          acción.
        </p>
      </details>
      <label className="field foundation-draft">
        <strong>Make one about your day</strong>
        <textarea
          aria-label="My daily sentence"
          value={draft}
          maxLength={2000}
          onChange={(e) => {
            setDraft(e.target.value);
            try {
              studyStorage.setItem('foundation-sentence-draft', e.target.value);
            } catch {}
          }}
          placeholder={sentence.text}
        />
      </label>
      <p className="fine-print" lang="es">
        {referenceOnly
          ? 'Tu borrador se guarda en este dispositivo, sin nota automática. Podés consultar y probar todos estos modelos sin completar ninguna clase.'
          : 'Este borrador se conserva en este dispositivo sin nota automática. Para guardar un ejercicio en tu progreso, abrí la clase de práctica.'}
      </p>
      {!referenceOnly && (
        <Button
          onClick={() =>
            onOpenLesson(
              `${isPortuguese ? 'pt' : 'en'}-found-${mode === 'sentences' ? 'sentences' : tense === 'present' ? 'present' : tense === 'past' ? 'past' : 'future'}`,
            )
          }
        >
          Practise this in a class <ArrowRight size={16} />
        </Button>
      )}
    </section>
  );
}
