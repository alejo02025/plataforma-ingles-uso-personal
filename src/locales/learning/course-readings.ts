import type { Question } from '@/lib/content';
// Original study texts; labels describe the intended practice, not a certified text assessment.
const texts = [
  [
    'A1',
    'A day in my neighbourhood',
    'My name is Alex. I live in a small flat near a park. I work in a shop. In the morning, I drink coffee and walk to work.|The shop opens at nine. My friend Sara works there too. We have lunch at one. After work, I go home and read a book.|On Saturday, I visit my family. We cook together. I like my neighbourhood because I can walk to the park and meet my friends.',
    'Where does Alex work?',
    'In a shop',
    'In a hospital',
    'In a school',
  ],
  [
    'A2',
    'A change of plans',
    'Last Saturday, Maya planned to visit the coast with her brother. They checked the weather and bought bus tickets. When they arrived at the station, they learned that their bus was delayed.|They decided to explore a nearby museum instead of waiting outside. The tickets were inexpensive, and the guide explained how the city had changed. Maya took notes because she wanted to remember the names of the old streets.|At lunchtime, they found a café and called their parents. They did not reach the coast, but they enjoyed a different kind of trip. Next weekend, they are going to check the bus schedule before leaving home.',
    'What did they do instead of waiting outside?',
    'They visited a museum',
    'They returned home immediately',
    'They took a taxi to the coast',
  ],
  [
    'B1',
    'Finding a fair way to share work',
    'A neighbourhood group wanted to turn an empty piece of land into a community garden. At first, a few volunteers did almost everything. They bought seeds, arranged meetings and watered the plants. Other members wanted to help but did not know which jobs were still available.|During one meeting, Rosa suggested a shared list with small, clearly described tasks. Each member could choose a job that fitted their schedule. The group also agreed to explain what had been done, so the next person would not repeat the same work.|The garden began to improve, but the list did not solve every problem. Some jobs required experience, and the water supply was unreliable. The group organised a training afternoon and spoke to the local council. Sharing responsibility meant asking for support as well as dividing tasks.',
    'Why did some members initially struggle to help?',
    'They did not know which jobs were available',
    'They refused every task',
    'There were no plants in the garden',
  ],
  [
    'B2',
    'When an experiment becomes a decision',
    'A public library tested longer opening hours for six weeks. Attendance rose on weekday evenings, and a survey found that several working adults valued the change. The organisers initially described the trial as a clear success.|However, the pilot took place during examination season, when students were already likely to use the library more often. Staff also reported that the extra hours had reduced the time available for maintaining the collection. Neither observation proved that the new schedule was a bad idea; both complicated the original conclusion.|Before making the arrangement permanent, the library compared attendance outside examination season and estimated the cost of an additional shift. A decision could then consider access, workload and funding together. The trial had provided useful evidence, but the evidence needed a context.',
    'What limits the initial conclusion?',
    'The trial coincided with examination season',
    'Nobody used the library',
    'The survey showed that every visitor opposed longer hours',
  ],
  [
    'C1',
    'The difference between transparency and understanding',
    'An organisation published a large archive of internal performance figures to demonstrate transparency. The release made previously inaccessible information available, but the files were scattered across formats and rarely explained how individual indicators had been calculated.|Critics argued that disclosure alone could not ensure meaningful scrutiny. A reader needed to know whether two apparently similar measures referred to the same population, period and method. Without that context, a striking comparison might reveal a change in reporting rather than a change in performance. This did not make publication pointless; it made interpretation a separate obligation.|The organisation subsequently added a methodology guide and invited questions about unclear categories. Some disputes remained because the measures reflected competing priorities. Nonetheless, the debate became more precise: participants could distinguish an objection to the evidence from an objection to the values guiding the decision.',
    'What is the main distinction made by the text?',
    'Making information available is different from making it interpretable',
    'Publishing information prevents every disagreement',
    'All numerical comparisons are necessarily misleading',
  ],
  [
    'C2',
    'What a plausible explanation leaves unresolved',
    'Two historians proposed competing accounts of a policy reversal. One emphasised pressure from influential advisers; the other pointed to a gradual change in public expectations. Each account could explain several surviving documents, and neither contradicted the known chronology. The temptation was to treat compatibility with the record as confirmation.|Yet a narrative can fit the available evidence without uniquely accounting for it. Some documents were preserved precisely because they justified decisions after the event, while dissenting voices were less likely to enter the archive. Recognising this asymmetry did not warrant dismissing every source as unreliable. It required separating what a document directly attested from the intentions later attributed to its author.|A careful synthesis therefore resisted a premature verdict. It identified observations that both accounts explained, claims that depended on missing evidence and conditions under which either interpretation would become less credible. The resulting argument was less dramatic than a single decisive story, but more explicit about the limits of its own authority.',
    'Which conclusion best preserves the scope of the argument?',
    'A compatible narrative is not necessarily uniquely supported by the evidence',
    'No historical source can provide any useful evidence',
    'Both accounts must be equally true in every detail',
  ],
] as const;
export const englishCourseReadings = texts.map(
  ([level, title, text, prompt, correct, wrong, other]) => ({
    id: `course-reading:${level}`,
    title,
    level,
    topic: 'Work',
    source: 'editorial',
    minutes: 8,
    intro: 'An original reading to connect your classes with real ideas.',
    paragraphs: text.split('|'),
    questions: [
      {
        id: `course-reading:${level}:main`,
        skill: 'reading',
        band: level,
        prompt,
        options: [correct, wrong, other],
        answer: 0,
        explanation:
          'La respuesta conserva el dato o argumento que aparece explícitamente en el texto. Volvé al párrafo correspondiente y compará el alcance de las otras opciones.',
      } as Question,
    ],
  }),
);
