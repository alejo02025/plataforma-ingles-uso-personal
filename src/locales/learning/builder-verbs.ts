import { englishVerbs, portugueseVerbs, type Verb } from './foundations';
import { spanishVerbModel } from './spanish-verb-models';
// Each row is a reviewed action with a compatible complement in all three languages.
// Inflected dictionary words are not counted as separate verbs. Course banks remain unchanged.
const rows = `
write|escribir|escrever|a message|uma mensagem|un mensaje|wrote|written|writing
need|necesitar|precisar|more time|de mais tempo|más tiempo|needed|needed|needing
open|abrir|abrir|a window|uma janela|una ventana|opened|opened|opening
close|cerrar|fechar|the door|a porta|la puerta|closed|closed|closing
call|llamar|chamar|a friend|um amigo|un amigo|called|called|calling
help|ayudar|ajudar|a friend|um amigo|un amigo|helped|helped|helping
listen|escuchar|escutar|to music|música|música|listened|listened|listening
watch|ver|assistir|a film|a um filme|una película|watched|watched|watching
look|mirar|olhar|at the sky|para o céu|el cielo|looked|looked|looking
ask|preguntar|perguntar|about the price|sobre o preço|por el precio|asked|asked|asking
answer|responder|responder|a question|a uma pergunta|una pregunta|answered|answered|answering
explain|explicar|explicar|the problem|o problema|el problema|explained|explained|explaining
repeat|repetir|repetir|the sentence|a frase|la oración|repeated|repeated|repeating
describe|describir|descrever|a place|um lugar|un lugar|described|described|describing
discuss|discutir|discutir|an idea|uma ideia|una idea|discussed|discussed|discussing
share|compartir|compartilhar|an idea|uma ideia|una idea|shared|shared|sharing
invite|invitar|convidar|a friend|um amigo|un amigo|invited|invited|inviting
thank|agradecer|agradecer|a teacher|a um professor|a un profesor|thanked|thanked|thanking
promise|prometer|prometer|to help|ajudar|ayudar|promised|promised|promising
suggest|recomendar|recomendar|a restaurant|um restaurante|un restaurante|suggested|suggested|suggesting
agree|concordar|concordar|with the idea|com a ideia|con la idea|agreed|agreed|agreeing
disagree|discrepar|discordar|with the idea|da ideia|de la idea|disagreed|disagreed|disagreeing
translate|traducir|traduzir|a text|um texto|un texto|translated|translated|translating
pronounce|pronunciar|pronunciar|a word|uma palavra|una palabra|pronounced|pronounced|pronouncing
spell|deletrear|soletrar|a name|um nome|un nombre|spelled|spelled|spelling
practice|practicar|praticar|a new skill|uma nova habilidade|una habilidad nueva|practiced|practiced|practicing
review|repasar|revisar|the lesson|a lição|la lección|reviewed|reviewed|reviewing
memorize|memorizar|memorizar|a word|uma palavra|una palabra|memorized|memorized|memorizing
understand|entender|entender|the lesson|a lição|la lección|understood|understood|understanding
remember|recordar|lembrar|a name|de um nome|un nombre|remembered|remembered|remembering
forget|olvidar|esquecer|a name|um nome|un nombre|forgot|forgotten|forgetting
discover|descubrir|descobrir|a new place|um novo lugar|un lugar nuevo|discovered|discovered|discovering
research|investigar|pesquisar|a topic|um tema|un tema|researched|researched|researching
compare|comparar|comparar|two options|duas opções|dos opciones|compared|compared|comparing
analyze|analizar|analisar|the results|os resultados|los resultados|analyzed|analyzed|analyzing
solve|resolver|resolver|a problem|um problema|un problema|solved|solved|solving
calculate|calcular|calcular|the total|o total|el total|calculated|calculated|calculating
count|contar|contar|the chairs|as cadeiras|las sillas|counted|counted|counting
measure|medir|medir|the room|o quarto|la habitación|measured|measured|measuring
check|revisar|verificar|the details|os detalhes|los detalles|checked|checked|checking
correct|corregir|corrigir|a mistake|um erro|un error|corrected|corrected|correcting
improve|mejorar|melhorar|a skill|uma habilidade|una habilidad|improved|improved|improving
develop|desarrollar|desenvolver|an idea|uma ideia|una idea|developed|developed|developing
create|crear|criar|a plan|um plano|un plan|created|created|creating
design|diseñar|projetar|a house|uma casa|una casa|designed|designed|designing
draw|dibujar|desenhar|a house|uma casa|una casa|drew|drawn|drawing
paint|pintar|pintar|a picture|um quadro|un cuadro|painted|painted|painting
build|construir|construir|a house|uma casa|una casa|built|built|building
repair|reparar|reparar|a chair|uma cadeira|una silla|repaired|repaired|repairing
fix|arreglar|consertar|a bicycle|uma bicicleta|una bicicleta|fixed|fixed|fixing
use|usar|usar|a map|um mapa|un mapa|used|used|using
try|probar|experimentar|a new recipe|uma nova receita|una receta nueva|tried|tried|trying
choose|elegir|escolher|a book|um livro|un libro|chose|chosen|choosing
decide|decidir|decidir|to study|estudar|estudiar|decided|decided|deciding
plan|planificar|planejar|a trip|uma viagem|un viaje|planned|planned|planning
organize|organizar|organizar|a meeting|uma reunião|una reunión|organized|organized|organizing
prepare|preparar|preparar|dinner|o jantar|la cena|prepared|prepared|preparing
start|empezar|começar|a new project|um novo projeto|un proyecto nuevo|started|started|starting
finish|terminar|terminar|the task|a tarefa|la tarea|finished|finished|finishing
continue|continuar|continuar|the project|o projeto|el proyecto|continued|continued|continuing
stop|parar|parar|at the corner|na esquina|en la esquina|stopped|stopped|stopping
wait|esperar|esperar|for the bus|o ônibus|el colectivo|waited|waited|waiting
arrive|llegar|chegar|at the station|à estação|a la estación|arrived|arrived|arriving
leave|salir|sair|early|cedo|temprano|left|left|leaving
return|volver|voltar|home|para casa|a casa|returned|returned|returning
visit|visitar|visitar|a museum|um museu|un museo|visited|visited|visiting
explore|explorar|explorar|the city|a cidade|la ciudad|explored|explored|exploring
walk|caminar|caminhar|in the park|no parque|en el parque|walked|walked|walking
run|correr|correr|in the park|no parque|en el parque|ran|run|running
swim|nadar|nadar|in the pool|na piscina|en la pileta|swam|swum|swimming
dance|bailar|dançar|at the party|na festa|en la fiesta|danced|danced|dancing
sing|cantar|cantar|a song|uma canção|una canción|sang|sung|singing
play|jugar|jogar|football|futebol|al fútbol|played|played|playing
exercise|entrenar|treinar|at the gym|na academia|en el gimnasio|exercised|exercised|exercising
rest|descansar|descansar|at home|em casa|en casa|rested|rested|resting
relax|relajar|relaxar|the muscles|os músculos|los músculos|relaxed|relaxed|relaxing
sleep|dormir|dormir|for eight hours|por oito horas|ocho horas|slept|slept|sleeping
wake|despertar|despertar|a friend|um amigo|a un amigo|woke|woken|waking
cook|cocinar|cozinhar|rice|arroz|arroz|cooked|cooked|cooking
bake|hornear|assar|bread|pão|pan|baked|baked|baking
wash|lavar|lavar|the dishes|a louça|los platos|washed|washed|washing
clean|limpiar|limpar|the kitchen|a cozinha|la cocina|cleaned|cleaned|cleaning
cut|cortar|cortar|the bread|o pão|el pan|cut|cut|cutting
mix|mezclar|misturar|the ingredients|os ingredientes|los ingredientes|mixed|mixed|mixing
add|agregar|adicionar|some salt|um pouco de sal|un poco de sal|added|added|adding
remove|quitar|retirar|the label|a etiqueta|la etiqueta|removed|removed|removing
buy|comprar|comprar|a ticket|uma passagem|un pasaje|bought|bought|buying
sell|vender|vender|a bicycle|uma bicicleta|una bicicleta|sold|sold|selling
pay|pagar|pagar|the bill|a conta|la cuenta|paid|paid|paying
save|ahorrar|economizar|money|dinheiro|dinero|saved|saved|saving
spend|gastar|gastar|money|dinheiro|dinero|spent|spent|spending
invest|invertir|investir|in education|em educação|en educación|invested|invested|investing
borrow|pedir|pedir|a book from a friend|um livro emprestado|un libro prestado|borrowed|borrowed|borrowing
lend|prestar|emprestar|a book to a friend|um livro a um amigo|un libro a un amigo|lent|lent|lending
rent|alquilar|alugar|a flat|um apartamento|un departamento|rented|rented|renting
book|reservar|reservar|a room|um quarto|una habitación|booked|booked|booking
cancel|cancelar|cancelar|a reservation|uma reserva|una reserva|cancelled|cancelled|cancelling
confirm|confirmar|confirmar|a reservation|uma reserva|una reserva|confirmed|confirmed|confirming
send|enviar|enviar|a message|uma mensagem|un mensaje|sent|sent|sending
receive|recibir|receber|a message|uma mensagem|un mensaje|received|received|receiving
deliver|entregar|entregar|a package|um pacote|un paquete|delivered|delivered|delivering
carry|llevar|carregar|a bag|uma bolsa|un bolso|carried|carried|carrying
bring|traer|trazer|a book|um livro|un libro|brought|brought|bringing
take|tomar|tirar|a photo|uma foto|una foto|took|taken|taking
put|poner|pôr|the book on the table|o livro na mesa|el libro en la mesa|put|put|putting
find|encontrar|encontrar|a solution|uma solução|una solución|found|found|finding
lose|perder|perder|a key|uma chave|una llave|lost|lost|losing
keep|guardar|guardar|a receipt|um recibo|un recibo|kept|kept|keeping
collect|recoger|recolher|the tickets|os ingressos|las entradas|collected|collected|collecting
throw|tirar|jogar|the ball|a bola|la pelota|threw|thrown|throwing
catch|atrapar|pegar|the ball|a bola|la pelota|caught|caught|catching
hold|sostener|segurar|the rope|a corda|la cuerda|held|held|holding
push|empujar|empurrar|the door|a porta|la puerta|pushed|pushed|pushing
pull|tirar|puxar|the rope|a corda|de la cuerda|pulled|pulled|pulling
lift|levantar|levantar|the box|a caixa|la caja|lifted|lifted|lifting
turn|girar|girar|the handle|a maçaneta|la manija|turned|turned|turning
move|mover|mover|the chair|a cadeira|la silla|moved|moved|moving
follow|seguir|seguir|the instructions|as instruções|las instrucciones|followed|followed|following
lead|dirigir|liderar|the team|a equipe|el equipo|led|led|leading
manage|administrar|administrar|a project|um projeto|un proyecto|managed|managed|managing
gather|reunir|reunir|the team|a equipe|al equipo|gathered|gathered|gathering
join|participar|participar|the meeting|da reunião|en la reunión|joined|joined|joining
support|apoyar|apoiar|the team|a equipe|al equipo|supported|supported|supporting
protect|proteger|proteger|the environment|o meio ambiente|el medioambiente|protected|protected|protecting
respect|respetar|respeitar|the rules|as regras|las reglas|respected|respected|respecting
allow|permitir|permitir|a break|uma pausa|una pausa|allowed|allowed|allowing
avoid|evitar|evitar|a mistake|um erro|un error|avoided|avoided|avoiding
accept|aceptar|aceitar|an invitation|um convite|una invitación|accepted|accepted|accepting
refuse|rechazar|recusar|an invitation|um convite|una invitación|refused|refused|refusing
offer|ofrecer|oferecer|some help|ajuda|ayuda|offered|offered|offering
request|solicitar|solicitar|information|informações|información|requested|requested|requesting
prefer|preferir|preferir|tea|chá|té|preferred|preferred|preferring
appreciate|apreciar|apreciar|music|música|la música|appreciated|appreciated|appreciating
love|amar|amar|music|música|la música|loved|loved|loving
hate|odiar|odiar|noise|barulho|el ruido|hated|hated|hating
enjoy|disfrutar|aproveitar|the trip|a viagem|del viaje|enjoyed|enjoyed|enjoying
hope|esperar|esperar|for good news|boas notícias|buenas noticias|hoped|hoped|hoping
trust|confiar|confiar|a friend|em um amigo|en un amigo|trusted|trusted|trusting
believe|creer|acreditar|the story|na história|la historia|believed|believed|believing
imagine|imaginar|imaginar|a better future|um futuro melhor|un futuro mejor|imagined|imagined|imagining
think|pensar|pensar|about the plan|no plano|en el plan|thought|thought|thinking
feel|sentir|sentir|the cold|o frio|el frío|felt|felt|feeling
laugh|reír|rir|at the joke|da piada|del chiste|laughed|laughed|laughing
smile|sonreír|sorrir|at a friend|para um amigo|a un amigo|smiled|smiled|smiling
cry|llorar|chorar|at the end of the film|no final do filme|al final de la película|cried|cried|crying
celebrate|celebrar|celebrar|a birthday|um aniversário|un cumpleaños|celebrated|celebrated|celebrating
win|ganar|ganhar|a prize|um prêmio|un premio|won|won|winning
fail|fallar|falhar|the test|no teste|en la prueba|failed|failed|failing
achieve|lograr|alcançar|a goal|uma meta|una meta|achieved|achieved|achieving
change|cambiar|mudar|the plan|o plano|el plan|changed|changed|changing
adapt|adaptar|adaptar|the plan|o plano|el plan|adapted|adapted|adapting
balance|equilibrar|equilibrar|the budget|o orçamento|el presupuesto|balanced|balanced|balancing
connect|conectar|conectar|the cable|o cabo|el cable|connected|connected|connecting
disconnect|desconectar|desconectar|the cable|o cabo|el cable|disconnected|disconnected|disconnecting
charge|cargar|carregar|the phone|o celular|el celular|charged|charged|charging
download|descargar|baixar|a file|um arquivo|un archivo|downloaded|downloaded|downloading
upload|subir|enviar|a file|um arquivo|un archivo|uploaded|uploaded|uploading
print|imprimir|imprimir|a document|um documento|un documento|printed|printed|printing
copy|copiar|copiar|the address|o endereço|la dirección|copied|copied|copying
paste|pegar|colar|the text|o texto|el texto|pasted|pasted|pasting
delete|borrar|apagar|a file|um arquivo|un archivo|deleted|deleted|deleting
search|buscar|buscar|for a file|um arquivo|un archivo|searched|searched|searching
select|seleccionar|selecionar|a file|um arquivo|un archivo|selected|selected|selecting
update|actualizar|atualizar|the app|o aplicativo|la app|updated|updated|updating
install|instalar|instalar|the app|o aplicativo|la app|installed|installed|installing
record|grabar|gravar|a video|um vídeo|un video|recorded|recorded|recording
edit|editar|editar|a video|um vídeo|un video|edited|edited|editing
sip|sorber|tomar|some tea|um chá|un poco de té|sipped|sipped|sipping
publish|publicar|publicar|an article|um artigo|un artículo|published|published|publishing
`;
// Only the finite forms that deviate from regular spelling need overrides.
const ptSpecial: Record<string, Partial<Verb>> = {
  reunir: {
    present: ['reúno', 'reúne', 'reunimos', 'reúnem'],
    subjunctive: ['reúna', 'reúna', 'reunamos', 'reúnam'],
  },
  traduzir: { present: ['traduzo', 'traduz', 'traduzimos', 'traduzem'] },
  escrever: { participle: 'escrito' },
  abrir: { participle: 'aberto' },
  descrever: { participle: 'descrito' },
  descobrir: { participle: 'descoberto' },
  imprimir: { participle: 'impresso' },
  medir: {
    present: ['meço', 'mede', 'medimos', 'medem'],
    subjunctive: ['meça', 'meça', 'meçamos', 'meçam'],
  },
  corrigir: {
    present: ['corrijo', 'corrige', 'corrigimos', 'corrigem'],
    subjunctive: ['corrija', 'corrija', 'corrijamos', 'corrijam'],
  },
  repetir: {
    present: ['repito', 'repete', 'repetimos', 'repetem'],
    subjunctive: ['repita', 'repita', 'repitamos', 'repitam'],
  },
  construir: {
    imperfect: ['construía', 'construía', 'construíamos', 'construíam'],
    participle: 'construído',
    futureSubjunctive: ['construir', 'construir', 'construirmos', 'construírem'],
    personalInfinitive: ['construir', 'construir', 'construirmos', 'construírem'],
    present: ['construo', 'constrói', 'construímos', 'constroem'],
    pastForms: ['construí', 'construiu', 'construímos', 'construíram'],
    subjunctive: ['construa', 'construa', 'construamos', 'construam'],
  },
  sair: {
    participle: 'saído',
    futureSubjunctive: ['sair', 'sair', 'sairmos', 'saírem'],
    personalInfinitive: ['sair', 'sair', 'sairmos', 'saírem'],
    present: ['saio', 'sai', 'saímos', 'saem'],
    pastForms: ['saí', 'saiu', 'saímos', 'saíram'],
    subjunctive: ['saia', 'saia', 'saiamos', 'saiam'],
    imperfect: ['saía', 'saía', 'saíamos', 'saíam'],
  },
  odiar: {
    present: ['odeio', 'odeia', 'odiamos', 'odeiam'],
    subjunctive: ['odeie', 'odeie', 'odiemos', 'odeiem'],
  },
  dormir: {
    present: ['durmo', 'dorme', 'dormimos', 'dormem'],
    subjunctive: ['durma', 'durma', 'durmamos', 'durmam'],
  },
  investir: {
    present: ['invisto', 'investe', 'investimos', 'investem'],
    subjunctive: ['invista', 'invista', 'invistamos', 'invistam'],
  },
  perder: {
    present: ['perco', 'perde', 'perdemos', 'perdem'],
    subjunctive: ['perca', 'perca', 'percamos', 'percam'],
  },
  preferir: {
    present: ['prefiro', 'prefere', 'preferimos', 'preferem'],
    subjunctive: ['prefira', 'prefira', 'prefiramos', 'prefiram'],
  },
  sentir: {
    present: ['sinto', 'sente', 'sentimos', 'sentem'],
    subjunctive: ['sinta', 'sinta', 'sintamos', 'sintam'],
  },
  seguir: {
    present: ['sigo', 'segue', 'seguimos', 'seguem'],
    subjunctive: ['siga', 'siga', 'sigamos', 'sigam'],
  },
  pedir: {
    present: ['peço', 'pede', 'pedimos', 'pedem'],
    subjunctive: ['peça', 'peça', 'peçamos', 'peçam'],
  },
  rir: { present: ['rio', 'ri', 'rimos', 'riem'], subjunctive: ['ria', 'ria', 'riamos', 'riam'] },
  sorrir: {
    present: ['sorrio', 'sorri', 'sorrimos', 'sorriem'],
    subjunctive: ['sorria', 'sorria', 'sorriamos', 'sorriam'],
  },
  trazer: {
    present: ['trago', 'traz', 'trazemos', 'trazem'],
    pastForms: ['trouxe', 'trouxe', 'trouxemos', 'trouxeram'],
    formal: ['trarei', 'trará', 'traremos', 'trarão'],
    subjunctive: ['traga', 'traga', 'tragamos', 'tragam'],
    pastStemStressed: 'trouxé',
  },
  pôr: {
    present: ['ponho', 'põe', 'pomos', 'põem'],
    pastForms: ['pus', 'pôs', 'pusemos', 'puseram'],
    formal: ['porei', 'porá', 'poremos', 'porão'],
    subjunctive: ['ponha', 'ponha', 'ponhamos', 'ponham'],
    imperfect: ['punha', 'punha', 'púnhamos', 'punham'],
    participle: 'posto',
    gerund: 'pondo',
    pastStemStressed: 'pusé',
  },
};
function regularPT(word: string): Partial<Verb> {
  const stem = word.slice(0, -2),
    end = word.slice(-2),
    ar = end === 'ar',
    ir = end === 'ir';
  let yo = stem;
  if (/ger$|gir$/.test(word)) yo = stem.slice(0, -1) + 'j';
  if (/cer$/.test(word)) yo = stem.slice(0, -1) + 'ç';
  let subjRoot = ar ? stem.replace(/c$/, 'qu').replace(/g$/, 'gu').replace(/ç$/, 'c') : yo;
  return {
    present: (ar ? ['o', 'a', 'amos', 'am'] : ['o', 'e', ir ? 'imos' : 'emos', 'em']).map(
      (e, n) => (n === 0 ? yo : stem) + e,
    ),
    pastForms: (ar
      ? ['ei', 'ou', 'amos', 'aram']
      : ir
        ? ['i', 'iu', 'imos', 'iram']
        : ['i', 'eu', 'emos', 'eram']
    ).map(
      (e, n) =>
        (ar && n === 0 ? stem.replace(/c$/, 'qu').replace(/g$/, 'gu').replace(/ç$/, 'c') : stem) +
        e,
    ),
    formal: ['ei', 'á', 'emos', 'ão'].map((e) => word + e),
    subjunctive: (ar ? ['e', 'e', 'emos', 'em'] : ['a', 'a', 'amos', 'am']).map(
      (e) => subjRoot + e,
    ),
    gerund: stem + (ar ? 'ando' : ir ? 'indo' : 'endo'),
    participle: stem + (ar ? 'ado' : 'ido'),
  };
}
function thirdEN(word: string) {
  if (word.endsWith('y') && !/[aeiou]y$/.test(word)) return word.slice(0, -1) + 'ies';
  return word + (/(s|sh|ch|x|z|o)$/.test(word) ? 'es' : 's');
}
const expandedEN: Verb[] = [],
  expandedPT: Verb[] = [];
for (const row of rows.trim().split('\n')) {
  const [en, es, pt, complementEN, complementPT, complementES, past, participle, gerund] =
    row.split('|');
  const grammar = spanishVerbModel(es);
  if (!englishVerbs.some((v) => v.id === en) && !expandedEN.some((v) => v.id === en))
    expandedEN.push({
      id: en,
      word: en,
      es,
      complement: complementEN,
      complementES,
      third: thirdEN(en),
      past,
      participle,
      gerund,
      esGrammar: grammar,
    });
  if (!portugueseVerbs.some((v) => v.id === pt) && !expandedPT.some((v) => v.id === pt))
    expandedPT.push({
      id: pt,
      word: pt,
      es,
      complement: complementPT,
      complementES,
      ...regularPT(pt),
      ...ptSpecial[pt],
      esGrammar: grammar,
    });
}
export const englishBuilderVerbs = [...englishVerbs, ...expandedEN];
export const portugueseBuilderVerbs = [...portugueseVerbs, ...expandedPT];
