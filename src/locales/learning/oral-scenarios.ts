// Original short listening tasks. Two answers provide limited evidence, never a CEFR certificate.
export const oralScenarios = {
  A1: {
    en: {
      story:
        'My name is Ana. I live in Córdoba. I study in the morning. In the evening, I like cooking with my sister.',
      prompt: 'Introduce yourself. Say where you live and one thing you like doing.',
      model: 'My name is Alejo. I live in Argentina. I like reading.',
      questions: ['Where does Ana live?', 'What does Ana like doing in the evening?'],
      options: [
        ['In Córdoba', 'In London', 'In Madrid'],
        ['Cooking with her sister', 'Studying with her brother', 'Working in a café'],
      ],
    },
    pt: {
      story:
        'Meu nome é Ana. Eu moro em Curitiba. Estudo de manhã. À noite, gosto de cozinhar com minha irmã.',
      prompt: 'Apresente-se. Diga onde mora e uma coisa que gosta de fazer.',
      model: 'Meu nome é Jazmín. Eu moro na Argentina. Gosto de ler.',
      questions: ['Onde Ana mora?', 'O que Ana gosta de fazer à noite?'],
      options: [
        ['Em Curitiba', 'Em São Paulo', 'Em Recife'],
        ['Cozinhar com a irmã', 'Estudar com o irmão', 'Trabalhar em um café'],
      ],
    },
    es: {
      storyEN:
        'Me llamo Ana. Vivo en Córdoba. Estudio por la mañana. Por la noche, me gusta cocinar con mi hermana.',
      storyPT:
        'Me llamo Ana. Vivo en Curitiba. Estudio por la mañana. Por la noche, me gusta cocinar con mi hermana.',
      prompt: 'Presentate. Decí dónde vivís y una cosa que te gusta hacer.',
      modelEN: 'Me llamo Alejo. Vivo en Argentina. Me gusta leer.',
      modelPT: 'Me llamo Jazmín. Vivo en Argentina. Me gusta leer.',
      questions: ['¿Dónde vive Ana?', '¿Qué le gusta hacer a Ana por la noche?'],
      why: [
        'La persona nombra explícitamente su ciudad. Escuchá la frase que empieza con “I live” o “Eu moro”.',
        'La actividad de la noche es cocinar con su hermana. “In the evening” y “À noite” ubican cuándo ocurre.',
      ],
    },
    whyEN: [
      'Ana explicitly names her city after “I live”. Listen for the place, not the time of day.',
      'She says she likes cooking with her sister in the evening. Studying belongs to the morning.',
    ],
    whyPT: [
      'Ana indica sua cidade depois de “Eu moro”. Escute o lugar, não o período do dia.',
      'Ela diz que gosta de cozinhar com a irmã à noite. O estudo acontece de manhã.',
    ],
  },
  A2: {
    en: {
      story:
        'Yesterday I bought a train ticket for Friday. The train leaves at nine, but I need to be at the station at half past eight. I am going to take the bus because parking near the station is expensive.',
      prompt: 'Describe something you did yesterday and a plan for tomorrow. Add one reason.',
      model:
        'Yesterday I bought a ticket. Tomorrow I am going to take the bus because parking is expensive.',
      questions: [
        'When does the speaker need to arrive at the station?',
        'Why is the speaker planning to take the bus?',
      ],
      options: [
        ['At half past eight', 'At nine', 'On Thursday afternoon'],
        [
          'Parking near the station is expensive',
          'The train was cancelled',
          'The station has no buses',
        ],
      ],
    },
    pt: {
      story:
        'Ontem comprei uma passagem de trem para sexta-feira. O trem sai às nove, mas preciso chegar à estação às oito e meia. Vou de ônibus porque estacionar perto da estação é caro.',
      prompt: 'Conte uma coisa que fez ontem e um plano para amanhã. Acrescente uma razão.',
      model: 'Ontem comprei uma passagem. Amanhã vou de ônibus porque estacionar é caro.',
      questions: [
        'A que horas a pessoa precisa chegar à estação?',
        'Por que a pessoa pretende ir de ônibus?',
      ],
      options: [
        ['Às oito e meia', 'Às nove', 'Na quinta-feira à tarde'],
        ['Estacionar perto da estação é caro', 'O trem foi cancelado', 'Não há ônibus na estação'],
      ],
    },
    es: {
      storyEN:
        'Ayer compré un pasaje de tren para el viernes. El tren sale a las nueve, pero tengo que estar en la estación a las ocho y media. Voy a tomar el colectivo porque estacionar cerca de la estación es caro.',
      storyPT:
        'Ayer compré un pasaje de tren para el viernes. El tren sale a las nueve, pero necesito llegar a la estación a las ocho y media. Voy en colectivo porque estacionar cerca de la estación es caro.',
      prompt: 'Contá algo que hiciste ayer y un plan para mañana. Agregá una razón.',
      modelEN: 'Ayer compré un pasaje. Mañana voy a tomar el colectivo porque estacionar es caro.',
      modelPT: 'Ayer compré un pasaje. Mañana voy en colectivo porque estacionar es caro.',
      questions: ['¿A qué hora necesita llegar a la estación?', '¿Por qué planea ir en colectivo?'],
      why: [
        'La llegada necesaria es a las ocho y media. No la confundas con la salida del tren a las nueve.',
        'La causa mencionada es el costo de estacionar. La cancelación y la ausencia de colectivos no aparecen en el mensaje.',
      ],
    },
    whyEN: [
      'The required arrival is half past eight. Do not confuse it with the train departure at nine.',
      'The stated reason is the cost of parking. The message does not mention a cancellation or missing buses.',
    ],
    whyPT: [
      'A chegada necessária é às oito e meia. Não confunda com a saída do trem às nove.',
      'A razão mencionada é o custo de estacionar. O recado não menciona cancelamento nem falta de ônibus.',
    ],
  },
  B1: {
    en: {
      story:
        'I have been working on the report all week. I was checking the figures when my manager called. She asked us to move the meeting to Thursday because the client has not confirmed the budget yet. The report is ready, but the decision will have to wait.',
      prompt:
        'Describe a recent situation, what was happening at the time, and what changed. Explain the consequence.',
      model:
        'I was checking a report when my manager called. We have finished the report, but we need to wait for the budget.',
      questions: ['Why was the meeting moved?', 'Which statement is supported by the message?'],
      options: [
        [
          'The client has not confirmed the budget',
          'The report was lost',
          'The manager is on holiday',
        ],
        [
          'The report is ready, but the decision is still pending',
          'The budget has already been approved',
          'The report will begin on Thursday',
        ],
      ],
    },
    pt: {
      story:
        'Tenho trabalhado no relatório a semana toda. Estava conferindo os números quando minha gerente ligou. Ela pediu para mudar a reunião para quinta-feira porque o cliente ainda não confirmou o orçamento. O relatório está pronto, mas a decisão vai ter que esperar.',
      prompt:
        'Conte uma situação recente, o que estava acontecendo e o que mudou. Explique a consequência.',
      model:
        'Estava conferindo um relatório quando minha gerente ligou. Terminamos o relatório, mas precisamos esperar o orçamento.',
      questions: ['Por que a reunião foi adiada?', 'Qual afirmação é sustentada pelo recado?'],
      options: [
        [
          'O cliente ainda não confirmou o orçamento',
          'O relatório foi perdido',
          'A gerente está de férias',
        ],
        [
          'O relatório está pronto, mas a decisão continua pendente',
          'O orçamento já foi aprovado',
          'O relatório vai começar na quinta-feira',
        ],
      ],
    },
    es: {
      storyEN:
        'He estado trabajando en el informe toda la semana. Estaba revisando las cifras cuando llamó mi gerente. Pidió mover la reunión al jueves porque el cliente todavía no confirmó el presupuesto. El informe está listo, pero la decisión tendrá que esperar.',
      storyPT:
        'He estado trabajando en el informe toda la semana. Estaba revisando las cifras cuando llamó mi gerente. Pidió cambiar la reunión al jueves porque el cliente todavía no confirmó el presupuesto. El informe está listo, pero la decisión tendrá que esperar.',
      prompt:
        'Describí una situación reciente, qué estaba pasando y qué cambió. Explicá la consecuencia.',
      modelEN:
        'Estaba revisando un informe cuando llamó mi gerente. Terminamos el informe, pero tenemos que esperar el presupuesto.',
      modelPT:
        'Estaba revisando un informe cuando llamó mi gerente. Terminamos el informe, pero tenemos que esperar el presupuesto.',
      questions: [
        '¿Por qué cambiaron la reunión?',
        '¿Qué afirmación está respaldada por el mensaje?',
      ],
      why: [
        'El motivo explícito es la falta de confirmación del presupuesto. Las otras causas no se mencionan.',
        'La preparación del informe terminó; la decisión sigue pendiente. Son dos estados distintos y no deben confundirse.',
      ],
    },
    whyEN: [
      'The explicit reason is that the budget has not been confirmed. Neither alternative cause is mentioned.',
      'Preparing the report is finished; making the decision is still pending. These are different states.',
    ],
    whyPT: [
      'A razão explícita é a falta de confirmação do orçamento. Nenhuma das outras causas é mencionada.',
      'A preparação do relatório terminou; a decisão continua pendente. São estados diferentes.',
    ],
  },
  B2: {
    en: {
      story:
        'Although the pilot reduced waiting times, several customers said the new system was difficult to use. We should keep the faster process, provided that the instructions are improved before a wider launch. I would not recommend removing the support team until we have tested whether the changes make a difference.',
      prompt:
        'Give a recommendation about a change at work. Include evidence, a limitation and a condition.',
      model:
        'The pilot reduced waiting times, but users need clearer instructions. I recommend a wider launch only if the support remains available.',
      questions: [
        'What condition is attached to a wider launch?',
        'What is the speaker’s position on removing support?',
      ],
      options: [
        ['Improve the instructions first', 'Increase waiting times', 'Remove the pilot results'],
        [
          'Do not remove support before testing the improvements',
          'Remove support immediately',
          'Support has already been removed',
        ],
      ],
    },
    pt: {
      story:
        'Embora o projeto-piloto tenha reduzido o tempo de espera, vários clientes disseram que o sistema novo era difícil de usar. Devemos manter o processo mais rápido, desde que as instruções sejam melhoradas antes de uma expansão. Eu não recomendaria retirar a equipe de apoio até testarmos se as mudanças fazem diferença.',
      prompt:
        'Faça uma recomendação sobre uma mudança no trabalho. Inclua evidências, uma limitação e uma condição.',
      model:
        'O projeto-piloto reduziu o tempo de espera, mas os usuários precisam de instruções mais claras. Recomendo a expansão somente se o apoio continuar disponível.',
      questions: [
        'Qual condição está ligada à expansão?',
        'Qual é a posição sobre retirar o apoio?',
      ],
      options: [
        [
          'Melhorar as instruções primeiro',
          'Aumentar o tempo de espera',
          'Retirar os resultados do projeto-piloto',
        ],
        [
          'Não retirar o apoio antes de testar as melhorias',
          'Retirar o apoio imediatamente',
          'O apoio já foi retirado',
        ],
      ],
    },
    es: {
      storyEN:
        'Aunque la prueba piloto redujo los tiempos de espera, varios clientes dijeron que el nuevo sistema era difícil de usar. Deberíamos mantener el proceso más rápido, siempre que se mejoren las instrucciones antes de una expansión. No recomendaría retirar al equipo de apoyo hasta probar si los cambios hacen una diferencia.',
      storyPT:
        'Aunque el proyecto piloto haya reducido el tiempo de espera, varios clientes dijeron que el nuevo sistema era difícil de usar. Debemos mantener el proceso más rápido, siempre que se mejoren las instrucciones antes de una expansión. No recomendaría retirar al equipo de apoyo hasta probar si los cambios hacen una diferencia.',
      prompt:
        'Recomendá un cambio en el trabajo. Incluí evidencia, una limitación y una condición.',
      modelEN:
        'La prueba piloto redujo la espera, pero los usuarios necesitan instrucciones más claras. Recomiendo expandirla solo si el apoyo sigue disponible.',
      modelPT:
        'El proyecto piloto redujo la espera, pero los usuarios necesitan instrucciones más claras. Recomiendo expandirlo solo si el apoyo sigue disponible.',
      questions: [
        '¿Qué condición se exige antes de ampliar el proyecto?',
        '¿Qué postura tiene sobre retirar el apoyo?',
      ],
      why: [
        'La expansión está condicionada a mejorar las instrucciones. “Provided that” y “desde que” marcan ese requisito.',
        'El hablante propone esperar una prueba de las mejoras antes de retirar el apoyo. No dice que ya se retiró ni pide retirarlo inmediatamente.',
      ],
    },
    whyEN: [
      'The wider launch depends on improving the instructions. “Provided that” introduces this condition.',
      'The speaker recommends testing the improvements before removing support. This is not an immediate removal or a report that it already happened.',
    ],
    whyPT: [
      'A expansão depende de melhorar as instruções. “Desde que” introduz essa condição.',
      'A pessoa recomenda testar as melhorias antes de retirar o apoio. Não pede uma retirada imediata nem afirma que ela já aconteceu.',
    ],
  },
  C1: {
    en: {
      story:
        'The findings appear to support the intervention, but the sample was small and participation was voluntary. These limitations may have influenced the results. A larger trial would help establish whether the observed improvement applies beyond this group; it would not, by itself, settle every question about long-term effects.',
      prompt:
        'Summarize a claim and qualify it. Explain what evidence is available and what remains uncertain.',
      model:
        'The findings suggest an improvement, but a small voluntary sample limits generalization. A larger trial would clarify scope without resolving all long-term questions.',
      questions: [
        'What limits the generalization?',
        'What does the speaker claim a larger trial could do?',
      ],
      options: [
        [
          'A small, voluntary sample',
          'A complete absence of results',
          'Evidence from every population',
        ],
        [
          'Clarify wider applicability without settling every long-term question',
          'Guarantee every long-term outcome',
          'Prove the current study had no value',
        ],
      ],
    },
    pt: {
      story:
        'Os resultados parecem apoiar a intervenção, mas a amostra era pequena e a participação foi voluntária. Essas limitações podem ter influenciado os resultados. Um estudo maior ajudaria a estabelecer se a melhora observada se aplica além desse grupo; por si só, não resolveria todas as questões sobre efeitos de longo prazo.',
      prompt:
        'Resuma uma afirmação e faça ressalvas. Explique quais evidências existem e o que permanece incerto.',
      model:
        'Os resultados sugerem uma melhora, mas uma amostra pequena e voluntária limita a generalização. Um estudo maior esclareceria o alcance sem resolver todas as questões de longo prazo.',
      questions: ['O que limita a generalização?', 'O que um estudo maior poderia esclarecer?'],
      options: [
        [
          'Uma amostra pequena e voluntária',
          'A ausência completa de resultados',
          'Evidências de todas as populações',
        ],
        [
          'A aplicação mais ampla, sem resolver toda questão de longo prazo',
          'A garantia de todos os efeitos de longo prazo',
          'A prova de que o estudo atual não teve valor',
        ],
      ],
    },
    es: {
      storyEN:
        'Los hallazgos parecen respaldar la intervención, pero la muestra era pequeña y la participación voluntaria. Estas limitaciones pudieron influir en los resultados. Una prueba más grande ayudaría a establecer si la mejora se aplica fuera de este grupo; por sí sola, no resolvería todas las preguntas sobre efectos a largo plazo.',
      storyPT:
        'Los resultados parecen respaldar la intervención, pero la muestra era pequeña y la participación voluntaria. Estas limitaciones pudieron influir en los resultados. Un estudio más grande ayudaría a establecer si la mejora se aplica fuera de este grupo; por sí solo, no resolvería todas las preguntas sobre efectos a largo plazo.',
      prompt:
        'Resumí una afirmación y matizala. Explicá qué evidencia existe y qué sigue incierto.',
      modelEN:
        'Los hallazgos sugieren una mejora, pero una muestra pequeña y voluntaria limita la generalización. Una prueba mayor aclararía el alcance sin resolver todas las dudas a largo plazo.',
      modelPT:
        'Los resultados sugieren una mejora, pero una muestra pequeña y voluntaria limita la generalización. Un estudio mayor aclararía el alcance sin resolver todas las dudas a largo plazo.',
      questions: ['¿Qué limita la generalización?', '¿Qué podría aclarar un estudio más grande?'],
      why: [
        'El tamaño pequeño y la selección voluntaria limitan qué puede generalizarse. No eliminan automáticamente todo valor de los resultados.',
        'El estudio mayor ayudaría a examinar otros grupos. El hablante limita explícitamente esa promesa: no resuelve todas las preguntas a largo plazo.',
      ],
    },
    whyEN: [
      'Small size and voluntary selection limit generalization. They do not automatically make all results worthless.',
      'A larger study could examine other groups. The speaker explicitly limits that claim: not every long-term question would be settled.',
    ],
    whyPT: [
      'O tamanho pequeno e a seleção voluntária limitam a generalização. Não tornam todos os resultados automaticamente sem valor.',
      'Um estudo maior poderia examinar outros grupos. A pessoa limita essa promessa: nem toda questão de longo prazo seria resolvida.',
    ],
  },
  C2: {
    en: {
      story:
        'I am not suggesting that none of the proposals has merit. Rather, the evidence does not yet justify treating all of them as equally reliable. Some may warrant further investigation, provided their assumptions are made explicit. Rejecting an unsupported conclusion is not the same as ruling out the possibility that stronger evidence could eventually support it.',
      prompt:
        'Rephrase a nuanced position without changing its scope. Distinguish rejecting a current claim from ruling out a future possibility.',
      model:
        'The proposals should not all be treated as equally reliable. This does not imply that every proposal lacks merit or that new evidence could never support one.',
      questions: [
        'Which interpretation preserves the speaker’s scope?',
        'What distinction is made in the final sentence?',
      ],
      options: [
        [
          'Not all proposals are equally supported; some may still have merit',
          'No proposal can ever have merit',
          'Every proposal is already equally reliable',
        ],
        [
          'Insufficient current support does not rule out stronger future support',
          'Rejecting a claim guarantees it will later be true',
          'Future evidence has already settled the question',
        ],
      ],
    },
    pt: {
      story:
        'Não estou sugerindo que nenhuma proposta tenha mérito. Antes, as evidências ainda não justificam tratar todas como igualmente confiáveis. Algumas podem merecer investigação adicional, desde que suas premissas sejam explicitadas. Rejeitar uma conclusão sem apoio suficiente não é o mesmo que descartar a possibilidade de que evidências mais fortes venham a sustentá-la.',
      prompt:
        'Reformule uma posição com nuances sem mudar seu alcance. Diferencie rejeitar uma afirmação atual de descartar uma possibilidade futura.',
      model:
        'As propostas não devem ser todas tratadas como igualmente confiáveis. Isso não implica que nenhuma tenha mérito ou que novas evidências jamais possam apoiar alguma.',
      questions: [
        'Qual interpretação preserva o alcance da posição?',
        'Qual distinção aparece na última frase?',
      ],
      options: [
        [
          'Nem todas as propostas têm apoio igual; algumas ainda podem ter mérito',
          'Nenhuma proposta jamais pode ter mérito',
          'Todas as propostas já são igualmente confiáveis',
        ],
        [
          'A falta de apoio atual não elimina um apoio futuro mais forte',
          'Rejeitar uma afirmação garante que ela será verdadeira depois',
          'As evidências futuras já resolveram a questão',
        ],
      ],
    },
    es: {
      storyEN:
        'No sugiero que ninguna propuesta tenga mérito. Más bien, la evidencia todavía no justifica tratarlas a todas como igualmente confiables. Algunas podrían merecer más investigación si se explicitan sus supuestos. Rechazar una conclusión sin respaldo suficiente no equivale a descartar que una evidencia más fuerte pudiera respaldarla después.',
      storyPT:
        'No sugiero que ninguna propuesta tenga mérito. Por el contrario, la evidencia todavía no justifica tratarlas a todas como igualmente confiables. Algunas podrían merecer más investigación si se explicitan sus supuestos. Rechazar una conclusión sin respaldo suficiente no equivale a descartar que una evidencia más fuerte pudiera respaldarla después.',
      prompt:
        'Reformulá una postura con matices sin cambiar su alcance. Diferenciá rechazar una afirmación actual de descartar una posibilidad futura.',
      modelEN:
        'No se debería tratar a todas las propuestas como igualmente confiables. Eso no implica que todas carezcan de mérito ni que nuevas pruebas nunca puedan respaldar alguna.',
      modelPT:
        'No se debería tratar a todas las propuestas como igualmente confiables. Eso no implica que ninguna tenga mérito ni que nuevas pruebas nunca puedan respaldar alguna.',
      questions: [
        '¿Qué interpretación conserva el alcance de la postura?',
        '¿Qué distinción aparece en la última oración?',
      ],
      why: [
        '“No todas” y “ninguna” tienen alcances distintos. La postura permite que algunas propuestas tengan mérito sin darles a todas el mismo respaldo.',
        'Rechazar la justificación actual no descarta apoyo futuro. Tampoco garantiza que ese apoyo vaya a existir.',
      ],
    },
    whyEN: [
      '“Not all” and “none” have different scopes. The position allows some proposals to have merit without giving every proposal equal support.',
      'Rejecting the current justification does not rule out future support. It does not guarantee that such support will appear either.',
    ],
    whyPT: [
      '“Nem todas” e “nenhuma” têm alcances diferentes. A posição permite que algumas propostas tenham mérito sem dar apoio igual a todas.',
      'Rejeitar a justificativa atual não elimina um apoio futuro. Também não garante que esse apoio vá existir.',
    ],
  },
} as const;
