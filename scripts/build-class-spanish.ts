/** Editorial Spanish support. Every model below is an explicit translation;
 * conjugation-class models reuse the same reviewed bilingual builder as their source.
 * Run after editing the corpus, then review the JSON diff. Never translates user prose. */
import { writeFile } from 'node:fs/promises';
import { englishClasses, portugueseClasses } from '../src/locales/lessons/catalog';
import {
  englishVerbs,
  portugueseVerbs,
  englishSubjects,
  portugueseSubjects,
  buildSentence,
  type Tense,
} from '../src/locales/learning/foundations';
const out: Record<string, string> = {};
const put = (native: string, es: string) => {
  if (out[native] && out[native] !== es)
    throw new Error(`Conflicting editorial translation: ${native}`);
  out[native] = es;
};
// goal, two examples, production prompt, production model, two corrected models.
const base: Record<string, string[]> = {
  'en-meet': [
    'Presentate y contá de dónde sos.',
    'Soy Alejo. Soy de Argentina.',
    'Ella es mi amiga. Estamos en Buenos Aires.',
    'Presentate y presentá a alguien que conozcas.',
    'Soy Alejo. Soy de Argentina. Jazmín es mi novia.',
    'Soy de Argentina.',
    'Jazmín es mi amiga.',
  ],
  'en-requests': [
    'Pedí algo con cortesía.',
    'Me gustaría un café, por favor.',
    '¿Podría tomar un poco de agua, por favor?',
    'Pedí una bebida y algo para comer.',
    'Me gustaría un café y una naranja, por favor.',
    'Me gustaría una naranja, por favor.',
    '¿Podría tomar un vaso de agua?',
  ],
  'en-routine': [
    'Describí rutinas y preguntá sobre ellas.',
    'Estudio inglés después del trabajo.',
    '¿Ella trabaja los sábados?',
    'Escribí dos hábitos y una pregunta sobre la rutina de alguien.',
    'Normalmente estudio de noche. Jazmín trabaja por la tarde. ¿Ella estudia todos los días?',
    'Ella estudia inglés todas las tardes.',
    '¿Él trabaja acá?',
  ],
  'en-past': [
    'Contá cómo fue un día que ya terminó.',
    'Ayer fui a un café.',
    'No tomé el colectivo. Fui caminando.',
    'Contá una historia breve sobre ayer. Incluí algo que no hiciste.',
    'Ayer fui caminando a un café. Tomé té. No tomé el colectivo.',
    'Ayer fuimos al parque.',
    'No tomé el colectivo.',
  ],
  'en-experiences': [
    'Hablá de experiencias y de cuándo ocurrieron.',
    '¿Alguna vez visitaste Brasil?',
    'Vivo acá desde 2022. Visité Brasil en 2023.',
    'Escribí una experiencia sin fecha y un hecho con una fecha pasada terminada.',
    'Probé comida brasileña. Comí pão de queijo el sábado pasado.',
    'Vivo acá desde 2022.',
    'Visité Brasil en 2023.',
  ],
  'en-plans': [
    'Conversá sobre un posible plan y su consecuencia.',
    'Si llueve, nos quedaremos en casa.',
    'Cuando llegue a casa, te voy a llamar.',
    'Hacé un plan para el fin de semana y una alternativa por si cambia el tiempo.',
    'Si está soleado, saldremos a caminar. Si llueve, cocinaremos en casa.',
    'Si llueve, nos quedaremos en casa.',
    'Si tengo tiempo, te voy a llamar.',
  ],
  'en-opinions': [
    'Explicá una opinión y reconocé un contraste.',
    'Aunque llovía, salimos.',
    'A pesar de la lluvia, disfrutamos la caminata.',
    'Opiná sobre aprender en casa. Agregá una razón y una limitación.',
    'Aprender en casa resulta cómodo porque ahorra tiempo. Aunque puede haber distracciones, una rutina breve ayuda.',
    'A pesar del ruido, terminé de leer.',
    'Aunque era difícil, ella siguió practicando.',
  ],
  'en-questions': [
    'Hacé preguntas indirectas con naturalidad.',
    '¿Podrías decirme dónde está la estación?',
    '¿Sabés si el café está abierto?',
    'Preguntá con cortesía dónde está un lugar y si está abierto.',
    '¿Podrías decirme dónde está el museo? ¿Sabés si está abierto hoy?',
    '¿Podrías decirme dónde está la estación?',
    '¿Sabés si el café está abierto?',
  ],
  'en-nuance': [
    'Ajustá la fuerza de una afirmación a la evidencia.',
    'El estudio pequeño sugiere un posible beneficio.',
    'Esto puede indicar un patrón, pero se necesita más evidencia.',
    'Describí un posible beneficio de un hábito sin afirmar que funciona para todos.',
    'Una rutina diaria breve puede ayudar a algunos estudiantes a sostener la constancia, aunque los resultados individuales pueden variar.',
    'Los resultados sugieren un posible beneficio, pero no establecen causalidad.',
    'Esto puede indicar un patrón.',
  ],
  'en-paraphrase': [
    'Reformulá sin cambiar el alcance ni la certeza.',
    'No todas las propuestas fueron rechazadas.',
    'El cambio podría ayudar, pero su efecto es incierto.',
    'Reformulá: «El cambio podría beneficiar a algunos usuarios, pero no a todos». Conservá esos límites.',
    'Algunos usuarios podrían beneficiarse del cambio, aunque no se espera que el beneficio sea universal.',
    'Al menos una propuesta no fue rechazada.',
    'El cambio puede ayudar.',
  ],
  'en-found-present': [
    'Describí un hábito y formá una oración negativa.',
    'Estudio inglés todos los días.',
    'Ella no trabaja los domingos.',
    'Describí una rutina y algo que no hacés.',
    'Estudio de noche. No trabajo los domingos.',
    'Él trabaja acá todos los días.',
    'Ella no trabaja acá.',
  ],
  'en-found-past': [
    'Contá una historia terminada y preguntá sobre ella.',
    'Ayer leí un libro.',
    '¿Escribiste un mensaje ayer?',
    'Escribí un hecho de ayer y una pregunta sobre un día terminado.',
    'Ayer escribí un mensaje. ¿Leíste un libro?',
    'Ayer leí un libro entero.',
    '¿Escribiste un mensaje?',
  ],
  'en-found-future': [
    'Expresá una decisión futura y un plan ya pensado.',
    'Te voy a llamar mañana.',
    'Voy a estudiar esta noche.',
    'Escribí una promesa y un plan para mañana.',
    'Te voy a mandar un mensaje. Voy a estudiar mañana.',
    'Voy a estudiar mañana.',
    'Voy a estudiar esta noche.',
  ],
  'en-found-sentences': [
    'Conectá un sujeto, un verbo y un detalle cotidiano.',
    'Trabajo en casa.',
    '¿Trabajás en casa?',
    'Escribí una afirmación, una negativa y una pregunta sobre una actividad.',
    'Trabajo en casa. No trabajo los domingos. ¿Trabajás acá?',
    '¿Trabajás acá?',
    'No trabajo acá.',
  ],
  'pt-meet': [
    'Presentate y contá de dónde sos.',
    'Me llamo Jazmín. Soy argentina.',
    'Vivo en Buenos Aires y estudio portugués.',
    'Presentate y contá dónde vivís.',
    'Me llamo Jazmín. Soy argentina y vivo en Buenos Aires.',
    'Soy argentina.',
    'Me llamo Jazmín.',
  ],
  'pt-requests': [
    'Pedí una bebida y agradecé.',
    'Me gustaría un café, por favor.',
    '¡Gracias por la ayuda!',
    'Pedí una bebida y agradecé.',
    'Me gustaría un agua, por favor. ¡Gracias!',
    'Me gustaría un café.',
    '¡Gracias por la ayuda!',
  ],
  'pt-routine': [
    'Describí hábitos y preferencias.',
    'Estudio portugués de noche.',
    '¿Te gusta leer? Nos gusta la música.',
    'Contá dos hábitos y algo que te guste.',
    'Trabajo por la tarde y estudio de noche. Me gusta leer.',
    'Estudiás portugués todos los días.',
    'Me gusta leer.',
  ],
  'pt-past': [
    'Contá acciones terminadas del pasado.',
    'Ayer fui al mercado.',
    'Ella compró pan y volvió a casa.',
    'Contá tres cosas que hiciste ayer.',
    'Ayer fui al mercado. Compré frutas y volví a casa.',
    'Ayer fui al mercado.',
    'Ella compró pan ayer.',
  ],
  'pt-stories': [
    'Distinguí una acción puntual de un hábito pasado.',
    'Cuando era chica, vivía cerca de una plaza.',
    'Estaba en casa cuando llegó mi amiga.',
    'Contá un hábito de la infancia y un hecho concreto.',
    'Cuando era chica, jugaba en la plaza. Un día conocí a una nueva amiga.',
    'Cuando era chica, jugaba en la plaza todos los días.',
    'Ayer mi amiga llegó a las ocho.',
  ],
  'pt-possibilities': [
    'Expresá una situación hipotética y su resultado.',
    'Si tuviera más tiempo, estudiaría todos los días.',
    'Si tengo tiempo mañana, voy a estudiar.',
    'Imaginá cómo usarías una hora libre extra.',
    'Si tuviera una hora libre, leería un libro y practicaría portugués.',
    'Si tuviera más tiempo, estudiaría todos los días.',
    'Si tuviera una hora libre, leería un libro.',
  ],
  'pt-opinions': [
    'Presentá argumentos y reconocé una concesión.',
    'Aunque sea difícil, vale la pena practicar.',
    'A pesar de la dificultad, ella siguió estudiando.',
    'Defendé una idea sobre estudiar en casa y reconocé una dificultad.',
    'Estudiar en casa ahorra tiempo. Aunque haya distracciones, una rutina breve puede ayudar.',
    'Aunque sea difícil, vale la pena practicar.',
    'A pesar de la dificultad, ella continuó.',
  ],
  'pt-requests-b2': [
    'Hacé pedidos claros y adecuados a la situación.',
    '¿Podrías explicarme ese detalle?',
    '¿Será que podés enviar el archivo hoy?',
    'Pedí una explicación y una fecha de entrega con cortesía.',
    '¿Podrías explicarme esa parte? ¿Será que podés enviar el archivo para mañana?',
    '¿Podrías explicarme ese detalle?',
    '¿Podrías explicarme esa parte?',
  ],
  'pt-nuance': [
    'Distinguí evidencia, hipótesis y certeza.',
    'Los datos sugieren una tendencia, pero no demuestran una causa.',
    'No es una falla individual; por el contrario, es un problema de organización.',
    'Describí un posible beneficio de un hábito sin garantizar resultados universales.',
    'Una rutina breve puede ayudar a algunos estudiantes, pero los resultados varían según el contexto.',
    'Los datos sugieren un posible beneficio.',
    'En ese contexto, «antes» significa «por el contrario».',
  ],
  'pt-paraphrase': [
    'Reformulá sin cambiar la negación ni el grado de certeza.',
    'No todas las propuestas fueron rechazadas.',
    'El cambio quizá ayude a algunos usuarios.',
    'Reformulá: «El cambio quizá beneficie a algunos usuarios, pero no a todos».',
    'Algunos usuarios pueden beneficiarse del cambio, aunque el beneficio no sea universal.',
    'Al menos una propuesta no fue rechazada.',
    'El cambio puede ayudar.',
  ],
  'pt-found-present': [
    'Describí una rutina y negá una acción.',
    'Estudio portugués todos los días.',
    'No trabajás los domingos.',
    'Contá un hábito y algo que no hacés.',
    'Estudio de noche. No trabajo los domingos.',
    'Estudiás portugués todos los días.',
    'No estudio portugués.',
  ],
  'pt-found-past': [
    'Contá una acción terminada y reconocé su contexto.',
    'Ayer leí un libro.',
    'Cuando era chica, estudiaba por la mañana.',
    'Contá un hecho de ayer y un hábito de la infancia.',
    'Ayer leí un libro. Cuando era chica, estudiaba por la mañana.',
    'Ayer leí un libro entero.',
    'Cuando era chica, estudiaba por la mañana.',
  ],
  'pt-found-future': [
    'Hablá de planes con una forma cotidiana y una formal.',
    'Mañana voy a estudiar portugués.',
    'Estudiaré el informe antes de la reunión.',
    'Escribí un plan cotidiano y una oración con futuro formal.',
    'Mañana voy a leer un libro. Estudiaré de noche.',
    'Voy a estudiar mañana.',
    'Estudiaré mañana.',
  ],
  'pt-found-sentences': [
    'Formá una afirmación, una negativa y una pregunta.',
    'Trabajo en casa.',
    '¿Trabajás en casa?',
    'Escribí una afirmación, una negativa y una pregunta sobre tu rutina.',
    'Estudio de noche. No estudio por la mañana. ¿Estudiás de noche?',
    '¿Trabajás acá?',
    'No estudio de noche.',
  ],
};
for (const lesson of [...englishClasses, ...portugueseClasses]) {
  const values = base[lesson.id];
  if (!values) continue;
  const sources = [
    lesson.goal,
    ...lesson.examples,
    lesson.practice,
    lesson.model,
    ...lesson.checks.map((q) => q.correction),
  ];
  if (sources.length !== values.length) throw new Error(lesson.id);
  sources.forEach((source, i) => put(source, values[i]));
}
// Paired concept units, in source order. A fourth entry overrides pt-BR where the situation differs.
const concept: [string, string, string?, string?][] = [
  [
    'Visité Londres dos veces.',
    'Visité Londres el año pasado.',
    'Ya visité São Paulo dos veces.',
    'Visité São Paulo el año pasado.',
  ],
  ['Estaba cocinando cuando llamaste.', 'Estaban caminando cuando empezó a llover.'],
  ['Si llueve, me quedaré en casa.', 'Si tengo tiempo, te voy a llamar.'],
  ['Deberías hacer una pausa.', 'Ella tiene que llegar antes de las nueve.'],
  ['Esta es la persona que me ayudó.', 'El libro que compré es útil.'],
  [
    'Estoy de acuerdo porque la evidencia es clara.',
    'No estamos de acuerdo porque el plan cuesta demasiado.',
  ],
  ['Si tuviera más tiempo, viajaría.', 'Si ella supiera la respuesta, nos la diría.'],
  ['Ella dijo que estaba cansada.', 'Me dijeron que necesitaban ayuda.'],
  ['El informe fue escrito ayer.', 'Las cartas fueron enviadas esta mañana.'],
  [
    'Si hubiera estudiado, habría aprobado.',
    'Si hubiéramos salido antes, habríamos llegado a tiempo.',
  ],
  ['Aunque llovía, salimos.', 'A pesar de la lluvia, salimos.'],
  [
    'El plan es prometedor; sin embargo, necesita pruebas.',
    'Los resultados respaldan nuestra afirmación, pero no la demuestran.',
    'El plan es prometedor; sin embargo, necesita pruebas.',
    'Los resultados respaldan nuestra hipótesis, pero no la demuestran.',
  ],
  [
    'Pocas veces he visto un trabajo tan cuidadoso.',
    'Ella no solo lo explicó, sino que también lo demostró.',
  ],
  [
    'El cambio puede haber afectado el resultado.',
    'La evidencia parece respaldar esa interpretación.',
  ],
  ['Sugeriría reconsiderar el plazo.', '¿Podríamos considerar otro enfoque?'],
  [
    'Estos resultados requieren más investigación.',
    'Esta distinción es central para el argumento.',
  ],
  [
    'El autor sostiene que algunos cambios pueden ser necesarios.',
    'El estudio sugiere una relación, en lugar de demostrar una causa.',
  ],
  [
    'Podemos continuar siempre que todos estén de acuerdo.',
    'Estoy dispuesto a ayudar si compartimos la carga de trabajo.',
    'Podemos continuar siempre que todos estén de acuerdo.',
    'Estoy dispuesta a ayudar si compartimos el trabajo.',
  ],
  ['No toda objeción es un rechazo.', 'El resultado no es necesariamente concluyente.'],
  [
    'El cumplimiento es necesario, pero no suficiente.',
    'La ausencia de evidencia no demuestra imposibilidad.',
  ],
  [
    'Agradeceríamos su respuesta cuando le resulte posible.',
    'Por favor, avisen cuando puedan.',
    'Agradeceríamos su respuesta lo antes posible.',
    'Por favor, avisá cuando puedas.',
  ],
  [
    'El comentario podría haber sido irónico.',
    'No podemos inferir la intención solo a partir de esa oración.',
  ],
  [
    'Ninguna de las dos explicaciones da cuenta de toda la evidencia.',
    'Ambos argumentos merecen un examen cuidadoso.',
  ],
  [
    'Esta revisión conserva el significado original.',
    'El pasaje revisado hace explícita la limitación.',
  ],
  ['Tengo un paraguas.', 'Estos son dos libros.'],
  ['Es una casa pequeña.', 'Son casas pequeñas.'],
  ['Este libro es mío.', 'Estos libros son míos.', 'Este libro es mío.', 'Esos libros son míos.'],
  ['Mi hermana vive acá.', 'Su hermano trabaja cerca.'],
  ['El libro está sobre la mesa.', 'Las llaves están debajo de la silla.'],
  ['Hay una silla en la habitación.', 'Hay dos sillas en la habitación.'],
  ['La reunión empieza a las nueve.', 'Nos encontramos el lunes.'],
  [
    'Me gustaría un vaso de agua.',
    '¿Podría tomar un poco de pan?',
    'Me gustaría un vaso de agua.',
    '¿Puedo pedir un trozo de pan?',
  ],
  ['¿Dónde vivís?', '¿Cuándo es la reunión?'],
  ['Me gusta leer.', 'A ella le gusta la música.'],
  ['Hoy estoy cansado.', 'Ella tiene hambre.', 'Hoy estoy cansada.', 'Ella tiene hambre.'],
  ['¿Podés llamarme más tarde?', 'Estoy en casa ahora.'],
  ['Ella está trabajando ahora.', 'Están leyendo en este momento.'],
  [
    'Este boleto es más barato que aquel.',
    'Esta opción es mejor.',
    'Este pasaje es más barato que aquel.',
    'Esta opción es mejor.',
  ],
  [
    'Hay demasiadas personas acá.',
    'No tenemos tiempo suficiente.',
    'Hay muchas personas acá.',
    'No tenemos tiempo suficiente.',
  ],
  ['Normalmente voy caminando al trabajo.', 'Ella siempre llega a tiempo.'],
  ['Voy a viajar mañana.', 'Mañana nos encontramos con Ana a las seis.'],
  ['Doblá a la izquierda en la próxima calle.', 'Seguí derecho y después doblá a la derecha.'],
  ['¿Cuánto cuesta esta camisa?', '¿Cuánto cuestan estos zapatos?'],
  ['No tenés que pagar hoy.', 'Ella tiene que traer su pasaporte.'],
  ['¿Podrías ayudarme, por favor?', '¿Podrías repetir eso?'],
  [
    'Perdí mi boleto ayer.',
    'No encontré mi bolso.',
    'Perdí mi pasaje ayer.',
    'No encontré mi valija.',
  ],
  ['¿Te gustaría cenar mañana?', 'Me gustaría ir.'],
  ['Escribo para confirmar nuestra reunión.', 'Por favor, avisame si el horario te sirve.'],
];
const unique = englishClasses
  .filter((l) => l.id.includes('-course-'))
  .filter((l, i, all) => all.findIndex((o) => o.examples[0] === l.examples[0]) === i);
if (unique.length !== concept.length)
  throw new Error('Concept source order changed: review editorial pairs');
unique.forEach((lesson, i) => {
  const counterpart = portugueseClasses.find((l) => l.id === lesson.id.replace('en-', 'pt-'))!;
  lesson.examples.forEach((example, n) => put(example, concept[i][n]!));
  counterpart.examples.forEach((example, n) => put(example, concept[i][n + 2] || concept[i][n]!));
});
for (const pt of [false, true]) {
  const bank = pt ? portugueseClasses : englishClasses;
  const verbs = pt ? portugueseVerbs : englishVerbs,
    subjects = pt ? portugueseSubjects : englishSubjects;
  for (const time of ['present', 'past', 'future'] as Tense[])
    verbs.forEach((v, i) => {
      const s = subjects[(i + 2) % subjects.length];
      const models = (['statement', 'negative', 'question'] as const).map((k) =>
        buildSentence(pt, v, s, time, k),
      );
      models.forEach((m) => {
        if (!out[m.text]) put(m.text, m.translation);
      });
      const complete = models.map((m) => m.text).join(' ');
      if (!out[complete]) put(complete, models.map((m) => out[m.text]).join(' '));
    });
  for (const l of bank) {
    if (l.id.includes('-verb-')) {
      put(l.goal, 'Usá este verbo en una situación real y hacé una pregunta.');
      const verb = verbs.find((v) => l.id.endsWith('-' + v.id))!;
      put(
        l.practice,
        `Escribí una afirmación, una negativa y una pregunta con «${verb.word}». Después usá una en una conversación.`,
      );
    } else if (l.id.includes('-course-')) {
      put(l.goal, 'Explicá la idea, interpretá un ejemplo y usalo en una situación propia.');
      const translation = out[l.model];
      if (!translation) throw new Error('Missing model ' + l.model);
      put(
        l.practice,
        `Escribí una situación real usando esta idea. Compará con el modelo, justificá tu elección y tratá de decir tu frase en voz alta: ${translation}`,
      );
    }
  }
}
await writeFile('src/locales/learning/class-spanish.json', JSON.stringify(out, null, 2) + '\n');
console.log(
  `${Object.keys(out).length} authored/model-derived Spanish pairs; no generic translations.`,
);
