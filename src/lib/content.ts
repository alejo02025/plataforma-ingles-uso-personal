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
    id: 'd1',
    skill: 'grammar',
    band: 'A2',
    prompt: 'Yesterday, I ___ a train to Córdoba.',
    options: ['take', 'took', 'have take'],
    answer: 1,
    explanation: 'Yesterday places the action in the completed past: took.',
  },
  {
    id: 'd2',
    skill: 'vocabulary',
    band: 'A2',
    prompt: 'At the airport, a boarding pass is…',
    options: ['a document to get on a plane', 'a place to leave luggage', 'a return ticket'],
    answer: 0,
    explanation: 'A boarding pass is the document that allows you to get on a plane.',
  },
  {
    id: 'd3',
    skill: 'reading',
    band: 'A2',
    prompt: '“The museum closes at six, but the last entry is at five.” Can you enter at 5:30?',
    options: ['Yes, it is still open', 'No, entry ends at five', 'Only on weekends'],
    answer: 1,
    explanation: 'The last entry time is different from the closing time.',
  },
  {
    id: 'd4',
    skill: 'grammar',
    band: 'B1',
    prompt: 'I ___ here since 2022.',
    options: ['work', 'worked', 'have worked'],
    answer: 2,
    explanation:
      'The present perfect connects a past starting point to the present. Since marks that starting point.',
  },
  {
    id: 'd5',
    skill: 'vocabulary',
    band: 'B1',
    prompt: '“We need to cut back on spending.” Cut back means…',
    options: ['increase', 'reduce', 'postpone forever'],
    answer: 1,
    explanation: 'Cut back on means to reduce the amount of something.',
  },
  {
    id: 'd6',
    skill: 'reading',
    band: 'B1',
    prompt: '“Although the flight was delayed, we arrived in time for the meeting.” What happened?',
    options: [
      'They missed the meeting',
      'The meeting was cancelled',
      'They reached the meeting on time',
    ],
    answer: 2,
    explanation:
      'Although introduces a difficulty that did not prevent them from arriving on time.',
  },
  {
    id: 'd7',
    skill: 'grammar',
    band: 'B2',
    prompt: 'If I had known about the delay, I ___ a different route.',
    options: ['would choose', 'would have chosen', 'had chosen'],
    answer: 1,
    explanation: 'El tercer condicional expresa una alternativa irreal en el pasado.',
  },
  {
    id: 'd8',
    skill: 'vocabulary',
    band: 'B2',
    prompt: '“The new policy is likely to undermine trust.” Undermine means…',
    options: ['gradually weaken', 'publicly announce', 'measure precisely'],
    answer: 0,
    explanation: 'Undermine means to weaken something, often gradually.',
  },
  {
    id: 'd9',
    skill: 'reading',
    band: 'B2',
    prompt:
      '“The results are promising, yet the small sample calls for caution.” The author suggests…',
    options: [
      'The results are worthless',
      'Further evidence is needed before firm conclusions',
      'The sample proves the theory',
    ],
    answer: 1,
    explanation: 'The results are encouraging, but the small sample limits the conclusions.',
  },
];
export const grammarQuestions: Question[] = [
  {
    id: 'g1',
    skill: 'grammar',
    band: 'B1',
    prompt: 'You are asking about a trip: “___ you ever been to London?”',
    options: ['Did', 'Have', 'Do'],
    answer: 1,
    explanation: 'For experiences without a specific date: Have you ever been…?',
  },
  {
    id: 'g2',
    skill: 'grammar',
    band: 'A2',
    prompt: 'Choose the most natural sentence about your routine.',
    options: ['I go to work by bus.', 'I go at work by bus.', 'I go to work in bus.'],
    answer: 0,
    explanation: 'Go to work y by bus son combinaciones habituales.',
  },
  {
    id: 'g3',
    skill: 'grammar',
    band: 'B1',
    prompt: 'A colleague asks: “How long ___ on this project?”',
    options: ['do you work', 'have you worked', 'you have worked'],
    answer: 1,
    explanation: 'How long have you worked…? asks about duration up to the present.',
  },
  {
    id: 'g4',
    skill: 'grammar',
    band: 'B1',
    prompt: 'If the price falls, we ___ more shares.',
    options: ['will buy', 'would bought', 'had bought'],
    answer: 0,
    explanation: 'First conditional: if + present, will + base verb.',
  },
  {
    id: 'g5',
    skill: 'grammar',
    band: 'A2',
    prompt: '“Could you tell me where ___?”',
    options: ['is the station', 'the station is', 'does the station'],
    answer: 1,
    explanation: 'Indirect questions keep the subject + verb order.',
  },
];
type Reading = {
  id: string;
  title: string;
  topic: string;
  level: string;
  minutes: number;
  intro: string;
  paragraphs: string[];
  questions: Question[];
};
export const readings: Reading[] = [
  {
    id: 'city',
    title: 'The city you discover on foot',
    topic: 'Travel',
    level: 'A2',
    minutes: 6,
    intro: 'A walk without an agenda can change how you discover a city.',
    paragraphs: [
      'On my first morning in Lisbon, I put my phone in my bag and went for a walk. I did not have a plan. The streets were narrow, and small shops were opening. At a corner café, a woman asked if I wanted coffee. I sat outside and watched the city wake up.',
      'A tram passed slowly. Behind it, I saw a bookshop with an open door. The owner told me that the building was more than a hundred years old. He also showed me a small map of the neighbourhood. It had places that were not in my travel guide.',
      'Later, I found a quiet garden above the river. I stayed there for an hour. I did not visit many famous places that day, but I learned something useful: a good trip does not always need a long list. Sometimes, you only need time and a little curiosity.',
    ],
    questions: [
      {
        id: 'city1',
        skill: 'reading',
        band: 'A2',
        prompt: 'What helped the traveller find places outside the travel guide?',
        options: ['A map from the bookshop owner', 'A phone app', 'A tram ticket'],
        answer: 0,
        explanation: 'The owner showed a map with places outside the travel guide.',
      },
      {
        id: 'city2',
        skill: 'reading',
        band: 'A2',
        prompt: 'What is the main idea?',
        options: [
          'Visit as many places as possible',
          'Slow exploration can be valuable',
          'Avoid speaking to local people',
        ],
        answer: 1,
        explanation:
          'El texto valora el tiempo y la curiosidad frente a una lista larga de visitas.',
      },
    ],
  },
  {
    id: 'money',
    title: 'Why a little patience changes your money',
    topic: 'Finance',
    level: 'B1',
    minutes: 7,
    intro: 'Compound interest, seen through an everyday decision.',
    paragraphs: [
      'When Clara received her first salary, she wanted to buy a new phone. Instead, she decided to save a small amount every month. It was not an exciting choice, and at first the difference seemed tiny. But she was building a habit that would matter more than a single purchase.',
      'Compound interest means that you can earn interest on both your original savings and the interest you have already earned. Over time, this can make a difference. However, fees and inflation can reduce that growth. Looking only at a large number on a screen can give you the wrong impression.',
      'Clara learned to ask three questions before choosing a savings product: What are the fees? Can I take my money out when I need it? What risks am I accepting? These questions did not make her rich overnight, but they helped her make clearer decisions.',
      'The lesson is not that everyone should choose the same investment. People have different needs and different levels of risk they can accept. The useful habit is to slow down, understand the terms, and make a plan you can actually follow. This story is an illustration, not financial advice.',
    ],
    questions: [
      {
        id: 'money1',
        skill: 'reading',
        band: 'B1',
        prompt: 'Why can the number on a savings screen be misleading?',
        options: [
          'Savings never earn interest',
          'Fees and inflation can reduce real growth',
          'The bank always makes a mistake',
        ],
        answer: 1,
        explanation: 'Fees and inflation can reduce real growth.',
      },
      {
        id: 'money2',
        skill: 'reading',
        band: 'B1',
        prompt: 'Which decision does the text encourage?',
        options: [
          'Buy the same product as Clara',
          'Ignore risk for better returns',
          'Understand terms and your own needs',
        ],
        answer: 2,
        explanation: 'The text highlights personal needs and understanding the terms.',
      },
    ],
  },
  {
    id: 'history',
    title: 'The clock that connected a country',
    topic: 'History',
    level: 'B1',
    minutes: 7,
    intro: 'How trains made time more than a local matter.',
    paragraphs: [
      'Before railways became common, towns often used local time. Noon was the moment when the sun was highest in the sky. A small difference between two towns did not matter much when most journeys took hours or days.',
      'Trains changed that. A timetable needed to tell passengers when a train would arrive, and railway workers needed to coordinate services. Different local clocks could create confusion. In Britain, railway companies began using a shared time based on Greenwich during the nineteenth century.',
      'The change was practical, but it was also cultural. People started organising their lives around a common schedule. Time became something you could share with strangers far away. A clock on a station wall was no longer just a local object; it was part of a network.',
      'Today, digital systems still face similar problems. A meeting with colleagues in another country requires us to think about time zones. Technology can connect us, but we still have to agree on what the numbers on a clock mean.',
    ],
    questions: [
      {
        id: 'history1',
        skill: 'reading',
        band: 'B1',
        prompt: 'Why did railways need shared time?',
        options: ['To coordinate timetables', 'To make journeys slower', 'To remove all clocks'],
        answer: 0,
        explanation: 'Schedules and service coordination needed a shared reference.',
      },
      {
        id: 'history2',
        skill: 'reading',
        band: 'B1',
        prompt: 'What connects railway time with digital meetings?',
        options: [
          'Both use local noon only',
          'Both require agreement about time',
          'Both eliminate distance',
        ],
        answer: 1,
        explanation: 'Both require agreeing on how to interpret time across different places.',
      },
    ],
  },
  {
    id: 'tech',
    title: 'A useful tool still needs a good question',
    topic: 'Technology',
    level: 'B2',
    minutes: 8,
    intro: 'Automating an answer is easier than deciding what is worth asking.',
    paragraphs: [
      'When a company introduces a new digital tool, the first question is often how much time it will save. That is understandable: repetitive work is expensive, and nobody enjoys copying the same information between spreadsheets. Yet speed alone is a poor measure of whether a tool is useful.',
      'Consider a team that automates its weekly reports. The reports arrive instantly, but nobody has checked whether the chosen metrics reflect what customers actually need. The team can now produce a misleading answer faster than before. Efficiency has improved; judgement has not.',
      'A better approach begins with the decision the information is supposed to support. What action will change if this number goes up? What evidence would make us question our assumptions? These questions can reveal that a smaller, simpler report is more valuable than an impressive dashboard.',
      'This does not mean that automation is unhelpful. Rather, its value depends on the quality of the task we give it. Tools extend our abilities, but they can also extend our mistakes. The most important skill may be knowing when to pause and ask whether we are solving the right problem.',
    ],
    questions: [
      {
        id: 'tech1',
        skill: 'reading',
        band: 'B2',
        prompt: 'What is the risk in the automated reports example?',
        options: [
          'Reports are delivered too late',
          'Misleading metrics become faster to produce',
          'Automation removes all useful information',
        ],
        answer: 1,
        explanation: 'Automation speeds up a report whose metrics may not be relevant.',
      },
      {
        id: 'tech2',
        skill: 'reading',
        band: 'B2',
        prompt: 'What is the author’s view of automation?',
        options: [
          'It should always be avoided',
          'Its usefulness depends on the task and judgement',
          'It guarantees good decisions',
        ],
        answer: 1,
        explanation: 'El autor condiciona su valor a la calidad de la tarea y el criterio.',
      },
    ],
  },
  {
    id: 'work',
    title: 'The meeting before the meeting',
    topic: 'Work',
    level: 'B1',
    minutes: 6,
    intro: 'A short conversation that avoids an hour of confusion.',
    paragraphs: [
      'Diego was nervous before his first meeting with an international team. He knew the topic well, but speaking in English felt different. He wrote down three points he wanted to explain and practised saying them out loud. He also prepared one question in case something was unclear.',
      'During the meeting, a colleague used an expression Diego did not know. Instead of pretending to understand, he said, “Could you explain what you mean by that?” The colleague gave a simple example. Two other people thanked him because they had been confused too.',
      'Afterwards, Diego realised that good communication was not about speaking perfectly. Preparing a few clear ideas and asking for clarification had helped the whole team. His next goal was to use shorter sentences and leave more space for questions.',
    ],
    questions: [
      {
        id: 'work1',
        skill: 'reading',
        band: 'B1',
        prompt: 'How did Diego prepare?',
        options: [
          'He memorised a dictionary',
          'He wrote and practised three points',
          'He avoided the meeting',
        ],
        answer: 1,
        explanation: 'He prepared three ideas and practised them out loud.',
      },
      {
        id: 'work2',
        skill: 'reading',
        band: 'B1',
        prompt: 'What happened when he asked for clarification?',
        options: ['It helped others too', 'The meeting ended', 'Nobody answered'],
        answer: 0,
        explanation: 'Two other participants had also been confused.',
      },
    ],
  },
  {
    id: 'daily',
    title: 'A small change to your morning',
    topic: 'Everyday Life',
    level: 'A2',
    minutes: 5,
    intro: 'What changes when you leave five free minutes at the start of the day.',
    paragraphs: [
      'Every morning, Sam looked at his phone before getting out of bed. Messages, news, and work emails filled his head. One Monday, he decided to try something different. He left the phone in the kitchen and opened the window instead.',
      'For five minutes, he drank water and thought about one thing he wanted to do that day. It was a very small change. He still had the same job and the same problems, but he felt less hurried.',
      'After a week, Sam did not have a perfect morning routine. Some days he forgot. But he learned that a useful habit does not have to be difficult. It only has to be simple enough to repeat.',
    ],
    questions: [
      {
        id: 'daily1',
        skill: 'reading',
        band: 'A2',
        prompt: 'Where did Sam leave his phone?',
        options: ['In the kitchen', 'At work', 'Outside'],
        answer: 0,
        explanation: 'He left his phone in the kitchen.',
      },
      {
        id: 'daily2',
        skill: 'reading',
        band: 'A2',
        prompt: 'What did Sam learn?',
        options: [
          'Habits must be perfect',
          'Simple habits are easier to repeat',
          'He should stop working',
        ],
        answer: 1,
        explanation: 'A useful routine must be simple enough to repeat.',
      },
    ],
  },
];
export const glossary: Record<string, { meaning: string; pronunciation: string; example: string }> =
  {
    quiet: {
      meaning: 'Making very little noise.',
      pronunciation: '/ˈkwaɪət/',
      example: 'I found a quiet place to read.',
    },
    train: {
      meaning: 'A connected group of vehicles that travels on railway tracks.',
      pronunciation: '/treɪn/',
      example: 'The train leaves in twenty minutes.',
    },
    share: {
      meaning: 'To let someone else use or have part of something.',
      pronunciation: '/ʃeə/',
      example: 'Can we share a table?',
    },
    learn: {
      meaning: 'To gain knowledge or a skill through study or experience.',
      pronunciation: '/lɜːn/',
      example: 'I learn a new word every day.',
    },
    spend: {
      meaning: 'To use money to pay for something.',
      pronunciation: '/spend/',
      example: 'I spend less money when I plan my meals.',
    },
    habit: {
      meaning: 'Something you do regularly, often without thinking about it.',
      pronunciation: '/ˈhæbɪt/',
      example: 'Reading before bed is my favourite habit.',
    },
    'compound interest': {
      meaning: 'Interest earned on both your savings and previously earned interest.',
      pronunciation: '/ˈkɒmpaʊnd ˈɪntrəst/',
      example: 'Compound interest includes interest earned on earlier interest.',
    },
    'out loud': {
      meaning: 'Spoken so that people can hear it.',
      pronunciation: '/aʊt laʊd/',
      example: 'Practise your main ideas out loud before the meeting.',
    },
    'cut back on': {
      meaning: 'To reduce how much you use or spend on something.',
      pronunciation: '/kʌt bæk ɒn/',
      example: 'We want to cut back on unnecessary spending.',
    },
    'travel guide': {
      meaning: 'A book or resource with information about a place to visit.',
      pronunciation: '/ˈtrævəl ɡaɪd/',
      example: 'The small garden was not in my travel guide.',
    },
    'ask for clarification': {
      meaning: 'To ask someone to explain something more clearly.',
      pronunciation: '/ɑːsk fə ˌklærɪfɪˈkeɪʃən/',
      example: 'It is useful to ask for clarification when a point is unclear.',
    },
    narrow: {
      meaning: 'Not wide; with little space from side to side.',
      pronunciation: '/ˈnærəʊ/',
      example: 'The streets in the old town are narrow.',
    },
    curiosity: {
      meaning: 'A strong wish to learn or discover something.',
      pronunciation: '/ˌkjʊəriˈɒsəti/',
      example: 'Curiosity helps you discover new places.',
    },
    neighbourhood: {
      meaning: 'A local area of a town or city where people live.',
      pronunciation: '/ˈneɪbəhʊd/',
      example: 'There is a quiet café in my neighbourhood.',
    },
    savings: {
      meaning: 'Money that you have saved instead of spending.',
      pronunciation: '/ˈseɪvɪŋz/',
      example: 'I use part of my savings for travel.',
    },
    fees: {
      meaning: 'Amounts of money charged for a service.',
      pronunciation: '/fiːz/',
      example: 'Check the fees before opening an account.',
    },
    growth: {
      meaning: 'An increase in size, amount, or development.',
      pronunciation: '/ɡrəʊθ/',
      example: 'Inflation can reduce real growth.',
    },
    overnight: {
      meaning: 'Very quickly or suddenly, in a short period of time.',
      pronunciation: '/ˌəʊvəˈnaɪt/',
      example: 'A new habit does not develop overnight.',
    },
    timetable: {
      meaning: 'A schedule showing when events or journeys happen.',
      pronunciation: '/ˈtaɪmteɪbəl/',
      example: 'Check the timetable before you leave.',
    },
    shared: {
      meaning: 'Used, experienced, or held by more than one person.',
      pronunciation: '/ʃeəd/',
      example: 'We need a shared plan.',
    },
    judgement: {
      meaning: 'The ability to make sensible decisions after considering the facts.',
      pronunciation: '/ˈdʒʌdʒmənt/',
      example: 'Good judgement matters more than speed.',
    },
    misleading: {
      meaning: 'Likely to give someone a wrong impression.',
      pronunciation: '/ˌmɪsˈliːdɪŋ/',
      example: 'A single number can be misleading.',
    },
    assumptions: {
      meaning: 'Things accepted as true without being fully checked.',
      pronunciation: '/əˈsʌmpʃənz/',
      example: 'We should question our assumptions.',
    },
    clarification: {
      meaning: 'An explanation that makes something clearer.',
      pronunciation: '/ˌklærɪfɪˈkeɪʃən/',
      example: 'Could I ask for clarification?',
    },
    hurried: {
      meaning: 'Rushed; doing something with too little time.',
      pronunciation: '/ˈhʌrid/',
      example: 'I felt less hurried this morning.',
    },
  };
export const writingPrompts = [
  'Write 4–6 sentences about a city you would like to visit. Explain why and what you would do there.',
  'Describe a small habit that helps you manage your money. Explain one benefit and one difficulty.',
  'Write a short email asking a colleague to clarify the time and purpose of a meeting.',
  'Explain how a technology tool has changed your daily work. Give a concrete example.',
];
