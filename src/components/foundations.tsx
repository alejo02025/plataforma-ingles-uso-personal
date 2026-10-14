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
import {
  buildReferenceSentence,
  englishBuilderTimes,
  portugueseBuilderTimes,
  builderSubjects,
  builderVerbWarning,
} from '@/locales/learning/sentence-builder';
import { englishBuilderVerbs, portugueseBuilderVerbs } from '@/locales/learning/builder-verbs';
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
  const verbs = isPortuguese ? portugueseBuilderVerbs : englishBuilderVerbs,
    subjects = isPortuguese ? portugueseSubjects : englishSubjects;
  const [verbId, setVerbId] = useState(verbs.find((v) => v.es === 'estudiar')!.id),
    [subjectId, setSubjectId] = useState(subjects[0].id),
    [tense, setTense] = useState('present'),
    [kind, setKind] = useState<SentenceKind>('statement'),
    [draft, setDraft] = useState(''),
    [verbQuery, setVerbQuery] = useState('');
  const verb = verbs.find((v) => v.id === verbId)!;
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const matches = verbs
    .filter((v) => normalize(v.word + ' ' + v.es).includes(normalize(verbQuery)))
    .sort((a, b) => a.word.localeCompare(b.word, isPortuguese ? 'pt-BR' : 'en'));
  const isCourseVerb = (isPortuguese ? portugueseVerbs : englishVerbs).some((v) => v.id === verbId);
  const allowedSubjects = builderSubjects(isPortuguese, tense, subjects);
  const effectiveSubject = allowedSubjects.find((s) => s.id === subjectId) || allowedSubjects[0];
  const sentence = buildReferenceSentence(isPortuguese, verb, effectiveSubject, tense, kind);
  const warning = builderVerbWarning(isPortuguese, verb, tense);
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
  const tenses = isPortuguese ? portugueseBuilderTimes : englishBuilderTimes;
  const form = (subjectId: string, tense: Tense) =>
    verbPart(isPortuguese, verb, subjects.find((s) => s.id === subjectId)!, tense);
  return (
    <section className="foundations card">
      <div className="foundation-heading">
        <BookOpen size={26} />
        <div>
          <span className="eyebrow">LANGUAGE, PIECE BY PIECE</span>
          <h2>{mode === 'verbs' ? 'Verbs for everyday life' : 'Build your own sentence'}</h2>
          <p>Every tense, one clear example at a time.</p>
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
          Time
          <select
            aria-label="Choose a time"
            value={tense}
            onChange={(e) => setTense(e.target.value)}
          >
            {Array.from(new Set(tenses.map((t) => t.group))).map((group) => (
              <optgroup label={group} key={group}>
                {tenses
                  .filter((t) => t.group === group)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
              </optgroup>
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
      <label className="field builder-verb-search">
        {isPortuguese ? 'Encontrar um verbo' : 'Find a verb'}
        <input
          type="search"
          value={verbQuery}
          placeholder={isPortuguese ? 'comprar, trazer, abrir…' : 'buy, bring, comprar…'}
          onChange={(e) => setVerbQuery(e.target.value)}
        />
      </label>
      <p className="fine-print builder-verb-count" aria-live="polite">
        {matches.length} / {verbs.length}{' '}
        {isPortuguese ? 'verbos para criar frases' : 'verbs for building sentences'}
      </p>
      {verbQuery && !matches.length && (
        <p className="fine-print" lang="es">
          No encontramos ese verbo en los modelos. Probá otra palabra o borrá la búsqueda. El
          diccionario completo sigue disponible en la pestaña de verbos.
        </p>
      )}
      <div className="foundation-selectors">
        <label className="field">
          Verb
          <select
            aria-label="Choose a verb"
            value={verbId}
            onChange={(e) => setVerbId(e.target.value)}
          >
            {!matches.some((v) => v.id === verbId) && (
              <option value={verbId}>
                {verb.word} · {verb.es}
              </option>
            )}
            {matches.map((v) => (
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
            value={effectiveSubject.id}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {allowedSubjects.map((s) => (
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
      {warning ? (
        <div className="foundation-model" lang="es">
          <p role="status">{warning}</p>
        </div>
      ) : (
        <div className="foundation-model">
          <span className="eyebrow">YOUR SENTENCE</span>
          <div className="section-heading">
            <h3 lang={isPortuguese ? 'pt-BR' : 'en'}>{sentence.text}</h3>
            <Speak text={sentence.text} />
          </div>
          <p lang="es">{sentence.translation}</p>
          <p lang="es">{sentence.explanation}</p>
          <details className="builder-comparison">
            <summary>
              {isPortuguese ? 'Comparar as três formas' : 'Compare all three forms'}
            </summary>
            {(['statement', 'negative', 'question'] as SentenceKind[]).map((form) => {
              const model = buildReferenceSentence(
                isPortuguese,
                verb,
                effectiveSubject,
                tense,
                form,
              );
              return (
                <div className="builder-comparison-row" key={form}>
                  <strong lang="es">
                    {
                      {
                        statement: 'Afirmación / modelo',
                        negative: 'Negativa',
                        question: 'Pregunta',
                      }[form]
                    }
                  </strong>
                  <div className="lesson-example">
                    <blockquote lang={isPortuguese ? 'pt-BR' : 'en'}>{model.text}</blockquote>
                    <Speak text={model.text} />
                  </div>
                  <p lang="es">{model.translation}</p>
                </div>
              );
            })}
          </details>
        </div>
      )}
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
          placeholder={warning ? undefined : sentence.text}
        />
      </label>
      <p className="fine-print" lang="es">
        {referenceOnly
          ? 'Tu borrador se guarda en este dispositivo, sin nota automática. Podés consultar y probar todos estos modelos sin completar ninguna clase.'
          : 'Este borrador se conserva en este dispositivo sin nota automática. Para guardar un ejercicio en tu progreso, abrí la clase de práctica.'}
      </p>
      {!referenceOnly && isCourseVerb && ['present', 'past', 'future', 'plans'].includes(tense) && (
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
