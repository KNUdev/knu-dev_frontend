export const AVAILABLE_LANGUAGES = ['uk', 'en'] as const;
export type LanguageCode = (typeof AVAILABLE_LANGUAGES)[number];

export const LANGUAGE_KEY = 'selectedLanguage';

export const LANG_TO_LOCALE: { [key in LanguageCode]: string } = {
    uk: 'uk-UA',
    en: 'en-UK',
};
