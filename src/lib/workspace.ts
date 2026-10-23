import { languages, type StudyLanguageCode } from '@/locales/languages';
export const workspaceLanguage: StudyLanguageCode =
  process.env.NEXT_PUBLIC_STUDY_LANGUAGE === 'pt' ? 'pt' : 'en';
export const languageConfig = languages[workspaceLanguage];
export const isPortuguese = workspaceLanguage === 'pt';
export const workspaceId = isPortuguese ? 'pt' : 'en';
export const defaultName = isPortuguese ? 'Jazmín' : 'Alejo';
export const initialInterests = isPortuguese
  ? ['Viagens', 'Finanças', 'Tecnologia']
  : ['Travel', 'Finance', 'Technology'];
export const appName = isPortuguese ? 'Português OS' : 'English OS';
export const syncFolder = isPortuguese ? 'portuguese-os' : 'english-os';
export const assetBase =
  process.env.NEXT_PUBLIC_ASSET_BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || '';
export const siteRoot =
  process.env.NEXT_PUBLIC_DEPLOY_TARGET === 'github'
    ? process.env.NEXT_PUBLIC_SITE_ROOT || '/plataforma-ingles-uso-personal'
    : 'https://alejo02025.github.io/plataforma-ingles-uso-personal';
export const studyStorage = {
  getItem(key: string) {
    return localStorage.getItem(`${languageConfig.storagePrefix}${key}`);
  },
  setItem(key: string, value: string) {
    localStorage.setItem(`${languageConfig.storagePrefix}${key}`, value);
  },
};

export const studyLanguage = isPortuguese ? 'Brazilian Portuguese' : 'English';

// Product names are identifiers, not translatable UI labels.
export const spaceNames = { en: 'English OS', pt: 'Português OS' };
// Endonyms stay stable in the language selector in either workspace.
export const studyLanguageNames = { en: languages.en.label, pt: languages.pt.label };
