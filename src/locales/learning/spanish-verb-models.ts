// Spanish aids for the reviewed builder verbs. Argentine voseo in the finite models.
export type SpanishVerbModel = {
  present: string[];
  past: string[];
  future: string[];
  imperfect: string[];
  subjunctive: string[];
  pastSubjunctive: string[];
  conditional: string[];
  part: string;
  ing: string;
  imperative: string;
};
const change: Record<string, string> = {
  resolver: 'resuelv',
  concordar: 'concuerd',
  cerrar: 'cierr',
  empezar: 'empiez',
  pensar: 'piens',
  recordar: 'recuerd',
  encontrar: 'encuentr',
  mostrar: 'muestr',
  probar: 'prueb',
  entender: 'entiend',
  perder: 'pierd',
  devolver: 'devuelv',
  volver: 'vuelv',
  contar: 'cuent',
  almorzar: 'almuerc',
  despertar: 'despiert',
  sentar: 'sient',
  jugar: 'jueg',
  costar: 'cuest',
  recomendar: 'recomiend',
  enviar: 'enví',
  confiar: 'confí',
  continuar: 'continú',
  reunir: 'reún',
  mover: 'muev',
};
const strong: Record<
  string,
  {
    pres: string[];
    subj: string[];
    past: string[];
    future?: string;
    part?: string;
    ing?: string;
    imp?: string;
  }
> = {
  traducir: {
    pres: ['traduzco', 'traducís', 'traduce', 'traducimos', 'traducen'],
    subj: ['traduzca', 'traduzcas', 'traduzca', 'traduzcamos', 'traduzcan'],
    past: ['traduje', 'tradujiste', 'tradujo', 'tradujimos', 'tradujeron'],
    ing: 'traduciendo',
  },
  medir: {
    pres: ['mido', 'medís', 'mide', 'medimos', 'miden'],
    subj: ['mida', 'midas', 'mida', 'midamos', 'midan'],
    past: ['medí', 'mediste', 'midió', 'medimos', 'midieron'],
    ing: 'midiendo',
  },
  corregir: {
    pres: ['corrijo', 'corregís', 'corrige', 'corregimos', 'corrigen'],
    subj: ['corrija', 'corrijas', 'corrija', 'corrijamos', 'corrijan'],
    past: ['corregí', 'corregiste', 'corrigió', 'corregimos', 'corrigieron'],
    ing: 'corrigiendo',
  },
  invertir: {
    pres: ['invierto', 'invertís', 'invierte', 'invertimos', 'invierten'],
    subj: ['invierta', 'inviertas', 'invierta', 'invirtamos', 'inviertan'],
    past: ['invertí', 'invertiste', 'invirtió', 'invertimos', 'invirtieron'],
    ing: 'invirtiendo',
  },
  preferir: {
    pres: ['prefiero', 'preferís', 'prefiere', 'preferimos', 'prefieren'],
    subj: ['prefiera', 'prefieras', 'prefiera', 'prefiramos', 'prefieran'],
    past: ['preferí', 'preferiste', 'prefirió', 'preferimos', 'prefirieron'],
    ing: 'prefiriendo',
  },
  sostener: {
    pres: ['sostengo', 'sostenés', 'sostiene', 'sostenemos', 'sostienen'],
    subj: ['sostenga', 'sostengas', 'sostenga', 'sostengamos', 'sostengan'],
    past: ['sostuve', 'sostuviste', 'sostuvo', 'sostuvimos', 'sostuvieron'],
    future: 'sostendr',
  },
  creer: {
    pres: ['creo', 'creés', 'cree', 'creemos', 'creen'],
    subj: ['crea', 'creas', 'crea', 'creamos', 'crean'],
    past: ['creí', 'creíste', 'creyó', 'creímos', 'creyeron'],
    part: 'creído',
    ing: 'creyendo',
  },
  reír: {
    pres: ['río', 'reís', 'ríe', 'reímos', 'ríen'],
    subj: ['ría', 'rías', 'ría', 'riamos', 'rían'],
    past: ['reí', 'reíste', 'rio', 'reímos', 'rieron'],
    part: 'reído',
    ing: 'riendo',
  },
  sonreír: {
    pres: ['sonrío', 'sonreís', 'sonríe', 'sonreímos', 'sonríen'],
    subj: ['sonría', 'sonrías', 'sonría', 'sonriamos', 'sonrían'],
    past: ['sonreí', 'sonreíste', 'sonrió', 'sonreímos', 'sonrieron'],
    part: 'sonreído',
    ing: 'sonriendo',
  },
  ver: {
    pres: ['veo', 'ves', 've', 'vemos', 'ven'],
    subj: ['vea', 'veas', 'vea', 'veamos', 'vean'],
    past: ['vi', 'viste', 'vio', 'vimos', 'vieron'],
    part: 'visto',
    ing: 'viendo',
    imp: 've',
  },
  dar: {
    pres: ['doy', 'das', 'da', 'damos', 'dan'],
    subj: ['dé', 'des', 'dé', 'demos', 'den'],
    past: ['di', 'diste', 'dio', 'dimos', 'dieron'],
    imp: 'da',
  },
  saber: {
    pres: ['sé', 'sabés', 'sabe', 'sabemos', 'saben'],
    subj: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepan'],
    past: ['supe', 'supiste', 'supo', 'supimos', 'supieron'],
    future: 'sabr',
    imp: 'sabé',
  },
  poder: {
    pres: ['puedo', 'podés', 'puede', 'podemos', 'pueden'],
    subj: ['pueda', 'puedas', 'pueda', 'podamos', 'puedan'],
    past: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudieron'],
    future: 'podr',
  },
  decir: {
    pres: ['digo', 'decís', 'dice', 'decimos', 'dicen'],
    subj: ['diga', 'digas', 'diga', 'digamos', 'digan'],
    past: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijeron'],
    future: 'dir',
    part: 'dicho',
    ing: 'diciendo',
    imp: 'decí',
  },
  venir: {
    pres: ['vengo', 'venís', 'viene', 'venimos', 'vienen'],
    subj: ['venga', 'vengas', 'venga', 'vengamos', 'vengan'],
    past: ['vine', 'viniste', 'vino', 'vinimos', 'vinieron'],
    future: 'vendr',
    ing: 'viniendo',
    imp: 'vení',
  },
  poner: {
    pres: ['pongo', 'ponés', 'pone', 'ponemos', 'ponen'],
    subj: ['ponga', 'pongas', 'ponga', 'pongamos', 'pongan'],
    past: ['puse', 'pusiste', 'puso', 'pusimos', 'pusieron'],
    future: 'pondr',
    part: 'puesto',
    imp: 'poné',
  },
  traer: {
    pres: ['traigo', 'traés', 'trae', 'traemos', 'traen'],
    subj: ['traiga', 'traigas', 'traiga', 'traigamos', 'traigan'],
    past: ['traje', 'trajiste', 'trajo', 'trajimos', 'trajeron'],
    ing: 'trayendo',
    part: 'traído',
    imp: 'traé',
  },
  salir: {
    pres: ['salgo', 'salís', 'sale', 'salimos', 'salen'],
    subj: ['salga', 'salgas', 'salga', 'salgamos', 'salgan'],
    past: ['salí', 'saliste', 'salió', 'salimos', 'salieron'],
    future: 'saldr',
    imp: 'salí',
  },
  sentir: {
    pres: ['siento', 'sentís', 'siente', 'sentimos', 'sienten'],
    subj: ['sienta', 'sientas', 'sienta', 'sintamos', 'sientan'],
    past: ['sentí', 'sentiste', 'sintió', 'sentimos', 'sintieron'],
    ing: 'sintiendo',
  },
  dormir: {
    pres: ['duermo', 'dormís', 'duerme', 'dormimos', 'duermen'],
    subj: ['duerma', 'duermas', 'duerma', 'durmamos', 'duerman'],
    past: ['dormí', 'dormiste', 'durmió', 'dormimos', 'durmieron'],
    ing: 'durmiendo',
  },
  pedir: {
    pres: ['pido', 'pedís', 'pide', 'pedimos', 'piden'],
    subj: ['pida', 'pidas', 'pida', 'pidamos', 'pidan'],
    past: ['pedí', 'pediste', 'pidió', 'pedimos', 'pidieron'],
    ing: 'pidiendo',
  },
  seguir: {
    pres: ['sigo', 'seguís', 'sigue', 'seguimos', 'siguen'],
    subj: ['siga', 'sigas', 'siga', 'sigamos', 'sigan'],
    past: ['seguí', 'seguiste', 'siguió', 'seguimos', 'siguieron'],
    ing: 'siguiendo',
  },
  repetir: {
    pres: ['repito', 'repetís', 'repite', 'repetimos', 'repiten'],
    subj: ['repita', 'repitas', 'repita', 'repitamos', 'repitan'],
    past: ['repetí', 'repetiste', 'repitió', 'repetimos', 'repitieron'],
    ing: 'repitiendo',
  },
  elegir: {
    pres: ['elijo', 'elegís', 'elige', 'elegimos', 'eligen'],
    subj: ['elija', 'elijas', 'elija', 'elijamos', 'elijan'],
    past: ['elegí', 'elegiste', 'eligió', 'elegimos', 'eligieron'],
    ing: 'eligiendo',
  },
  construir: {
    pres: ['construyo', 'construís', 'construye', 'construimos', 'construyen'],
    subj: ['construya', 'construyas', 'construya', 'construyamos', 'construyan'],
    past: ['construí', 'construiste', 'construyó', 'construimos', 'construyeron'],
    ing: 'construyendo',
  },
};
export function spanishVerbModel(word: string): SpanishVerbModel {
  const stem = word.slice(0, -2),
    ending = word.slice(-2),
    ar = ending === 'ar',
    s = strong[word];
  let yoStem = stem;
  if (/(ger|gir)$/.test(word)) yoStem = stem.slice(0, -1) + 'j';
  if (/[^c]ocer$|ecer$|ucir$/.test(word)) yoStem = stem.slice(0, -1) + 'zc';
  const changed = change[word] || stem;
  let subjStem = yoStem;
  if (ar) subjStem = stem.replace(/c$/, 'qu').replace(/g$/, 'gu').replace(/z$/, 'c');
  const changedSubj = ar
    ? changed.replace(/c$/, 'qu').replace(/g$/, 'gu').replace(/z$/, 'c')
    : changed;
  const present = s?.pres || [
    (change[word] ? changed : yoStem) + 'o',
    stem + (ar ? 'ás' : ending === 'ir' ? 'ís' : 'és'),
    changed + (ar ? 'a' : 'e'),
    stem + (ar ? 'amos' : ending === 'ir' ? 'imos' : 'emos'),
    changed + (ar ? 'an' : 'en'),
  ];
  const past =
    s?.past ||
    (ar ? ['é', 'aste', 'ó', 'amos', 'aron'] : ['í', 'iste', 'ió', 'imos', 'ieron']).map(
      (e, n) => (ar && n === 0 ? subjStem : stem) + e,
    );
  const subj =
    s?.subj ||
    (ar ? ['e', 'es', 'e', 'emos', 'en'] : ['a', 'as', 'a', 'amos', 'an']).map(
      (e, n) => (n === 3 ? subjStem : change[word] ? changedSubj : subjStem) + e,
    );
  const pastRoot = past[4].slice(0, -3);
  const pastSubj = ['ra', 'ras', 'ra', 'ramos', 'ran'].map(
    (e, n) =>
      (n === 3
        ? pastRoot.slice(0, -1) +
          ({ a: 'á', e: 'é', i: 'í' }[pastRoot.slice(-1)] || pastRoot.slice(-1))
        : pastRoot) + e,
  );
  const futureRoot = s?.future || word.replace(/í/g, 'i');
  const imperfect =
    word === 'ver'
      ? ['veía', 'veías', 'veía', 'veíamos', 'veían']
      : (ar ? ['aba', 'abas', 'aba', 'ábamos', 'aban'] : ['ía', 'ías', 'ía', 'íamos', 'ían']).map(
          (e) => stem + e,
        );
  return {
    present,
    past,
    subjunctive: subj,
    pastSubjunctive: pastSubj,
    imperfect,
    future: ['é', 'ás', 'á', 'emos', 'án'].map((e) => futureRoot + e),
    conditional: ['ía', 'ías', 'ía', 'íamos', 'ían'].map((e) => futureRoot + e),
    part:
      s?.part ||
      {
        abrir: 'abierto',
        romper: 'roto',
        devolver: 'devuelto',
        volver: 'vuelto',
        cubrir: 'cubierto',
        escribir: 'escrito',
        imprimir: 'impreso',
        resolver: 'resuelto',
        descubrir: 'descubierto',
        describir: 'descrito',
      }[word] ||
      stem + (ar ? 'ado' : 'ido'),
    ing: s?.ing || stem + (ar ? 'ando' : 'iendo'),
    imperative:
      s?.imp || word.slice(0, -1).replace(/a$/, 'á').replace(/e$/, 'é').replace(/i$/, 'í'),
  };
}
