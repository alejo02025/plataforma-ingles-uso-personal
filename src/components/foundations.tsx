'use client';
import { StudyCopy } from './study-copy';
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
import { builderStructure } from '@/locales/learning/builder-structure';
import { requestWordHelp } from '@/lib/word-help';
import { Button, Speak } from './ui';
export function Foundations({
  mode,
  onOpenLesson,
  referenceOnly = false,
  allowLessonLink = false,
}: {
  mode: 'verbs' | 'sentences';
  onOpenLesson: (id: string) => void;
  referenceOnly?: boolean;
  allowLessonLink?: boolean;
}) {
  const verbs = isPortuguese ? portugueseBuilderVerbs : englishBuilderVerbs,
    subjects = isPortuguese ? portugueseSubjects : englishSubjects;
  const [verbId, setVerbId] = useState(verbs.find((v) => v.es === 'estudiar')!.id),
    [subjectId, setSubjectId] = useState(subjects[0].id),
    [tense, setTense] = useState('present'),
    [kind, setKind] = useState<SentenceKind>('statement'),
    [draft, setDraft] = useState(''),
    [verbQuery, setVerbQuery] = useState(''),
    [ready, setReady] = useState(false),
    [saveError, setSaveError] = useState('');
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
  const warning = builderVerbWarning(isPortuguese, verb, tense);
  const sentence = warning
    ? null
    : buildReferenceSentence(isPortuguese, verb, effectiveSubject, tense, kind);
  useEffect(() => {
    try {
      setDraft(studyStorage.getItem('foundation-sentence-draft') || '');
      const saved = JSON.parse(studyStorage.getItem('foundation-builder:v1') || 'null');
      if (saved) {
        if (verbs.some((v) => v.id === saved.verbId)) setVerbId(saved.verbId);
        if (subjects.some((v) => v.id === saved.subjectId)) setSubjectId(saved.subjectId);
        if (
          (isPortuguese ? portugueseBuilderTimes : englishBuilderTimes).some(
            (t) => t.id === saved.tense,
          )
        )
          setTense(saved.tense);
        if (['statement', 'negative', 'question'].includes(saved.kind)) setKind(saved.kind);
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      studyStorage.setItem('foundation-sentence-draft', draft);
      studyStorage.setItem(
        'foundation-builder:v1',
        JSON.stringify({ verbId, subjectId, tense, kind }),
      );
      setSaveError('');
    } catch {
      setSaveError(
        isPortuguese
          ? 'Não foi possível salvar neste dispositivo. Guarde uma cópia do seu texto.'
          : 'Could not save on this device. Keep a copy of your writing.',
      );
    }
  }, [draft, verbId, subjectId, tense, kind, ready]);
  const tenses = isPortuguese ? portugueseBuilderTimes : englishBuilderTimes;
  const form = (subjectId: string, tense: Tense) =>
    verbPart(isPortuguese, verb, subjects.find((s) => s.id === subjectId)!, tense);
  return (
    <section className={`foundations card ${referenceOnly ? 'reference-builder' : ''}`}>
      {!(referenceOnly && mode === 'sentences') && (
        <div className="foundation-heading">
          <BookOpen size={22} />
          <h2>{mode === 'verbs' ? 'Verbs for everyday life' : 'Build your own sentence'}</h2>
        </div>
      )}
      <div className="builder-workspace">
        <div className="builder-controls">
          <div className="foundation-selectors builder-time-options">
            <label className="field">
              {isPortuguese ? 'Tempo verbal' : 'Tense'}
              <span className="builder-label-es" lang="es">
                Tiempo verbal
              </span>
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
              {isPortuguese ? 'Tipo de frase' : 'Sentence type'}
              <span className="builder-label-es" lang="es">
                Afirmativa, negativa o pregunta
              </span>
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
            <StudyCopy as="p" className="fine-print">
              No encontramos ese verbo en los modelos. Probá otra palabra o borrá la búsqueda. El
              diccionario completo sigue disponible en la pestaña de verbos.
            </StudyCopy>
          )}
          <div className="foundation-selectors">
            <label className="field">
              {isPortuguese ? 'Verbo' : 'Verb'}
              <span className="builder-label-es" lang="es">
                La acción de la oración
              </span>
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
              {isPortuguese ? 'Sujeito' : 'Subject'}
              <span className="builder-label-es" lang="es">
                ¿Quién hace la acción?
              </span>
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
        </div>
        <div className="builder-output">
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
            <div className="foundation-model" role="status">
              <StudyCopy
                native={
                  isPortuguese
                    ? 'Neste modelo, o verbo descreve um estado. Para praticar uma ação em andamento, escolha estudar, trabalhar ou ler. O contínuo pode mudar o sentido de um verbo de estado.'
                    : 'In this model, the verb describes a state. For an ongoing action, choose study, work or read. A continuous form can change the meaning of a state verb.'
                }
              >
                {warning}
              </StudyCopy>
              <Button
                secondary
                onClick={() => setVerbId(verbs.find((v) => v.es === 'estudiar')!.id)}
              >
                {isPortuguese ? 'Usar um verbo de ação' : 'Use an action verb'}
              </Button>
            </div>
          ) : (
            sentence && (
              <div className="foundation-model">
                <span className="eyebrow">{isPortuguese ? 'SUA FRASE' : 'YOUR SENTENCE'}</span>
                <div className="section-heading">
                  <h3 lang={isPortuguese ? 'pt-BR' : 'en'}>{sentence.text}</h3>
                  <Speak text={sentence.text} />
                </div>
                <p lang="es">{sentence.translation}</p>
                <div className="builder-structure">
                  <span className="tiny-label">
                    {isPortuguese ? 'Estrutura do modelo' : 'Model structure'}
                  </span>
                  <p>{builderStructure(isPortuguese, tense, kind, verb)}</p>
                </div>
                <details className="builder-why">
                  <summary>
                    {isPortuguese ? 'Por que funciona assim?' : 'Why does it work?'}
                  </summary>
                  <StudyCopy as="p">{sentence.explanation}</StudyCopy>
                </details>
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
                        <StudyCopy as="strong">
                          {
                            {
                              statement: 'Afirmación / modelo',
                              negative: 'Negativa',
                              question: 'Pregunta',
                            }[form]
                          }
                        </StudyCopy>
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
            )
          )}
        </div>
      </div>
      {saveError && (
        <p role="alert" className="error">
          {saveError}
        </p>
      )}
      {!referenceOnly && (
        <details className="lesson-tip">
          <summary>
            <Lightbulb size={16} />A sentence has a shape
          </summary>
          <StudyCopy as="p">
            El modelo combina sujeto, verbo y un complemento adecuado para ese verbo. En inglés, el
            sujeto normalmente se expresa; en portugués puede omitirse cuando está claro. En las
            preguntas, fijate dónde va el auxiliar o el verbo. La traducción usa voseo argentino;
            «you» puede referirse a vos o a ustedes, según el contexto.
          </StudyCopy>
          <StudyCopy as="p">
            No toda oración válida tiene exactamente el orden del modelo. Para portugués, el cuadro
            de pasado usa pretérito perfeito; los hábitos pasados también pueden necesitar
            imperfeito. Para inglés, «be» no sigue el mismo patrón de preguntas y negativas que un
            verbo de acción.
          </StudyCopy>
        </details>
      )}
      <details className="builder-personal">
        <summary>
          {isPortuguese
            ? 'Experimente uma frase sua (opcional)'
            : 'Try your own sentence (optional)'}
        </summary>
        <label className="field foundation-draft">
          <strong>{isPortuguese ? 'Sua vez (opcional)' : 'Your turn (optional)'}</strong>
          <textarea
            aria-label="My daily sentence"
            value={draft}
            rows={3}
            maxLength={2000}
            onChange={(e) => {
              setDraft(e.target.value);
            }}
            placeholder={sentence?.text}
          />
        </label>
        <StudyCopy as="p" className="fine-print">
          {referenceOnly
            ? 'Tu borrador se guarda automáticamente en este dispositivo. No se califica.'
            : 'Este borrador se conserva en este dispositivo sin nota automática. Para guardar un ejercicio en tu progreso, abrí la clase de práctica.'}
        </StudyCopy>
      </details>
      {(!referenceOnly || allowLessonLink) &&
        isCourseVerb &&
        ['present', 'past', 'future', 'plans'].includes(tense) && (
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
