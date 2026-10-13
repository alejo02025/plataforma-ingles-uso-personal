import { glossary } from './content';
export const wordCategories = [
  'All',
  'Everyday Life',
  'Travel',
  'Work',
  'Finance',
  'Technology',
  'Expressions',
] as const;
export type WordCategory = (typeof wordCategories)[number];
const extra: Record<
  string,
  { meaning: string; pronunciation: string; example: string; category: WordCategory; usage: string }
> = {
  commute: {
    meaning: 'A regular journey between home and work or school.',
    pronunciation: '/kəˈmjuːt/',
    example: 'My commute takes about thirty minutes.',
    category: 'Work',
    usage: 'How long is your commute?',
  },
  deadline: {
    meaning: 'The latest time or date when something must be finished.',
    pronunciation: '/ˈdedlaɪn/',
    example: 'The deadline for this report is Friday.',
    category: 'Work',
    usage: 'Could we extend the deadline by one day?',
  },
  affordable: {
    meaning: 'Not too expensive for you to pay for.',
    pronunciation: '/əˈfɔːrdəbəl/',
    example: 'We are looking for an affordable apartment.',
    category: 'Finance',
    usage: 'Is there a more affordable option?',
  },
  reliable: {
    meaning: 'Someone or something you can trust to work well.',
    pronunciation: '/rɪˈlaɪəbəl/',
    example: 'The train is usually a reliable way to travel.',
    category: 'Everyday Life',
    usage: 'I need a reliable internet connection.',
  },
  'make sense': {
    meaning: 'To be clear, understandable, or reasonable.',
    pronunciation: '/meɪk sens/',
    example: 'Your explanation makes sense now.',
    category: 'Expressions',
    usage: 'Does this plan make sense to you?',
  },
  'catch up': {
    meaning: 'To learn what has happened recently, or reach the same level as others.',
    pronunciation: '/kætʃ ʌp/',
    example: 'Let’s catch up over a coffee this weekend.',
    category: 'Expressions',
    usage: 'I need to catch up on my emails.',
  },
  awkward: {
    meaning: 'Uncomfortable, embarrassing, or difficult to deal with.',
    pronunciation: '/ˈɔːkwərd/',
    example: 'There was an awkward silence after the question.',
    category: 'Everyday Life',
    usage: 'I felt awkward asking for help.',
  },
  wonder: {
    meaning: 'To think about something because you want to know more.',
    pronunciation: '/ˈwʌndər/',
    example: 'I wonder what time the shop closes.',
    category: 'Everyday Life',
    usage: 'I was wondering if you could help me.',
  },
  luggage: {
    meaning: 'Bags and suitcases you take when you travel.',
    pronunciation: '/ˈlʌɡɪdʒ/',
    example: 'We left our luggage at the hotel.',
    category: 'Travel',
    usage: 'Can I leave my luggage here for an hour?',
  },
  refund: {
    meaning: 'Money returned to you after you return an item or cancel a service.',
    pronunciation: '/ˈriːfʌnd/',
    example: 'I received a refund for the cancelled ticket.',
    category: 'Finance',
    usage: 'Could I ask for a refund?',
  },
  receipt: {
    meaning: 'A document showing that you paid for something.',
    pronunciation: '/rɪˈsiːt/',
    example: 'Keep the receipt in case you need to return it.',
    category: 'Finance',
    usage: 'Could I have a receipt, please?',
  },
  feedback: {
    meaning: 'Comments or information about how well something was done.',
    pronunciation: '/ˈfiːdbæk/',
    example: 'Your feedback helped me improve the presentation.',
    category: 'Work',
    usage: 'Could you give me some feedback on this draft?',
  },
  'figure out': {
    meaning: 'To understand or find the answer to something.',
    pronunciation: '/ˈfɪɡjər aʊt/',
    example: 'I’m trying to figure out how this app works.',
    category: 'Expressions',
    usage: 'We can figure it out together.',
  },
  'in advance': {
    meaning: 'Before a particular event or time.',
    pronunciation: '/ɪn ədˈvæns/',
    example: 'It is cheaper to book the train in advance.',
    category: 'Expressions',
    usage: 'Please let me know in advance.',
  },
  appointment: {
    meaning: 'An arranged time to meet someone or receive a service.',
    pronunciation: '/əˈpɔɪntmənt/',
    example: 'I have a dentist appointment tomorrow.',
    category: 'Everyday Life',
    usage: 'I would like to make an appointment.',
  },
  'on my way': {
    meaning: 'Travelling towards a place.',
    pronunciation: '/ɒn maɪ weɪ/',
    example: 'I’m on my way to the station.',
    category: 'Expressions',
    usage: 'I’m on my way. I’ll be there in ten minutes.',
  },
  'boarding pass': {
    meaning: 'A document that allows you to get on a plane.',
    pronunciation: '/ˈbɔːrdɪŋ pæs/',
    example: 'Please have your boarding pass ready.',
    category: 'Travel',
    usage: 'Where can I print my boarding pass?',
  },
  update: {
    meaning: 'A change that brings information or software up to date.',
    pronunciation: '/ˈʌpdeɪt/',
    example: 'The latest update makes the app easier to use.',
    category: 'Technology',
    usage: 'Could you send me an update on the project?',
  },
  backup: {
    meaning: 'An extra copy of data kept in case the original is lost.',
    pronunciation: '/ˈbækʌp/',
    example: 'I keep a backup of my important files.',
    category: 'Technology',
    usage: 'Remember to make a backup before changing the settings.',
  },
  thoughtful: {
    meaning: 'Showing care and attention to other people or to an idea.',
    pronunciation: '/ˈθɔːtfəl/',
    example: 'That was a thoughtful message.',
    category: 'Everyday Life',
    usage: 'Thank you for being so thoughtful.',
  },
};
export function categoryFor(word: string, example = ''): WordCategory {
  const normalized = word.toLowerCase().trim();
  if (extra[normalized]) return extra[normalized].category;
  if (
    /compound interest|savings|fees|growth|refund|budget|inflation|account|spending|money/.test(
      `${normalized} ${example.toLowerCase()}`,
    )
  )
    return 'Finance';
  if (
    /travel|timetable|neighbourhood|boarding|luggage|airport|hotel|journey|train|narrow/.test(
      `${normalized} ${example.toLowerCase()}`,
    )
  )
    return 'Travel';
  if (
    /clarification|meeting|colleague|office|deadline|report|judgement/.test(
      `${normalized} ${example.toLowerCase()}`,
    )
  )
    return 'Work';
  if (
    /software|update|backup|device|digital|password|technology/.test(
      `${normalized} ${example.toLowerCase()}`,
    )
  )
    return 'Technology';
  if (
    /^(out loud|cut back on|ask for clarification)$/.test(normalized) ||
    normalized.split(' ').length > 2
  )
    return 'Expressions';
  return 'Everyday Life';
}
export const dailyWords = Object.entries({ ...glossary, ...extra }).map(([word, entry]) => ({
  word,
  ...entry,
  category: categoryFor(word, entry.example),
  usage: 'usage' in entry ? entry.usage : entry.example,
  kind: word.includes(' ') ? 'Expression' : 'Word',
}));
export function wordDetails(word: string) {
  return dailyWords.find((item) => item.word.toLowerCase() === word.toLowerCase());
}
export function wordsForDay(day: string, _level?: string) {
  const index = Number(day.replaceAll('-', '')) % dailyWords.length;
  return Array.from(
    { length: 5 },
    (_, offset) => dailyWords[(index + offset * 7) % dailyWords.length],
  );
}
