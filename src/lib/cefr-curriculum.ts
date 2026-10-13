import type { Question } from './content';
export const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrLevel = (typeof cefrLevels)[number];
export type CourseTask = {
  id: string;
  skill: 'reading' | 'grammar' | 'writing' | 'speaking';
  prompt: string;
  options?: string[];
  answer?: number;
  tip: string;
};
export const cefrCourse: {
  level: CefrLevel;
  name: string;
  canDo: string;
  title: string;
  text: string;
  tasks: CourseTask[];
}[] = [
  {
    level: 'A1',
    name: 'Iniciante',
    canDo: 'Apresentar-se e usar frases simples para necessidades imediatas.',
    title: 'Meu nome, minha cidade',
    text: 'Olá! Meu nome é Jazmín. Eu sou argentina e moro em Buenos Aires. Estudo português. De manhã, tomo café. À tarde, trabalho. Gosto de música e de conversar com meus amigos.',
    tasks: [
      {
        id: 'reading',
        skill: 'reading',
        prompt: 'Onde Jazmín mora?',
        options: ['Em Buenos Aires', 'Em Lisboa', 'No Rio de Janeiro'],
        answer: 0,
        tip: 'Procure a frase que começa com “moro”.',
      },
      {
        id: 'grammar',
        skill: 'grammar',
        prompt: 'Complete: Eu ___ argentina.',
        options: ['sou', 'é', 'são'],
        answer: 0,
        tip: 'Com “eu”, usamos “sou”. Com “ela”, usamos “é”.',
      },
      {
        id: 'writing',
        skill: 'writing',
        prompt: 'Escreva duas frases: seu nome e onde você mora.',
        tip: 'Meu nome é ____. Eu moro em ____.',
      },
      {
        id: 'speaking',
        skill: 'speaking',
        prompt:
          'Diga em voz alta seu nome, sua cidade e algo de que você gosta. Depois anote o que praticou.',
        tip: 'Eu me chamo ____. Moro em ____. Gosto de ____.',
      },
    ],
  },
  {
    level: 'A2',
    name: 'Elementar',
    canDo: 'Trocar informações sobre rotina, compras, trabalho e lugares conhecidos.',
    title: 'Uma compra para o jantar',
    text: 'Ontem, Marina foi ao mercado depois do trabalho. Comprou arroz, feijão e tomates para preparar o jantar. Como os tomates estavam caros, escolheu uma quantidade menor. Hoje, vai cozinhar para uma amiga e precisa passar na padaria para comprar pão.',
    tasks: [
      {
        id: 'reading',
        skill: 'reading',
        prompt: 'Por que Marina comprou menos tomates?',
        options: [
          'Porque estavam caros',
          'Porque não gosta de tomate',
          'Porque a amiga comprou pão',
        ],
        answer: 0,
        tip: 'A palavra “como” apresenta a razão da escolha.',
      },
      {
        id: 'grammar',
        skill: 'grammar',
        prompt: 'Complete: Ontem, Marina ___ ao mercado.',
        options: ['foi', 'vai', 'irá'],
        answer: 0,
        tip: '“Ontem” pede uma ação no passado: foi.',
      },
      {
        id: 'writing',
        skill: 'writing',
        prompt: 'Conte o que você fez ontem e o que vai fazer hoje. Use quatro frases.',
        tip: 'Ontem, eu fui… Hoje, vou…',
      },
      {
        id: 'speaking',
        skill: 'speaking',
        prompt: 'Simule uma compra: pergunte o preço e peça uma quantidade. Anote o que praticou.',
        tip: 'Quanto custa? Eu gostaria de meio quilo, por favor.',
      },
    ],
  },
  {
    level: 'B1',
    name: 'Intermediário',
    canDo: 'Lidar com situações de viagem e contar experiências sobre temas familiares.',
    title: 'Quando a viagem muda',
    text: 'Durante uma viagem a Curitiba, Rafael descobriu que seu ônibus tinha sido cancelado. Primeiro, procurou informações no balcão. A atendente ofereceu uma passagem para o dia seguinte, mas ele precisava chegar naquela noite. Por isso, pediu o reembolso e escolheu outro meio de transporte. Embora tenha gasto mais, conseguiu chegar a tempo do encontro com seus amigos.',
    tasks: [
      {
        id: 'reading',
        skill: 'reading',
        prompt: 'Qual foi o principal motivo para Rafael recusar a nova passagem?',
        options: [
          'Precisava chegar naquela noite',
          'Não queria encontrar os amigos',
          'Preferia viajar no dia seguinte',
        ],
        answer: 0,
        tip: 'Separe o problema, a necessidade e a solução.',
      },
      {
        id: 'grammar',
        skill: 'grammar',
        prompt: 'Complete: Se eu tivesse mais tempo, ___ outra opção.',
        options: ['procuraria', 'procuro', 'procurarei'],
        answer: 0,
        tip: 'Uma situação hipotética combina “se tivesse” com “procuraria”.',
      },
      {
        id: 'writing',
        skill: 'writing',
        prompt:
          'Conte um problema durante uma viagem e como você o resolveu. Use um parágrafo conectado.',
        tip: 'Primeiro… Depois… Por isso… No fim…',
      },
      {
        id: 'speaking',
        skill: 'speaking',
        prompt: 'Explique um problema a uma atendente e negocie uma solução. Anote o que praticou.',
        tip: 'Minha reserva foi cancelada. Você poderia me oferecer outra opção?',
      },
    ],
  },
  {
    level: 'B2',
    name: 'Intermediário alto',
    canDo: 'Compreender argumentos complexos e defender opiniões com clareza.',
    title: 'Trabalhar de qualquer lugar?',
    text: 'O trabalho remoto amplia as possibilidades de contratação e reduz o tempo gasto em deslocamentos. Entretanto, também pode tornar menos nítida a fronteira entre descanso e obrigação. Para alguns profissionais, a flexibilidade favorece a concentração; para outros, a ausência de encontros presenciais dificulta a troca espontânea de ideias. Assim, avaliar essa modalidade exige considerar tanto as condições individuais quanto os objetivos da equipe, em vez de buscar uma resposta válida para todos.',
    tasks: [
      {
        id: 'reading',
        skill: 'reading',
        prompt: 'Qual posição o texto defende?',
        options: [
          'A decisão depende das pessoas e dos objetivos da equipe',
          'O trabalho remoto é sempre melhor',
          'Encontros presenciais são sempre desnecessários',
        ],
        answer: 0,
        tip: 'Observe a conclusão e as concessões feitas às duas perspectivas.',
      },
      {
        id: 'grammar',
        skill: 'grammar',
        prompt: 'Complete: Embora o trabalho remoto ___ vantagens, exige organização.',
        options: ['ofereça', 'oferece', 'ofereceu'],
        answer: 0,
        tip: '“Embora” introduz uma concessão e pede o subjuntivo nesse contexto.',
      },
      {
        id: 'writing',
        skill: 'writing',
        prompt:
          'Defenda sua opinião sobre trabalho remoto, incluindo uma vantagem, uma objeção e uma conclusão.',
        tip: 'Por um lado… Entretanto… Portanto…',
      },
      {
        id: 'speaking',
        skill: 'speaking',
        prompt:
          'Defenda uma opinião e responda a uma objeção sem perder o fio da conversa. Anote o que praticou.',
        tip: 'Entendo esse ponto, mas considero que…',
      },
    ],
  },
  {
    level: 'C1',
    name: 'Avançado',
    canDo: 'Expressar ideias com fluidez e adaptar o discurso a contextos exigentes.',
    title: 'Entre acesso e participação',
    text: 'Disponibilizar informações não equivale, por si só, a democratizar decisões. Um relatório pode estar formalmente acessível e, ainda assim, permanecer distante de quem não domina sua linguagem. A participação efetiva depende também de mediação, tempo para interpretar dados e canais pelos quais dúvidas possam alterar o debate. Essa distinção não diminui a importância da transparência; antes, impede que ela seja tratada como um ponto de chegada quando deveria constituir uma condição para o diálogo.',
    tasks: [
      {
        id: 'reading',
        skill: 'reading',
        prompt: 'Que distinção sustenta o argumento?',
        options: [
          'Acesso formal não garante participação efetiva',
          'Transparência impede o diálogo',
          'Relatórios não devem ser divulgados',
        ],
        answer: 0,
        tip: 'Identifique o pressuposto criticado e a reformulação proposta.',
      },
      {
        id: 'grammar',
        skill: 'grammar',
        prompt: 'Em “antes, impede que ela seja tratada…”, o termo “antes” indica:',
        options: [
          'Retificação do argumento anterior',
          'Um momento anterior no tempo',
          'Uma condição impossível',
        ],
        answer: 0,
        tip: 'Aqui, “antes” equivale a “pelo contrário” ou “na verdade”.',
      },
      {
        id: 'writing',
        skill: 'writing',
        prompt:
          'Escreva uma proposta formal para tornar uma informação pública mais compreensível. Justifique escolhas e antecipe limitações.',
        tip: 'Convém distinguir… À luz disso… Sem desconsiderar…',
      },
      {
        id: 'speaking',
        skill: 'speaking',
        prompt:
          'Explique uma ideia abstrata de modo acessível e reformule-a para um público especializado. Anote o que praticou.',
        tip: 'Em termos simples… Mais precisamente…',
      },
    ],
  },
  {
    level: 'C2',
    name: 'Proficiência',
    canDo: 'Integrar fontes e interpretar nuances, registros e sentidos implícitos.',
    title: 'A delicadeza da discordância',
    text: 'Ao dizer que uma proposta é “interessante”, uma interlocutora pode estar elogiando sua originalidade, adiando um julgamento ou, conforme a entonação e o contexto, sinalizando uma reserva. O domínio de uma língua envolve reconhecer essa margem entre o que se enuncia e o que se negocia na interação. Não se trata de supor que toda fala esconda um sentido oposto, mas de confrontar interpretações com indícios: a sequência da conversa, o registro adotado e as relações entre os participantes. Uma leitura rigorosa preserva a ambiguidade quando os indícios não autorizam resolvê-la.',
    tasks: [
      {
        id: 'reading',
        skill: 'reading',
        prompt: 'Por que uma leitura rigorosa pode preservar a ambiguidade?',
        options: [
          'Porque os indícios podem não sustentar uma interpretação única',
          'Porque toda fala significa o oposto do que diz',
          'Porque a entonação nunca influencia o sentido',
        ],
        answer: 0,
        tip: 'Diferencie possibilidades de interpretação e evidências suficientes.',
      },
      {
        id: 'grammar',
        skill: 'grammar',
        prompt:
          'Qual reformulação preserva o sentido de “não se trata de supor que toda fala esconda um sentido oposto”?',
        options: [
          'A existência de sentidos implícitos não implica inversão sistemática do sentido literal',
          'Toda fala tem necessariamente um sentido contrário',
          'Nenhuma fala permite sentidos implícitos',
        ],
        answer: 0,
        tip: 'Uma paráfrase fiel conserva o alcance da negação e evita generalizações.',
      },
      {
        id: 'writing',
        skill: 'writing',
        prompt:
          'Reescreva uma discordância direta em dois registros — formal e próximo — e explique os efeitos de cada escolha.',
        tip: 'Compare intenção, grau de certeza e relação entre os interlocutores.',
      },
      {
        id: 'speaking',
        skill: 'speaking',
        prompt:
          'Apresente duas interpretações de uma fala ambígua e diga quais indícios favorecem cada uma. Anote o que praticou.',
        tip: 'Uma leitura possível… Contudo, o contexto também permite…',
      },
    ],
  },
];
export const cefrReadings = cefrCourse.map((unit) => ({
  id: `cefr:${unit.level}`,
  title: unit.title,
  topic: 'Dia a dia',
  level: unit.level,
  minutes: unit.level === 'A1' ? 3 : 6,
  intro: unit.canDo,
  paragraphs: [unit.text],
  questions: unit.tasks
    .filter((task) => task.skill === 'reading')
    .map(
      (task) =>
        ({
          id: `cefr:${unit.level}:${task.id}`,
          skill: 'reading',
          band: unit.level,
          prompt: task.prompt,
          options: task.options!,
          answer: task.answer!,
          explanation: task.tip,
        }) as Question,
    ),
}));
export const cefrGrammar: Question[] = cefrCourse.flatMap((unit) =>
  unit.tasks
    .filter((task) => task.skill === 'grammar')
    .map((task) => ({
      id: `cefr:${unit.level}:${task.id}`,
      skill: 'grammar',
      band: unit.level,
      prompt: task.prompt,
      options: task.options!,
      answer: task.answer!,
      explanation: task.tip,
    })),
);

export const cefrA1Words = [
  'nome',
  'casa',
  'água',
  'amigo',
  'livro',
  'noite',
  'comer',
  'beber',
  'morar',
  'falar',
  'bom dia',
  'obrigada',
];
