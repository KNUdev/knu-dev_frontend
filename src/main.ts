import { bootstrapApplication } from '@angular/platform-browser';
import {
    PreloadAllModules,
    withPreloading,
    withComponentInputBinding,
    withViewTransitions,
} from '@angular/router';
import { LOCALE_ID } from '@angular/core';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { routes } from './app/services/app.routes';
import { registerLocaleData } from '@angular/common';

import localeUk from '@angular/common/locales/uk';
import localeEn from '@angular/common/locales/en';

const LANG_TO_LOCALE: { [key: string]: string } = {
    uk: 'uk-UA',
    en: 'en-UK',
};

registerLocaleData(localeUk, LANG_TO_LOCALE["uk"]);
registerLocaleData(localeEn, LANG_TO_LOCALE["en"]);

function localeIdFactory(): string {
    const savedLang = localStorage.getItem('selectedLanguage') || 'uk';
    return LANG_TO_LOCALE[savedLang] || LANG_TO_LOCALE["en"];
}

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        provideTranslateService(),
        provideRouter(
            routes,
            withPreloading(PreloadAllModules),
            withComponentInputBinding(),
            withViewTransitions()
        ),
        {
            provide: LOCALE_ID,
            useFactory: localeIdFactory
        },
    ]
}).catch((err) => console.error(err));
