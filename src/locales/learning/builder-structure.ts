import type { SentenceKind, Subject, Verb } from './foundations';

/** A teaching scaffold for the reviewed model, never a universal sentence generator. */
export function builderStructure(
  pt: boolean,
  time: string,
  kind: SentenceKind,
  verb: Verb,
  subject?: Subject,
): string {
  const negative = kind === 'negative',
    question = kind === 'question';
  if (pt) {
    const forms: Record<string, string> = {
      present: 'verbo no presente',
      past: 'verbo no pretérito perfeito',
      future: 'ir no presente + infinitivo',
      plans: 'verbo no futuro do presente',
      imperfect: 'verbo no imperfeito',
      'pluperfect-simple': 'verbo no mais-que-perfeito',
      conditional: 'verbo no futuro do pretérito',
      'present-perfect': 'ter no presente + particípio',
      'past-perfect': 'ter no imperfeito + particípio',
      'future-perfect': 'ter no futuro + particípio',
      'conditional-perfect': 'ter no futuro do pretérito + particípio',
      gerund: 'estar no presente + gerúndio',
      'past-continuous': 'estar no imperfeito + gerúndio',
      'future-continuous': 'estar no futuro + gerúndio',
      participle: 'ter no presente + particípio',
    };
    if (forms[time])
      return `sujeito + ${negative ? 'não + ' : ''}${forms[time]} + complemento${question ? ' + ?' : ''}`;
    if (time.startsWith('subjunctive')) {
      const compound = [
        'subjunctive-perfect',
        'subjunctive-pluperfect',
        'subjunctive-future-perfect',
      ].includes(time);
      const future = time.includes('future');
      const opening =
        time.includes('past') || time.includes('pluperfect')
          ? 'Seria bom se'
          : future
            ? 'Quando'
            : question
              ? 'É possível que'
              : 'Espero que';
      return `${opening} + sujeito + ${negative ? 'não + ' : ''}${compound ? 'ter no subjuntivo + particípio' : 'verbo no subjuntivo'} + complemento${future ? ', será melhor / será diferente' : ''}${question ? ' + ?' : ''}`;
    }
    if (time === 'imperative')
      return question
        ? 'sujeito + poder no presente + infinitivo + complemento + ?'
        : `${negative ? 'não + ' : ''}verbo no imperativo + complemento`;
    if (time === 'personal-infinitive')
      return `É importante + sujeito + ${negative ? 'não + ' : ''}infinitivo pessoal + complemento${question ? ' + ?' : ''}`;
    if (time === 'infinitive')
      return `sujeito + ${negative ? 'não + ' : ''}pretender no presente + infinitivo + complemento${question ? ' + ?' : ''}`;
    if (time === 'infinitive-perfect')
      return `sujeito + ${negative ? 'não + ' : ''}lembrar no presente + de + ter (infinitivo pessoal) + particípio + complemento${question ? ' + ?' : ''}`;
    return `${negative ? 'não + ' : ''}tendo + particípio + complemento, sujeito + poder no presente + ${question ? 'pedir ajuda + ?' : 'descansar'}`;
  }
  const be = subject ? (subject.id === 'i' ? 'am' : subject.third ? 'is' : 'are') : 'am/is/are';
  const was = subject ? (subject.id === 'i' || subject.third ? 'was' : 'were') : 'was/were';
  const have = subject ? (subject.third ? 'has' : 'have') : 'have/has';
  const doAux = subject ? (subject.third ? 'does' : 'do') : 'do/does';
  if (time === 'present' || time === 'past') {
    if (verb.be)
      return question
        ? `${time === 'past' ? was : be} + subject + complement + ?`
        : `subject + ${time === 'past' ? was : be} + ${negative ? 'not + ' : ''}complement`;
    const aux = time === 'past' ? 'did' : doAux;
    return question
      ? `${aux} + subject + base verb + complement + ?`
      : negative
        ? `subject + ${aux} + not + base verb + complement`
        : `subject + ${time === 'past' ? 'past verb' : subject ? (subject.third ? 'third-person form' : 'base verb') : 'base verb / third-person form'} + complement`;
  }
  const forms: Record<string, [string, string]> = {
    future: ['will', 'base verb'],
    plans: [be, 'going to + base verb'],
    'present-continuous': [be, 'verb-ing'],
    'present-perfect': [have, 'past participle'],
    'present-perfect-continuous': [have, 'been + verb-ing'],
    'past-continuous': [was, 'verb-ing'],
    'past-perfect': ['had', 'past participle'],
    'past-perfect-continuous': ['had', 'been + verb-ing'],
    'future-continuous': ['will', 'be + verb-ing'],
    'future-perfect': ['will', 'have + past participle'],
    'future-perfect-continuous': ['will', 'have been + verb-ing'],
    arrangement: [be, 'verb-ing + future time'],
    conditional: ['would', 'base verb'],
    'conditional-continuous': ['would', 'be + verb-ing'],
    'conditional-perfect': ['would', 'have + past participle'],
    'conditional-perfect-continuous': ['would', 'have been + verb-ing'],
    participle: [have, 'past participle'],
  };
  if (forms[time]) {
    const [aux, rest] = forms[time];
    return question
      ? `${aux} + subject + ${rest} + complement + ?`
      : `subject + ${aux} + ${negative ? 'not + ' : ''}${rest} + complement`;
  }
  if (time === 'subjunctive')
    return `${question ? 'Is it' : 'It is'} important that + subject + ${negative ? 'not + ' : ''}base verb + complement${question ? ' + ?' : ''}`;
  if (time === 'imperative') {
    if (subject?.id === 'we')
      return question
        ? 'shall + we + base verb + complement + ?'
        : `let's + ${negative ? 'not + ' : ''}base verb + complement`;
    return question
      ? 'could + you + base verb + complement + please + ?'
      : `${negative ? 'do not + ' : ''}base verb + complement`;
  }
  if (time === 'infinitive')
    return `${question ? 'Is it' : 'It is'} ${negative ? 'not + ' : ''}useful for + object pronoun + to + base verb + complement${question ? ' + ?' : ''}`;
  return question
    ? `${doAux} + subject + check + detail + before + verb-ing + ?`
    : `subject + ${negative ? `${doAux} + not + check` : subject?.third ? 'checks' : subject ? 'check' : 'check(s)'} + detail + before + verb-ing`;
}

/** Translate only our finite scaffold vocabulary, never the learner's sentence. */
export function spanishBuilderStructure(structure: string): string {
  const terms: Record<string, string> = {
    'base verb / third-person form': 'verbo base / forma de tercera persona',
    'third-person form': 'forma de tercera persona',
    'object pronoun': 'pronombre de objeto',
    'past participle': 'participio pasado',
    'past verb': 'verbo en pasado',
    'base verb': 'verbo en forma base',
    'verb-ing': 'verbo terminado en -ing',
    'future time': 'referencia de tiempo futuro',
    subject: 'sujeto',
    complement: 'complemento',
    detail: 'detalle',
    'verbo no pretérito perfeito': 'verbo en pretérito perfecto simple',
    'verbo no mais-que-perfeito': 'verbo en pluscuamperfecto',
    'verbo no futuro do pretérito': 'verbo en condicional',
    'verbo no futuro do presente': 'verbo en futuro',
    'verbo no presente': 'verbo en presente',
    'verbo no imperfeito': 'verbo en imperfecto',
    'verbo no subjuntivo': 'verbo en subjuntivo',
    'verbo no imperativo': 'verbo en imperativo',
    'ter no futuro do pretérito': 'ter en condicional',
    'ter no imperfeito': 'ter en imperfecto',
    'ter no subjuntivo': 'ter en subjuntivo',
    'ter no presente': 'ter en presente',
    'ter no futuro': 'ter en futuro',
    'estar no presente': 'estar en presente',
    'estar no imperfeito': 'estar en imperfecto',
    'estar no futuro': 'estar en futuro',
    'ir no presente': 'ir en presente',
    'pretender no presente': 'pretender en presente',
    'lembrar no presente': 'lembrar en presente',
    'poder no presente': 'poder en presente',
    'infinitivo pessoal': 'infinitivo personal',
    'pergunta: pedido com poder': 'pregunta: pedido con poder',
    sujeito: 'sujeto',
    complemento: 'complemento',
    particípio: 'participio',
    gerúndio: 'gerundio',
  };
  const pattern = Object.keys(terms)
    .sort((a, b) => b.length - a.length)
    .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  return structure.replace(new RegExp(pattern, 'g'), (term) => terms[term]);
}
