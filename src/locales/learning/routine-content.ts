// Authored learning starters, not a CEFR certification. Spanish guides accompany native content.
export type RoutineWord = { en: string; pt: string; es: string; icon: string };
export type RoutineSentence = {
  en: string[];
  pt: string[];
  es: string;
  whyEN: string;
  whyPT: string;
};
export type RoutineReading = {
  en: string;
  pt: string;
  checks: {
    en: string;
    pt: string;
    es: string;
    optionsEN: string[];
    optionsPT: string[];
    answer: number;
    why: string;
  }[];
};
const word = (en: string, pt: string, es: string, icon: string): RoutineWord => ({
  en,
  pt,
  es,
  icon,
});
const sentence = (
  en: string,
  pt: string,
  es: string,
  whyEN: string,
  whyPT = whyEN,
): RoutineSentence => ({ en: en.split('|'), pt: pt.split('|'), es, whyEN, whyPT });
export const routineWords: Record<string, RoutineWord[]> = {
  A1: [
    word('glass', 'copo', 'vaso', '🥛'),
    word('cup', 'xícara', 'taza', '☕'),
    word('book', 'livro', 'libro', '📖'),
    word('house', 'casa', 'casa', '🏠'),
    word('water', 'água', 'agua', '💧'),
    word('bread', 'pão', 'pan', '🍞'),
    word('friend', 'amigo', 'amigo', '🧑‍🤝‍🧑'),
    word('school', 'escola', 'escuela', '🏫'),
  ],
  A2: [
    word('ticket', 'passagem', 'pasaje de transporte', '🎫'),
    word('receipt', 'recibo', 'comprobante de pago', '🧾'),
    word('luggage', 'bagagem', 'equipaje', '🧳'),
    word('appointment', 'compromisso', 'cita o compromiso agendado', '📅'),
    word('timetable', 'horário', 'horario de un servicio', '🕒'),
    word('neighbourhood', 'bairro', 'barrio', '🏘️'),
    word('savings', 'poupança', 'ahorros', '🐷'),
    word('refund', 'reembolso', 'devolución de dinero', '💸'),
  ],
  B1: [
    word('experience', 'experiência', 'experiencia vivida', '🧭'),
    word('decision', 'decisão', 'decisión', '🔀'),
    word('advice', 'conselho', 'consejo', '💡'),
    word('opportunity', 'oportunidade', 'oportunidad', '🚪'),
    word('challenge', 'desafio', 'desafío', '⛰️'),
    word('improvement', 'melhoria', 'mejora', '📈'),
    word('reason', 'motivo', 'motivo o razón', '🔎'),
    word('choice', 'escolha', 'elección', '✅'),
  ],
  B2: [
    word('evidence', 'evidência', 'información que respalda una afirmación', '🔍'),
    word('claim', 'alegação', 'afirmación que necesita respaldo', '💬'),
    word('drawback', 'desvantagem', 'inconveniente o desventaja', '⚖️'),
    word('outcome', 'resultado', 'resultado de un proceso', '🏁'),
    word('despite', 'apesar de', 'a pesar de', '🌧️'),
    word('whereas', 'ao passo que', 'mientras que, al contrastar ideas', '↔️'),
    word('bias', 'viés', 'sesgo', '🎯'),
    word('assumption', 'pressuposto', 'suposición tomada como punto de partida', '🧩'),
  ],
  C1: [
    word('caveat', 'ressalva', 'salvedad que limita una afirmación', '⚠️'),
    word('plausible', 'plausível', 'razonable o verosímil, sin ser una prueba', '💭'),
    word('robust', 'robusto', 'sólido frente a distintas comprobaciones', '🛡️'),
    word('tentative', 'provisório', 'provisional, sujeto a revisión', '📝'),
    word('implication', 'implicação', 'consecuencia o idea que se desprende de otra', '🔗'),
    word('underlying', 'subjacente', 'que está detrás de lo visible', '🌱'),
    word('subtle', 'sutil', 'difícil de advertir de inmediato', '🪶'),
    word('constraint', 'restrição', 'limitación que condiciona una decisión', '🚧'),
  ],
  C2: [
    word('scope', 'alcance', 'ámbito o extensión de una afirmación', '🔭'),
    word('nuance', 'nuance', 'matiz fino de significado', '🎨'),
    word('equivocal', 'equívoco', 'que admite interpretaciones diferentes', '🌀'),
    word('counterexample', 'contraexemplo', 'caso que refuta una afirmación general', '🧪'),
    word('necessary', 'necessário', 'necesario para que algo ocurra', '🔑'),
    word('sufficient', 'suficiente', 'que basta para que algo ocurra', '✔️'),
    word('qualified', 'condicionado', 'limitado por condiciones o salvedades', '📎'),
    word('unequivocal', 'inequívoco', 'que no deja duda sobre su interpretación', '📌'),
  ],
};
export const routineSentences: Record<string, RoutineSentence[]> = {
  A1: [
    sentence(
      'I|am|a student.',
      'Eu|sou|estudante.',
      'Soy estudiante.',
      'Con I, be toma la forma am. A student necesita el artículo a.',
      'Eu usa sou; no é. Estudante puede ir sin artículo en esta presentación.',
    ),
    sentence(
      'She|is|at home.',
      'Ela|está|em casa.',
      'Ella está en casa.',
      'She lleva is. At home indica dónde está.',
      'Estar indica la ubicación. Ela lleva está; em casa indica dónde.',
    ),
    sentence(
      'I|study|English.',
      'Eu|estudo|português.',
      'Estudio el idioma.',
      'La afirmación sigue sujeto + verbo + complemento. Con I, study no lleva -s.',
      'Eu lleva estudo. No uses estudiar, que es español, ni el infinitivo estudar en esta afirmación.',
    ),
    sentence(
      'I|do not|drink|coffee.',
      'Eu|não|bebo|café.',
      'No tomo café.',
      'Do not forma la negativa; drink queda en forma base.',
      'Não va antes del verbo conjugado: bebo. No se necesita do ni does.',
    ),
    sentence(
      'Do|you|have|a book?',
      'Você|tem|um livro?',
      '¿Tenés un libro?',
      'Do aparece antes del sujeto; have queda en forma base.',
      'La pregunta conserva el orden: você + tem + um livro. El signo y la entonación indican la pregunta.',
    ),
    sentence(
      'We|are|friends.',
      'Nós|somos|amigos.',
      'Somos amigos.',
      'We usa are y friends expresa un plural.',
      'Nós se conjuga somos. Amigos concuerda en plural.',
    ),
  ],
  A2: [
    sentence(
      'I|study|English|after work.',
      'Eu|estudo|português|depois do trabalho.',
      'Estudio el idioma después del trabajo.',
      'Sujeto + verbo + complemento + momento. After work conecta la actividad con tu rutina.',
      'Eu estudio se dice eu estudo. Depois do trabalho indica el momento de la rutina.',
    ),
    sentence(
      'Yesterday,|I|bought|a ticket.',
      'Ontem,|eu|comprei|uma passagem.',
      'Ayer compré un pasaje.',
      'Yesterday sitúa la acción en un pasado terminado: buy cambia a bought.',
      'Ontem sitúa la acción terminada: eu comprei, pretérito perfeito de comprar.',
    ),
    sentence(
      'She|did not|buy|a book.',
      'Ela|não|comprou|um livro.',
      'Ella no compró un libro.',
      'Después de did not, usá buy, no bought: el pasado ya está en did.',
      'Não va delante de comprou. En portugués el verbo conserva su conjugación pasada.',
    ),
    sentence(
      'I|am going to|travel|tomorrow.',
      'Eu|vou|viajar|amanhã.',
      'Voy a viajar mañana.',
      'Am going to + verbo base expresa un plan. I usa am.',
      'Vou + infinitivo expresa un plan habitual en Brasil. Viajar queda sin conjugar.',
    ),
    sentence(
      'Did|you|read|the message?',
      'Você|leu|a mensagem?',
      '¿Leíste el mensaje?',
      'Did va antes del sujeto; read queda en forma base y se pronuncia como presente después de did.',
      'Você usa leu para una acción terminada. No agregues did.',
    ),
    sentence(
      'I|am studying|because|I have a test.',
      'Eu|estou estudando|porque|tenho uma prova.',
      'Estoy estudiando porque tengo una prueba.',
      'Am studying expresa una acción en desarrollo; because introduce la razón.',
      'Estou + estudando expresa acción en desarrollo. Porque introduce el motivo.',
    ),
  ],
  B1: [
    sentence(
      'I|have visited|Brazil|twice.',
      'Eu|já visitei|o Brasil|duas vezes.',
      'Visité Brasil dos veces.',
      'Have + participio habla de una experiencia sin fijar una fecha pasada terminada.',
      'Para esta experiencia terminada se usa visitei. Tenho visitado sugiere repetición reciente o continuidad, no es una copia automática del inglés.',
    ),
    sentence(
      'If|it rains,|we|will stay|at home.',
      'Se|chover,|nós|vamos ficar|em casa.',
      'Si llueve, nos vamos a quedar en casa.',
      'If lleva presente y el resultado will + verbo base.',
      'Una condición futura posible usa se + futuro de subjuntivo: chover. El resultado usa vamos ficar.',
    ),
    sentence(
      'You|should ask|for help.',
      'Você|deveria pedir|ajuda.',
      'Deberías pedir ayuda.',
      'Should + verbo base sirve para dar un consejo. Ask for help es pedir ayuda.',
      'Deveria + infinitivo permite aconsejar. Pedir ajuda no necesita for.',
    ),
    sentence(
      'I|used to work|at night.',
      'Eu|trabalhava|à noite.',
      'Antes trabajaba de noche.',
      'Used to + verbo base expresa un hábito pasado que se contrasta con el presente.',
      'El imperfeito trabalhava describe un hábito pasado, no un evento aislado concluido.',
    ),
    sentence(
      'Although|she was tired,|she|finished the task.',
      'Embora|ela estivesse cansada,|ela|terminou a tarefa.',
      'Aunque ella estaba cansada, terminó la tarea.',
      'Although introduce una dificultad que no impidió el resultado.',
      'Embora introduce concesión y aquí exige subjuntivo: estivesse. Terminou expresa el resultado concluido.',
    ),
    sentence(
      'I|had finished|before|she arrived.',
      'Eu|tinha terminado|antes de|ela chegar.',
      'Había terminado antes de que ella llegara.',
      'Had + participio sitúa una acción antes de otra pasada.',
      'Tinha + participio indica anterioridad. Antes de ela chegar usa un infinitivo con su propio sujeto.',
    ),
  ],
  B2: [
    sentence(
      'If|I had more time,|I|would travel.',
      'Se|eu tivesse mais tempo,|eu|viajaria.',
      'Si tuviera más tiempo, viajaría.',
      'La condición hipotética usa pasado en if y would + verbo base en el resultado.',
      'La hipótesis usa tivesse, imperfecto de subjuntivo; el resultado usa viajaria.',
    ),
    sentence(
      'Could you|tell me|where|the station is?',
      'Você poderia|me dizer|onde|fica a estação?',
      '¿Podrías decirme dónde está la estación?',
      'Una pregunta indirecta conserva sujeto + verbo: the station is, no is the station.',
      'Poderia vuelve el pedido cortés; onde fica a estação introduce la ubicación.',
    ),
    sentence(
      'The report|was written|by a researcher.',
      'O relatório|foi escrito|por um pesquisador.',
      'El informe fue escrito por un investigador.',
      'La pasiva usa be + participio. Written es el participio de write.',
      'La pasiva usa ser + participio. Foi escrito concuerda con relatório.',
    ),
    sentence(
      'Despite|the heavy rain,|we|went out.',
      'Apesar de|a chuva estar forte,|nós|saímos.',
      'A pesar de la lluvia fuerte, salimos.',
      'Despite va seguido de un nombre; no necesita of.',
      'Apesar de admite una cláusula de infinitivo: a chuva estar forte. Saímos es el resultado terminado.',
    ),
    sentence(
      'She said|that|she had finished.',
      'Ela disse|que|tinha terminado.',
      'Ella dijo que había terminado.',
      'En el relato pasado, had finished deja clara la anterioridad de la tarea.',
      'Tinha terminado marca una acción anterior a disse.',
    ),
    sentence(
      'The proposal|has advantages;|however,|it also has drawbacks.',
      'A proposta|tem vantagens;|contudo,|também tem desvantagens.',
      'La propuesta tiene ventajas; sin embargo, también tiene desventajas.',
      'However conecta dos oraciones y señala un contraste.',
      'Contudo introduce contraste. La puntuación separa dos afirmaciones completas.',
    ),
  ],
  C1: [
    sentence(
      'The findings|suggest|a possible benefit.',
      'Os resultados|sugerem|um possível benefício.',
      'Los resultados sugieren un beneficio posible.',
      'Suggest y possible limitan la fuerza de la afirmación: los resultados no prueban una certeza.',
      'Sugerem y possível moderan la afirmación; no equivalen a una prueba definitiva.',
    ),
    sentence(
      'Rarely|have I seen|such careful work.',
      'Raramente|tenho visto|um trabalho tão cuidadoso.',
      'Rara vez vi un trabajo tan cuidadoso.',
      'Rarely al inicio activa inversión: have I seen.',
      'La forma portuguesa no copia la inversión inglesa. Tenho visto expresa una experiencia repetida o reciente.',
    ),
    sentence(
      'The change|may have affected|the result.',
      'A mudança|pode ter afetado|o resultado.',
      'El cambio puede haber afectado el resultado.',
      'May have + participio expresa posibilidad sobre el pasado, no certeza.',
      'Pode ter + participio expresa una posibilidad sobre un efecto pasado.',
    ),
    sentence(
      'Were|the sample larger,|the estimate|might be more reliable.',
      'Se|a amostra fosse maior,|a estimativa|poderia ser mais confiável.',
      'Si la muestra fuera mayor, la estimación podría ser más confiable.',
      'Were sustituye if en esta condición formal y aparece antes del sujeto.',
      'Fosse plantea la hipótesis; poderia evita convertir una posibilidad en certeza.',
    ),
    sentence(
      'What matters|is|whether the evidence supports the claim.',
      'O que importa|é|se a evidência sustenta a alegação.',
      'Lo que importa es si la evidencia respalda la afirmación.',
      'La cláusula inicial focaliza la idea central; whether introduce la cuestión que se evalúa.',
      'O que importa focaliza el punto central. Se introduce una pregunta indirecta, no una condición en este uso.',
    ),
    sentence(
      'The conclusion|is plausible,|albeit|subject to revision.',
      'A conclusão|é plausível,|embora|sujeita a revisão.',
      'La conclusión es plausible, aunque está sujeta a revisión.',
      'Albeit introduce una salvedad breve. Plausible no significa demostrado.',
      'Embora introduce la salvedad en una construcción elíptica; plausível no significa comprobado.',
    ),
  ],
  C2: [
    sentence(
      'Not every|objection|is|a rejection.',
      'Nem toda|objeção|é|uma rejeição.',
      'No toda objeción es un rechazo.',
      'Not every niega una generalización universal; no dice que ninguna objeción sea rechazo.',
      'Nem toda niega la generalización. No equivale a nenhuma.',
    ),
    sentence(
      'Compliance|is necessary|but not sufficient.',
      'A conformidade|é necessária,|mas não suficiente.',
      'El cumplimiento es necesario, pero no suficiente.',
      'Necessary marca un requisito; sufficient indicaría que ese requisito basta por sí solo.',
      'Necessária señala un requisito; suficiente significa que basta para alcanzar el resultado.',
    ),
    sentence(
      'Had|the assumptions been different,|the conclusion|might have changed.',
      'Se|os pressupostos tivessem sido diferentes,|a conclusão|poderia ter mudado.',
      'Si los supuestos hubieran sido diferentes, la conclusión podría haber cambiado.',
      'Had al inicio reemplaza if; might have changed conserva la incertidumbre del resultado hipotético.',
      'Tivessem sido expresa la condición contrafactual; poderia ter mudado evita afirmar un resultado seguro.',
    ),
    sentence(
      'The evidence|does not rule out|an alternative explanation.',
      'A evidência|não descarta|uma explicação alternativa.',
      'La evidencia no descarta una explicación alternativa.',
      'No descartar algo no equivale a demostrarlo; mantené el alcance de la negación.',
      'Não descarta mantiene abierta una posibilidad, sin probarla.',
    ),
    sentence(
      'A single counterexample|is enough|to refute a universal claim.',
      'Um único contraexemplo|basta|para refutar uma afirmação universal.',
      'Un solo contraejemplo basta para refutar una afirmación universal.',
      'Una afirmación sobre todos los casos queda refutada por un caso incompatible; no necesariamente se refuta una afirmación más limitada.',
      'Um único limita la cantidad necesaria; universal especifica el alcance de la afirmación.',
    ),
    sentence(
      'The wording|is deliberately equivocal,|rather than|unequivocally supportive.',
      'A formulação|é deliberadamente equívoca,|em vez de|inequivocamente favorável.',
      'La formulación es deliberadamente ambigua, en vez de inequívocamente favorable.',
      'Rather than contrasta dos interpretaciones. Equivocal y unequivocal no son equivalentes.',
      'Em vez de contrasta las dos lecturas. Equívoca admite ambigüedad; inequivocamente la excluye.',
    ),
  ],
};
const q = (
  en: string,
  pt: string,
  es: string,
  optionsEN: string[],
  optionsPT: string[],
  answer: number,
  why: string,
) => ({ en, pt, es, optionsEN, optionsPT, answer, why });
const read = (en: string, pt: string, checks: RoutineReading['checks']): RoutineReading => ({
  en,
  pt,
  checks,
});
export const routineReadings: Record<string, RoutineReading[]> = {
  A1: [
    read(
      'Ana has a glass of water. Bia has a cup of coffee.',
      'Ana tem um copo de água. Bia tem uma xícara de café.',
      [
        q(
          'Who has water?',
          'Quem tem água?',
          '¿Quién tiene agua?',
          ['Ana', 'Bia', 'Both'],
          ['Ana', 'Bia', 'As duas'],
          0,
          'El texto asocia Ana con water/água y Bia con coffee/café.',
        ),
        q(
          'What does Bia have?',
          'O que Bia tem?',
          '¿Qué tiene Bia?',
          ['A book', 'Coffee', 'Water'],
          ['Um livro', 'Café', 'Água'],
          1,
          'La segunda oración dice que Bia tiene café. No dice que tenga un libro.',
        ),
      ],
    ),
    read(
      'Leo is a student. He studies at home in the morning.',
      'Leo é estudante. Ele estuda em casa de manhã.',
      [
        q(
          'Where does Leo study?',
          'Onde Leo estuda?',
          '¿Dónde estudia Leo?',
          ['At home', 'At a café', 'At a hotel'],
          ['Em casa', 'Em um café', 'Em um hotel'],
          0,
          'At home/em casa indica el lugar. Ser estudiante no implica que esta actividad ocurra en una escuela.',
        ),
        q(
          'When does he study?',
          'Quando ele estuda?',
          '¿Cuándo estudia?',
          ['At night', 'In the afternoon', 'In the morning'],
          ['À noite', 'À tarde', 'De manhã'],
          2,
          'El momento aparece al final: in the morning/de manhã.',
        ),
      ],
    ),
    read(
      'Mia lives in a small house. She has two books and one glass.',
      'Mia mora em uma casa pequena. Ela tem dois livros e um copo.',
      [
        q(
          'How many books does Mia have?',
          'Quantos livros Mia tem?',
          '¿Cuántos libros tiene Mia?',
          ['One', 'Two', 'Three'],
          ['Um', 'Dois', 'Três'],
          1,
          'Two books/dois livros indica dos. One glass/um copo se refiere al vaso, no a los libros.',
        ),
        q(
          'What is small?',
          'O que é pequeno?',
          '¿Qué es pequeño?',
          ['The glass', 'The book', 'The house'],
          ['O copo', 'O livro', 'A casa'],
          2,
          'Small/pequena describe la casa. El texto no describe el tamaño del vaso ni de los libros.',
        ),
      ],
    ),
  ],
  A2: [
    read(
      'Yesterday, Ana bought a train ticket. She kept the receipt because she needed it for work.',
      'Ontem, Ana comprou uma passagem de trem. Ela guardou o recibo porque precisava dele para o trabalho.',
      [
        q(
          'What did Ana buy?',
          'O que Ana comprou?',
          '¿Qué compró Ana?',
          ['A train ticket', 'A book', 'A suitcase'],
          ['Uma passagem de trem', 'Um livro', 'Uma mala'],
          0,
          'Bought/comprou se conecta con el pasaje. Un recibo es el comprobante, no lo que compró.',
        ),
        q(
          'Why did she keep the receipt?',
          'Por que ela guardou o recibo?',
          '¿Por qué guardó el recibo?',
          ['To give it to a friend', 'For work', 'To change her ticket'],
          ['Para dar a um amigo', 'Para o trabalho', 'Para trocar a passagem'],
          1,
          'Because/porque introduce el motivo: necesitaba el recibo para el trabajo. No se menciona un cambio de pasaje.',
        ),
      ],
    ),
    read(
      'Bruno usually walks to work. Today it is raining, so he is taking the bus.',
      'Bruno geralmente caminha até o trabalho. Hoje está chovendo, então ele está indo de ônibus.',
      [
        q(
          'How does Bruno usually travel?',
          'Como Bruno geralmente vai ao trabalho?',
          '¿Cómo va habitualmente al trabajo?',
          ['By train', 'By bus', 'On foot'],
          ['De trem', 'De ônibus', 'A pé'],
          2,
          'Usually/geralmente señala la rutina: camina. El colectivo es la excepción de hoy.',
        ),
        q(
          'Why is today different?',
          'Por que hoje é diferente?',
          '¿Por qué hoy es diferente?',
          ['He is on holiday', 'It is raining', 'The bus is cheaper'],
          ['Ele está de férias', 'Está chovendo', 'O ônibus é mais barato'],
          1,
          'El texto presenta la lluvia como causa con so/então. No afirma nada sobre precio ni vacaciones.',
        ),
      ],
    ),
    read(
      'Lia has an appointment at ten. The bus leaves at nine, so she plans to arrive early.',
      'Lia tem um compromisso às dez. O ônibus sai às nove, então ela planeja chegar cedo.',
      [
        q(
          'What happens at ten?',
          'O que acontece às dez?',
          '¿Qué pasa a las diez?',
          ['The bus leaves', 'The appointment', 'The shop closes'],
          ['O ônibus sai', 'O compromisso', 'A loja fecha'],
          1,
          'El compromiso es a las diez; la salida del colectivo es a las nueve. Separá los dos horarios.',
        ),
        q(
          'What does Lia plan to do?',
          'O que Lia planeja fazer?',
          '¿Qué planea hacer Lia?',
          ['Arrive early', 'Cancel the appointment', 'Travel tomorrow'],
          ['Chegar cedo', 'Cancelar o compromisso', 'Viajar amanhã'],
          0,
          'Plans to arrive early/planeja chegar cedo indica un plan. Cancelar o viajar mañana no aparece en el texto.',
        ),
      ],
    ),
  ],
  B1: [
    read(
      'Nora has visited Brazil twice. On her last trip, she missed a bus, but a local helped her find another route.',
      'Nora já visitou o Brasil duas vezes. Na última viagem, ela perdeu um ônibus, mas uma pessoa da região a ajudou a encontrar outra rota.',
      [
        q(
          'How many visits are mentioned?',
          'Quantas visitas são mencionadas?',
          '¿Cuántas visitas se mencionan?',
          ['One', 'Two', 'Three'],
          ['Uma', 'Duas', 'Três'],
          1,
          'Twice/duas vezes informa dos experiencias. El detalle de la última no agrega una tercera visita.',
        ),
        q(
          'What solved the problem?',
          'O que resolveu o problema?',
          '¿Qué ayudó a resolver el problema?',
          ['A local helped', 'She cancelled the trip', 'The bus returned'],
          ['Uma pessoa da região ajudou', 'Ela cancelou a viagem', 'O ônibus voltou'],
          0,
          'But/mas introduce la solución: una persona la ayudó a encontrar otra ruta. No se afirma que el colectivo regresara.',
        ),
      ],
    ),
    read(
      'If the weather improves, Sam will walk to the meeting. Otherwise, he will take a taxi.',
      'Se o tempo melhorar, Sam irá a pé à reunião. Caso contrário, pegará um táxi.',
      [
        q(
          'When will Sam walk?',
          'Quando Sam irá a pé?',
          '¿En qué caso irá caminando?',
          ['If the weather improves', 'Only at night', 'If the meeting is cancelled'],
          ['Se o tempo melhorar', 'Só à noite', 'Se a reunião for cancelada'],
          0,
          'La cláusula con if/se establece la condición. La caminata no es una decisión incondicional.',
        ),
        q(
          'What is his backup plan?',
          'Qual é o plano alternativo?',
          '¿Cuál es su plan alternativo?',
          ['Stay at home', 'Take a bus', 'Take a taxi'],
          ['Ficar em casa', 'Pegar um ônibus', 'Pegar um táxi'],
          2,
          'Otherwise/caso contrário presenta la alternativa: tomar un taxi.',
        ),
      ],
    ),
    read(
      'I used to study alone. Now I meet a friend every week because explaining ideas helps me remember them.',
      'Eu estudava sozinho. Agora encontro um amigo toda semana porque explicar ideias me ajuda a lembrá-las.',
      [
        q(
          'What has changed?',
          'O que mudou?',
          '¿Qué cambió?',
          ['The place of work', 'The way of studying', 'The language of the books'],
          ['O lugar de trabalho', 'A forma de estudar', 'O idioma dos livros'],
          1,
          'El contraste antes/ahora es entre estudiar solo y compartir una sesión semanal. No se habla de trabajo.',
        ),
        q(
          'Why does the writer explain ideas?',
          'Por que o autor explica ideias?',
          '¿Por qué explica las ideas?',
          ['To remember them', 'To teach professionally', 'To finish faster'],
          ['Para se lembrar delas', 'Para ensinar profissionalmente', 'Para terminar mais rápido'],
          0,
          'Because/porque introduce la razón explícita: explicar ayuda a recordar. No implica ser docente profesional.',
        ),
      ],
    ),
  ],
  B2: [
    read(
      'The proposal could save money, but the estimate excludes maintenance costs. The team therefore asks for more evidence before deciding.',
      'A proposta poderia economizar dinheiro, mas a estimativa não inclui os custos de manutenção. A equipe, portanto, pede mais evidências antes de decidir.',
      [
        q(
          'What limits the estimate?',
          'O que limita a estimativa?',
          '¿Qué limita la estimación?',
          ['Excluded maintenance costs', 'Too many receipts', 'A final decision'],
          ['Custos de manutenção não incluídos', 'Recibos demais', 'Uma decisão final'],
          0,
          'But/mas introduce una limitación concreta: faltan los costos de mantenimiento. El ahorro no está asegurado.',
        ),
        q(
          'Has the team made a final decision?',
          'A equipe tomou uma decisão final?',
          '¿Ya decidió el equipo?',
          ['Yes, it accepted', 'Yes, it rejected', 'No, it wants more evidence'],
          ['Sim, aceitou', 'Sim, rejeitou', 'Não, quer mais evidências'],
          2,
          'Before deciding/antes de decidir mantiene la decisión pendiente. Pedir evidencia no equivale a rechazar.',
        ),
      ],
    ),
    read(
      'Although the trial improved attendance, participants chose to join it. The result may therefore reflect motivation as well as the programme.',
      'Embora o teste tenha melhorado a frequência, os participantes escolheram participar. O resultado pode, portanto, refletir a motivação, além do programa.',
      [
        q(
          'What alternative explanation is raised?',
          'Que explicação alternativa é apresentada?',
          '¿Qué explicación alternativa aparece?',
          ['Participants’ motivation', 'A cheaper ticket', 'No improvement at all'],
          ['A motivação dos participantes', 'Uma passagem mais barata', 'Nenhuma melhoria'],
          0,
          'As well as/além de admite una contribución de la motivación. No niega que se haya registrado una mejora.',
        ),
        q(
          'Does the text prove a single cause?',
          'O texto prova uma causa única?',
          '¿Prueba una causa única?',
          ['Yes', 'No', 'It says nobody joined'],
          ['Sim', 'Não', 'Diz que ninguém participou'],
          1,
          'May/pode expresa posibilidad. El texto no demuestra que el programa sea la única causa.',
        ),
      ],
    ),
    read(
      'The report was reviewed by two specialists. However, both worked on the original project, so independent review is still recommended.',
      'O relatório foi revisado por dois especialistas. Contudo, ambos trabalharam no projeto original, por isso uma revisão independente ainda é recomendada.',
      [
        q(
          'Why recommend another review?',
          'Por que recomendar outra revisão?',
          '¿Por qué se recomienda otra revisión?',
          ['The report is missing', 'The reviewers were involved', 'No one reviewed it'],
          ['O relatório desapareceu', 'Os revisores estavam envolvidos', 'Ninguém o revisou'],
          1,
          'However/contudo plantea un límite a la independencia de los revisores, no a la existencia de la revisión.',
        ),
        q(
          'What does the text acknowledge?',
          'O que o texto reconhece?',
          '¿Qué reconoce el texto?',
          ['A review already occurred', 'The result is false', 'The specialists refused'],
          ['Uma revisão já ocorreu', 'O resultado é falso', 'Os especialistas recusaram'],
          0,
          'Was reviewed/foi revisado afirma que hubo revisión. La recomendación no demuestra que el resultado sea falso.',
        ),
      ],
    ),
  ],
  C1: [
    read(
      'A small study suggests a possible benefit. Its sample is too limited to justify a general recommendation, although the findings warrant further investigation.',
      'Um estudo pequeno sugere um possível benefício. Sua amostra é limitada demais para justificar uma recomendação geral, embora os resultados mereçam investigação adicional.',
      [
        q(
          'Which claim is justified?',
          'Qual afirmação é justificada?',
          '¿Qué afirmación está justificada?',
          [
            'The benefit is certain',
            'More investigation is warranted',
            'The findings are worthless',
          ],
          ['O benefício é certo', 'Mais investigação é justificada', 'Os resultados não têm valor'],
          1,
          'Suggests/sugere y possible/possível moderan la afirmación; la salvedad limita su generalización, sin quitar todo valor al estudio.',
        ),
        q(
          'What is the main caveat?',
          'Qual é a principal ressalva?',
          '¿Cuál es la principal salvedad?',
          ['The sample is limited', 'There is no study', 'The recommendation is already universal'],
          ['A amostra é limitada', 'Não há estudo', 'A recomendação já é universal'],
          0,
          'La limitación explícita es la muestra. No se puede convertir un resultado pequeño en recomendación general sin más evidencia.',
        ),
      ],
    ),
    read(
      'The conclusion is plausible provided that the assumptions hold. If they do not, the same observations could support a different interpretation.',
      'A conclusão é plausível desde que os pressupostos se mantenham. Se isso não ocorrer, as mesmas observações poderiam sustentar outra interpretação.',
      [
        q(
          'What condition supports the conclusion?',
          'Que condição sustenta a conclusão?',
          '¿Qué condición sostiene la conclusión?',
          ['The assumptions hold', 'The observations disappear', 'No alternative is possible'],
          [
            'Os pressupostos se mantêm',
            'As observações desaparecem',
            'Nenhuma alternativa é possível',
          ],
          0,
          'Provided that/desde que introduce una condición necesaria para esta lectura. Plausible no equivale a certeza.',
        ),
        q(
          'Can the same observations admit another interpretation?',
          'As mesmas observações admitem outra interpretação?',
          '¿Pueden admitir otra interpretación?',
          ['Never', 'Possibly, if assumptions fail', 'Only if there are no observations'],
          ['Nunca', 'Possivelmente, se os pressupostos falharem', 'Só se não houver observações'],
          1,
          'Could/poderiam deja abierta una alternativa condicionada al cambio de supuestos.',
        ),
      ],
    ),
    read(
      'The policy addresses an immediate constraint rather than the underlying cause. Its short-term success should not be taken as evidence of a lasting solution.',
      'A política responde a uma restrição imediata, em vez da causa subjacente. Seu sucesso de curto prazo não deve ser tomado como evidência de uma solução duradoura.',
      [
        q(
          'What distinction matters?',
          'Que distinção importa?',
          '¿Qué distinción importa?',
          [
            'Price versus speed',
            'An immediate constraint versus the underlying cause',
            'Two identical causes',
          ],
          [
            'Preço e velocidade',
            'Uma restrição imediata e a causa subjacente',
            'Duas causas idênticas',
          ],
          1,
          'Rather than/em vez de contrasta el problema inmediato con la causa que lo origina.',
        ),
        q(
          'What does short-term success establish?',
          'O que o sucesso de curto prazo estabelece?',
          '¿Qué permite establecer el éxito breve?',
          [
            'A lasting solution is certain',
            'The policy failed completely',
            'It does not by itself establish a lasting solution',
          ],
          [
            'Uma solução duradoura é certa',
            'A política fracassou totalmente',
            'Por si só, não estabelece uma solução duradoura',
          ],
          2,
          'No convertir el éxito breve en una solución definitiva tampoco equivale a decir que la política fracasó por completo.',
        ),
      ],
    ),
  ],
  C2: [
    read(
      'Not every objection was a rejection. Some participants requested clarification while remaining broadly supportive; others withheld endorsement without opposing the proposal.',
      'Nem toda objeção foi uma rejeição. Alguns participantes pediram esclarecimentos, mantendo-se em geral favoráveis; outros não deram apoio explícito, sem se opor à proposta.',
      [
        q(
          'What does “not every” exclude?',
          'O que “nem toda” exclui?',
          '¿Qué excluye “no toda”?',
          [
            'That all objections were rejections',
            'That any objection existed',
            'That some people were supportive',
          ],
          [
            'Que todas as objeções fossem rejeições',
            'Que existisse alguma objeção',
            'Que algumas pessoas fossem favoráveis',
          ],
          0,
          'La negación tiene alcance sobre la universalidad: no todas. No implica ninguna ni elimina el apoyo matizado.',
        ),
        q(
          'Is withholding endorsement necessarily opposition?',
          'Não dar apoio explícito é necessariamente oposição?',
          '¿Retener el respaldo implica necesariamente oposición?',
          [
            'Yes, always',
            'No, the text distinguishes them',
            'The proposal was unanimously rejected',
          ],
          [
            'Sim, sempre',
            'Não, o texto distingue as duas coisas',
            'A proposta foi rejeitada por unanimidade',
          ],
          1,
          'El texto distingue no respaldar explícitamente de oponerse. No agregues una conclusión más fuerte que la formulación.',
        ),
      ],
    ),
    read(
      'Compliance is necessary but not sufficient for approval. A proposal may satisfy every formal rule and still fail to demonstrate that its benefits outweigh its risks.',
      'A conformidade é necessária, mas não suficiente para a aprovação. Uma proposta pode cumprir todas as regras formais e ainda assim não demonstrar que seus benefícios superam seus riscos.',
      [
        q(
          'Does compliance guarantee approval?',
          'A conformidade garante a aprovação?',
          '¿El cumplimiento garantiza aprobación?',
          ['Yes', 'No', 'Only when there are no rules'],
          ['Sim', 'Não', 'Só quando não há regras'],
          1,
          'Necesario es un requisito; suficiente sería una garantía bajo el criterio descrito. El texto niega esa suficiencia.',
        ),
        q(
          'What additional issue remains?',
          'Que questão adicional permanece?',
          '¿Qué cuestión adicional queda pendiente?',
          [
            'Whether benefits outweigh risks',
            'Whether formal rules exist',
            'Whether compliance is irrelevant',
          ],
          [
            'Se os benefícios superam os riscos',
            'Se existem regras formais',
            'Se a conformidade é irrelevante',
          ],
          0,
          'Cumplir reglas no resuelve por sí solo la relación entre beneficios y riesgos. Tampoco vuelve irrelevante el cumplimiento.',
        ),
      ],
    ),
    read(
      'A counterexample refutes the universal claim, but it does not establish the opposite universal claim. The conclusion must be narrowed, not simply reversed.',
      'Um contraexemplo refuta a afirmação universal, mas não estabelece a afirmação universal oposta. A conclusão precisa ser restringida, e não simplesmente invertida.',
      [
        q(
          'What follows from the counterexample?',
          'O que decorre do contraexemplo?',
          '¿Qué se desprende del contraejemplo?',
          [
            'The opposite is true in every case',
            'The original universal claim is refuted',
            'Every conclusion is impossible',
          ],
          [
            'O oposto vale em todos os casos',
            'A afirmação universal original é refutada',
            'Toda conclusão é impossível',
          ],
          1,
          'Un caso incompatible refuta la universalidad original; no prueba que el opuesto valga en todos los casos.',
        ),
        q(
          'What revision is recommended?',
          'Que revisão é recomendada?',
          '¿Qué revisión se recomienda?',
          [
            'Narrow the conclusion',
            'Reverse it without qualification',
            'Ignore the counterexample',
          ],
          ['Restringir a conclusão', 'Invertê-la sem ressalvas', 'Ignorar o contraexemplo'],
          0,
          'La revisión adecuada limita el alcance de la conclusión. Invertirla sin más repetiría el salto lógico.',
        ),
      ],
    ),
  ],
};
