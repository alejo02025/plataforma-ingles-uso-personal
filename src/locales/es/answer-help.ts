import { isPortuguese } from '@/lib/workspace';
import { dailyWordSpanish } from './daily-word-meanings';

const english: Record<string, string> = {
  d1: '“Yesterday” sitúa la acción en un pasado terminado. Por eso necesitás “took”, el pasado de “take”, y no una forma presente.',
  d2: 'La tarjeta de embarque es el documento que permite subir al avión. No es lo mismo que una reserva o un comprobante de pago.',
  d3: 'La última hora de entrada y la hora de cierre son distintas: podés entrar hasta la primera, aunque el lugar cierre más tarde.',
  d4: 'La situación empezó en el pasado y sigue ahora: usá present perfect. “Since” indica cuándo comenzó; no una duración.',
  d5: '“Cut back on” significa reducir el consumo o gasto, no eliminarlo necesariamente ni aumentarlo.',
  d6: '“Although” introduce una dificultad que no impidió el resultado: llegaron a tiempo a pesar de ella.',
  d7: 'El tercer condicional imagina un pasado que no ocurrió: if + past perfect, would have + participio.',
  d8: '“Undermine” significa debilitar o perjudicar algo, a menudo poco a poco.',
  d9: 'Los resultados son alentadores, pero una muestra pequeña no permite generalizar la conclusión.',
  g1: 'Para preguntar por una experiencia sin fecha concreta, usá present perfect: “Have you ever been…?”.',
  g2: 'Las expresiones habituales son “go to work” y “by bus”. En este contexto no llevan artículo.',
  g3: 'La pregunta se refiere a una duración que llega hasta ahora: “How long have you worked…?”.',
  g4: 'Para una posibilidad futura, usá presente después de “if” y “will” con el verbo base en el resultado.',
  g5: 'Una pregunta indirecta conserva el orden sujeto + verbo; no inviertas ese orden como en una pregunta directa.',
  city1:
    'La dueña mostró un mapa con lugares que no aparecían en la guía. Ese detalle, y no una visita organizada, explica el descubrimiento.',
  city2:
    'El texto valora dedicar tiempo y dejarse guiar por la curiosidad, en lugar de completar una lista extensa de visitas.',
  money1:
    'Las comisiones y la inflación pueden reducir el crecimiento real de los ahorros; el interés anunciado no cuenta toda la historia.',
  money2:
    'El texto recomienda considerar tus necesidades y entender las condiciones, no elegir solamente por una cifra atractiva.',
  history1:
    'Coordinar horarios y servicios entre ciudades requería una referencia compartida de la hora.',
  history2:
    'Tanto los ferrocarriles como las reuniones internacionales necesitan acordar cómo interpretar la hora en distintos lugares.',
  tech1:
    'La automatización acelera un informe, pero no garantiza que sus indicadores sean relevantes.',
  tech2:
    'La utilidad depende de la calidad de la tarea y del criterio de quien la usa, no solamente de la rapidez.',
  work1:
    'Preparó tres ideas y las practicó en voz alta: esas son las acciones que menciona el texto.',
  work2:
    'Otros dos participantes también estaban confundidos. Pedir una aclaración ayudó a más de una persona.',
  daily1:
    'Dejó el teléfono en la cocina: el texto identifica ese cambio concreto para evitar distracciones.',
  daily2:
    'La rutina debía ser lo bastante sencilla para poder repetirla; una sesión muy exigente no garantiza constancia.',
};
const portuguese: Record<string, string> = {
  d1: '“Ontem” indica una acción terminada en el pasado. Con “eu”, el pasado de “ir” es “fui”.',
  d2: 'El recibo demuestra que el pago se realizó; no es solamente una solicitud o una reserva.',
  d3: 'El horario de ingreso es distinto del de cierre. La última entrada puede ser antes de que cierre el lugar.',
  d4: '“Desde” marca el inicio de una situación que continúa ahora. En portugués, esta frase usa presente: “mora”.',
  d5: '“Economizar” significa gastar menos o guardar dinero; no significa gastar más.',
  d6: '“Embora” introduce una dificultad que no impidió llegar a tiempo: hay un contraste entre dificultad y resultado.',
  d7: 'La condición imagina un pasado diferente que no ocurrió. El resultado necesita “teria escolhido”.',
  d8: '“Comprometer a confiança” significa perjudicar o debilitar la confianza.',
  d9: 'Los resultados son positivos, pero el tamaño de la muestra limita lo que se puede concluir.',
  g1: '“Já foi” pregunta por una experiencia anterior: si alguna vez fuiste a ese lugar.',
  g2: 'En esta frase, las combinaciones naturales son “ao trabalho” y “de ônibus”.',
  g3: '“Há” introduce el tiempo transcurrido de una situación que sigue hasta ahora, no una fecha futura.',
  g4: 'Para esta posibilidad futura, “se” lleva futuro del subjuntivo y el resultado usa “vamos comprar”.',
  g5: '“Me envie” expresa un pedido dirigido a “você”; no una acción pasada ni una descripción.',
  city1:
    'La dueña de la librería mostró un mapa con otros lugares. Ese es el detalle que explica la nueva ruta.',
  city2:
    'El último párrafo valora el tiempo y la curiosidad, en lugar de una lista de lugares que hay que completar.',
  money1:
    'Empezó observando sus gastos durante una semana: primero necesitaba entender cómo usaba el dinero.',
  money2: 'La reserva permitió pagar un imprevisto. No se usó para un gasto planeado de antemano.',
  time1:
    'Los trenes conectaban ciudades con horas locales distintas. Eso dificultaba coordinar los viajes.',
  time2:
    'El último párrafo explica que los husos horarios surgieron de decisiones históricas, no de una única regla natural.',
  tech1: 'Comprobó el resumen comparándolo con el texto original: no lo aceptó sin verificarlo.',
  tech2:
    'El texto recomienda revisar fuentes, información y suposiciones antes de confiar en una respuesta.',
  work1: 'Organizó tres ideas y las practicó en voz alta: ambas acciones aparecen en el texto.',
  work2: 'Pedir una aclaración permitió seguir la conversación; no significó abandonar la reunión.',
  routine1:
    'Los horarios cambiaban y las sesiones largas se postergaban: ese era el problema de la rutina.',
  routine2:
    'El último párrafo valora volver a practicar después de las pausas, sin exigir una racha perfecta.',
  'cefr:A1:reading':
    'El texto dice “moro em Buenos Aires”: “moro” significa que vive allí, no que está de visita.',
  'cefr:A1:grammar':
    'Con “eu” se usa “sou”; “é” corresponde a “ele/ela/você” y “são” a sujetos plurales.',
  'cefr:A2:reading':
    'Compró menos tomates porque estaban caros. “Como” introduce la razón de esa decisión.',
  'cefr:A2:grammar': '“Ontem” exige una acción pasada: “foi”. “Vai” es presente e “irá” es futuro.',
  'cefr:B1:reading':
    'Separá el problema de la reserva cancelada, la necesidad de alojamiento y la solución que propone el texto.',
  'cefr:B1:grammar':
    'La situación es hipotética: “se tivesse” se combina con “procuraria”, no con una acción que ya ocurrió.',
  'cefr:B2:reading':
    'La conclusión combina las dos perspectivas y reconoce sus límites; no acepta una de ellas sin matices.',
  'cefr:B2:grammar':
    '“Embora” introduce una concesión y en este contexto necesita subjuntivo, no indicativo.',
  'cefr:C1:reading':
    'La respuesta debe reconocer el supuesto que se critica y la reformulación propuesta, no repetir el supuesto como conclusión.',
  'cefr:C1:grammar':
    'Aquí “antes” significa “por el contrario” o “en realidad”; no indica un momento anterior.',
  'cefr:C2:reading':
    'Una interpretación posible no equivale a una prueba suficiente. El texto distingue ambas cosas.',
  'cefr:C2:grammar':
    'Una paráfrasis fiel conserva el alcance de la negación; no convierte una afirmación limitada en una generalización.',
};
export function answerWhy(id: string) {
  return (
    (isPortuguese ? portuguese : english)[id] ||
    'La opción elegida no coincide con la respuesta de este ejercicio. Compará la corrección con la consigna y el texto de referencia.'
  );
}
export function matchWhy(word: string, selected: string) {
  return (
    `La definición corresponde a «${word}»: ${dailyWordSpanish[word.toLowerCase()] || 'revisá su significado en el ejemplo'}.` +
    (dailyWordSpanish[selected.toLowerCase()]
      ? ` En cambio, «${selected}» significa: ${dailyWordSpanish[selected.toLowerCase()]}`
      : ' La otra palabra no corresponde a esa definición.')
  );
}
export function sentenceWhy(solution: string, selected: string) {
  const expected = solution.split(/\s+/),
    actual = selected.split(/\s+/);
  const at = expected.findIndex(
    (piece, index) => piece.toLowerCase() !== actual[index]?.toLowerCase(),
  );
  return at < 0
    ? 'Revisá la puntuación y la separación de las palabras del modelo.'
    : `El orden no coincide con la oración de referencia. En la posición ${at + 1}, colocaste «${actual[at] || '…'}», pero el modelo necesita «${expected[at]}». Leé la oración corregida completa para ver cómo se conectan las partes. Puede haber otras formas válidas de expresarlo; este juego comprueba el orden del modelo.`;
}
export function pdfWhy(kind: string) {
  return kind === 'word'
    ? 'La consigna pide la palabra exacta del texto. La que elegiste no completa el fragmento original; compará el hueco con el párrafo de referencia.'
    : 'La frase elegida no aparece en este párrafo. Puede estar en otra parte del documento, pero esta pregunta pide un detalle de la sección actual.';
}
export function trailWhy(marks: string[]) {
  const exact = marks.filter((x) => x === 'exact').length,
    moved = marks.filter((x) => x === 'present').length,
    absent = marks.filter((x) => x === 'absent').length;
  return `Todavía no es la palabra: ${exact} letra(s) están en el lugar correcto y ${moved} deben cambiar de posición. ${absent} letra(s) no aparecen o ya se usaron todas sus repeticiones disponibles. Conservá las verdes y reubicá las doradas; mientras queden intentos, la solución permanece oculta.`;
}
