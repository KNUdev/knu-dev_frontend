import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';

const AVAILABLE_LANGUAGES = ['uk', 'en'] as string[];
type LanguageCode = (typeof AVAILABLE_LANGUAGES)[number];
const LANGUAGE_KEY = 'selectedLanguage';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, HeaderComponent, FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
    private router = inject(Router);
    private translate = inject(TranslateService);
    currentLang = signal<LanguageCode>('uk');

    constructor() {
        this.translate.addLangs(AVAILABLE_LANGUAGES);

        const savedLanguage = localStorage.getItem(
            LANGUAGE_KEY
        ) as LanguageCode;
        const userDefaultLanguage = (navigator.language.split('-')[0] ||
            'uk') as LanguageCode;
        const defaultLang = savedLanguage ||
            (AVAILABLE_LANGUAGES.includes(userDefaultLanguage)
                ? userDefaultLanguage
                : 'uk'
            );

        this.translate.setDefaultLang(defaultLang);
        this.translate.use(defaultLang);
        this.currentLang.set(defaultLang);
    }

    isAuthPage(): boolean {
        return this.router.url.includes('auth');
    }
}
