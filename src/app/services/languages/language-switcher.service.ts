import { computed, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export const AVAILABLE_LANGUAGES = ['uk', 'en'] as const;
export type LanguageCode = (typeof AVAILABLE_LANGUAGES)[number];
export const LANGUAGE_KEY = 'selectedLanguage';

interface LanguageOption {
    code: LanguageCode;
    active: boolean;
    name: string;
}

export function LanguageSwitcherService(translate: TranslateService) {
    const currentLang = signal<LanguageCode>('uk');

    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as LanguageCode;
    const browserLang = navigator.language.split('-')[0];

    const userDefaultLanguage = AVAILABLE_LANGUAGES.includes(
        browserLang as LanguageCode
    )
        ? (browserLang as LanguageCode)
        : 'uk';

    const defaultLang = savedLanguage || userDefaultLanguage;

    currentLang.set(defaultLang);
    translate.setDefaultLang(defaultLang);
    translate.use(defaultLang);

    const switchLang = (languageCode: LanguageCode) => {
        translate.use(languageCode);
        currentLang.set(languageCode);
        localStorage.setItem(LANGUAGE_KEY, languageCode);
    };

    const supportedLanguages = computed<LanguageOption[]>(() => {
        return AVAILABLE_LANGUAGES.map((code) => ({
            code,
            active: currentLang() === code,
            name: code === 'uk' ? 'Українська' : 'English',
            imgMiniPath: `assets/icon/language/${code}Round.svg`,
            imgFullPath: `assets/icon/language/${code}Square.svg`,
        }));
    });

    return {
        currentLang,
        switchLang,
        supportedLanguages,
    };
}
