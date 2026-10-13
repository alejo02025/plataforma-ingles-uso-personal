import { isPortuguese } from './workspace';
export const voiceDocumentId = 'voice-room';
export const voiceTopics = [
  {
    id: 'daily',
    title: 'My day',
    prompt: 'Tell me about your day. What was one good moment?',
    example: 'Today I went for a walk and had coffee with a friend.',
  },
  {
    id: 'travel',
    title: 'Travel',
    prompt: 'Where would you like to travel, and why?',
    example: 'I would like to visit a quiet town near the sea.',
  },
  {
    id: 'work',
    title: 'Work',
    prompt: 'What are you working on this week?',
    example: 'This week I am working on a presentation.',
  },
  {
    id: 'free',
    title: 'Free conversation',
    prompt: 'What would you like to talk about today?',
    example: 'I would like to talk about a book I am reading.',
  },
] as const;
export function checkedVoiceReply(text: string) {
  const value = text.trim().slice(0, 1800);
  if (
    !value ||
    /(?:I (?:have|earned|won|hold)|my|tenho|ganhei|possuo|meus?)\b[^.!?\n]{0,90}(?:\d+ years|years of (?:teaching|experience)|award|doctorate|PhD|pr[êe]mio|\d+ anos|doutorado)/i.test(
      value,
    )
  )
    return isPortuguese
      ? 'Vamos praticar com calma. Conte um pouco mais e tente usar uma frase completa.'
      : 'Let’s practise one step at a time. Tell me a little more using a complete sentence.';
  // The small local model may switch languages. Keep a transparent Portuguese practice prompt.
  if (
    isPortuguese &&
    /\b(?:the|you|your|what|would|tell|english)\b/i.test(value) &&
    !/\b(?:voc[êe]|como|uma|seu|sua|vamos|conte)\b/i.test(value)
  )
    return 'Vamos continuar em português. Conte um pouco mais: onde, quando ou com quem?';
  return value;
}

export function coachResponse(raw: string, message: string, turns: number) {
  const content = checkedVoiceReply(raw);
  const repeated = /\b([\p{L}]+\s+[\p{L}]+)\s+\1\b/iu.test(content);
  if (
    content === raw.trim().slice(0, 1800) &&
    content.includes('?') &&
    content.toLocaleLowerCase() !== message.trim().toLocaleLowerCase() &&
    !repeated
  )
    return { content, mode: 'local' as const };
  const prompts = isPortuguese
    ? [
        'Conte um pouco mais. O que você mais gostou?',
        'Como você se sentiu? Tente responder com uma frase completa.',
        'Você pode dar um exemplo? Use um detalhe da sua própria vida.',
        'O que você faria de diferente da próxima vez?',
        'O que aconteceu depois? Conte em uma ou duas frases.',
      ]
    : [
        'Tell me a little more. What did you enjoy most?',
        'How did you feel? Try answering in a complete sentence.',
        'Can you give an example? Use one detail from your own life.',
        'What would you do differently next time?',
        'What happened next? Tell me in one or two sentences.',
      ];
  return { content: prompts[turns % prompts.length], mode: 'guided' as const };
}
