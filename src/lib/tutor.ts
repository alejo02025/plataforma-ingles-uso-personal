import type { Document } from './types';
import { glossary } from './content';
export type Source = { paragraph: number; page: number | null; text: string };
export type TutorQuestion = {
  id: string;
  kind: 'word' | 'detail' | 'open';
  prompt: string;
  options: string[];
  answer: number | null;
  source: Source;
};
const stop = new Set(
  'the and that this with from into are was were have has had not but for you your they their them what which when where why how does did would could should about please explain tell simple english summarize summary some more there here these those because then than our its who can will to of in on at a an is it as be by or if i me we us do so'.split(
    ' ',
  ),
);
export function words(text: string) {
  return (text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []).filter(
    (word) => word.length > 2 && !stop.has(word),
  );
}
function source(doc: Pick<Document, 'paragraphs' | 'pages'>, paragraph: number): Source {
  return { paragraph, page: doc.pages?.[paragraph] || null, text: doc.paragraphs[paragraph] };
}
export function references(
  doc: Pick<Document, 'paragraphs' | 'pages'>,
  question: string,
  focus = 0,
): Source[] {
  const query = new Set(words(question));
  const ranked = doc.paragraphs
    .map((text, index) => {
      const terms = words(text),
        counts = new Map<string, number>();
      for (const term of terms) counts.set(term, (counts.get(term) || 0) + 1);
      const score = [...query].reduce(
        (n, term) => n + (counts.has(term) ? 1 + Math.log(counts.get(term)!) : 0),
        0,
      );
      return { index, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.index === focus) - Number(a.index === focus) ||
        a.index - b.index,
    );
  const selected = ranked.some((item) => item.score > 0)
    ? ranked.filter((item) => item.score > 0).slice(0, 3)
    : [{ index: Math.min(Math.max(focus, 0), doc.paragraphs.length - 1), score: 0 }];
  return selected.map((item) => source(doc, item.index));
}
function sentences(text: string) {
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [])
    .map((s) => s.trim())
    .filter((s) => s.length > 25);
}
export function questions(
  doc: Pick<Document, 'id' | 'paragraphs' | 'pages'>,
  round = 0,
  focus = 0,
): TutorQuestion[] {
  if (!doc.paragraphs.length) return [];
  const paragraph = (focus + Math.floor(round / 3)) % doc.paragraphs.length,
    ref = source(doc, paragraph),
    selected = sentences(ref.text);
  const sentence = selected[round % Math.max(selected.length, 1)] || ref.text;
  const candidates = [...new Set(words(sentence))].filter((word) => word.length >= 4);
  const result: TutorQuestion[] = [];
  if (candidates.length) {
    const chosen = candidates[round % candidates.length];
    const distractors = [...new Set(words(doc.paragraphs.join(' ')))]
      .filter((word) => word !== chosen)
      .sort(
        (a, b) =>
          Math.abs(a.length - chosen.length) - Math.abs(b.length - chosen.length) ||
          a.localeCompare(b),
      )
      .slice(0, 2);
    if (distractors.length === 2) {
      const options = [...distractors];
      options.splice(round % 3, 0, chosen);
      result.push({
        id: `${doc.id}:word:${paragraph}:${round}`,
        kind: 'word',
        prompt: `Complete this sentence with the original word from the text:\n“${sentence.replace(new RegExp(`\\b${chosen}\\b`, 'i'), '_____')}”`,
        options,
        answer: options.indexOf(chosen),
        source: ref,
      });
    }
  }
  const otherSentences = doc.paragraphs
    .flatMap((text) => sentences(text))
    .filter((text) => !ref.text.includes(text))
    .slice(0, 2);
  if (otherSentences.length === 2) {
    const options = [...otherSentences];
    options.splice((round + 1) % 3, 0, sentence);
    result.push({
      id: `${doc.id}:detail:${paragraph}:${round}`,
      kind: 'detail',
      prompt: 'Which statement appears in this section of your document?',
      options,
      answer: options.indexOf(sentence),
      source: ref,
    });
  }
  const prompts = [
    'What is the main idea of this section? Explain it in your own words and include one detail.',
    'Choose one fact from this section. Why do you think it matters?',
    'How does this section connect to your own experience? Use one detail from the text.',
  ];
  result.push({
    id: `${doc.id}:open:${paragraph}:${round}`,
    kind: 'open',
    prompt: prompts[round % prompts.length],
    options: [],
    answer: null,
    source: ref,
  });
  return result;
}
export function guidedReply(
  doc: Pick<Document, 'paragraphs' | 'pages'>,
  message: string,
  focus = 0,
): { content: string; sources: Source[] } {
  const refs = references(doc, message, focus);
  const term = message
    .match(/(?:mean|meaning of|define)\s+["']?([a-z -]+)/i)?.[1]
    ?.trim()
    .replace(/[?"']+$/, '')
    .toLowerCase();
  const definition = term ? glossary[term] : undefined;
  if (definition)
    return {
      content: `${term}: ${definition.meaning}\n\nExample: ${definition.example}\n\nCan you write a sentence using this word?`,
      sources: refs,
    };
  if (/question|quiz|practice/i.test(message))
    return {
      content: `Let's work with this passage:\n\n“${sentences(refs[0].text)[0] || refs[0].text}”\n\nWhat is the main point? Answer in English and include one detail from the text.`,
      sources: refs,
    };
  return {
    content: `Here is the relevant passage from your document:\n\n${refs.map((ref) => `“${ref.text}”`).join('\n\n')}\n\nWhat do you think the key idea is? Try explaining it in one or two English sentences.`,
    sources: refs,
  };
}
export function unverifiedNames(text: string, sources: Source[]): string[] {
  const reference = sources
    .map((source) => source.text)
    .join(' ')
    .toLowerCase();
  const allowed = new Set([
    'English',
    'PDF',
    'AI',
    'CEFR',
    'I',
    'The',
    'This',
    'That',
    'It',
    'They',
    'We',
    'You',
    'Your',
    'Here',
    'There',
    'In',
    'At',
    'On',
    'For',
    'According',
    'Based',
    'What',
    'Which',
    'How',
    'Where',
    'When',
    'Why',
    'Can',
    'Could',
    'Do',
    'Yes',
    'No',
    'However',
    'First',
    'Next',
    'Also',
    'Answer',
    'Question',
  ]);
  const unknown: string[] = [];
  for (const match of text.matchAll(/\b[A-Z][a-z]{2,}(?:-[A-Z][a-z]+)?\b/g)) {
    if (allowed.has(match[0]) || reference.includes(match[0].toLowerCase())) continue;
    unknown.push(match[0]);
  }
  return [...new Set(unknown)];
}
export function sourceAnswer(sources: Source[], question: string) {
  const query = new Set(words(question));
  const ranked = sources
    .flatMap((source) =>
      sentences(source.text).map((text) => ({
        text,
        score: words(text).filter((word) => query.has(word)).length,
      })),
    )
    .sort((a, b) => b.score - a.score);
  return `The passage says:\n\n“${ranked[0]?.text || sources[0].text}”\n\nWhat can you infer from this detail? Try replying in English.`;
}

export function checkedLocalReply(
  content: string,
  sources: Source[],
  question: string,
): { content: string; mode: 'local' | 'guided' } {
  const factual =
    /\b(where|when|who|how many|how much|what (?:is|are|was|were|did|does|do)|which)\b/i.test(
      question,
    );
  if (unverifiedNames(content, sources).length)
    return { content: sourceAnswer(sources, question), mode: 'guided' };
  if (factual) {
    // Keep factual claims in the author's words; the small model contributes a follow-up.
    const followUp = content
      .match(/[^.!?\n]{5,180}\?/g)
      ?.at(-1)
      ?.trim();
    const quoted = sourceAnswer(sources, question);
    return {
      content: followUp
        ? quoted.replace('What can you infer from this detail? Try replying in English.', followUp)
        : quoted,
      mode: 'guided',
    };
  }
  return { content: content.trim(), mode: 'local' };
}
