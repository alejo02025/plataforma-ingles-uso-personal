// Edition 2: authored contexts. Keep edition 1 banks unchanged for saved work.
export type Context = { en: string; pt: string; es: string };
const c = (en: string, pt: string, es: string): Context => ({ en, pt, es });
export const wordContexts: Record<string, Context[]> = {
  A1: [
    c(
      'At lunch, Ana drinks water from a ___.',
      'No almoço, Ana bebe água em um ___.',
      'En el almuerzo, Ana toma agua en un ___.',
    ),
    c(
      'In the café, Bia drinks coffee from a ___.',
      'No café, Bia toma café em uma ___.',
      'En la cafetería, Bia toma café en una ___.',
    ),
    c(
      'At home, Leo opens a ___ and reads a story.',
      'Em casa, Leo abre um ___ e lê uma história.',
      'En casa, Leo abre un ___ y lee una historia.',
    ),
    c(
      'Mia lives with her family in a small ___.',
      'Mia mora com a família em uma ___ pequena.',
      'Mia vive con su familia en una ___ pequeña.',
    ),
    c(
      'I am thirsty. I would like some ___.',
      'Estou com sede. Quero um pouco de ___.',
      'Tengo sed. Quiero un poco de ___.',
    ),
    c(
      'For breakfast, I eat ___ with butter.',
      'No café da manhã, eu como ___ com manteiga.',
      'En el desayuno, como ___ con manteca.',
    ),
    c(
      'Bia and I like spending time together. She is my ___.',
      'Leo e eu gostamos de passar tempo juntos. Ele é meu ___.',
      'Nos gusta pasar tiempo juntos. Es mi ___.',
    ),
    c(
      'Our children have lessons at a ___ near home.',
      'Nossos filhos têm aulas em uma ___ perto de casa.',
      'Nuestros hijos tienen clases en una ___ cerca de casa.',
    ),
  ],
  A2: [
    c(
      'Before boarding the train, Ana shows her ___.',
      'Antes de embarcar no trem, Ana mostra sua ___.',
      'Antes de subir al tren, Ana muestra su ___.',
    ),
    c(
      'After paying, keep the ___ as proof of payment.',
      'Depois de pagar, guarde o ___ como comprovante do pagamento.',
      'Después de pagar, guardá el ___ como comprobante del pago.',
    ),
    c(
      'At the airport, put your suitcases in the ___ area.',
      'No aeroporto, coloque suas malas na área de ___.',
      'En el aeropuerto, colocá tus valijas en el área de ___.',
    ),
    c(
      'I cannot meet at ten. I have an ___ with my doctor.',
      'Não posso encontrar você às dez. Tenho um ___ com meu médico.',
      'No puedo encontrarme con vos a las diez. Tengo una ___ con mi médico.',
    ),
    c(
      'Check the ___ to find out when the next bus leaves.',
      'Consulte o ___ para saber quando sai o próximo ônibus.',
      'Consultá el ___ para saber cuándo sale el próximo colectivo.',
    ),
    c(
      'The shops and streets around my home make up my ___.',
      'As lojas e ruas perto da minha casa fazem parte do meu ___.',
      'Las tiendas y calles cerca de mi casa forman mi ___.',
    ),
    c(
      'I put some money aside every month. These are my ___.',
      'Eu guardo um pouco de dinheiro todo mês. É a minha ___.',
      'Guardo algo de dinero cada mes. Son mis ___.',
    ),
    c(
      'The concert was cancelled. I asked for a ___ of my payment.',
      'O show foi cancelado. Pedi o ___ do valor pago.',
      'El recital se canceló. Pedí el ___ del importe pagado.',
    ),
  ],
  B1: [
    c(
      'Living abroad gave me useful ___ of daily life in another country.',
      'Morar no exterior me deu uma ___ útil da vida cotidiana em outro país.',
      'Vivir en otro país me dio una ___ útil de su vida cotidiana.',
    ),
    c(
      'We compared both options and finally made a ___.',
      'Comparamos as duas opções e finalmente tomamos uma ___.',
      'Comparamos las dos opciones y finalmente tomamos una ___.',
    ),
    c(
      'I was not sure what to do, so I asked a colleague for ___.',
      'Eu não sabia o que fazer, então pedi um ___ a um colega.',
      'No sabía qué hacer, así que le pedí un ___ a un colega.',
    ),
    c(
      'The new job offers an ___ to learn a useful skill.',
      'O novo emprego oferece uma ___ de aprender uma habilidade útil.',
      'El nuevo trabajo ofrece una ___ para aprender una habilidad útil.',
    ),
    c(
      'The task is difficult but possible. It is a ___, not a reason to give up.',
      'A tarefa é difícil, mas possível. É um ___, não um motivo para desistir.',
      'La tarea es difícil pero posible. Es un ___, no un motivo para abandonar.',
    ),
    c(
      'My first report had many errors; the next had fewer. That is an ___.',
      'Meu primeiro relatório tinha muitos erros; o seguinte teve menos. Isso é uma ___.',
      'Mi primer informe tenía muchos errores; el siguiente tuvo menos. Eso es una ___.',
    ),
    c(
      'The road was closed. That was the ___ for our delay.',
      'A rua estava fechada. Esse foi o ___ do nosso atraso.',
      'La calle estaba cerrada. Ese fue el ___ de nuestra demora.',
    ),
    c(
      'There are two suitable courses. You have a ___ between them.',
      'Há dois cursos adequados. Você pode fazer uma ___ entre eles.',
      'Hay dos cursos adecuados. Podés hacer una ___ entre ellos.',
    ),
  ],
  B2: [
    c(
      'Before accepting the explanation, check the ___ that supports it.',
      'Antes de aceitar a explicação, verifique a ___ que a sustenta.',
      'Antes de aceptar la explicación, revisá la ___ que la respalda.',
    ),
    c(
      'The advertisement makes a ___ that has not been independently tested.',
      'A publicidade faz uma ___ que não foi testada de forma independente.',
      'La publicidad hace una ___ que no fue comprobada de forma independiente.',
    ),
    c(
      'The service is cheap, but its main ___ is the long waiting time.',
      'O serviço é barato, mas sua principal ___ é a longa espera.',
      'El servicio es barato, pero su principal ___ es la espera larga.',
    ),
    c(
      'We will measure the final ___ after the trial ends.',
      'Vamos medir o ___ final depois que o teste terminar.',
      'Vamos a medir el ___ final al terminar la prueba.',
    ),
    c(
      'We continued the walk ___ the heavy rain.',
      'Continuamos a caminhada ___ estar chovendo forte.',
      'Continuamos la caminata ___ la lluvia fuerte.',
    ),
    c(
      'The first plan is cheap, ___ the second offers more support.',
      'O primeiro plano é barato, ___ o segundo oferece mais suporte.',
      'El primer plan es barato, ___ el segundo ofrece más ayuda.',
    ),
    c(
      'Only interviewing satisfied customers can introduce ___ into the findings.',
      'Entrevistar apenas clientes satisfeitos pode introduzir ___ nos resultados.',
      'Entrevistar solo a clientes satisfechos puede introducir ___ en los resultados.',
    ),
    c(
      'We planned on the ___ that prices would stay stable, but they rose.',
      'Planejamos com o ___ de que os preços ficariam estáveis, mas eles subiram.',
      'Planificamos con el ___ de que los precios quedarían estables, pero subieron.',
    ),
  ],
  C1: [
    c(
      'The result is promising, with one important ___: the sample is small.',
      'O resultado é promissor, com uma ___ importante: a amostra é pequena.',
      'El resultado es prometedor, con una ___ importante: la muestra es pequeña.',
    ),
    c(
      'The explanation is ___, but reasonable does not mean proven.',
      'A explicação é ___, mas razoável não significa comprovada.',
      'La explicación es ___, pero razonable no significa comprobada.',
    ),
    c(
      'The finding remained consistent across several checks, making it more ___.',
      'O resultado permaneceu consistente em várias verificações, tornando-se mais ___.',
      'El resultado se mantuvo consistente en varias comprobaciones, por lo que es más ___.',
    ),
    c(
      'The recommendation is ___ until stronger evidence is available.',
      'O parecer é ___ até que haja evidências mais fortes.',
      'El dictamen es ___ hasta disponer de evidencia más sólida.',
    ),
    c(
      'One ___ of the new rule is that small firms may need extra time.',
      'Uma ___ da nova regra é que empresas pequenas podem precisar de mais tempo.',
      'Una ___ de la nueva regla es que las empresas pequeñas pueden necesitar más tiempo.',
    ),
    c(
      'The visible delay is a symptom; we still need to identify the ___ cause.',
      'O atraso visível é um sintoma; ainda precisamos identificar o problema ___.',
      'La demora visible es un síntoma; aún debemos identificar el problema ___.',
    ),
    c(
      'There is a ___ difference in tone: one reply is cautious, the other dismissive.',
      'Há uma diferença ___ no tom: uma resposta é cautelosa, a outra desdenhosa.',
      'Hay una diferencia ___ en el tono: una respuesta es cauta, la otra desdeñosa.',
    ),
    c(
      'A limited budget is a ___ on how much we can test.',
      'Um orçamento limitado é uma ___ ao que podemos testar.',
      'Un presupuesto limitado es una ___ sobre cuánto podemos probar.',
    ),
  ],
  C2: [
    c(
      'The statement applies only to surveyed firms; its ___ is limited.',
      'A afirmação se aplica apenas às empresas pesquisadas; seu ___ é limitado.',
      'La afirmación se aplica solo a las empresas encuestadas; su ___ es limitado.',
    ),
    c(
      'The translation loses a ___: reluctant agreement is not enthusiasm.',
      'A tradução perde uma ___: concordância relutante não é entusiasmo.',
      'La traducción pierde un ___: aceptar con reticencia no es entusiasmo.',
    ),
    c(
      'His answer was deliberately ___; two opposing readings remained possible.',
      'Seu comentário foi deliberadamente ___; duas leituras opostas continuaram possíveis.',
      'Su comentario fue deliberadamente ___; seguían siendo posibles dos lecturas opuestas.',
    ),
    c(
      'One ___ is enough to refute a claim about every case.',
      'Um ___ basta para refutar uma afirmação sobre todos os casos.',
      'Un ___ basta para refutar una afirmación sobre todos los casos.',
    ),
    c(
      'A passport is ___ for this journey, but does not by itself guarantee entry.',
      'Um passaporte é ___ para esta viagem, mas não garante a entrada por si só.',
      'Un pasaporte es ___ para este viaje, pero no garantiza la entrada por sí solo.',
    ),
    c(
      'Meeting this condition is ___: no other condition is required under the rule.',
      'Cumprir esta condição é ___: a regra não exige outra condição.',
      'Cumplir esta condición es ___: la regla no exige otra condición.',
    ),
    c(
      'Their support was ___ by several reservations, rather than unconditional.',
      'O apoio deles foi ___ por várias ressalvas, em vez de ser incondicional.',
      'Su apoyo estuvo ___ por varias salvedades, en lugar de ser incondicional.',
    ),
    c(
      'The statement was ___: it explicitly accepted the proposal without reservation.',
      'O pronunciamento foi ___: aceitou explicitamente a proposta sem ressalvas.',
      'El pronunciamiento fue ___: aceptó la propuesta explícitamente y sin salvedades.',
    ),
  ],
};
export const sentenceContexts: Record<string, Context[]> = {
  A1: [
    c(
      'You meet a new classmate. Introduce yourself as a student.',
      'Você conhece uma colega de turma. Apresente-se como estudante.',
      'Conocés a una compañera de curso. Presentate como estudiante.',
    ),
    c(
      'Your friend asks where Ana is. She is not at work; she is at home.',
      'Seu amigo pergunta onde Ana está. Ela não está no trabalho; está em casa.',
      'Tu amigo pregunta dónde está Ana. No está trabajando; está en casa.',
    ),
    c(
      'Say which language you study, rather than naming an activity in the infinitive.',
      'Diga qual idioma você estuda, em vez de citar uma atividade no infinitivo.',
      'Decí qué idioma estudiás, usando el verbo conjugado.',
    ),
    c(
      'At a café, explain that coffee is not part of your routine.',
      'Em um café, explique que tomar café não faz parte da sua rotina.',
      'En una cafetería, explicá que no tomás café.',
    ),
    c(
      'You need something to read. Ask the other person whether they have a book.',
      'Você quer algo para ler. Pergunte à outra pessoa se ela tem um livro.',
      'Querés algo para leer. Preguntá si la otra persona tiene un libro.',
    ),
    c(
      'Introduce yourself and Leo together. Explain your relationship.',
      'Apresente você e Leo juntos. Explique a relação entre vocês.',
      'Presentate junto con Leo. Explicá la relación entre ustedes.',
    ),
  ],
  A2: [
    c(
      'Describe a regular activity that you do after your working day.',
      'Descreva uma atividade habitual que você faz depois do trabalho.',
      'Describí una actividad habitual que hacés después del trabajo.',
    ),
    c(
      'You travelled yesterday. Tell a colleague what you bought for the journey.',
      'Você viajou ontem. Conte a um colega o que comprou para a viagem.',
      'Viajaste ayer. Contale a un colega qué compraste para el viaje.',
    ),
    c(
      'Correct an assumption: she looked at the book but did not buy it.',
      'Corrija uma suposição: ela olhou o livro, mas não o comprou.',
      'Corregí una suposición: ella miró el libro pero no lo compró.',
    ),
    c(
      'You have made a plan for tomorrow. Tell someone about it.',
      'Você fez um plano para amanhã. Conte a alguém.',
      'Hiciste un plan para mañana. Contáselo a alguien.',
    ),
    c(
      'A message was sent earlier. Find out whether the other person read it.',
      'Uma mensagem foi enviada antes. Descubra se a outra pessoa a leu.',
      'Antes se envió un mensaje. Averiguá si la otra persona lo leyó.',
    ),
    c(
      'Explain what you are doing now and give the reason.',
      'Explique o que você está fazendo agora e dê o motivo.',
      'Explicá qué estás haciendo ahora y por qué.',
    ),
  ],
  B1: [
    c(
      'Talk about travel experience without giving a finished date.',
      'Fale de uma experiência de viagem sem dar uma data específica.',
      'Contá una experiencia de viaje sin dar una fecha pasada específica.',
    ),
    c(
      'Make a realistic backup plan that depends on the weather.',
      'Faça um plano alternativo realista que depende do tempo.',
      'Hacé un plan alternativo realista condicionado al clima.',
    ),
    c(
      'A colleague is struggling with a task. Offer advice, not an order.',
      'Um colega tem dificuldade com uma tarefa. Dê um conselho, não uma ordem.',
      'Un colega tiene dificultad con una tarea. Dale un consejo, no una orden.',
    ),
    c(
      'Contrast an old working routine with your present routine.',
      'Compare uma rotina antiga de trabalho com a atual.',
      'Contrastá un hábito laboral pasado con tu rutina actual.',
    ),
    c(
      'A task was completed despite a difficulty. Keep both ideas.',
      'Uma tarefa foi concluída apesar de uma dificuldade. Mantenha as duas ideias.',
      'Una tarea se terminó a pesar de una dificultad. Conservá las dos ideas.',
    ),
    c(
      'Two things happened in the past. Make clear which one happened first.',
      'Duas coisas aconteceram no passado. Deixe claro qual aconteceu primeiro.',
      'Pasaron dos cosas en el pasado. Dejá claro cuál ocurrió antes.',
    ),
  ],
  B2: [
    c(
      'Imagine a change to your present circumstances and its possible result.',
      'Imagine uma mudança nas suas circunstâncias atuais e seu possível resultado.',
      'Imaginá un cambio en tu situación actual y su posible resultado.',
    ),
    c(
      'Ask a stranger for directions politely, using an indirect question.',
      'Peça informações a uma pessoa desconhecida com educação, usando uma pergunta indireta.',
      'Pedí indicaciones a una persona desconocida con una pregunta indirecta cortés.',
    ),
    c(
      'Focus on the report and what happened to it, rather than starting with its author.',
      'Foque o relatório e o que aconteceu com ele, em vez de começar pelo autor.',
      'Enfocá el informe y qué le pasó, en lugar de comenzar por su autor.',
    ),
    c(
      'Explain that bad weather did not prevent the activity.',
      'Explique que o mau tempo não impediu a atividade.',
      'Explicá que el mal tiempo no impidió la actividad.',
    ),
    c(
      'Report what someone said, making the earlier completion clear.',
      'Relate o que alguém disse, deixando clara a conclusão anterior.',
      'Contá lo que alguien dijo, dejando clara la anterioridad de la tarea.',
    ),
    c(
      'Give a balanced assessment: an advantage does not remove a disadvantage.',
      'Faça uma avaliação equilibrada: uma vantagem não elimina uma desvantagem.',
      'Hacé una evaluación equilibrada: una ventaja no elimina una desventaja.',
    ),
  ],
  C1: [
    c(
      'Describe findings cautiously: they suggest a benefit, rather than proving one.',
      'Descreva os resultados com cautela: sugerem um benefício, não o comprovam.',
      'Describí los resultados con cautela: sugieren un beneficio, no lo demuestran.',
    ),
    c(
      'Use a marked, formal structure to stress how unusual the quality is.',
      'Use uma construção enfática para destacar como essa qualidade é incomum.',
      'Usá una construcción enfática para destacar que esa calidad es poco frecuente.',
    ),
    c(
      'Offer a possible explanation of a past result without asserting certainty.',
      'Ofereça uma possível explicação de um resultado passado sem afirmar certeza.',
      'Ofrecé una explicación posible de un resultado pasado sin afirmar certeza.',
    ),
    c(
      'Present a hypothetical improvement in the reliability of an estimate.',
      'Apresente uma melhoria hipotética na confiabilidade de uma estimativa.',
      'Planteá una mejora hipotética en la confiabilidad de una estimación.',
    ),
    c(
      'Focus the discussion on whether the supporting evidence is adequate.',
      'Foque a discussão em saber se a evidência é adequada.',
      'Enfocá el debate en si la evidencia respalda la afirmación.',
    ),
    c(
      'Keep a plausible conclusion open to revision.',
      'Mantenha uma conclusão plausível aberta a revisão.',
      'Mantené una conclusión plausible abierta a revisión.',
    ),
  ],
  C2: [
    c(
      'Reject an overgeneralisation without claiming the opposite.',
      'Rejeite uma generalização excessiva sem afirmar o oposto.',
      'Rechazá una generalización excesiva sin afirmar lo opuesto.',
    ),
    c(
      'Distinguish a prerequisite from a condition that guarantees the result.',
      'Distinga um requisito de uma condição que garante o resultado.',
      'Distinguí un requisito de una condición que garantiza el resultado.',
    ),
    c(
      'Express an uncertain counterfactual consequence of different assumptions.',
      'Expresse uma consequência contrafactual incerta de outros pressupostos.',
      'Expresá una consecuencia contrafactual incierta de otros supuestos.',
    ),
    c(
      'Leave an alternative possible without claiming that it is established.',
      'Mantenha uma alternativa possível sem afirmar que foi comprovada.',
      'Dejá abierta una alternativa sin afirmar que está demostrada.',
    ),
    c(
      'Explain exactly what one incompatible case can refute.',
      'Explique exatamente o que um caso incompatível pode refutar.',
      'Explicá exactamente qué puede refutar un caso incompatible.',
    ),
    c(
      'Contrast intentional ambiguity with unequivocal support.',
      'Compare a ambiguidade intencional com o apoio inequívoco.',
      'Contrastá la ambigüedad intencional con un respaldo inequívoco.',
    ),
  ],
};
export const sentenceReasons: Record<string, Context[]> = {
  A1: [
    c(
      'Use I am, not I is. A student needs the article a in this introduction.',
      'Use eu sou, não eu é. Estudante pode ficar sem artigo nesta apresentação.',
      'Con I usá am; con eu usá sou. Revisá persona verbal y artículo según el idioma.',
    ),
    c(
      'She takes is. At home gives the location.',
      'Ela está indica localização. Em casa diz onde ela está.',
      'La oración ubica a una persona: revisá el verbo y la expresión de lugar.',
    ),
    c(
      'Use subject + present verb + object. Study has no -s after I.',
      'Use sujeito + verbo no presente + complemento. Eu pede estudo, não estudar.',
      'Para afirmar, usá sujeto, verbo conjugado y complemento; no un infinitivo aislado.',
    ),
    c(
      'Do not marks the negative; drink stays in its base form.',
      'Não vem antes do verbo conjugado: bebo. Não é necessário um auxiliar como do.',
      'La negación tiene reglas distintas en cada idioma: no copies el auxiliar inglés al portugués.',
    ),
    c(
      'Do goes before you. Have stays in its base form in the question.',
      'A pergunta mantém você + tem + complemento. A entonação indica a pergunta.',
      'Revisá dónde va el auxiliar en inglés; el portugués no usa do para preguntar.',
    ),
    c(
      'We takes are. Friends is plural because it refers to more than one person.',
      'Nós pede somos. Amigos concorda com nós no plural.',
      'El sujeto plural necesita la forma verbal correspondiente y un complemento concordante.',
    ),
  ],
  A2: [
    c(
      'Use the present simple for a routine. After work says when it happens.',
      'Use o presente para uma rotina. Depois do trabalho indica quando acontece.',
      'Una rutina usa presente; el complemento temporal indica cuándo sucede.',
    ),
    c(
      'Yesterday requires a finished past action. Buy becomes bought.',
      'Ontem indica uma ação concluída. Eu comprar passa a eu comprei.',
      'Una acción terminada ayer requiere pasado, no presente ni un plan futuro.',
    ),
    c(
      'Did not already marks the past. Use buy, not bought, after it.',
      'Não vem antes de comprou. O verbo conserva o passado na negativa.',
      'En inglés did ya marca pasado; en portugués el verbo conjugado conserva el tiempo.',
    ),
    c(
      'I am going to + base verb expresses a plan. Do not conjugate travel again.',
      'Vou + infinitivo expressa um plano. Use viajar, não viajo, depois de vou.',
      'Para planes, el primer verbo se conjuga y el segundo queda en la forma requerida.',
    ),
    c(
      'Did starts the question. Read is the base form after did.',
      'Você leu usa o pretérito perfeito. Não acrescente did à pergunta.',
      'Preguntar por una acción terminada usa did en inglés o el verbo pasado en portugués.',
    ),
    c(
      'Am studying is an action in progress. Because introduces its reason.',
      'Estou estudando indica uma ação em andamento. Porque introduz o motivo.',
      'Distinguí una acción en curso de un hábito y conectá el motivo con because/porque.',
    ),
  ],
  B1: [
    c(
      'Have + past participle describes experience without a finished date. Twice gives the number of visits.',
      'Já visitei fala de uma experiência concluída. Tenho visitado teria outro sentido: repetição recente.',
      'No traduzcas automáticamente el present perfect inglés con ter + participio en portugués.',
    ),
    c(
      'Use present after if for a possible future condition; will marks the result.',
      'Uma condição futura possível usa se chover, no futuro do subjuntivo. Vamos ficar apresenta o resultado.',
      'La condición futura tiene reglas propias de cada idioma: presente inglés, subjuntivo futuro portugués.',
    ),
    c(
      'Should + base verb gives advice. Ask for help is a useful collocation.',
      'Deveria + infinitivo dá um conselho. Pedir ajuda não exige uma preposição extra.',
      'Un consejo no es una obligación: cuidá el modal y las combinaciones naturales.',
    ),
    c(
      'Used to + base verb describes a past habit contrasted with the present.',
      'Trabalhava, no imperfeito, descreve um hábito passado, não um evento isolado.',
      'Diferenciá un hábito anterior de un evento pasado único.',
    ),
    c(
      'Although introduces a difficulty that did not prevent the result.',
      'Embora introduz concessão e aqui pede estivesse, no subjuntivo.',
      'Expresá la dificultad sin perder el resultado; en portugués revisá el subjuntivo tras embora.',
    ),
    c(
      'Had finished places the completion before the other past action.',
      'Tinha terminado marca anterioridade. Antes de ela chegar tem um sujeito próprio.',
      'Marcá qué acción ocurrió primero; no presentes ambas como simultáneas.',
    ),
  ],
  B2: [
    c(
      'If + past form introduces an imagined present condition. Would + base verb gives its result.',
      'Se tivesse usa o imperfeito do subjuntivo. Viajaria apresenta o resultado hipotético.',
      'Una hipótesis actual no usa la misma estructura que una condición futura real.',
    ),
    c(
      'The indirect question keeps statement order: the station is, not is the station.',
      'Você poderia torna o pedido cortês; onde fica a estação apresenta a informação pedida.',
      'Una pregunta indirecta inglesa no conserva la inversión de la pregunta directa.',
    ),
    c(
      'The passive is be + past participle. Written is the participle of write.',
      'A passiva usa ser + particípio. Escrito concorda com relatório.',
      'La pasiva pone el resultado al inicio; revisá auxiliar y participio, no solo el orden.',
    ),
    c(
      'Despite takes a noun phrase and does not need of.',
      'Apesar de pode introduzir o infinitivo com sujeito próprio: a chuva estar forte.',
      'No copies despite of del español: cada conector exige su propia construcción.',
    ),
    c(
      'Had finished shows that the task was completed before she spoke.',
      'Tinha terminado mostra que a tarefa terminou antes de ela falar.',
      'El relato debe dejar clara la anterioridad, no solo que ambos hechos son pasados.',
    ),
    c(
      'However links two complete statements and introduces a contrast.',
      'Contudo liga duas afirmações completas e apresenta contraste.',
      'Una evaluación equilibrada debe conservar las dos ideas y conectar el contraste.',
    ),
  ],
  C1: [
    c(
      'Suggest and possible limit the claim. They do not establish certainty.',
      'Sugerem e possível limitam a afirmação. Não estabelecem certeza.',
      'Ajustá la fuerza de la afirmación a la evidencia: posibilidad no equivale a certeza.',
    ),
    c(
      'Initial rarely triggers inversion: have I seen. This is a marked, formal pattern.',
      'Raramente não exige a inversão inglesa. Tenho visto indica experiência recente ou repetida.',
      'No transfieras la inversión inglesa al portugués; cambia la construcción natural.',
    ),
    c(
      'May have + participle expresses a possible past cause, not a confirmed cause.',
      'Pode ter + particípio apresenta uma causa passada possível, não confirmada.',
      'Mantené la incertidumbre al explicar una causa posible del pasado.',
    ),
    c(
      'Were at the start replaces if in this formal hypothetical condition.',
      'Se a amostra fosse maior é uma hipótese; poderia evita prometer um resultado certo.',
      'La forma hipotética no convierte una mejora posible en una garantía.',
    ),
    c(
      'What matters focuses the issue; whether introduces what needs to be established.',
      'O que importa focaliza a questão. Se introduz uma pergunta indireta neste uso.',
      'Diferenciá la pregunta sobre la evidencia de una condición causal.',
    ),
    c(
      'Albeit adds a concise caveat. Plausible does not mean proven.',
      'Embora acrescenta uma ressalva nesta construção elíptica. Plausível não significa comprovado.',
      'Conservá la salvedad: una conclusión plausible todavía puede necesitar revisión.',
    ),
  ],
  C2: [
    c(
      'Not every rejects a universal claim; it does not mean none.',
      'Nem toda rejeita uma afirmação universal; não significa nenhuma.',
      'Controlá el alcance de la negación: no todos es distinto de ninguno.',
    ),
    c(
      'Necessary is a prerequisite. Sufficient would mean enough by itself.',
      'Necessária é um requisito. Suficiente significaria que basta por si só.',
      'No confundas un requisito necesario con una condición suficiente.',
    ),
    c(
      'Initial had replaces if. Might have changed keeps the consequence uncertain.',
      'Tivessem sido é contrafactual. Poderia ter mudado mantém a consequência incerta.',
      'Expresá la condición contrafactual sin exagerar la certeza de su consecuencia.',
    ),
    c(
      'Not ruling something out keeps it possible without proving it.',
      'Não descartar mantém uma possibilidade aberta sem comprová-la.',
      'Que algo no esté descartado no significa que esté demostrado.',
    ),
    c(
      'One counterexample refutes a universal claim, not necessarily a narrower claim.',
      'Um contraexemplo refuta uma afirmação universal, não necessariamente uma mais restrita.',
      'El contraejemplo refuta la universalidad, no demuestra la afirmación opuesta.',
    ),
    c(
      'Rather than contrasts two interpretations. Equivocal is not unequivocal.',
      'Em vez de contrasta duas interpretações. Equívoca não é inequívoca.',
      'Conservá el matiz entre ambigüedad deliberada y respaldo inequívoco.',
    ),
  ],
};
