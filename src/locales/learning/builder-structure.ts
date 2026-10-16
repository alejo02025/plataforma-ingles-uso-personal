import type { SentenceKind, Verb } from './foundations';

/** A teaching scaffold for the reviewed model, never a universal sentence generator. */
export function builderStructure(
  pt: boolean,
  time: string,
  kind: SentenceKind,
  verb: Verb,
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
    if (time.startsWith('subjunctive'))
      return `${time.includes('past') || time.includes('pluperfect') ? 'Seria bom se' : time.includes('future') ? 'Quando' : 'Espero que / É possível que'} + sujeito + ${negative ? 'não + ' : ''}verbo no subjuntivo${time.includes('perfect') ? ' composto' : ''} + complemento`;
    if (time === 'imperative')
      return `${negative ? 'não + ' : ''}verbo no imperativo + complemento (pergunta: pedido com poder)`;
    if (time === 'personal-infinitive')
      return `É importante + sujeito + ${negative ? 'não + ' : ''}infinitivo pessoal + complemento`;
    if (time === 'infinitive-perfect')
      return `Lembro de / Você lembra de + ${negative ? 'não + ' : ''}ter + particípio + complemento`;
    return 'tendo + particípio + complemento, sujeito + oração principal';
  }
  if (time === 'present' || time === 'past') {
    if (verb.be)
      return question
        ? `${time === 'past' ? 'was/were' : 'am/is/are'} + subject + complement + ?`
        : `subject + ${time === 'past' ? 'was/were' : 'am/is/are'} + ${negative ? 'not + ' : ''}complement`;
    const aux = time === 'past' ? 'did' : 'do/does';
    return question
      ? `${aux} + subject + base verb + complement + ?`
      : negative
        ? `subject + ${aux} + not + base verb + complement`
        : `subject + ${time === 'past' ? 'past verb' : 'base verb / third-person form'} + complement`;
  }
  const forms: Record<string, [string, string]> = {
    future: ['will', 'base verb'],
    plans: ['am/is/are', 'going to + base verb'],
    'present-continuous': ['am/is/are', 'verb-ing'],
    'present-perfect': ['have/has', 'past participle'],
    'present-perfect-continuous': ['have/has', 'been + verb-ing'],
    'past-continuous': ['was/were', 'verb-ing'],
    'past-perfect': ['had', 'past participle'],
    'past-perfect-continuous': ['had', 'been + verb-ing'],
    'future-continuous': ['will', 'be + verb-ing'],
    'future-perfect': ['will', 'have + past participle'],
    'future-perfect-continuous': ['will', 'have been + verb-ing'],
    arrangement: ['am/is/are', 'verb-ing + future time'],
    conditional: ['would', 'base verb'],
    'conditional-continuous': ['would', 'be + verb-ing'],
    'conditional-perfect': ['would', 'have + past participle'],
    'conditional-perfect-continuous': ['would', 'have been + verb-ing'],
    participle: ['have/has', 'past participle'],
  };
  if (forms[time]) {
    const [aux, rest] = forms[time];
    return question
      ? `${aux} + subject + ${rest} + complement + ?`
      : `subject + ${aux} + ${negative ? 'not + ' : ''}${rest} + complement`;
  }
  if (time === 'subjunctive')
    return `${question ? 'Is it' : 'It is'} important that + subject + ${negative ? 'not + ' : ''}base verb + complement`;
  if (time === 'imperative')
    return `${negative ? 'do not + ' : ''}base verb + complement (we: let's; question: polite request)`;
  if (time === 'infinitive')
    return `${question ? 'Is it' : 'It is'} ${negative ? 'not + ' : ''}useful for + object pronoun + to + base verb + complement`;
  return question
    ? 'Do/does + subject + check + detail + before + verb-ing + ?'
    : 'subject + check(s) / do(es) not check + detail + before + verb-ing';
}
