import { cefrGrammar } from '@/lib/cefr-curriculum';
export type Skill = 'reading' | 'grammar' | 'vocabulary' | 'writing';
export type Question = {
  id: string;
  skill: Skill;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  explanationLanguage?: 'es';
  band: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'unrated';
};

export const diagnosticQuestions: Question[] = [
  {
    id: 'd-a1-g',
    skill: 'grammar',
    band: 'A1',
    prompt: 'Eu ___ Jazmín.',
    options: ['é', 'sou', 'são'],
    answer: 1,
    explanation: 'Com o pronome “eu”, usamos “sou” como forma do verbo “ser”.',
  },
  {
    id: 'd-a1-v',
    skill: 'vocabulary',
    band: 'A1',
    prompt: 'Onde você compra pão?',
    options: ['Na padaria', 'No banco', 'No hospital'],
    answer: 0,
    explanation: 'Uma padaria é um estabelecimento onde compramos pão.',
  },
  {
    id: 'd-a1-r',
    skill: 'reading',
    band: 'A1',
    prompt: '“Ana estuda de manhã e trabalha à tarde.” Quando ela estuda?',
    options: ['À noite', 'À tarde', 'De manhã'],
    answer: 2,
    explanation: 'O texto informa que Ana estuda de manhã.',
  },
  {
    id: 'd1',
    skill: 'grammar',
    band: 'A2',
    prompt: 'Ontem, eu ___ ao museu.',
    options: ['vou', 'fui', 'irei'],
    answer: 1,
    explanation: 'Ontem indica uma ação concluída no passado: fui.',
  },
  {
    id: 'd2',
    skill: 'vocabulary',
    band: 'A2',
    prompt: 'Depois de pagar uma compra, você recebe um recibo. O que é isso?',
    options: ['um comprovante de pagamento', 'um horário de viagem', 'um pedido de desconto'],
    answer: 0,
    explanation: 'O recibo comprova que o pagamento foi feito.',
  },
  {
    id: 'd3',
    skill: 'reading',
    band: 'A2',
    prompt: '“O museu fecha às seis, mas a última entrada é às cinco.” Você pode entrar às 17h30?',
    options: [
      'Sim, porque ainda está aberto',
      'Não, a entrada termina às cinco',
      'Só aos domingos',
    ],
    answer: 1,
    explanation: 'O horário de entrada é diferente do horário de fechamento.',
  },
  {
    id: 'd4',
    skill: 'grammar',
    band: 'B1',
    prompt: 'Ela ___ em Salvador desde 2022.',
    options: ['mora', 'morou', 'morará'],
    answer: 0,
    explanation: 'Desde apresenta o início de uma situação que continua no presente: mora.',
  },
  {
    id: 'd5',
    skill: 'vocabulary',
    band: 'B1',
    prompt: '“Precisamos economizar nas compras.” Economizar significa…',
    options: ['gastar mais', 'reduzir os gastos', 'cancelar todas as compras para sempre'],
    answer: 1,
    explanation: 'Economizar significa gastar menos ou guardar dinheiro.',
  },
  {
    id: 'd6',
    skill: 'reading',
    band: 'B1',
    prompt: '“Embora o ônibus tenha atrasado, chegamos a tempo para a reunião.” O que aconteceu?',
    options: ['Perderam a reunião', 'A reunião foi cancelada', 'Chegaram no horário da reunião'],
    answer: 2,
    explanation: 'Embora introduz uma dificuldade que não impediu a chegada a tempo.',
  },
  {
    id: 'd7',
    skill: 'grammar',
    band: 'B2',
    prompt: 'Se eu soubesse do atraso, ___ outro caminho.',
    options: ['escolherei', 'teria escolhido', 'escolho'],
    answer: 1,
    explanation:
      'A condição hipotética no passado pede uma alternativa que não aconteceu: teria escolhido.',
  },
  {
    id: 'd8',
    skill: 'vocabulary',
    band: 'B2',
    prompt: '“A medida pode comprometer a confiança da equipe.” Comprometer significa…',
    options: ['prejudicar ou enfraquecer', 'anunciar publicamente', 'medir com precisão'],
    answer: 0,
    explanation: 'Comprometer a confiança significa prejudicá-la.',
  },
  {
    id: 'd9',
    skill: 'reading',
    band: 'B2',
    prompt: '“Os resultados são animadores, mas a amostra pequena pede cautela.” A autora sugere…',
    options: [
      'descartar os resultados',
      'buscar mais evidências antes de concluir',
      'considerar a hipótese comprovada',
    ],
    answer: 1,
    explanation: 'Os resultados são positivos, mas a amostra limita as conclusões.',
  },
];
for (const question of diagnosticQuestions) question.options.push('Ainda não sei.');

export const grammarQuestions: Question[] = [
  {
    id: 'g1',
    skill: 'grammar',
    band: 'A2',
    prompt: 'Você já ___ ao Brasil?',
    options: ['foi', 'vai', 'irá'],
    answer: 0,
    explanation: 'Já foi pergunta sobre uma experiência anterior.',
  },
  {
    id: 'g2',
    skill: 'grammar',
    band: 'A2',
    prompt: 'Qual frase combina melhor com uma rotina?',
    options: [
      'Eu vou ao trabalho de ônibus.',
      'Eu vou no trabalho por ônibus.',
      'Eu vou para trabalho em ônibus.',
    ],
    answer: 0,
    explanation: 'Ao trabalho e de ônibus são combinações naturais nessa frase.',
  },
  {
    id: 'g3',
    skill: 'grammar',
    band: 'B1',
    prompt: 'Trabalho neste projeto ___ dois meses.',
    options: ['há', 'a', 'em'],
    answer: 0,
    explanation: 'Há indica um período de tempo que já passou e continua até agora.',
  },
  {
    id: 'g4',
    skill: 'grammar',
    band: 'B1',
    prompt: 'Se o preço cair, nós ___ mais.',
    options: ['vamos comprar', 'compraríamos', 'tínhamos comprado'],
    answer: 0,
    explanation:
      'Uma possibilidade futura pode usar se com o futuro do subjuntivo e vamos comprar.',
  },
  {
    id: 'g5',
    skill: 'grammar',
    band: 'B1',
    prompt: 'Quando você puder, ___ uma mensagem.',
    options: ['me envie', 'me enviou', 'me enviaremos'],
    answer: 0,
    explanation: 'Me envie expressa um pedido educado dirigido a você.',
  },
];
export const readings: {
  id: string;
  title: string;
  topic: string;
  level: string;
  minutes: number;
  intro: string;
  paragraphs: string[];
  questions: Question[];
}[] = [
  {
    id: 'city',
    title: 'Uma cidade descoberta a pé',
    topic: 'Viagens',
    level: 'A2',
    minutes: 6,
    intro: 'Um passeio sem pressa muda a maneira de conhecer uma cidade.',
    paragraphs: [
      'Na minha primeira manhã em Salvador, guardei o celular na bolsa e saí para caminhar. Não tinha um plano. As ruas eram estreitas e as lojas começavam a abrir. Na esquina, uma senhora perguntou se eu queria um café. Sentei do lado de fora e observei a cidade acordar.',
      'Mais adiante, encontrei uma livraria com a porta aberta. A dona contou que o prédio tinha mais de cem anos. Ela também mostrou um pequeno mapa da vizinhança. Havia lugares que não apareciam no meu guia de viagem.',
      'Depois, achei um jardim tranquilo perto do mar. Fiquei ali por uma hora. Não visitei muitos lugares famosos naquele dia, mas aprendi algo útil: uma boa viagem nem sempre precisa de uma lista enorme. Às vezes, basta tempo e um pouco de curiosidade.',
    ],
    questions: [
      {
        id: 'city1',
        skill: 'reading',
        band: 'A2',
        prompt: 'O que ajudou a viajante a conhecer lugares fora do guia?',
        options: [
          'Um mapa mostrado pela dona da livraria',
          'Uma lista de pontos famosos',
          'Um aplicativo de ônibus',
        ],
        answer: 0,
        explanation: 'A dona da livraria mostrou um mapa com outros lugares.',
      },
      {
        id: 'city2',
        skill: 'reading',
        band: 'A2',
        prompt: 'Qual foi a principal descoberta da viajante?',
        options: [
          'Uma viagem precisa de muitos passeios',
          'É melhor visitar só lugares famosos',
          'Tempo e curiosidade também fazem uma boa viagem',
        ],
        answer: 2,
        explanation: 'O último parágrafo valoriza o tempo e a curiosidade.',
      },
    ],
  },
  {
    id: 'money',
    title: 'Pequenas escolhas, mais tranquilidade',
    topic: 'Finanças',
    level: 'B1',
    minutes: 6,
    intro: 'Organizar o dinheiro começa com decisões possíveis.',
    paragraphs: [
      'Lia queria organizar suas finanças, mas achava que precisava de um salário maior para começar. Uma amiga sugeriu anotar os gastos durante uma semana. Lia percebeu que pequenas compras repetidas faziam diferença no fim do mês.',
      'Em vez de cortar tudo, escolheu duas mudanças: preparar café em casa alguns dias e comparar as taxas da sua conta bancária. Guardou o valor que economizou em uma reserva para imprevistos. O objetivo não era ficar rica de uma hora para outra, mas ganhar tranquilidade.',
      'Depois de três meses, uma despesa inesperada apareceu. Lia usou parte da reserva sem precisar pedir dinheiro emprestado. Entendeu que um orçamento não serve apenas para limitar gastos: ele também ajuda a escolher o que realmente importa.',
    ],
    questions: [
      {
        id: 'money1',
        skill: 'reading',
        band: 'B1',
        prompt: 'Qual foi o primeiro passo de Lia?',
        options: [
          'Anotar os gastos por uma semana',
          'Pedir um empréstimo',
          'Cancelar todas as compras',
        ],
        answer: 0,
        explanation: 'Ela começou observando seus gastos durante uma semana.',
      },
      {
        id: 'money2',
        skill: 'reading',
        band: 'B1',
        prompt: 'Para que serviu a reserva?',
        options: [
          'Para comprar uma viagem de luxo',
          'Para pagar uma despesa inesperada',
          'Para aumentar as taxas bancárias',
        ],
        answer: 1,
        explanation: 'A reserva ajudou Lia a pagar um imprevisto.',
      },
    ],
  },
  {
    id: 'time',
    title: 'O tempo de cada lugar',
    topic: 'História',
    level: 'B1',
    minutes: 6,
    intro: 'Os horários que usamos hoje também têm uma história.',
    paragraphs: [
      'Antes da expansão das ferrovias, muitas cidades ajustavam seus relógios pela posição do sol. O meio-dia de um lugar não era exatamente igual ao de outro. Para a vida local, essa diferença pequena não costumava causar problemas.',
      'Quando os trens começaram a ligar cidades distantes, os horários diferentes dificultaram o planejamento das viagens. Funcionários e passageiros precisavam de uma referência compartilhada. Por isso, as empresas passaram a coordenar os horários de suas linhas.',
      'Com o tempo, os fusos horários se tornaram uma maneira de organizar essa referência. Hoje parecem naturais, mas resultaram de escolhas e necessidades históricas. Até um hábito comum, como conferir a hora de uma reunião, carrega uma história.',
    ],
    questions: [
      {
        id: 'time1',
        skill: 'reading',
        band: 'B1',
        prompt: 'Por que as ferrovias precisavam de horários coordenados?',
        options: [
          'Para planejar viagens entre cidades',
          'Para mudar a posição do sol',
          'Para diminuir o tamanho dos relógios',
        ],
        answer: 0,
        explanation: 'Os trens ligavam cidades com horários locais diferentes.',
      },
      {
        id: 'time2',
        skill: 'reading',
        band: 'B1',
        prompt: 'O texto mostra que os fusos horários…',
        options: [
          'sempre existiram da mesma forma',
          'foram criados por necessidades históricas',
          'são iguais em todos os lugares',
        ],
        answer: 1,
        explanation: 'O último parágrafo explica que os fusos resultaram de escolhas históricas.',
      },
    ],
  },
  {
    id: 'tech',
    title: 'Uma ferramenta, muitas perguntas',
    topic: 'Tecnologia',
    level: 'B1',
    minutes: 6,
    intro: 'Usar tecnologia também é aprender a fazer boas perguntas.',
    paragraphs: [
      'Camila encontrou um aplicativo que prometia resumir textos em segundos. Testou a ferramenta com um artigo conhecido e percebeu que o resumo parecia claro. Mesmo assim, decidiu compará-lo com o texto original antes de compartilhar.',
      'A comparação mostrou que uma informação importante tinha ficado de fora. A ferramenta também apresentou uma suposição como se fosse um fato. Camila corrigiu esses pontos e anotou perguntas para as próximas vezes: qual é a fonte, o que está faltando e o que precisa ser confirmado?',
      'O aplicativo continuou sendo útil para começar a leitura. A diferença foi a maneira de usá-lo. Camila entendeu que uma resposta rápida pode ajudar, mas não substitui atenção e critério. Quanto melhor a pergunta, mais útil pode ser a ferramenta.',
    ],
    questions: [
      {
        id: 'tech1',
        skill: 'reading',
        band: 'B1',
        prompt: 'O que Camila fez antes de compartilhar o resumo?',
        options: [
          'Comparou com o texto original',
          'Apagou o artigo',
          'Confiou apenas no aplicativo',
        ],
        answer: 0,
        explanation: 'Ela conferiu o resumo no texto original.',
      },
      {
        id: 'tech2',
        skill: 'reading',
        band: 'B1',
        prompt: 'Qual é a principal ideia da leitura?',
        options: [
          'Toda resposta rápida é correta',
          'A tecnologia dispensa perguntas',
          'Uma ferramenta útil ainda precisa de verificação',
        ],
        answer: 2,
        explanation: 'O texto recomenda conferir fontes, informações e suposições.',
      },
    ],
  },
  {
    id: 'work',
    title: 'Uma reunião com espaço para dúvidas',
    topic: 'Trabalho',
    level: 'A2',
    minutes: 6,
    intro: 'Uma boa conversa não exige saber tudo de antemão.',
    paragraphs: [
      'Júlia estava nervosa antes da primeira reunião com uma equipe brasileira. Conhecia o projeto, mas conversar em português era uma experiência nova. Escreveu três ideias que queria explicar e treinou dizendo cada uma em voz alta.',
      'Na reunião, um colega usou uma expressão que ela não conhecia. Júlia pediu uma explicação: “Você pode repetir de outra maneira?” O colega respondeu com um exemplo, e a conversa continuou. Ninguém esperava que ela entendesse tudo sem perguntar.',
      'Depois da reunião, Júlia anotou a expressão e uma frase em que poderia usá-la. Não falou sem erros, mas conseguiu participar e aprender. Percebeu que pedir esclarecimento também faz parte de uma boa comunicação.',
    ],
    questions: [
      {
        id: 'work1',
        skill: 'reading',
        band: 'A2',
        prompt: 'Como Júlia se preparou?',
        options: [
          'Decorou um dicionário inteiro',
          'Escreveu três ideias e falou em voz alta',
          'Evitou falar na reunião',
        ],
        answer: 1,
        explanation: 'Ela organizou três ideias e praticou em voz alta.',
      },
      {
        id: 'work2',
        skill: 'reading',
        band: 'A2',
        prompt: 'O que ajudou quando uma expressão era desconhecida?',
        options: ['Pedir uma explicação com um exemplo', 'Mudar de assunto', 'Encerrar a reunião'],
        answer: 0,
        explanation: 'O pedido de esclarecimento permitiu continuar a conversa.',
      },
    ],
  },
  {
    id: 'routine',
    title: 'Uma pausa que cabe no dia',
    topic: 'Dia a dia',
    level: 'A2',
    minutes: 6,
    intro: 'Nem todo bom hábito precisa de uma hora livre.',
    paragraphs: [
      'Jazmín queria estudar todos os dias, mas sua rotina tinha horários diferentes. Quando planejava uma sessão longa, acabava adiando. Decidiu começar com dez minutos depois do café da manhã, sem esperar pelo momento perfeito.',
      'Em alguns dias, lia uma página. Em outros, revisava três palavras ou escrevia uma frase sobre o que tinha feito. Deixou o material preparado para não perder tempo escolhendo. A prática pequena se tornou mais fácil de repetir.',
      'Houve dias sem estudo, e isso não significou desistir. No dia seguinte, retomou de onde tinha parado. Aprendeu que a constância não é fazer tudo sempre: é encontrar um jeito possível de voltar.',
    ],
    questions: [
      {
        id: 'routine1',
        skill: 'reading',
        band: 'A2',
        prompt: 'Por que Jazmín mudou seu plano?',
        options: [
          'As sessões longas eram difíceis de encaixar',
          'Ela não gostava de ler',
          'Não tinha palavras para revisar',
        ],
        answer: 0,
        explanation: 'Os horários variavam e as sessões longas eram adiadas.',
      },
      {
        id: 'routine2',
        skill: 'reading',
        band: 'A2',
        prompt: 'O que significa constância nesta leitura?',
        options: [
          'Nunca faltar um dia',
          'Encontrar uma maneira de retomar',
          'Estudar só nas férias',
        ],
        answer: 1,
        explanation: 'O último parágrafo valoriza voltar à prática depois das pausas.',
      },
    ],
  },
];
export const glossary: Record<string, { meaning: string; pronunciation: string; example: string }> =
  {
    curiosidade: {
      meaning: 'Vontade de conhecer ou descobrir algo.',
      pronunciation: '',
      example: 'A curiosidade me levou a conhecer uma nova livraria.',
    },
    vizinhança: {
      meaning: 'Área próxima de onde alguém mora.',
      pronunciation: '',
      example: 'Há uma praça bonita na minha vizinhança.',
    },
    estreito: {
      meaning: 'Que tem pouca largura.',
      pronunciation: '',
      example: 'O caminho para a praia é estreito.',
    },
    tranquilidade: {
      meaning: 'Estado de calma, sem preocupações excessivas.',
      pronunciation: '',
      example: 'Organizar os gastos trouxe mais tranquilidade.',
    },
    economizar: {
      meaning: 'Gastar menos ou guardar parte do dinheiro.',
      pronunciation: '',
      example: 'Quero economizar para a próxima viagem.',
    },
    imprevisto: {
      meaning: 'Algo que acontece sem ter sido planejado.',
      pronunciation: '',
      example: 'Guardo dinheiro para lidar com um imprevisto.',
    },
    orçamento: {
      meaning: 'Plano de receitas e despesas.',
      pronunciation: '',
      example: 'O orçamento ajuda a organizar as contas.',
    },
    taxa: {
      meaning: 'Valor cobrado por um serviço.',
      pronunciation: '',
      example: 'O banco cobra uma taxa mensal.',
    },
    reserva: {
      meaning: 'Algo guardado para usar depois.',
      pronunciation: '',
      example: 'Tenho uma reserva para emergências.',
    },
    esclarecimento: {
      meaning: 'Explicação que torna uma informação mais clara.',
      pronunciation: '',
      example: 'Pedi um esclarecimento sobre o horário.',
    },
    'em voz alta': {
      meaning: 'Falando de modo que outras pessoas possam ouvir.',
      pronunciation: '',
      example: 'Pratique a frase em voz alta.',
    },
    'ficar à vontade': {
      meaning: 'Sentir-se confortável em uma situação.',
      pronunciation: '',
      example: 'Fique à vontade para fazer perguntas.',
    },
    'aos poucos': {
      meaning: 'De maneira gradual, um pouco de cada vez.',
      pronunciation: '',
      example: 'Aprendo português aos poucos.',
    },
    'dar conta': {
      meaning: 'Conseguir fazer ou resolver algo.',
      pronunciation: '',
      example: 'Hoje consegui dar conta das minhas tarefas.',
    },
    'ter saudade': {
      meaning: 'Sentir falta de alguém, de um lugar ou de uma experiência.',
      pronunciation: '',
      example: 'Tenho saudade dos passeios com minha família.',
    },
    'pois é': {
      meaning: 'Expressão usada para concordar ou reconhecer uma situação.',
      pronunciation: '',
      example: 'Pois é, o ônibus atrasou de novo.',
    },
    caprichar: {
      meaning: 'Fazer algo com cuidado e atenção.',
      pronunciation: '',
      example: 'Vou caprichar na apresentação.',
    },
    aconchegante: {
      meaning: 'Que dá uma sensação de conforto e acolhimento.',
      pronunciation: '',
      example: 'O café da esquina é aconchegante.',
    },
    combinar: {
      meaning: 'Decidir algo em conjunto ou harmonizar elementos.',
      pronunciation: '',
      example: 'Vamos combinar um horário para conversar.',
    },
    prazo: {
      meaning: 'Período ou data limite para fazer algo.',
      pronunciation: '',
      example: 'O prazo para entregar o relatório é sexta-feira.',
    },
    confiável: {
      meaning: 'Que merece confiança ou costuma funcionar bem.',
      pronunciation: '',
      example: 'Preciso de uma conexão confiável.',
    },
    acessível: {
      meaning: 'Que pode ser alcançado ou pago com facilidade.',
      pronunciation: '',
      example: 'Procuramos um hotel com preço acessível.',
    },
    bagagem: {
      meaning: 'Malas e objetos levados em uma viagem.',
      pronunciation: '',
      example: 'Posso deixar minha bagagem aqui?',
    },
    reembolso: {
      meaning: 'Devolução de um valor pago.',
      pronunciation: '',
      example: 'Pedi o reembolso da passagem cancelada.',
    },
    recibo: {
      meaning: 'Documento que comprova um pagamento.',
      pronunciation: '',
      example: 'Você pode me dar um recibo?',
    },
    agendar: {
      meaning: 'Marcar uma data ou um horário.',
      pronunciation: '',
      example: 'Gostaria de agendar uma consulta.',
    },
    consulta: {
      meaning: 'Encontro com um profissional para receber orientação.',
      pronunciation: '',
      example: 'Tenho uma consulta amanhã.',
    },
    embarque: {
      meaning: 'Entrada de passageiros em um meio de transporte.',
      pronunciation: '',
      example: 'O embarque começa às oito.',
    },
    passagem: {
      meaning: 'Bilhete que permite fazer uma viagem.',
      pronunciation: '',
      example: 'Comprei a passagem de ônibus pela internet.',
    },
    ônibus: {
      meaning: 'Veículo coletivo para transportar passageiros.',
      pronunciation: '',
      example: 'Vou ao trabalho de ônibus.',
    },
    feriado: {
      meaning: 'Dia em que atividades de trabalho ou escola costumam ser suspensas.',
      pronunciation: '',
      example: 'Vamos viajar no próximo feriado.',
    },
    passeio: {
      meaning: 'Saída para conhecer um lugar ou se divertir.',
      pronunciation: '',
      example: 'Fizemos um passeio pelo bairro.',
    },
    'com antecedência': {
      meaning: 'Antes da data ou do momento necessário.',
      pronunciation: '',
      example: 'É melhor comprar a passagem com antecedência.',
    },
    'estou a caminho': {
      meaning: 'Expressão para dizer que já está indo a um lugar.',
      pronunciation: '',
      example: 'Estou a caminho e chego em dez minutos.',
    },
    'fazer sentido': {
      meaning: 'Ser compreensível ou razoável.',
      pronunciation: '',
      example: 'Seu exemplo faz sentido para mim.',
    },
    'sem pressa': {
      meaning: 'Sem necessidade de fazer algo rapidamente.',
      pronunciation: '',
      example: 'Podemos conversar sem pressa.',
    },
    'por enquanto': {
      meaning: 'Durante o momento atual, sem indicar algo definitivo.',
      pronunciation: '',
      example: 'Por enquanto, vou estudar dez minutos por dia.',
    },
    atualização: {
      meaning: 'Mudança para deixar informações ou programas mais recentes.',
      pronunciation: '',
      example: 'A atualização melhorou o aplicativo.',
    },
    'cópia de segurança': {
      meaning: 'Cópia de dados para evitar sua perda.',
      pronunciation: '',
      example: 'Faço uma cópia de segurança dos meus arquivos.',
    },
    senha: {
      meaning: 'Código secreto usado para proteger um acesso.',
      pronunciation: '',
      example: 'Escolha uma senha que não seja fácil de adivinhar.',
    },
    critério: {
      meaning: 'Regra ou cuidado usado para avaliar e decidir.',
      pronunciation: '',
      example: 'É importante usar critério ao conferir uma informação.',
    },
    suposição: {
      meaning: 'Ideia considerada possível, mas ainda não confirmada.',
      pronunciation: '',
      example: 'Essa conclusão é uma suposição.',
    },
    constância: {
      meaning: 'Hábito de continuar ou retomar uma prática.',
      pronunciation: '',
      example: 'A constância vale mais do que estudar só uma vez.',
    },
    retomar: {
      meaning: 'Voltar a uma atividade que foi interrompida.',
      pronunciation: '',
      example: 'Amanhã vou retomar a leitura.',
    },
  };
export const writingPrompts = [
  'Conte, em quatro a seis frases, como seria um fim de semana tranquilo para você. Inclua um lugar e uma atividade.',
  'Escreva uma mensagem para combinar um café com uma amiga. Sugira um dia, um horário e um lugar.',
  'Explique uma pequena mudança que quer fazer na sua rotina. Diga por que ela é importante e como pode começar.',
];

grammarQuestions.push(...cefrGrammar);

Object.assign(glossary, {
  nome: {
    meaning: 'A palavra usada para identificar uma pessoa.',
    pronunciation: '',
    example: 'Meu nome é Jazmín.',
  },
  casa: {
    meaning: 'O lugar onde uma pessoa mora.',
    pronunciation: '',
    example: 'Eu estou em casa.',
  },
  água: {
    meaning: 'Uma bebida sem cor que precisamos beber.',
    pronunciation: '',
    example: 'Eu quero um copo de água.',
  },
  amigo: {
    meaning: 'Uma pessoa de quem você gosta e em quem confia.',
    pronunciation: '',
    example: 'Meu amigo mora perto.',
  },
  livro: {
    meaning: 'Um objeto com páginas para ler.',
    pronunciation: '',
    example: 'Eu gosto deste livro.',
  },
  noite: {
    meaning: 'A parte do dia depois da tarde.',
    pronunciation: '',
    example: 'À noite, eu leio.',
  },
  comer: {
    meaning: 'Colocar alimento na boca.',
    pronunciation: '',
    example: 'Eu gosto de comer frutas.',
  },
  beber: { meaning: 'Tomar um líquido.', pronunciation: '', example: 'Eu vou beber água.' },
  morar: { meaning: 'Viver em um lugar.', pronunciation: '', example: 'Eu quero morar aqui.' },
  falar: {
    meaning: 'Usar a voz para dizer palavras.',
    pronunciation: '',
    example: 'Eu gosto de falar português.',
  },
  'bom dia': {
    meaning: 'Uma saudação usada de manhã.',
    pronunciation: '',
    example: 'Bom dia! Tudo bem?',
  },
  obrigada: {
    meaning: 'Uma palavra para agradecer, usada por uma mulher.',
    pronunciation: '',
    example: 'Obrigada pela ajuda!',
  },
});
