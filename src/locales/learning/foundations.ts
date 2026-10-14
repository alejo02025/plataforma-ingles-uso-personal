import type { SpanishVerbModel } from './spanish-verb-models';
export type Tense = 'present' | 'past' | 'future' | 'plans';
export type SentenceKind = 'statement' | 'negative' | 'question';
export type Subject = {
  id: string;
  text: string;
  es: string;
  esIndex: number;
  formIndex: number;
  third?: boolean;
};
export type Verb = {
  id: string;
  word: string;
  es: string;
  complement: string;
  complementES: string;
  third?: string;
  past?: string;
  present?: string[];
  pastForms?: string[];
  formal?: string[];
  be?: boolean;
  participle?: string;
  gerund?: string;
  subjunctive?: string[];
  imperfect?: string[];
  pastStemStressed?: string;
  futureSubjunctive?: string[];
  personalInfinitive?: string[];
  esGrammar?: SpanishVerbModel;
};
export const englishSubjects: Subject[] = [
  { id: 'i', text: 'I', es: 'Yo', esIndex: 0, formIndex: 0 },
  { id: 'you', text: 'You', es: 'Vos', esIndex: 1, formIndex: 1 },
  { id: 'he', text: 'He', es: 'Él', esIndex: 2, formIndex: 2, third: true },
  { id: 'she', text: 'She', es: 'Ella', esIndex: 2, formIndex: 2, third: true },
  { id: 'we', text: 'We', es: 'Nosotros', esIndex: 3, formIndex: 3 },
  { id: 'they', text: 'They', es: 'Ellos', esIndex: 4, formIndex: 4 },
];
export const portugueseSubjects: Subject[] = [
  { id: 'eu', text: 'Eu', es: 'Yo', esIndex: 0, formIndex: 0 },
  { id: 'voce', text: 'Você', es: 'Vos', esIndex: 1, formIndex: 1 },
  { id: 'ele', text: 'Ele', es: 'Él', esIndex: 2, formIndex: 1 },
  { id: 'ela', text: 'Ela', es: 'Ella', esIndex: 2, formIndex: 1 },
  { id: 'nos', text: 'Nós', es: 'Nosotros', esIndex: 3, formIndex: 2 },
  { id: 'voces', text: 'Vocês', es: 'Ustedes', esIndex: 4, formIndex: 3 },
  { id: 'eles', text: 'Eles', es: 'Ellos', esIndex: 4, formIndex: 3 },
  { id: 'elas', text: 'Elas', es: 'Ellas', esIndex: 4, formIndex: 3 },
];
export const englishVerbs: Verb[] = [
  { id: 'be', word: 'be', es: 'estar', complement: 'at home', complementES: 'en casa', be: true },
  {
    id: 'have',
    word: 'have',
    es: 'tener',
    third: 'has',
    past: 'had',
    complement: 'time to study',
    complementES: 'tiempo para estudiar',
  },
  {
    id: 'go',
    word: 'go',
    es: 'ir',
    third: 'goes',
    past: 'went',
    complement: 'to work',
    complementES: 'al trabajo',
  },
  {
    id: 'do',
    word: 'do',
    es: 'hacer',
    third: 'does',
    past: 'did',
    complement: 'my homework',
    complementES: 'mi tarea',
  },
  {
    id: 'study',
    word: 'study',
    es: 'estudiar',
    third: 'studies',
    past: 'studied',
    complement: 'English',
    complementES: 'inglés',
  },
  {
    id: 'work',
    word: 'work',
    es: 'trabajar',
    third: 'works',
    past: 'worked',
    complement: 'at home',
    complementES: 'en casa',
  },
  {
    id: 'read',
    word: 'read',
    es: 'leer',
    third: 'reads',
    past: 'read',
    complement: 'a book',
    complementES: 'un libro',
  },
  {
    id: 'eat',
    word: 'eat',
    es: 'comer',
    third: 'eats',
    past: 'ate',
    complement: 'breakfast',
    complementES: 'el desayuno',
  },
  {
    id: 'drink',
    word: 'drink',
    es: 'beber',
    third: 'drinks',
    past: 'drank',
    complement: 'water',
    complementES: 'agua',
  },
  {
    id: 'speak',
    word: 'speak',
    es: 'hablar',
    third: 'speaks',
    past: 'spoke',
    complement: 'English',
    complementES: 'inglés',
  },
  {
    id: 'learn',
    word: 'learn',
    es: 'aprender',
    third: 'learns',
    past: 'learned',
    complement: 'English',
    complementES: 'inglés',
  },
  {
    id: 'want',
    word: 'want',
    es: 'querer',
    third: 'wants',
    past: 'wanted',
    complement: 'a coffee',
    complementES: 'un café',
  },
  {
    id: 'need',
    word: 'need',
    es: 'necesitar',
    third: 'needs',
    past: 'needed',
    complement: 'more time',
    complementES: 'más tiempo',
  },
  {
    id: 'write',
    word: 'write',
    es: 'escribir',
    third: 'writes',
    past: 'wrote',
    complement: 'a message',
    complementES: 'un mensaje',
  },
  {
    id: 'travel',
    word: 'travel',
    es: 'viajar',
    third: 'travels',
    past: 'travelled',
    complement: 'to Brazil',
    complementES: 'a Brasil',
  },
];
function regularPT(id: string, es: string, complement: string, complementES: string): Verb {
  const stem = id.slice(0, -2),
    group = id.slice(-2);
  return {
    id,
    word: id,
    es,
    complement,
    complementES,
    present: (group === 'ar' ? ['o', 'a', 'amos', 'am'] : ['o', 'e', 'emos', 'em']).map(
      (end) => stem + end,
    ),
    pastForms: (group === 'ar' ? ['ei', 'ou', 'amos', 'aram'] : ['i', 'eu', 'emos', 'eram']).map(
      (end) => stem + end,
    ),
    formal: ['ei', 'á', 'emos', 'ão'].map((end) => id + end),
  };
}
export const portugueseVerbs: Verb[] = [
  {
    id: 'ser',
    word: 'ser',
    es: 'ser',
    complement: 'estudante',
    complementES: 'estudiante',
    present: ['sou', 'é', 'somos', 'são'],
    pastForms: ['fui', 'foi', 'fomos', 'foram'],
    formal: ['serei', 'será', 'seremos', 'serão'],
  },
  {
    id: 'estar',
    word: 'estar',
    es: 'estar',
    complement: 'em casa',
    complementES: 'en casa',
    present: ['estou', 'está', 'estamos', 'estão'],
    pastForms: ['estive', 'esteve', 'estivemos', 'estiveram'],
    formal: ['estarei', 'estará', 'estaremos', 'estarão'],
  },
  {
    id: 'ter',
    word: 'ter',
    es: 'tener',
    complement: 'tempo para estudar',
    complementES: 'tiempo para estudiar',
    present: ['tenho', 'tem', 'temos', 'têm'],
    pastForms: ['tive', 'teve', 'tivemos', 'tiveram'],
    formal: ['terei', 'terá', 'teremos', 'terão'],
  },
  {
    id: 'ir',
    word: 'ir',
    es: 'ir',
    complement: 'ao trabalho',
    complementES: 'al trabajo',
    present: ['vou', 'vai', 'vamos', 'vão'],
    pastForms: ['fui', 'foi', 'fomos', 'foram'],
    formal: ['irei', 'irá', 'iremos', 'irão'],
  },
  regularPT('estudar', 'estudiar', 'português', 'portugués'),
  regularPT('trabalhar', 'trabajar', 'em casa', 'en casa'),
  {
    id: 'ler',
    word: 'ler',
    es: 'leer',
    complement: 'um livro',
    complementES: 'un libro',
    present: ['leio', 'lê', 'lemos', 'leem'],
    pastForms: ['li', 'leu', 'lemos', 'leram'],
    formal: ['lerei', 'lerá', 'leremos', 'lerão'],
  },
  regularPT('comer', 'comer', 'frutas', 'frutas'),
  regularPT('beber', 'beber', 'água', 'agua'),
  regularPT('falar', 'hablar', 'português', 'portugués'),
  regularPT('aprender', 'aprender', 'português', 'portugués'),
  {
    id: 'querer',
    word: 'querer',
    es: 'querer',
    complement: 'um café',
    complementES: 'un café',
    present: ['quero', 'quer', 'queremos', 'querem'],
    pastForms: ['quis', 'quis', 'quisemos', 'quiseram'],
    formal: ['quererei', 'quererá', 'quereremos', 'quererão'],
  },
  {
    id: 'fazer',
    word: 'fazer',
    es: 'hacer',
    complement: 'a tarefa',
    complementES: 'la tarea',
    present: ['faço', 'faz', 'fazemos', 'fazem'],
    pastForms: ['fiz', 'fez', 'fizemos', 'fizeram'],
    formal: ['farei', 'fará', 'faremos', 'farão'],
  },
  regularPT('morar', 'vivir', 'em Buenos Aires', 'en Buenos Aires'),
  regularPT('viajar', 'viajar', 'para o Brasil', 'a Brasil'),
];
const esIrregular: Record<string, { present: string[]; past: string[]; future: string[] }> = {
  ser: {
    present: ['soy', 'sos', 'es', 'somos', 'son'],
    past: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'],
    future: ['seré', 'serás', 'será', 'seremos', 'serán'],
  },
  estar: {
    present: ['estoy', 'estás', 'está', 'estamos', 'están'],
    past: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvieron'],
    future: ['estaré', 'estarás', 'estará', 'estaremos', 'estarán'],
  },
  tener: {
    present: ['tengo', 'tenés', 'tiene', 'tenemos', 'tienen'],
    past: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvieron'],
    future: ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendrán'],
  },
  ir: {
    present: ['voy', 'vas', 'va', 'vamos', 'van'],
    past: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'],
    future: ['iré', 'irás', 'irá', 'iremos', 'irán'],
  },
  hacer: {
    present: ['hago', 'hacés', 'hace', 'hacemos', 'hacen'],
    past: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicieron'],
    future: ['haré', 'harás', 'hará', 'haremos', 'harán'],
  },
  querer: {
    present: ['quiero', 'querés', 'quiere', 'queremos', 'quieren'],
    past: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisieron'],
    future: ['querré', 'querrás', 'querrá', 'querremos', 'querrán'],
  },
  leer: {
    present: ['leo', 'leés', 'lee', 'leemos', 'leen'],
    past: ['leí', 'leíste', 'leyó', 'leímos', 'leyeron'],
    future: ['leeré', 'leerás', 'leerá', 'leeremos', 'leerán'],
  },
};
function esForm(verb: string, tense: 'present' | 'past' | 'future', index: number) {
  if (esIrregular[verb]) return esIrregular[verb][tense][index];
  const group = verb.slice(-2),
    stem = verb.slice(0, -2);
  const ends =
    tense === 'future'
      ? ['é', 'ás', 'á', 'emos', 'án']
      : tense === 'past'
        ? group === 'ar'
          ? ['é', 'aste', 'ó', 'amos', 'aron']
          : ['í', 'iste', 'ió', 'imos', 'ieron']
        : group === 'ar'
          ? ['o', 'ás', 'a', 'amos', 'an']
          : group === 'ir'
            ? ['o', 'ís', 'e', 'imos', 'en']
            : ['o', 'és', 'e', 'emos', 'en'];
  return (tense === 'future' ? verb : stem) + ends[index];
}
const sentenceNotes: Record<string, string> = {
  enPresent:
    'En afirmaciones, he/she/it llevan la forma de tercera persona. En preguntas o negativas con do/does, el verbo principal vuelve a su forma base. “Be” se comporta de otra manera: se invierte para preguntar y usa “not” para negar.',
  enPast:
    'En una afirmación pasada, usá el pasado del verbo. Con did/didn’t, el verbo vuelve a su forma base. “Be” usa was/were y no necesita did. El pasado de “read” se escribe igual, pero se pronuncia como “red”.',
  enFuture:
    '“Will” va seguido del verbo base. Para negar, usá “will not”; para preguntar, colocá “will” antes del sujeto. Este modelo sirve para una decisión, promesa o predicción; no todos los futuros se expresan igual.',
  enPlans:
    'Para un plan, usá am/is/are + going to + verbo base. El sujeto decide la forma de “be”. Para negar, agregá “not” después de be; para preguntar, invertí be y el sujeto.',
  ptPresent:
    'Con você/ele/ela, usá la forma de tercera persona. Para negar, colocá “não” antes del verbo. Una pregunta de sí/no puede conservar el orden de la afirmación y cambiar la entonación y el signo final.',
  ptPast:
    'Este cuadro usa pretérito perfeito: acciones terminadas. Para hábitos o situaciones de fondo en el pasado existe el imperfeito, como “estudava” o “estava”; no son equivalentes en todos los contextos.',
  ptFuture:
    'En el día a día de Brasil es habitual ir en presente + infinitivo: vou estudar, vai estudar. “Vou ir” también aparece en el habla brasileña; “irei” es una alternativa más formal.',
  ptPlans:
    'El futuro do presente suele aparecer en un registro más formal: estudarei, estudará. “Fazer” tiene la raíz especial far-: farei. Para negar, poné não antes del verbo.',
};
export function buildSentence(
  pt: boolean,
  verb: Verb,
  subject: Subject,
  tense: Tense,
  kind: SentenceKind,
) {
  let body = '';
  const complement =
    pt && verb.id === 'ser' && subject.esIndex >= 3 ? 'estudantes' : verb.complement;
  const complementES =
    verb.es === 'ser' && subject.esIndex >= 3 ? 'estudiantes' : verb.complementES;
  if (pt) {
    const finite =
      tense === 'present'
        ? verb.present![subject.formIndex]
        : tense === 'past'
          ? verb.pastForms![subject.formIndex]
          : tense === 'plans'
            ? verb.formal![subject.formIndex]
            : ['vou', 'vai', 'vamos', 'vão'][subject.formIndex] + ' ' + verb.word;
    body = subject.text + ' ' + (kind === 'negative' ? 'não ' : '') + finite + ' ' + complement;
  } else {
    const lower = subject.text === 'I' ? 'I' : subject.text.toLowerCase();
    if (tense === 'future')
      body =
        kind === 'question'
          ? `Will ${lower} ${verb.word} ${complement}`
          : `${subject.text} will ${kind === 'negative' ? 'not ' : ''}${verb.word} ${complement}`;
    else if (tense === 'plans') {
      const be = subject.id === 'i' ? 'am' : subject.third ? 'is' : 'are';
      body =
        kind === 'question'
          ? `${be[0].toUpperCase() + be.slice(1)} ${lower} going to ${verb.word} ${complement}`
          : `${subject.text} ${be} ${kind === 'negative' ? 'not ' : ''}going to ${verb.word} ${complement}`;
    } else if (verb.be) {
      const be =
        tense === 'past'
          ? subject.id === 'i' || subject.third
            ? 'was'
            : 'were'
          : subject.id === 'i'
            ? 'am'
            : subject.third
              ? 'is'
              : 'are';
      body =
        kind === 'question'
          ? `${be[0].toUpperCase() + be.slice(1)} ${lower} ${complement}`
          : `${subject.text} ${be} ${kind === 'negative' ? 'not ' : ''}${complement}`;
    } else if (kind === 'statement')
      body = `${subject.text} ${tense === 'past' ? verb.past : subject.third ? verb.third : verb.word} ${complement}`;
    else {
      const aux = tense === 'past' ? 'did' : subject.third ? 'does' : 'do';
      body =
        kind === 'question'
          ? `${aux[0].toUpperCase() + aux.slice(1)} ${lower} ${verb.word} ${complement}`
          : `${subject.text} ${aux} not ${verb.word} ${complement}`;
    }
  }
  const periphrastic = pt ? tense === 'future' : tense === 'plans';
  const spanishVerb = periphrastic
    ? esForm('ir', 'present', subject.esIndex) + ' a ' + verb.es
    : verb.esGrammar
      ? verb.esGrammar[tense === 'past' ? 'past' : tense === 'present' ? 'present' : 'future'][
          subject.esIndex
        ]
      : esForm(
          verb.es,
          tense === 'past' ? 'past' : tense === 'present' ? 'present' : 'future',
          subject.esIndex,
        );
  const spanish = `${subject.es} ${kind === 'negative' ? 'no ' : ''}${spanishVerb} ${complementES}`;
  return {
    text: body + (kind === 'question' ? '?' : '.'),
    translation: (kind === 'question' ? '¿' : '') + spanish + (kind === 'question' ? '?' : '.'),
    explanation: sentenceNotes[(pt ? 'pt' : 'en') + tense[0].toUpperCase() + tense.slice(1)],
  };
}

export function verbPart(pt: boolean, verb: Verb, subject: Subject, tense: Tense) {
  const text = buildSentence(pt, verb, subject, tense, 'statement').text;
  const complement =
    pt && verb.id === 'ser' && subject.esIndex >= 3 ? 'estudantes' : verb.complement;
  return text.slice(subject.text.length + 1, -complement.length - 2);
}
