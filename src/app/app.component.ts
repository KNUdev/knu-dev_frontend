import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

const AVAILABLE_LANGUAGES = ['uk', 'en'] as string[];
type LanguageCode = (typeof AVAILABLE_LANGUAGES)[number];

@Component({
    selector: 'app-root',
    imports: [FormsModule, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    private translate = inject(TranslateService);
    currentLang = signal<LanguageCode>('uk');

    constructor() {
        this.translate.addLangs(AVAILABLE_LANGUAGES);

        const userDefaultLanguage = (navigator.language.split('-')[0] ||
            'uk') as LanguageCode;
        const defaultLang = AVAILABLE_LANGUAGES.includes(userDefaultLanguage)
            ? userDefaultLanguage
            : 'uk';

        this.translate.setDefaultLang(defaultLang);
        this.translate.use(defaultLang);
        this.currentLang.set(defaultLang);
    }

    switchLang(languageCode: LanguageCode): void {
        this.translate.use(languageCode);
        this.currentLang.set(languageCode);
    }
}
