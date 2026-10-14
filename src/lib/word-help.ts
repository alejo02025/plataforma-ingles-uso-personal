import { isPortuguese, assetBase } from './workspace';
import { wordDetails } from './daily-words';
import { dailyWordSpanish } from '@/locales/es/daily-word-meanings';
import { englishNotes, portugueseNotes, type WordNote } from '@/locales/learning/word-notes';
import {
  buildSentence,
  verbPart,
  englishSubjects,
  portugueseSubjects,
  englishVerbs,
  portugueseVerbs,
  type Tense,
} from '@/locales/learning/foundations';
export type WordHelp = WordNote & {
  word: string;
  source: 'reviewed' | 'dictionary' | 'indirect' | 'missing' | 'personal';
  context?: string;
};
type DictionaryEntry = { translations: string[]; indirect?: boolean };
let loaded: Promise<Record<string, DictionaryEntry>> | undefined;
export function cleanWord(word: string) {
  return word
    .normalize('NFC')
    .trim()
    .toLocaleLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
}
function fixedNote(word: string): WordNote | undefined {
  const key = cleanWord(word),
    notes = isPortuguese ? portugueseNotes : englishNotes;
  const exact = notes[word.toLowerCase()] || notes[key] || notes[key.replaceAll("'", '’')];
  if (exact) return exact;
  const daily = wordDetails(key);
  if (daily && dailyWordSpanish[key])
    return {
      translation: dailyWordSpanish[key],
      explanation:
        'Este es el significado que corresponde al uso del vocabulario de la app. Según la oración, una palabra puede tener otros sentidos.',
      example: daily.usage,
      usage:
        'Usá el ejemplo como modelo y adaptá un detalle a tu situación. Compará la palabra dentro de la oración, no solamente aislada.',
    };
  const subjects = isPortuguese ? portugueseSubjects : englishSubjects,
    verbs = isPortuguese ? portugueseVerbs : englishVerbs;
  const found: WordNote[] = [];
  for (const verb of verbs) {
    if (verb.word === key) {
      const example = buildSentence(isPortuguese, verb, subjects[0], 'present', 'statement');
      found.push({
        translation: verb.word === 'be' ? 'Ser / estar' : verb.es,
        explanation:
          'Forma base o infinitivo del verbo. Elegí sujeto y tiempo en Verbs para ver sus cambios.',
        example: example.text,
        usage: example.translation + ' ' + example.explanation,
      });
    }
    for (const subject of subjects)
      for (const tense of ['present', 'past', 'future', 'plans'] as Tense[]) {
        const form = verbPart(isPortuguese, verb, subject, tense);
        if (form !== key) continue;
        const example = buildSentence(isPortuguese, verb, subject, tense, 'statement');
        found.push({
          translation: `Forma de «${verb.word}»: ${verb.word === 'be' ? 'ser/estar' : verb.es}`,
          explanation: `En este modelo: ${subject.text}, ${tense === 'present' ? 'presente' : tense === 'past' ? 'pasado terminado' : tense === 'future' ? 'futuro' : isPortuguese ? 'futuro formal' : 'futuro con intención'}. Una forma puede corresponder a varios sujetos o tiempos.`,
          example: example.text,
          usage: example.translation + ' ' + example.explanation,
        });
      }
  }
  if (found.length) {
    const first = found[0],
      meanings = [...new Set(found.map((f) => f.translation))];
    return {
      ...first,
      translation: meanings.join(' / '),
      explanation:
        first.explanation +
        (isPortuguese && ['fui', 'foi'].includes(key)
          ? ' En especial, «fui/foi» pueden venir de ser o de ir: el complemento aclara el sentido.'
          : ''),
    };
  }
}
export function reviewedHelp(word: string, context = ''): WordHelp | undefined {
  const note = fixedNote(word);
  return note ? { ...note, word: cleanWord(word), source: 'reviewed', context } : undefined;
}
export async function findWordHelp(word: string, context = ''): Promise<WordHelp> {
  const key = cleanWord(word),
    reviewed = reviewedHelp(key, context);
  if (reviewed) return reviewed;
  loaded ||= fetch(
    `${assetBase}/assets/word-help/${isPortuguese ? 'pt' : 'en'}.json?build=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_BUILD || 'local')}`,
  )
    .then((r) => {
      if (!r.ok) throw Error('Dictionary unavailable');
      return r.json();
    })
    .catch(() => {
      loaded = undefined;
      return {};
    });
  const dictionary = await loaded;
  const entry = Object.hasOwn(dictionary, key) ? dictionary[key] : undefined;
  const example =
    context || (isPortuguese ? `O que significa “${key}”?` : `What does “${key}” mean?`);
  if (entry?.translations?.length)
    return {
      word: key,
      translation: entry.translations.join(' / '),
      explanation: entry.indirect
        ? 'Estos son posibles equivalentes obtenidos mediante inglés como idioma intermedio. No son una traducción contextual comprobada: elegí el sentido que encaja con la oración.'
        : 'Estos son equivalentes del diccionario; pueden corresponder a distintos sentidos. La oración y el uso actual ayudan a elegir.',
      example,
      usage: context
        ? 'Este es el contexto donde tocaste la palabra. Observá qué palabras la acompañan antes de elegir un significado.'
        : 'Esta pregunta sirve para pedir el significado de una palabra en una conversación. No es un ejemplo de todos sus sentidos.',
      source: entry.indirect ? 'indirect' : 'dictionary',
      context,
    };
  return {
    word: key,
    translation: 'Todavía no tengo una traducción fiable para esta palabra.',
    explanation:
      'Puede ser un nombre propio, una forma flexionada o una palabra que falta en el diccionario. No voy a inventar su significado.',
    example,
    usage:
      'Conservá la oración completa y consultá el significado en este chat. Después podés añadir una nota en tu vocabulario.',
    source: 'missing',
    context,
  };
}
export function requestWordHelp(word: string, context: string, sourceId?: string) {
  window.dispatchEvent(new CustomEvent('study-word-help', { detail: { word, context, sourceId } }));
}
