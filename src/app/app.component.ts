import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FooterComponent } from './footer/footer.component';

const AVAILABLE_LANGUAGES = ['uk', 'en'] as string[];
type SupportedLanguages = (typeof AVAILABLE_LANGUAGES)[number];

@Component({
    selector: 'app-root',
    imports: [FormsModule, FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    private translate = inject(TranslateService);
    availableLanguages = AVAILABLE_LANGUAGES;
    currentLang: SupportedLanguages;

    constructor() {
        // Add available languages
        this.translate.addLangs(AVAILABLE_LANGUAGES);

        // Get browser language or fallback to Ukrainian
        const userDefaultLanguage = (navigator.language.split('-')[0] ||
            'uk') as SupportedLanguages;
        const defaultLang = AVAILABLE_LANGUAGES.includes(userDefaultLanguage)
            ? userDefaultLanguage
            : 'uk';

        // Set default language
        this.translate.setDefaultLang(defaultLang);
        this.translate.use(defaultLang);
        this.currentLang = defaultLang;
    }

    switchLang(languageCode: SupportedLanguages) {
        this.translate.use(languageCode);
        this.currentLang = languageCode;
    }
}
