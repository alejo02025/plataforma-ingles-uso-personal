/** Register a language here, then author its curriculum, UI and teaching support.
 * Storage identifiers are durable: never rename them when rebranding the product.
 */
export const languages = {
  en: {
    label: 'English',
    locale: 'en-US',
    path: '',
    database: 'english-os-private-v1',
    storagePrefix: '',
    goal: 'B1 → B2 → C1',
  },
  pt: {
    label: 'Português',
    locale: 'pt-BR',
    path: '/portugues',
    database: 'portuguese-os-private-v1',
    storagePrefix: 'portuguese:',
    goal: 'A1 → A2 → B1',
  },
} as const;
export type StudyLanguageCode = keyof typeof languages;
