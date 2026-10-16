export const isPortuguese = process.env.NEXT_PUBLIC_STUDY_LANGUAGE === 'pt';
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
    return localStorage.getItem(isPortuguese ? `portuguese:${key}` : key);
  },
  setItem(key: string, value: string) {
    localStorage.setItem(isPortuguese ? `portuguese:${key}` : key, value);
  },
};

export const studyLanguage = isPortuguese ? 'Brazilian Portuguese' : 'English';

// Product names are identifiers, not translatable UI labels.
export const spaceNames = { en: 'English OS', pt: 'Português OS' };
// Endonyms stay stable in the language selector in either workspace.
export const studyLanguageNames = { en: 'English', pt: 'Português' };
