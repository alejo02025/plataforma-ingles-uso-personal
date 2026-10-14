import {
  buildSentence,
  type Verb,
  type Subject,
  type SentenceKind,
  type Tense,
} from './foundations';
export type BuilderTime = { id: string; label: string; group: string; explanation: string };
const time = (id: string, label: string, group: string, explanation: string): BuilderTime => ({
  id,
  label,
  group,
  explanation,
});
export const englishBuilderTimes = [
  time(
    'present',
    'Present simple',
    'Present',
    'Hábitos y hechos. He/she/it lleva -s; con do/does el verbo vuelve a su forma base.',
  ),
  time(
    'present-continuous',
    'Present continuous',
    'Present',
    'Acción en curso: am/is/are + verbo en -ing. No omitas el auxiliar.',
  ),
  time(
    'present-perfect',
    'Present perfect',
    'Present',
    'Conexión con el presente: have/has + participio. No lo combines con un momento pasado terminado como yesterday.',
  ),
  time(
    'present-perfect-continuous',
    'Present perfect continuous',
    'Present',
    'Duración hasta ahora: have/has been + -ing. For indica cuánto tiempo; since, desde cuándo.',
  ),
  time(
    'past',
    'Past simple',
    'Past',
    'Acción terminada. Did indica el pasado en preguntas y negativas; el verbo principal vuelve a su forma base.',
  ),
  time(
    'past-continuous',
    'Past continuous',
    'Past',
    'Acción que estaba en curso: was/were + -ing.',
  ),
  time('past-perfect', 'Past perfect', 'Past', 'Acción anterior a otra pasada: had + participio.'),
  time(
    'past-perfect-continuous',
    'Past perfect continuous',
    'Past',
    'Duración anterior a otro momento pasado: had been + -ing.',
  ),
  time(
    'future',
    'Future simple · will',
    'Future',
    'Promesa, decisión o predicción: will + verbo base.',
  ),
  time(
    'plans',
    'Future · going to',
    'Future',
    'Plan o evidencia: am/is/are going to + verbo base.',
  ),
  time(
    'future-continuous',
    'Future continuous',
    'Future',
    'Acción en desarrollo en un momento futuro: will be + -ing.',
  ),
  time(
    'future-perfect',
    'Future perfect',
    'Future',
    'Acción terminada antes de un límite futuro: will have + participio.',
  ),
  time(
    'future-perfect-continuous',
    'Future perfect continuous',
    'Future',
    'Duración acumulada hasta un punto futuro: will have been + -ing.',
  ),
  time(
    'arrangement',
    'Present continuous · future arrangement',
    'Future',
    'Un acuerdo concreto futuro puede expresarse con presente continuo. El complemento tomorrow distingue este uso.',
  ),
  time(
    'conditional',
    'Would · conditional',
    'Conditional',
    'Resultado hipotético: would + verbo base. En una condición hipotética, if lleva pasado, no would.',
  ),
  time(
    'conditional-continuous',
    'Would be doing',
    'Conditional',
    'Resultado hipotético en desarrollo: would be + -ing.',
  ),
  time(
    'conditional-perfect',
    'Would have done',
    'Conditional',
    'Resultado hipotético que no ocurrió: would have + participio.',
  ),
  time(
    'conditional-perfect-continuous',
    'Would have been doing',
    'Conditional',
    'Duración hipotética en el pasado: would have been + -ing.',
  ),
  time(
    'subjunctive',
    'Subjunctive · recommendations',
    'Other forms',
    'Después de una recomendación formal se usa el verbo base: It is important that she study. La negativa es that she not study.',
  ),
  time(
    'imperative',
    'Imperative',
    'Other forms',
    'Instrucción: verbo base sin sujeto. Negativa: do not + verbo. Para nosotros: Let’s. La pregunta es un pedido cortés, no un imperativo.',
  ),
  time(
    'infinitive',
    'Infinitive · to + verb',
    'Other forms',
    'El infinitivo no es un tiempo. Aquí aparece después de it is useful for + persona + to + verbo.',
  ),
  time(
    'gerund',
    'Gerund · verb-ing',
    'Other forms',
    'Una forma en -ing puede funcionar como nombre de una actividad. Aquí va después de before; no forma por sí sola un tiempo continuo.',
  ),
  time(
    'participle',
    'Past participle · in context',
    'Other forms',
    'El participio forma tiempos perfectos con have/has. No siempre coincide con el pasado: went → gone, wrote → written.',
  ),
];
export const portugueseBuilderTimes = [
  time(
    'present',
    'Presente do indicativo',
    'Indicativo',
    'Hábitos y hechos. Você/ele/ela comparten forma; nós y vocês tienen otras formas.',
  ),
  time(
    'past',
    'Pretérito perfeito simples',
    'Indicativo',
    'Acción concluida en el pasado. No se usa para todos los hábitos o situaciones de fondo.',
  ),
  time(
    'imperfect',
    'Pretérito imperfeito',
    'Indicativo',
    'Hábitos pasados, descripciones o situaciones de fondo: estudava, era, tinha.',
  ),
  time(
    'pluperfect-simple',
    'Mais-que-perfeito simples',
    'Indicativo',
    'Acción anterior a otra pasada. Forma literaria: estudara. En el habla suele preferirse tinha estudado.',
  ),
  time(
    'plans',
    'Futuro do presente',
    'Indicativo',
    'Futuro formal: estudarei. Fazer usa far-: farei.',
  ),
  time(
    'conditional',
    'Futuro do pretérito',
    'Indicativo',
    'Hipótesis, cortesía o futuro visto desde el pasado: estudaria.',
  ),
  time(
    'present-perfect',
    'Pretérito perfeito composto',
    'Indicativo composto',
    'Ter en presente + participio expresa repetición o continuidad hasta ahora. Tenho estudado suele equivaler a vengo estudiando, no simplemente estudié.',
  ),
  time(
    'past-perfect',
    'Mais-que-perfeito composto',
    'Indicativo composto',
    'Tinha + participio: una acción anterior a otra pasada.',
  ),
  time(
    'future-perfect',
    'Futuro do presente composto',
    'Indicativo composto',
    'Terei + participio: una acción completada antes de un punto futuro.',
  ),
  time(
    'conditional-perfect',
    'Futuro do pretérito composto',
    'Indicativo composto',
    'Teria + participio: resultado hipotético en el pasado.',
  ),
  time(
    'subjunctive',
    'Presente do subjuntivo',
    'Subjuntivo',
    'Deseo, duda o necesidad: Espero que você estude. Não va antes del verbo subordinado.',
  ),
  time(
    'subjunctive-past',
    'Pretérito imperfeito do subjuntivo',
    'Subjuntivo',
    'Hipótesis: Seria bom se você estudasse. El verbo termina en -sse.',
  ),
  time(
    'subjunctive-future',
    'Futuro do subjuntivo',
    'Subjuntivo',
    'Situación futura posible con quando/se: Quando eu estudar… En español suele traducirse con presente de subjuntivo.',
  ),
  time(
    'subjunctive-perfect',
    'Perfeito composto do subjuntivo',
    'Subjuntivo composto',
    'Deseo o posibilidad sobre una acción concluida: tenha + participio.',
  ),
  time(
    'subjunctive-pluperfect',
    'Mais-que-perfeito composto do subjuntivo',
    'Subjuntivo composto',
    'Hipótesis pasada: tivesse + participio. Se eu tivesse estudado…',
  ),
  time(
    'subjunctive-future-perfect',
    'Futuro composto do subjuntivo',
    'Subjuntivo composto',
    'Acción terminada antes de otra futura posible: Quando eu tiver estudado…',
  ),
  time(
    'imperative',
    'Imperativo afirmativo e negativo',
    'Imperativo',
    'Un pedido dirigido a você/vocês, o una propuesta con nós. Aquí se usan las formas del subjuntivo; para eu no existe imperativo.',
  ),
  time(
    'infinitive',
    'Infinitivo impessoal',
    'Formas nominais',
    'El infinitivo no tiene tiempo ni persona. Aquí se usa después de un verbo de intención: pretendo estudar.',
  ),
  time(
    'personal-infinitive',
    'Infinitivo pessoal',
    'Formas nominais',
    'El infinitivo puede marcar persona: É importante nós estudarmos. No lo confundas con el futuro de subjuntivo de los verbos irregulares.',
  ),
  time(
    'infinitive-perfect',
    'Infinitivo composto',
    'Formas nominais',
    'Infinitivo de ter + participio para una acción anterior: lembro de ter estudado.',
  ),
  time(
    'gerund',
    'Gerúndio simples',
    'Formas nominais',
    'Una acción en desarrollo con estar: estou estudando. Es una perífrasis; -ndo no es un tiempo por sí solo.',
  ),
  time(
    'gerund-perfect',
    'Gerúndio composto',
    'Formas nominais',
    'Tendo + participio expresa anterioridad: Tendo estudado, eu… El sujeto de la cláusula debe coincidir con el de la principal.',
  ),
  time(
    'participle',
    'Particípio · em contexto',
    'Formas nominais',
    'Con ter, el participio no concuerda con el sujeto: tenho feito. Estos modelos lo muestran dentro de un tiempo compuesto.',
  ),
  time(
    'future',
    'Ir + infinitivo · futuro próximo',
    'Perífrases',
    'Futuro habitual en Brasil: vou/vai/vamos/vão + infinitivo.',
  ),
  time(
    'past-continuous',
    'Estava + gerúndio',
    'Perífrases',
    'Acción que estaba en curso: estava estudando.',
  ),
  time(
    'future-continuous',
    'Estarei + gerúndio',
    'Perífrases',
    'Acción en desarrollo en un momento futuro: estarei estudando.',
  ),
];
const enParticiples: Record<string, string> = {
  be: 'been',
  have: 'had',
  go: 'gone',
  do: 'done',
  study: 'studied',
  work: 'worked',
  read: 'read',
  eat: 'eaten',
  drink: 'drunk',
  speak: 'spoken',
  learn: 'learned',
  want: 'wanted',
  need: 'needed',
  write: 'written',
  travel: 'travelled',
};
const enIng: Record<string, string> = {
  be: 'being',
  have: 'having',
  go: 'going',
  do: 'doing',
  study: 'studying',
  work: 'working',
  read: 'reading',
  eat: 'eating',
  drink: 'drinking',
  speak: 'speaking',
  learn: 'learning',
  want: 'wanting',
  need: 'needing',
  write: 'writing',
  travel: 'travelling',
};
const ptParticiples: Record<string, string> = {
  ser: 'sido',
  estar: 'estado',
  ter: 'tido',
  ir: 'ido',
  ler: 'lido',
  querer: 'querido',
  fazer: 'feito',
};
const ptImperfect: Record<string, string[]> = {
  ser: ['era', 'era', 'éramos', 'eram'],
  ter: ['tinha', 'tinha', 'tínhamos', 'tinham'],
  ir: ['ia', 'ia', 'íamos', 'iam'],
};
const ptSubj: Record<string, string[]> = {
  ser: ['seja', 'seja', 'sejamos', 'sejam'],
  estar: ['esteja', 'esteja', 'estejamos', 'estejam'],
  ter: ['tenha', 'tenha', 'tenhamos', 'tenham'],
  ir: ['vá', 'vá', 'vamos', 'vão'],
  ler: ['leia', 'leia', 'leiamos', 'leiam'],
  querer: ['queira', 'queira', 'queiramos', 'queiram'],
  fazer: ['faça', 'faça', 'façamos', 'façam'],
};
function ptForms(v: Verb, name: string): string[] {
  const stem = v.word.slice(0, -2),
    ar = v.word.endsWith('ar'),
    i = v.pastForms![3].slice(0, -3);
  if (name === 'participle')
    return Array(4).fill(v.participle || ptParticiples[v.id] || stem + (ar ? 'ado' : 'ido'));
  if (name === 'ing')
    return Array(4).fill(v.gerund || (v.id === 'ir' ? 'indo' : stem + (ar ? 'ando' : 'endo')));
  if (name === 'subjunctive')
    return (
      v.subjunctive ||
      ptSubj[v.id] ||
      (ar ? ['e', 'e', 'emos', 'em'] : ['a', 'a', 'amos', 'am']).map((e) => stem + e)
    );
  if (name === 'imperfect')
    return (
      v.imperfect ||
      ptImperfect[v.id] ||
      (ar ? ['ava', 'ava', 'ávamos', 'avam'] : ['ia', 'ia', 'íamos', 'iam']).map((e) => stem + e)
    );
  if (name === 'conditional')
    return ['ia', 'ia', 'íamos', 'iam'].map((e) => v.formal![0].slice(0, -2) + e);
  if (name === 'subjunctive-past')
    return ['sse', 'sse', 'ssemos', 'ssem'].map((e, n) => (n === 2 ? accentPT(i, v) : i) + e);
  if (name === 'pluperfect-simple')
    return ['ra', 'ra', 'ramos', 'ram'].map((e, n) => (n === 2 ? accentPT(i, v) : i) + e);
  if (name === 'subjunctive-future')
    return (
      v.futureSubjunctive || ['', '', 'mos', 'em'].map((e) => v.pastForms![3].slice(0, -2) + e)
    );
  if (name === 'personal-infinitive')
    return (
      v.personalInfinitive ||
      ['', '', 'mos', 'em'].map((e) => (v.word === 'pôr' && e ? 'por' : v.word) + e)
    );
  throw new Error('Unknown Portuguese form: ' + name);
}
function accentPT(stem: string, v: Verb) {
  if (v.pastStemStressed) return v.pastStemStressed;
  const last = stem.slice(-1),
    acute = ['estar', 'ter', 'querer', 'fazer'].includes(v.id);
  return (
    stem.slice(0, -1) + ({ a: 'á', e: acute ? 'é' : 'ê', i: 'í', o: 'ô', u: 'ú' }[last] || last)
  );
}
const esSpecial: Record<
  string,
  {
    part: string;
    ing: string;
    imperfect: string;
    subj: string;
    pastSubj: string;
    conditional?: string;
  }
> = {
  ser: { part: 'sido', ing: 'siendo', imperfect: 'er', subj: 'se', pastSubj: 'fuer' },
  estar: { part: 'estado', ing: 'estando', imperfect: 'estab', subj: 'esté', pastSubj: 'estuvier' },
  tener: {
    part: 'tenido',
    ing: 'teniendo',
    imperfect: 'tení',
    subj: 'teng',
    pastSubj: 'tuvier',
    conditional: 'tendr',
  },
  ir: { part: 'ido', ing: 'yendo', imperfect: 'ib', subj: 'vay', pastSubj: 'fuer' },
  hacer: {
    part: 'hecho',
    ing: 'haciendo',
    imperfect: 'hací',
    subj: 'hag',
    pastSubj: 'hicier',
    conditional: 'har',
  },
  querer: {
    part: 'querido',
    ing: 'queriendo',
    imperfect: 'querí',
    subj: 'quier',
    pastSubj: 'quisier',
    conditional: 'querr',
  },
  leer: { part: 'leído', ing: 'leyendo', imperfect: 'leí', subj: 'le', pastSubj: 'leyer' },
  escribir: {
    part: 'escrito',
    ing: 'escribiendo',
    imperfect: 'escribí',
    subj: 'escrib',
    pastSubj: 'escribier',
  },
};
function esParts(v: Verb, s: Subject) {
  if (v.esGrammar) {
    const g = v.esGrammar,
      n = s.esIndex;
    return {
      part: g.part,
      ing: g.ing,
      imperfect: g.imperfect[n],
      subj: g.subjunctive[n],
      pastSubj: g.pastSubjunctive[n],
      conditional: g.conditional[n],
    };
  }
  const stem = v.es.slice(0, -2),
    ar = v.es.endsWith('ar'),
    special = esSpecial[v.es],
    n = s.esIndex;
  const part = special?.part || stem + (ar ? 'ado' : 'ido'),
    ing = special?.ing || stem + (ar ? 'ando' : 'iendo');
  const imperfect =
    (special?.imperfect || stem + (ar ? 'ab' : 'í')) + ['a', 'as', 'a', 'amos', 'an'][n];
  const subjBase = special?.subj || stem;
  let subj: string;
  if (v.es === 'estar') subj = ['esté', 'estés', 'esté', 'estemos', 'estén'][n];
  else if (v.es === 'ser') subj = ['sea', 'seas', 'sea', 'seamos', 'sean'][n];
  else if (v.es === 'querer') subj = ['quiera', 'quieras', 'quiera', 'queramos', 'quieran'][n];
  else subj = subjBase + (ar ? ['e', 'es', 'e', 'emos', 'en'] : ['a', 'as', 'a', 'amos', 'an'])[n];
  const ps = special?.pastSubj || stem + (ar ? 'ar' : 'ier');
  const pastSubj = ps + ['a', 'as', 'a', 'amos', 'an'][n];
  // Nosotros adds written stress in the imperfect and past subjunctive.
  const imp =
    n === 3 && ['ser', 'ir'].includes(v.es) ? (v.es === 'ser' ? 'éramos' : 'íbamos') : imperfect;
  const correctedImp = imp.replace(/abamos$/, 'ábamos');
  const pastSubjNos =
    n === 3
      ? ps.replace(/([ae])r$/, (_, vowel: string) => (vowel === 'a' ? 'á' : 'é') + 'r') + 'amos'
      : pastSubj;
  return {
    part,
    ing,
    imperfect: correctedImp,
    subj,
    pastSubj: pastSubjNos,
    conditional: (special?.conditional || v.es) + ['ía', 'ías', 'ía', 'íamos', 'ían'][n],
  };
}
export function builderSubjects(pt: boolean, time: string, subjects: Subject[]) {
  return time === 'imperative'
    ? subjects.filter((s) =>
        pt ? ['voce', 'nos', 'voces'].includes(s.id) : ['you', 'we'].includes(s.id),
      )
    : subjects;
}
export function builderVerbWarning(pt: boolean, v: Verb, time: string) {
  if (
    !pt &&
    (time.includes('continuous') || time === 'arrangement' || time === 'gerund') &&
    [
      'be',
      'have',
      'want',
      'need',
      'understand',
      'remember',
      'prefer',
      'love',
      'hate',
      'trust',
      'believe',
    ].includes(v.id)
  )
    return 'Este verbo expresa un estado en este ejemplo. Para practicar una acción en curso, elegí study, work, read u otro verbo de acción; no todos los verbos admiten el continuo con el mismo significado.';
  if (
    pt &&
    ['gerund', 'past-continuous', 'future-continuous'].includes(time) &&
    ['ser', 'estar', 'ter', 'querer', 'morar'].includes(v.id)
  )
    return 'Este ejemplo describe un estado. Para un modelo cotidiano de acción en curso, elegí estudar, trabalhar, ler u otro verbo de acción. Un continuo puede cambiar el significado de un verbo de estado.';
  return '';
}
export function buildReferenceSentence(
  pt: boolean,
  v: Verb,
  s: Subject,
  t: string,
  k: SentenceKind,
) {
  const all = pt ? portugueseBuilderTimes : englishBuilderTimes,
    definition = all.find((x) => x.id === t);
  if (!definition) throw new Error('Unknown builder time');
  if (['present', 'past', 'future', 'plans'].includes(t))
    return buildSentence(pt, v, s, t as Tense, k);
  const c = pt && v.id === 'ser' && s.esIndex >= 3 ? 'estudantes' : v.complement;
  const ces = v.es === 'ser' && s.esIndex >= 3 ? 'estudiantes' : v.complementES;
  const n = s.esIndex,
    f = s.formIndex,
    neg = k === 'negative',
    q = k === 'question';
  const lower = s.text === 'I' ? 'I' : s.text.toLowerCase();
  const es = esParts(v, s),
    he = ['he', 'has', 'ha', 'hemos', 'han'][n],
    habia = ['había', 'habías', 'había', 'habíamos', 'habían'][n],
    habre = ['habré', 'habrás', 'habrá', 'habremos', 'habrán'][n],
    habria = ['habría', 'habrías', 'habría', 'habríamos', 'habrían'][n],
    haya = ['haya', 'hayas', 'haya', 'hayamos', 'hayan'][n],
    hubiera = ['hubiera', 'hubieras', 'hubiera', 'hubiéramos', 'hubieran'][n];
  const estar = ['estoy', 'estás', 'está', 'estamos', 'están'][n],
    estaba = ['estaba', 'estabas', 'estaba', 'estábamos', 'estaban'][n],
    estare = ['estaré', 'estarás', 'estará', 'estaremos', 'estarán'][n],
    estaria = ['estaría', 'estarías', 'estaría', 'estaríamos', 'estarían'][n];
  let body = '',
    spanish = '',
    note = definition.explanation;
  const esNormal = (action: string) => `${s.es} ${neg ? 'no ' : ''}${action} ${ces}`;
  if (!pt) {
    const part = v.participle || enParticiples[v.id],
      ing = v.gerund || enIng[v.id],
      has = s.third ? 'has' : 'have',
      be = s.id === 'i' ? 'am' : s.third ? 'is' : 'are',
      was = s.id === 'i' || s.third ? 'was' : 'were';
    const forms: Record<string, [string, string, string]> = {
      'present-continuous': [be, ing, `${estar} ${es.ing}`],
      'present-perfect': [has, part, `${he} ${es.part}`],
      'present-perfect-continuous': [has, `been ${ing}`, `${he} estado ${es.ing}`],
      'past-continuous': [was, ing, `${estaba} ${es.ing}`],
      'past-perfect': ['had', part, `${habia} ${es.part}`],
      'past-perfect-continuous': ['had', `been ${ing}`, `${habia} estado ${es.ing}`],
      'future-continuous': ['will', `be ${ing}`, `${estare} ${es.ing}`],
      'future-perfect': ['will', `have ${part}`, `${habre} ${es.part}`],
      'future-perfect-continuous': ['will', `have been ${ing}`, `${habre} estado ${es.ing}`],
      arrangement: [be, ing, `${estar} ${es.ing}`],
      conditional: ['would', v.word, es.conditional],
      'conditional-continuous': ['would', `be ${ing}`, `${estaria} ${es.ing}`],
      'conditional-perfect': ['would', `have ${part}`, `${habria} ${es.part}`],
      'conditional-perfect-continuous': ['would', `have been ${ing}`, `${habria} estado ${es.ing}`],
      participle: [has, part, `${he} ${es.part}`],
    };
    if (forms[t]) {
      const [aux, rest, esp] = forms[t];
      body = q
        ? `${aux} ${lower} ${rest} ${c}`
        : `${s.text} ${aux} ${neg ? 'not ' : ''}${rest} ${c}`;
      spanish = esNormal(esp);
      if (t === 'arrangement') {
        body += ' tomorrow';
        spanish += ' mañana';
      }
    } else if (t === 'subjunctive') {
      body = q
        ? `Is it important that ${lower} ${v.word} ${c}`
        : `It is important that ${lower} ${neg ? 'not ' : ''}${v.word} ${c}`;
      spanish = `Es importante que ${s.es.toLowerCase()} ${neg ? 'no ' : ''}${es.subj} ${ces}`;
    } else if (t === 'imperative') {
      if (s.id === 'we') {
        body = q ? `Shall we ${v.word} ${c}` : `Let's ${neg ? 'not ' : ''}${v.word} ${c}`;
        spanish = q
          ? `Vamos a ${v.es} ${ces}`
          : `${neg ? 'No ' : ''}${esParts(v, { ...s, esIndex: 3 }).subj} ${ces}`;
      } else {
        body = q ? `Could you ${v.word} ${c}, please` : `${neg ? 'Do not ' : ''}${v.word} ${c}`;
        spanish = q
          ? `¿Podés ${v.es} ${ces}, por favor`
          : `${neg ? 'No ' : ''}${neg ? es.subj : v.esGrammar?.imperative || { ir: 'andá', ser: 'sé', estar: 'está', tener: 'tené', hacer: 'hacé' }[v.es] || v.es.slice(0, -1).replace(/a$/, 'á').replace(/e$/, 'é').replace(/i$/, 'í')} ${ces}`;
      }
    } else if (t === 'infinitive') {
      const obj = { i: 'me', you: 'you', he: 'him', she: 'her', we: 'us', they: 'them' }[s.id];
      body = q
        ? `Is it useful for ${obj} to ${v.word} ${c}`
        : `It is ${neg ? 'not ' : ''}useful for ${obj} to ${v.word} ${c}`;
      spanish = `${neg ? 'No es' : 'Es'} útil que ${s.es.toLowerCase()} ${es.subj} ${ces}`;
    } else if (t === 'gerund') {
      body = q
        ? `Do ${lower} check the instructions before ${ing} ${c}`
        : `${s.text} ${neg ? (s.third ? 'does not' : 'do not') : s.third ? 'checks' : 'check'} ${neg ? 'check ' : ''}the instructions before ${ing} ${c}`;
      if (q && s.third) body = body.replace(/^Do /, 'Does ');
      spanish = `${s.es} ${neg ? 'no ' : ''}${['reviso', 'revisás', 'revisa', 'revisamos', 'revisan'][n]} las instrucciones antes de ${v.es} ${ces}`;
    }
  } else {
    const part = ptForms(v, 'participle')[f],
      ing = ptForms(v, 'ing')[f];
    const aux: Record<string, string[]> = {
      'present-perfect': ['tenho', 'tem', 'temos', 'têm'],
      'past-perfect': ['tinha', 'tinha', 'tínhamos', 'tinham'],
      'future-perfect': ['terei', 'terá', 'teremos', 'terão'],
      'conditional-perfect': ['teria', 'teria', 'teríamos', 'teriam'],
      'subjunctive-perfect': ['tenha', 'tenha', 'tenhamos', 'tenham'],
      'subjunctive-pluperfect': ['tivesse', 'tivesse', 'tivéssemos', 'tivessem'],
      'subjunctive-future-perfect': ['tiver', 'tiver', 'tivermos', 'tiverem'],
      participle: ['tenho', 'tem', 'temos', 'têm'],
    };
    const simple: Record<string, string> = {
      imperfect: es.imperfect,
      'pluperfect-simple': `${habia} ${es.part}`,
      conditional: es.conditional,
    };
    if (simple[t]) {
      body = `${s.text} ${neg ? 'não ' : ''}${ptForms(v, t)[f]} ${c}`;
      spanish = esNormal(simple[t]);
    } else if (['gerund', 'past-continuous', 'future-continuous'].includes(t)) {
      const be =
        t === 'gerund'
          ? ['estou', 'está', 'estamos', 'estão'][f]
          : t === 'past-continuous'
            ? ['estava', 'estava', 'estávamos', 'estavam'][f]
            : ['estarei', 'estará', 'estaremos', 'estarão'][f];
      body = `${s.text} ${neg ? 'não ' : ''}${be} ${ing} ${c}`;
      spanish = esNormal(
        `${t === 'gerund' ? estar : t === 'past-continuous' ? estaba : estare} ${es.ing}`,
      );
    } else if (
      [
        'subjunctive',
        'subjunctive-past',
        'subjunctive-future',
        'subjunctive-perfect',
        'subjunctive-pluperfect',
        'subjunctive-future-perfect',
      ].includes(t)
    ) {
      const finite = aux[t] ? `${aux[t][f]} ${part}` : ptForms(v, t)[f];
      if (t === 'subjunctive' || t === 'subjunctive-perfect') {
        body = `${q ? 'É possível que' : 'Espero que'} ${s.text.toLowerCase()} ${neg ? 'não ' : ''}${finite} ${c}`;
        spanish = `${q ? 'Es posible que' : 'Espero que'} ${s.es.toLowerCase()} ${neg ? 'no ' : ''}${t === 'subjunctive' ? es.subj : `${haya} ${es.part}`} ${ces}`;
      } else if (t === 'subjunctive-past' || t === 'subjunctive-pluperfect') {
        body = `Seria bom se ${s.text.toLowerCase()} ${neg ? 'não ' : ''}${finite} ${c}`;
        spanish = `Sería bueno si ${s.es.toLowerCase()} ${neg ? 'no ' : ''}${t === 'subjunctive-past' ? es.pastSubj : `${hubiera} ${es.part}`} ${ces}`;
      } else {
        body = `Quando ${s.text.toLowerCase()} ${neg ? 'não ' : ''}${finite} ${c}, ${q ? 'será melhor' : 'será diferente'}`;
        spanish = `Cuando ${s.es.toLowerCase()} ${neg ? 'no ' : ''}${t === 'subjunctive-future' ? es.subj : `${haya} ${es.part}`} ${ces}, ${q ? 'será mejor' : 'será diferente'}`;
      }
    } else if (aux[t]) {
      body = `${s.text} ${neg ? 'não ' : ''}${aux[t][f]} ${part} ${c}`;
      spanish = esNormal(
        t === 'present-perfect' || t === 'participle'
          ? `${['vengo', 'venís', 'viene', 'venimos', 'vienen'][n]} ${es.ing}`
          : `${t === 'past-perfect' ? habia : t === 'future-perfect' ? habre : habria} ${es.part}`,
      );
    } else if (t === 'imperative') {
      body = q
        ? `${s.text} pode${f >= 2 ? 'm' : ''} ${v.word} ${c}`
        : `${neg ? 'Não ' : ''}${ptForms(v, 'subjunctive')[f]} ${c}`;
      if (q && s.id === 'nos') body = `Nós podemos ${v.word} ${c}`;
      spanish = q
        ? `${s.es} ${['puedo', 'podés', 'puede', 'podemos', 'pueden'][n]} ${v.es} ${ces}`
        : `${neg ? 'No ' : ''}${neg || s.id === 'nos' || s.id === 'voces' ? es.subj : v.esGrammar?.imperative || { ir: 'andá', ser: 'sé', estar: 'está', tener: 'tené', hacer: 'hacé' }[v.es] || v.es.slice(0, -1).replace(/a$/, 'á').replace(/e$/, 'é').replace(/i$/, 'í')} ${ces}`;
    } else if (t === 'infinitive') {
      body = `${s.text} ${neg ? 'não ' : ''}${['pretendo', 'pretende', 'pretendemos', 'pretendem'][f]} ${v.word} ${c}`;
      spanish = `${s.es} ${neg ? 'no ' : ''}${['pienso', 'pensás', 'piensa', 'pensamos', 'piensan'][n]} ${v.es} ${ces}`;
    } else if (t === 'personal-infinitive') {
      body = `É importante ${s.text.toLowerCase()} ${neg ? 'não ' : ''}${ptForms(v, t)[f]} ${c}`;
      spanish = `Es importante que ${s.es.toLowerCase()} ${neg ? 'no ' : ''}${es.subj} ${ces}`;
    } else if (t === 'infinitive-perfect') {
      body = `${s.text} ${neg ? 'não ' : ''}${['lembro', 'lembra', 'lembramos', 'lembram'][f]} de ${['ter', 'ter', 'termos', 'terem'][f]} ${part} ${c}`;
      spanish = `${s.es} ${neg ? 'no ' : ''}${['me acuerdo', 'te acordás', 'se acuerda', 'nos acordamos', 'se acuerdan'][n]} de haber ${es.part} ${ces}`;
    } else if (t === 'gerund-perfect') {
      body = `${neg ? 'Não tendo' : 'Tendo'} ${part} ${c}, ${s.text.toLowerCase()} ${['posso', 'pode', 'podemos', 'podem'][f]} ${q ? 'pedir ajuda' : 'descansar'}`;
      spanish = `${neg ? 'No habiendo' : 'Habiendo'} ${es.part} ${ces}, ${s.es.toLowerCase()} ${['puedo', 'podés', 'puede', 'podemos', 'pueden'][n]} ${q ? 'pedir ayuda' : 'descansar'}`;
    }
  }
  const punctuation = q ? '?' : '.';
  const translated = spanish.replace(/^¿/, '');
  return {
    text: body[0].toUpperCase() + body.slice(1) + punctuation,
    translation: (q ? '¿' : '') + translated[0].toUpperCase() + translated.slice(1) + punctuation,
    explanation: note,
  };
}
