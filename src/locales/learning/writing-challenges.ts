type Brief = { en: string; pt: string; es: string; criteria: [string, string, string][] };
const briefs: Record<string, Brief> = {
  A1: {
    en: 'Write three short sentences: introduce yourself, say where you live and name one thing you like.',
    pt: 'Escreva três frases curtas: apresente-se, diga onde mora e uma coisa de que gosta.',
    es: 'Escribí tres frases cortas: presentate, contá dónde vivís y algo que te guste.',
    criteria: [
      [
        'Name the person and use a complete verb.',
        'Identifique a pessoa e use um verbo completo.',
        'Identificá la persona y usá un verbo completo.',
      ],
      [
        'Check agreement and basic negation.',
        'Confira concordância e negação básica.',
        'Revisá concordancia y negación básica.',
      ],
      [
        'Make each detail true or plausible for your situation.',
        'Use detalhes verdadeiros ou plausíveis para sua situação.',
        'Usá detalles verdaderos o plausibles para tu situación.',
      ],
    ],
  },
  A2: {
    en: 'Write four sentences about your routine. Include a finished event, a plan and one question for a colleague.',
    pt: 'Escreva quatro frases sobre sua rotina. Inclua um acontecimento concluído, um plano e uma pergunta para uma colega.',
    es: 'Escribí cuatro frases sobre tu rutina. Incluí un hecho terminado, un plan y una pregunta para un compañero.',
    criteria: [
      [
        'Make the time clear in each sentence.',
        'Deixe claro o tempo de cada frase.',
        'Dejá claro el tiempo de cada oración.',
      ],
      [
        'Check the auxiliary or conjugation in the question.',
        'Confira a conjugação na pergunta.',
        'Revisá el auxiliar o la conjugación de la pregunta.',
      ],
      [
        'Add one concrete detail, not four disconnected examples.',
        'Acrescente um detalhe concreto, não quatro exemplos soltos.',
        'Agregá un detalle concreto; evitá cuatro ejemplos sin relación.',
      ],
    ],
  },
  B1: {
    en: 'Write a short paragraph about a travel or work experience. Set the scene, describe what happened and explain one thing you learned.',
    pt: 'Escreva um parágrafo curto sobre uma experiência de viagem ou trabalho. Apresente o contexto, conte o que aconteceu e algo que aprendeu.',
    es: 'Escribí un párrafo breve sobre una experiencia de viaje o trabajo. Presentá el contexto, contá qué pasó y algo que aprendiste.',
    criteria: [
      [
        'Separate background, events and their results.',
        'Separe contexto, acontecimentos e resultados.',
        'Separá contexto, hechos y resultados.',
      ],
      [
        'Connect the ideas with a reason or a contrast.',
        'Ligue as ideias com uma razão ou um contraste.',
        'Conectá las ideas con una razón o un contraste.',
      ],
      [
        'Check tense choices, references and one recurring error.',
        'Confira tempos, referências e um erro recorrente.',
        'Revisá tiempos, referencias y un error recurrente.',
      ],
    ],
  },
  B2: {
    en: 'Write two short paragraphs giving an opinion on a real decision. Give a reason, a concrete example and a fair counterargument before your conclusion.',
    pt: 'Escreva dois parágrafos curtos sobre uma decisão real. Dê uma razão, um exemplo concreto e um contra-argumento justo antes de concluir.',
    es: 'Escribí dos párrafos breves sobre una decisión real. Incluí una razón, un ejemplo concreto y un contraargumento justo antes de concluir.',
    criteria: [
      [
        'Make a clear claim and support it with a specific example.',
        'Apresente uma posição clara e um exemplo específico.',
        'Presentá una postura clara y un ejemplo específico.',
      ],
      [
        'Acknowledge a limitation without contradicting your argument.',
        'Reconheça um limite sem contradizer o argumento.',
        'Reconocé una limitación sin contradecir el argumento.',
      ],
      [
        'Check linkers, register and precise verb forms.',
        'Confira conectores, registro e formas verbais precisas.',
        'Revisá conectores, registro y precisión verbal.',
      ],
    ],
  },
  C1: {
    en: 'Explain a proposal to a professional audience. Distinguish evidence from inference, acknowledge uncertainty and recommend a justified next step.',
    pt: 'Explique uma proposta a um público profissional. Diferencie evidência de inferência, reconheça incertezas e recomende um próximo passo justificado.',
    es: 'Explicá una propuesta a un público profesional. Separá evidencia de inferencia, reconocé incertidumbres y recomendá un próximo paso justificado.',
    criteria: [
      [
        'Keep the strength of each claim proportional to its evidence.',
        'Ajuste a força da afirmação à evidência.',
        'Ajustá la fuerza de cada afirmación a su evidencia.',
      ],
      [
        'Use cohesive references and an appropriate register.',
        'Use referências coesivas e registro adequado.',
        'Usá referencias cohesivas y un registro adecuado.',
      ],
      [
        'Revise for ambiguity, concision and a clear recommendation.',
        'Revise ambiguidades, concisão e clareza da recomendação.',
        'Revisá ambigüedad, concisión y claridad de la recomendación.',
      ],
    ],
  },
  C2: {
    en: 'Synthesize two contrasting views from material you have read. Preserve attribution, scope and uncertainty; then defend your own nuanced conclusion.',
    pt: 'Sintetize duas perspectivas contrastantes de materiais que leu. Preserve autoria, alcance e incerteza; depois defenda uma conclusão própria e matizada.',
    es: 'Sintetizá dos perspectivas contrastantes de materiales que leíste. Conservá autoría, alcance e incertidumbre; después defendé una conclusión propia y matizada.',
    criteria: [
      [
        'Keep each source’s position and limits intact.',
        'Preserve a posição e os limites de cada fonte.',
        'Conservá la postura y los límites de cada fuente.',
      ],
      [
        'Compare the views instead of merely listing them.',
        'Compare as perspectivas em vez de apenas listá-las.',
        'Compará las posturas en lugar de solo enumerarlas.',
      ],
      [
        'Check subtle changes in negation, modality and register.',
        'Confira mudanças sutis de negação, modalidade e registro.',
        'Revisá cambios sutiles de negación, modalidad y registro.',
      ],
    ],
  },
};
export function writingChallenge(level: string, pt: boolean) {
  const b = briefs[level] || briefs.A1;
  return {
    prompt: pt ? b.pt : b.en,
    spanish: b.es,
    criteria: b.criteria.map(([en, br, es]) => ({ native: pt ? br : en, spanish: es })),
    minutes: level === 'B2' ? 10 : ['C1', 'C2'].includes(level) ? 12 : level === 'B1' ? 7 : 5,
  };
}
