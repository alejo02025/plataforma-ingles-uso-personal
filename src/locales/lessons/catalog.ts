import { everydayLessons } from '@/locales/learning/everyday-lessons';
import { advancedLessons } from '@/locales/learning/advanced-lessons';
import { verbLessons } from '@/locales/learning/verb-lessons';
import {
  englishFoundationLessons,
  portugueseFoundationLessons,
} from '@/locales/learning/foundation-lessons';
import type { Lesson } from '@/lib/lessons';
// Original micro-lessons. Level labels indicate study focus, not a complete CEFR syllabus.
export const englishClasses: Lesson[] = [
  {
    id: 'en-meet',
    level: 'A1',
    title: 'A little about me',
    goal: 'Introduce yourself and say where you are from.',
    explanation:
      'Para presentarte, usá “I am” o la forma corta “I’m”. El verbo “be” cambia según la persona: I am, you are, he/she is. En inglés, normalmente necesitás nombrar el sujeto: no alcanza con decir “am Alejo”.',
    pattern: 'I am / You are / He is / She is',
    examples: ['I’m Alejo. I’m from Argentina.', 'She is my friend. We are in Buenos Aires.'],
    tip: '“I’m” y “I am” significan lo mismo. No combines las dos formas: “I’m am” repite el verbo.',
    practice: 'Introduce yourself and one person you know.',
    model: 'I’m Alejo. I’m from Argentina. Jazmín is my girlfriend.',
    checks: [
      {
        prompt: 'I ___ from Argentina.',
        options: ['is', 'am', 'are'],
        answer: 1,
        correction: 'I am from Argentina.',
        why: 'El sujeto es “I”, así que corresponde “am”. “Is” se usa con he/she/it y “are” con you/we/they.',
      },
      {
        prompt: 'Jazmín ___ my friend.',
        options: ['am', 'are', 'is'],
        answer: 2,
        correction: 'Jazmín is my friend.',
        why: 'Jazmín es una sola persona y equivale a “she”; por eso se usa “is”.',
      },
    ],
  },
  {
    id: 'en-requests',
    level: 'A1',
    title: 'Coffee, please',
    goal: 'Ask for something politely.',
    explanation:
      '“I’d like” significa “me gustaría” y sirve para pedir algo con cortesía. “A” va antes de un sonido consonántico; “an”, antes de un sonido vocálico. Importa el sonido, no solamente la letra. “Water” suele ser incontable: pedí “some water” o “a glass of water”.',
    pattern: 'I’d like + a/an/some + noun + please',
    examples: ['I’d like a coffee, please.', 'Could I have some water, please?'],
    tip: 'Un café como bebida individual puede ser “a coffee”. Para agua, “a water” puede usarse en algunos pedidos informales, pero “a glass of water” es un modelo claro.',
    practice: 'Order a drink and something to eat.',
    model: 'I’d like a coffee and an orange, please.',
    checks: [
      {
        prompt: 'I’d like ___ orange, please.',
        options: ['a', 'an', 'many'],
        answer: 1,
        correction: 'I’d like an orange, please.',
        why: '“Orange” comienza con sonido vocálico, así que necesita “an”. “Many” se usa con sustantivos plurales.',
      },
      {
        prompt: 'Could I have a glass of ___?',
        options: ['water', 'waters', 'a water'],
        answer: 0,
        correction: 'Could I have a glass of water?',
        why: 'Después de “a glass of”, nombrá la sustancia: “water”, sin otro artículo ni plural en este contexto.',
      },
    ],
  },
  {
    id: 'en-routine',
    level: 'A2',
    title: 'My everyday rhythm',
    goal: 'Describe routines and ask about them.',
    explanation:
      'Para hábitos, usá present simple. Con he/she/it, el verbo afirmativo suele llevar -s: she works. Para negar o preguntar, usá do/does y dejá el verbo principal en su forma base: Does she work? No agregues otra -s después de “does”.',
    pattern: 'She works. / Does she work? / She doesn’t work.',
    examples: ['I study English after work.', 'Does she work on Saturdays?'],
    tip: '“Always”, “usually” y “sometimes” suelen ir antes del verbo principal: “I usually study at night”.',
    practice: 'Write two habits and one question about someone’s routine.',
    model: 'I usually study at night. Jazmín works in the afternoon. Does she study every day?',
    checks: [
      {
        prompt: 'She ___ English every evening.',
        options: ['study', 'studies', 'studying'],
        answer: 1,
        correction: 'She studies English every evening.',
        why: 'Con “she”, el verbo afirmativo cambia. “Study” termina en consonante + y, por eso se transforma en “studies”.',
      },
      {
        prompt: 'Does he ___ here?',
        options: ['works', 'working', 'work'],
        answer: 2,
        correction: 'Does he work here?',
        why: '“Does” ya marca la tercera persona. El verbo principal queda en su forma base: “work”.',
      },
    ],
  },
  {
    id: 'en-past',
    level: 'A2',
    title: 'A story from yesterday',
    goal: 'Tell someone about a finished day.',
    explanation:
      'El past simple describe acciones terminadas. Algunos verbos agregan -ed; otros son irregulares: go → went, take → took. Después de “did” o “didn’t”, usá el verbo base. Una fecha terminada como “yesterday” pide normalmente past simple, no present perfect.',
    pattern: 'I went. / Did you go? / I didn’t go.',
    examples: ['Yesterday I went to a café.', 'I didn’t take the bus. I walked.'],
    tip: 'No marques el pasado dos veces: “didn’t went” debe ser “didn’t go”.',
    practice: 'Tell a short story about yesterday. Include something you did not do.',
    model: 'Yesterday I walked to a café. I had tea. I didn’t take the bus.',
    checks: [
      {
        prompt: 'Yesterday, we ___ to the park.',
        options: ['go', 'have go', 'went'],
        answer: 2,
        correction: 'Yesterday, we went to the park.',
        why: '“Yesterday” señala un pasado terminado. El pasado irregular de “go” es “went”.',
      },
      {
        prompt: 'I didn’t ___ the bus.',
        options: ['took', 'take', 'taken'],
        answer: 1,
        correction: 'I didn’t take the bus.',
        why: '“Didn’t” ya indica pasado; el verbo que le sigue debe ser “take”, no “took”.',
      },
    ],
  },
  {
    id: 'en-experiences',
    level: 'B1',
    title: 'Things I’ve tried',
    goal: 'Talk about experiences and their time.',
    explanation:
      'El present perfect conecta una experiencia con el presente sin dar una fecha terminada: have/has + participio. Si decís cuándo pasó, por ejemplo “in 2023”, cambiá a past simple. “Since” marca el inicio; “for”, la duración.',
    pattern: 'Have you ever…? / I have… / since 2022 / for two years',
    examples: [
      'Have you ever visited Brazil?',
      'I’ve lived here since 2022. I visited Brazil in 2023.',
    ],
    tip: '“Been” puede describir una visita de la que ya volviste. “Gone” suele indicar que la persona fue y aún no regresó.',
    practice: 'Write one experience without a date and one event with a finished date.',
    model: 'I’ve tried Brazilian food. I ate pão de queijo last Saturday.',
    checks: [
      {
        prompt: 'I have lived here ___ 2022.',
        options: ['for', 'since', 'during'],
        answer: 1,
        correction: 'I have lived here since 2022.',
        why: '2022 es el punto de inicio, no una duración; por eso corresponde “since”.',
      },
      {
        prompt: 'Choose the sentence with a finished past date.',
        options: [
          'I have visited Brazil in 2023.',
          'I have visit Brazil in 2023.',
          'I visited Brazil in 2023.',
        ],
        answer: 2,
        correction: 'I visited Brazil in 2023.',
        why: '“In 2023” ubica el evento en un período terminado. El modelo necesita past simple: “visited”.',
      },
    ],
  },
  {
    id: 'en-plans',
    level: 'B1',
    title: 'Plans with a backup',
    goal: 'Discuss a possible plan and its consequence.',
    explanation:
      'El primer condicional sirve para una posibilidad futura: if + presente, will + verbo base. No se usa normalmente “will” en la condición. “If” plantea una condición; “when” da por esperado que ocurra el evento.',
    pattern: 'If + present simple, will + base verb',
    examples: ['If it rains, we’ll stay home.', 'When I get home, I’ll call you.'],
    tip: 'Si la condición va al principio, separala con una coma. Si va al final, normalmente no hace falta.',
    practice: 'Make a weekend plan and a backup plan if the weather changes.',
    model: 'If it is sunny, we’ll go for a walk. If it rains, we’ll cook at home.',
    checks: [
      {
        prompt: 'If it ___, we’ll stay home.',
        options: ['will rain', 'rains', 'raining'],
        answer: 1,
        correction: 'If it rains, we’ll stay home.',
        why: 'La condición futura lleva presente: “rains”. “Will” queda en el resultado, no en esta parte con “if”.',
      },
      {
        prompt: 'If I have time, I ___ you.',
        options: ['will call', 'calling', 'have called'],
        answer: 0,
        correction: 'If I have time, I will call you.',
        why: 'El resultado futuro usa “will” seguido del verbo base “call”.',
      },
    ],
  },
  {
    id: 'en-opinions',
    level: 'B2',
    title: 'A point of view, with reasons',
    goal: 'Explain an opinion and acknowledge a contrast.',
    explanation:
      'Una opinión más clara incluye una razón y reconoce un límite. “Although” introduce una oración completa; “despite” suele ir seguido de un sustantivo o una forma en -ing. No son intercambiables sin cambiar la estructura.',
    pattern: 'Although + clause / Despite + noun or -ing',
    examples: ['Although it was raining, we went out.', 'Despite the rain, we enjoyed the walk.'],
    tip: '“Despite it was raining” mezcla dos estructuras. Usá “although it was raining” o “despite the rain”.',
    practice: 'Give an opinion about learning at home. Add a reason and a limitation.',
    model:
      'Learning at home is convenient because it saves time. Although it can be distracting, a short routine helps.',
    checks: [
      {
        prompt: '___ the noise, I finished reading.',
        options: ['Although', 'Despite', 'Because'],
        answer: 1,
        correction: 'Despite the noise, I finished reading.',
        why: '“The noise” es un grupo nominal, no una oración con verbo. En esta estructura corresponde “despite”.',
      },
      {
        prompt: '___ it was difficult, she kept practising.',
        options: ['Despite', 'Because of', 'Although'],
        answer: 2,
        correction: 'Although it was difficult, she kept practising.',
        why: '“It was difficult” es una oración completa; “although” introduce el contraste entre la dificultad y seguir practicando.',
      },
    ],
  },
  {
    id: 'en-questions',
    level: 'B2',
    title: 'Could you tell me…?',
    goal: 'Ask indirect questions naturally.',
    explanation:
      'Una pregunta indirecta puede sonar más cortés. Después de “Could you tell me…”, mantené el orden de una afirmación: sujeto + verbo. Para una pregunta de sí/no, usá “if” o “whether”. La inversión queda en “Could you”, no se repite dentro de la pregunta.',
    pattern: 'Could you tell me + question word + subject + verb?',
    examples: ['Could you tell me where the station is?', 'Do you know if the café is open?'],
    tip: 'Compará “Where is the station?” con “Could you tell me where the station is?”.',
    practice: 'Ask politely where a place is and whether it is open.',
    model: 'Could you tell me where the museum is? Do you know if it is open today?',
    checks: [
      {
        prompt: 'Could you tell me ___?',
        options: ['where is the station', 'where the station is', 'where does the station is'],
        answer: 1,
        correction: 'Could you tell me where the station is?',
        why: 'Dentro de la pregunta indirecta, el sujeto “the station” va antes del verbo “is”.',
      },
      {
        prompt: 'Do you know ___ the café is open?',
        options: ['if', 'what', 'where'],
        answer: 0,
        correction: 'Do you know if the café is open?',
        why: 'La pregunta busca una respuesta de sí/no. “If” introduce esa pregunta indirecta.',
      },
    ],
  },
  {
    id: 'en-nuance',
    skill: 'reading',
    level: 'C1',
    title: 'Evidence, without overclaiming',
    goal: 'Match the strength of a claim to the evidence.',
    explanation:
      'El lenguaje matizado distingue indicios de pruebas definitivas. “May”, “suggests” y “appears to” permiten expresar incertidumbre. No conviertas una asociación en una causa comprobada. Después de un modal como “may”, usá verbo base.',
    pattern: 'The evidence suggests… / This may indicate…',
    examples: [
      'The small study suggests a possible benefit.',
      'This may indicate a pattern, but further evidence is needed.',
    ],
    tip: 'Matizar no significa ser impreciso: explicá qué sabés, qué inferís y qué falta comprobar.',
    practice: 'Describe a possible benefit of a habit without claiming that it works for everyone.',
    model:
      'A short daily routine may help some learners stay consistent, although individual results can vary.',
    checks: [
      {
        prompt: 'Choose a claim appropriate for a small observational study.',
        options: [
          'This proves that the habit works for everyone.',
          'The findings suggest a possible benefit, but do not establish causation.',
          'The results guarantee success.',
        ],
        answer: 1,
        correction: 'The findings suggest a possible benefit, but do not establish causation.',
        why: 'Una observación pequeña puede sugerir un beneficio, pero no prueba una causa ni garantiza resultados universales.',
      },
      {
        prompt: 'This may ___ a pattern.',
        options: ['indicates', 'indicating', 'indicate'],
        answer: 2,
        correction: 'This may indicate a pattern.',
        why: 'Después del modal “may”, se usa el verbo base “indicate”, sin -s ni -ing.',
      },
    ],
  },
  {
    id: 'en-paraphrase',
    skill: 'reading',
    level: 'C2',
    title: 'The meaning between the lines',
    goal: 'Paraphrase without changing scope or certainty.',
    explanation:
      'Una paráfrasis fiel conserva quién afirma algo, con qué certeza y a cuántos casos se refiere. “Not all” no significa “none”. Tampoco “might” equivale a “will”. La elegancia no compensa un cambio de significado.',
    pattern: 'Not all ≠ none / might ≠ will / some ≠ all',
    examples: [
      'Not all proposals were rejected.',
      'The change might help, but its effect is uncertain.',
    ],
    tip: 'Antes de reformular, comprobá negación, cantidad, tiempo y grado de certeza.',
    practice: 'Paraphrase: “The change might benefit some users, but not all.” Keep its limits.',
    model:
      'Some users may benefit from the change, although the benefit is not expected to be universal.',
    checks: [
      {
        prompt: 'Which paraphrase preserves “Not all proposals were rejected”?',
        options: [
          'Every proposal was rejected.',
          'At least one proposal was not rejected.',
          'No proposal was rejected.',
        ],
        answer: 1,
        correction: 'At least one proposal was not rejected.',
        why: '“Not all” niega que se rechazaran todas. Permite afirmar que al menos una no fue rechazada, pero no que ninguna lo fuera.',
      },
      {
        prompt: 'Which sentence preserves uncertainty in “The change might help”?',
        options: [
          'The change will certainly help.',
          'The change cannot help.',
          'The change may help.',
        ],
        answer: 2,
        correction: 'The change may help.',
        why: '“May” conserva la posibilidad. “Will certainly” agrega una certeza que el original no tiene; “cannot” la niega.',
      },
    ],
  },
];
export const portugueseClasses: Lesson[] = [
  {
    id: 'pt-meet',
    level: 'A1',
    title: 'Meu nome, minha história',
    goal: 'Apresentar-se e dizer de onde você é.',
    explanation:
      'Para presentarte, usá “Meu nome é…” o “Eu me chamo…”. El verbo “ser” cambia: eu sou, você/ela é, nós somos. Se usa para identidad y origen; “estar” suele describir estados o ubicación. En Brasil es muy habitual usar “você”.',
    pattern: 'Eu sou / Você é / Ela é / Nós somos',
    examples: [
      'Meu nome é Jazmín. Eu sou argentina.',
      'Eu moro em Buenos Aires e estudo português.',
    ],
    tip: 'Aunque “eu” puede omitirse en portugués, al empezar ayuda a ver qué forma del verbo corresponde.',
    practice: 'Apresente-se e diga onde você mora.',
    model: 'Meu nome é Jazmín. Eu sou argentina e moro em Buenos Aires.',
    checks: [
      {
        prompt: 'Eu ___ argentina.',
        options: ['é', 'sou', 'são'],
        answer: 1,
        correction: 'Eu sou argentina.',
        why: 'Con “eu” se usa “sou”. “É” corresponde a você/ele/ela y “são” a eles/elas/vocês.',
      },
      {
        prompt: 'Meu nome ___ Jazmín.',
        options: ['sou', 'são', 'é'],
        answer: 2,
        correction: 'Meu nome é Jazmín.',
        why: 'El sujeto es “meu nome”, singular y equivalente a “ele”; por eso corresponde “é”.',
      },
    ],
  },
  {
    id: 'pt-requests',
    level: 'A1',
    title: 'Um café, por favor',
    goal: 'Pedir uma bebida e agradecer.',
    explanation:
      '“Eu quero…” es directo; “Eu gostaria de…” expresa un pedido más cortés. El artículo debe concordar con la palabra: um café, uma água. Para agradecer, la forma tradicional depende de quien habla: una mujer dice “obrigada” y un hombre “obrigado”.',
    pattern: 'Eu gostaria de + um/uma + pedido, por favor',
    examples: ['Eu gostaria de um café, por favor.', 'Obrigada pela ajuda!'],
    tip: '“Gostaria de” necesita “de” antes del pedido. “Por favor” ayuda a expresar cortesía en una situación cotidiana.',
    practice: 'Peça uma bebida e agradeça.',
    model: 'Eu gostaria de uma água, por favor. Obrigada!',
    checks: [
      {
        prompt: 'Eu gostaria ___ um café.',
        options: ['de', 'em', 'por'],
        answer: 0,
        correction: 'Eu gostaria de um café.',
        why: 'La expresión “gostaria de” lleva la preposición “de” para introducir lo que pedís.',
      },
      {
        prompt: 'Jazmín agradece: “___ pela ajuda!”',
        options: ['Bom dia', 'Obrigada', 'Com licença'],
        answer: 1,
        correction: 'Obrigada pela ajuda!',
        why: 'Para agradecer, Jazmín usa “obrigada”. “Bom dia” saluda y “com licença” pide permiso.',
      },
    ],
  },
  {
    id: 'pt-routine',
    level: 'A2',
    title: 'Meu dia a dia',
    goal: 'Descrever hábitos e preferências.',
    explanation:
      'Para hábitos, usá presente: eu estudo, você estuda, nós estudamos. En portugués brasileño, “você” lleva la forma verbal de tercera persona, aunque se refiera a la persona con quien hablás. “Gostar” necesita “de”: gosto de música, gosto de estudar.',
    pattern: 'Eu estudo / Você estuda / Nós estudamos / gostar de',
    examples: ['Eu estudo português à noite.', 'Você gosta de ler? Nós gostamos de música.'],
    tip: 'No copies “tú estudias” del español como “você estudas”: con “você” corresponde “estuda”.',
    practice: 'Conte dois hábitos e algo de que você gosta.',
    model: 'Eu trabalho de tarde e estudo à noite. Gosto de ler.',
    checks: [
      {
        prompt: 'Você ___ português todos os dias.',
        options: ['estudas', 'estuda', 'estudo'],
        answer: 1,
        correction: 'Você estuda português todos os dias.',
        why: '“Você” usa tercera persona: “estuda”. “Estudas” corresponde a “tu” en la conjugación tradicional y “estudo” a “eu”.',
      },
      {
        prompt: 'Eu gosto ___ ler.',
        options: ['de', 'em', 'para'],
        answer: 0,
        correction: 'Eu gosto de ler.',
        why: 'El verbo “gostar” requiere “de”, incluso cuando después viene otro verbo.',
      },
    ],
  },
  {
    id: 'pt-past',
    level: 'A2',
    title: 'O que fiz ontem',
    goal: 'Contar ações concluídas no passado.',
    explanation:
      'Para un día terminado, usá pretérito perfeito: eu trabalhei, eu comi, eu fui. “Ir” y “ser” comparten algunas formas pasadas, como “fui”; el contexto indica el sentido. “Foi” corresponde a você/ele/ela, no a “eu”.',
    pattern: 'Eu fui / Você foi / Eu comprei / Nós compramos',
    examples: ['Ontem, eu fui ao mercado.', 'Ela comprou pão e voltou para casa.'],
    tip: '“Eu fui” puede ser “yo fui” a un lugar o “yo fui” una cosa/persona. Observá qué viene después del verbo.',
    practice: 'Conte três coisas que você fez ontem.',
    model: 'Ontem, eu fui ao mercado. Comprei frutas e voltei para casa.',
    checks: [
      {
        prompt: 'Ontem, eu ___ ao mercado.',
        options: ['vou', 'foi', 'fui'],
        answer: 2,
        correction: 'Ontem, eu fui ao mercado.',
        why: '“Ontem” sitúa la acción en el pasado. Con “eu”, el pretérito de “ir” es “fui”.',
      },
      {
        prompt: 'Ela ___ pão ontem.',
        options: ['comprei', 'comprou', 'compraram'],
        answer: 1,
        correction: 'Ela comprou pão ontem.',
        why: 'Con “ela”, el pasado de “comprar” es “comprou”; “comprei” corresponde a “eu” y “compraram” a sujetos plurales.',
      },
    ],
  },
  {
    id: 'pt-stories',
    level: 'B1',
    title: 'Uma história com contexto',
    goal: 'Distinguir uma ação pontual de um hábito passado.',
    explanation:
      'El pretérito perfeito presenta una acción concluida: comprei, cheguei. El imperfeito aporta el fondo, un hábito o un estado pasado: morava, fazia, estava. Para contar una historia, podés combinar lo que estaba pasando con el evento que ocurrió.',
    pattern: 'Eu morava… / Um dia, aconteceu…',
    examples: [
      'Quando eu era criança, morava perto de uma praça.',
      'Eu estava em casa quando minha amiga chegou.',
    ],
    tip: '“Morava” no significa por sí solo que la situación se interrumpió. Es el contexto de la historia el que aporta ese límite.',
    practice: 'Conte um hábito da infância e um acontecimento específico.',
    model: 'Quando eu era criança, brincava na praça. Um dia, conheci uma nova amiga.',
    checks: [
      {
        prompt: 'Quando eu era criança, ___ na praça todos os dias.',
        options: ['brincava', 'brinco', 'brincarei'],
        answer: 0,
        correction: 'Quando eu era criança, brincava na praça todos os dias.',
        why: 'La frase describe un hábito repetido en la infancia, así que corresponde el imperfeito “brincava”.',
      },
      {
        prompt: 'Ontem, minha amiga ___ às oito.',
        options: ['chegará', 'chega', 'chegou'],
        answer: 2,
        correction: 'Ontem, minha amiga chegou às oito.',
        why: 'Se trata de una llegada concreta y concluida, con día y hora: “chegou”, en pretérito perfeito.',
      },
    ],
  },
  {
    id: 'pt-possibilities',
    level: 'B1',
    title: 'Se eu tivesse mais tempo…',
    goal: 'Expressar uma situação hipotética e seu resultado.',
    explanation:
      'Para una situación hipotética, combiná “se” con imperfeito do subjuntivo y un resultado en futuro do pretérito: se eu tivesse, eu estudaria. No es lo mismo que una posibilidad futura concreta como “se eu tiver tempo, vou estudar”.',
    pattern: 'Se eu tivesse…, eu faria…',
    examples: [
      'Se eu tivesse mais tempo, estudaria todos os dias.',
      'Se eu tiver tempo amanhã, vou estudar.',
    ],
    tip: '“Tivesse” imagina una condición; “tiver” plantea una posibilidad futura. Elegí según lo que querés expresar.',
    practice: 'Imagine como usaria uma hora livre extra.',
    model: 'Se eu tivesse uma hora livre, leria um livro e praticaria português.',
    checks: [
      {
        prompt: 'Se eu ___ mais tempo, estudaria todos os dias.',
        options: ['tenho', 'tivesse', 'tive'],
        answer: 1,
        correction: 'Se eu tivesse mais tempo, estudaria todos os dias.',
        why: 'El resultado “estudaria” plantea una situación hipotética; la condición usa “tivesse”, no presente ni pasado concluido.',
      },
      {
        prompt: 'Se eu tivesse uma hora livre, ___ um livro.',
        options: ['lerei', 'li', 'leria'],
        answer: 2,
        correction: 'Se eu tivesse uma hora livre, leria um livro.',
        why: 'Con la condición hipotética “se eu tivesse”, el resultado del modelo es “leria”, en futuro do pretérito.',
      },
    ],
  },
  {
    id: 'pt-opinions',
    level: 'B2',
    title: 'Opiniões com espaço para o outro',
    goal: 'Apresentar argumentos e reconhecer uma concessão.',
    explanation:
      'Para argumentar, podés reconocer una dificultad sin abandonar tu idea. “Embora” introduce una concesión y en este modelo lleva subjuntivo: embora seja. “Apesar de” puede introducir un sustantivo: apesar da dificuldade. Cambiar el conector exige revisar la estructura.',
    pattern: 'Embora + subjuntivo / Apesar de + nome',
    examples: [
      'Embora seja difícil, vale a pena praticar.',
      'Apesar da dificuldade, ela continuou estudando.',
    ],
    tip: '“Apesar da” combina “de” con el artículo “a”. No necesita repetir otro artículo delante del mismo sustantivo.',
    practice: 'Defenda uma ideia sobre estudar em casa e reconheça uma dificuldade.',
    model: 'Estudar em casa economiza tempo. Embora haja distrações, uma rotina curta pode ajudar.',
    checks: [
      {
        prompt: 'Embora ___ difícil, vale a pena praticar.',
        options: ['é', 'seja', 'ser'],
        answer: 1,
        correction: 'Embora seja difícil, vale a pena praticar.',
        why: 'En esta concesión con “embora”, el verbo va en subjuntivo: “seja”. “É” es indicativo y “ser” es infinitivo.',
      },
      {
        prompt: '___ dificuldade, ela continuou.',
        options: ['Apesar da', 'Embora a', 'Mesmo que a'],
        answer: 0,
        correction: 'Apesar da dificuldade, ela continuou.',
        why: '“Dificuldade” es un sustantivo. “Apesar da” introduce ese grupo; las otras opciones necesitan una oración con verbo.',
      },
    ],
  },
  {
    id: 'pt-requests-b2',
    level: 'B2',
    title: 'Pedidos que abrem uma conversa',
    goal: 'Fazer pedidos claros e adequados à situação.',
    explanation:
      '“Você poderia…?” expresa un pedido cortés. Después de “poderia”, el verbo que indica la acción va en infinitivo: poderia explicar. En una conversación brasileña, “me explicar” es muy habitual; en un registro formal también aparece “explicar-me”. El contexto importa más que corregir una variante aceptada sin motivo.',
    pattern: 'Você poderia + infinitivo…?',
    examples: [
      'Você poderia me explicar esse detalhe?',
      'Será que você pode enviar o arquivo hoje?',
    ],
    tip: 'Para pedir una aclaración, especificá qué parte no entendiste. Un pedido concreto facilita una respuesta útil.',
    practice: 'Peça uma explicação e um prazo de entrega de maneira educada.',
    model: 'Você poderia me explicar essa parte? Será que você pode enviar o arquivo até amanhã?',
    checks: [
      {
        prompt: 'Você poderia me ___ esse detalhe?',
        options: ['explicou', 'explica', 'explicar'],
        answer: 2,
        correction: 'Você poderia me explicar esse detalhe?',
        why: 'Después de “poderia”, la acción queda en infinitivo: “explicar”. Las otras formas son verbos conjugados.',
      },
      {
        prompt: 'Escolha um pedido claro e educado de explicação.',
        options: [
          'Você poderia me explicar essa parte?',
          'Essa parte existe.',
          'Você explicou essa parte ontem.',
        ],
        answer: 0,
        correction: 'Você poderia me explicar essa parte?',
        why: 'La primera opción solicita una explicación. Las otras solamente describen un hecho o una acción pasada.',
      },
    ],
  },
  {
    id: 'pt-nuance',
    skill: 'reading',
    level: 'C1',
    title: 'Precisão sem exagero',
    goal: 'Distinguir evidência, hipótese e certeza.',
    explanation:
      '“Os dados sugerem” y “pode indicar” permiten expresar una inferencia sin presentarla como certeza. Una correlación no demuestra por sí sola una relación causal. Cuando “antes” aparece en un contraste como “não é…, antes…”, puede significar “por el contrario” y no un momento previo.',
    pattern: 'Os dados sugerem… / Isso pode indicar… / Não é…, antes…',
    examples: [
      'Os dados sugerem uma tendência, mas não demonstram uma causa.',
      'Não é uma falha individual; antes, é um problema de organização.',
    ],
    tip: 'La precisión consiste en ajustar la fuerza de la afirmación a lo que permite la evidencia, sin esconder lo que todavía no sabés.',
    practice: 'Descreva um possível benefício de um hábito sem garantir resultados universais.',
    model:
      'Uma rotina curta pode ajudar alguns estudantes, mas os resultados variam conforme o contexto.',
    checks: [
      {
        prompt: 'Uma amostra pequena permite afirmar com cautela:',
        options: [
          'O método garante sucesso para todos.',
          'Os dados sugerem um possível benefício.',
          'A causa está definitivamente comprovada.',
        ],
        answer: 1,
        correction: 'Os dados sugerem um possível benefício.',
        why: 'Una muestra pequeña puede sugerir un beneficio; no permite garantizar éxito universal ni demostrar una causa por sí sola.',
      },
      {
        prompt: 'Em “não é um atraso; antes, é uma mudança”, “antes” significa:',
        options: ['em um momento anterior', 'antes de ontem', 'pelo contrário'],
        answer: 2,
        correction: 'Antes, nesse contexto, significa “pelo contrário”.',
        why: 'La oración contrapone dos interpretaciones. “Antes” reformula la primera; no sitúa algo en el tiempo.',
      },
    ],
  },
  {
    id: 'pt-paraphrase',
    skill: 'reading',
    level: 'C2',
    title: 'O sentido que a frase preserva',
    goal: 'Reformular sem mudar a negação nem o grau de certeza.',
    explanation:
      'Una paráfrasis fiel mantiene el alcance de la negación, la cantidad y la certeza. “Nem todos” no equivale a “nenhum”. “Talvez” expresa una posibilidad, no una garantía. Elegí palabras más claras sin agregar conclusiones que el original no permite.',
    pattern: 'Nem todos ≠ nenhum / talvez ≠ certamente',
    examples: [
      'Nem todas as propostas foram rejeitadas.',
      'A mudança talvez ajude alguns usuários.',
    ],
    tip: 'Antes de reformular, preguntate qué casos incluye la frase y qué casos deja abiertos.',
    practice: 'Reformule: “A mudança talvez beneficie alguns usuários, mas não todos.”',
    model: 'Alguns usuários podem se beneficiar da mudança, embora o benefício não seja universal.',
    checks: [
      {
        prompt: 'Qual paráfrase preserva “Nem todas as propostas foram rejeitadas”?',
        options: [
          'Todas foram rejeitadas.',
          'Pelo menos uma proposta não foi rejeitada.',
          'Nenhuma foi rejeitada.',
        ],
        answer: 1,
        correction: 'Pelo menos uma proposta não foi rejeitada.',
        why: '“Nem todas” niega que se hayan rechazado todas. No permite concluir que ninguna haya sido rechazada.',
      },
      {
        prompt: 'Qual opção preserva “A mudança talvez ajude”?',
        options: [
          'A mudança pode ajudar.',
          'A mudança certamente ajudará.',
          'A mudança não pode ajudar.',
        ],
        answer: 0,
        correction: 'A mudança pode ajudar.',
        why: '“Pode ajudar” conserva la posibilidad. “Certamente” agrega certeza y “não pode” elimina la posibilidad del original.',
      },
    ],
  },
];

englishClasses.push(...englishFoundationLessons);
portugueseClasses.push(...portugueseFoundationLessons);

englishClasses.push(...verbLessons(false));
portugueseClasses.push(...verbLessons(true));

englishClasses.push(...advancedLessons(false));
portugueseClasses.push(...advancedLessons(true));

englishClasses.push(...everydayLessons(false));
portugueseClasses.push(...everydayLessons(true));
