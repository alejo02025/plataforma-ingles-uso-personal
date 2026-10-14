import { cefrA1Words } from '@/lib/cefr-curriculum';
const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
// Teaching groups for this app, rather than certified CEFR classifications of isolated words.
const basic = ['quiet', 'train', 'share', 'learn', 'spend'];
const everyday = [
  'habit',
  'out loud',
  'travel guide',
  'narrow',
  'neighbourhood',
  'savings',
  'fees',
  'timetable',
  'shared',
  'luggage',
  'refund',
  'receipt',
  'in advance',
  'appointment',
  'on my way',
  'boarding pass',
  'update',
  'backup',
];
const advanced = [
  'compound interest',
  'judgement',
  'misleading',
  'assumptions',
  'clarification',
  'ask for clarification',
  'thoughtful',
];
const ptEveryday = [
  'bagagem',
  'passagem',
  'passeio',
  'bairro',
  'poupança',
  'recibo',
  'reembolso',
  'prazo',
  'economizar',
  'agendar',
  'atualização',
  'cópia de segurança',
  'ônibus',
  'feriado',
  'dinheiro',
  'reserva',
  'conta bancária',
];
const ptAdvanced = [
  'discernimento',
  'pressupostos',
  'enganoso',
  'esclarecimento',
  'juros compostos',
];
export function vocabularyBand(word: string, pt: boolean) {
  if (pt)
    return cefrA1Words.includes(word)
      ? 0
      : ptEveryday.includes(word)
        ? 1
        : ptAdvanced.includes(word)
          ? 4
          : 2;
  return basic.includes(word) ? 0 : everyday.includes(word) ? 1 : advanced.includes(word) ? 4 : 2;
}
export function vocabularyAtLevel(word: string, level: string | undefined, pt: boolean) {
  if (!level) return true;
  return vocabularyBand(word, pt) <= Math.max(0, levels.indexOf(level));
}
