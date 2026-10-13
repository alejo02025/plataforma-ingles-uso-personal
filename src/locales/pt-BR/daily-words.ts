import { cefrA1Words } from '@/lib/cefr-curriculum';
import { glossary } from './content';
export const wordCategories = [
  'Todas',
  'Dia a dia',
  'Viagens',
  'Trabalho',
  'Finanças',
  'Tecnologia',
  'Expressões',
] as const;
export type WordCategory = (typeof wordCategories)[number];
export function categoryFor(word: string, example = ''): WordCategory {
  const text = `${word} ${example}`.toLocaleLowerCase('pt-BR');
  if (
    /economizar|orçamento|taxa|reserva|reembolso|recibo|conta bancária|dinheiro|poupança/.test(text)
  )
    return 'Finanças';
  if (/bagagem|embarque|passagem|ônibus|feriado|passeio|viagem|aeroporto|hotel|bairro/.test(text))
    return 'Viagens';
  if (/prazo|agendar|relatório|reunião|equipe|esclarecimento|trabalho/.test(text))
    return 'Trabalho';
  if (/atualização|cópia de segurança|senha|programa|aplicativo|internet/.test(text))
    return 'Tecnologia';
  if (word.trim().includes(' ')) return 'Expressões';
  return 'Dia a dia';
}
export const dailyWords = Object.entries(glossary).map(([word, entry]) => ({
  word,
  ...entry,
  category: categoryFor(word, entry.example),
  usage: entry.example,
  kind: word.includes(' ') ? 'Expressão' : 'Palavra',
}));
export function wordDetails(word: string) {
  return dailyWords.find(
    (item) => item.word.toLocaleLowerCase('pt-BR') === word.toLocaleLowerCase('pt-BR'),
  );
}
export function wordsForDay(day: string, level?: string) {
  const pool =
    level === 'A1' ? dailyWords.filter((word) => cefrA1Words.includes(word.word)) : dailyWords;
  const index = Number(day.replaceAll('-', '')) % pool.length;
  return Array.from({ length: 5 }, (_, offset) => pool[(index + offset * 7) % pool.length]);
}
