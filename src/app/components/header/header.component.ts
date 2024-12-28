import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

const AVAILABLE_LANGUAGES = ['uk', 'en'] as string[];
type LanguageCode = (typeof AVAILABLE_LANGUAGES)[number];
const LANGUAGE_KEY = 'selectedLanguage';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [FormsModule],
})
export class HeaderComponent {
    private translate = inject(TranslateService);
    private router = inject(Router);
    currentLang = signal<LanguageCode>('uk');

    constructor() {
        const savedLanguage = localStorage.getItem(
            LANGUAGE_KEY
        ) as LanguageCode;
        const userDefaultLanguage = (navigator.language.split('-')[0] ||
            'uk') as LanguageCode;
        const defaultLang =
            savedLanguage ||
            (AVAILABLE_LANGUAGES.includes(userDefaultLanguage)
                ? userDefaultLanguage
                : 'uk'
            );

        this.currentLang.set(defaultLang);
    }

    isAuthPage(): boolean {
        return this.router.url.includes('auth');
    }

    switchLang(languageCode: LanguageCode): void {
        this.translate.use(languageCode);
        this.currentLang.set(languageCode);
        localStorage.setItem(LANGUAGE_KEY, languageCode);
    }
}
