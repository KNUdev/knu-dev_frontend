import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    PreloadAllModules,
    provideRouter,
    withComponentInputBinding,
    withPreloading,
    withViewTransitions,
} from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { AppComponent } from './app/app.component';
import { routes } from './app/services/app.routes';

import localeEn from '@angular/common/locales/en';
import localeUk from '@angular/common/locales/uk';
import { notFoundInterceptor } from './app/pages/error/404/404.interceptor';

const LANG_TO_LOCALE: { [key: string]: string } = {
    uk: 'uk-UA',
    en: 'en-UK',
};

registerLocaleData(localeUk, LANG_TO_LOCALE['uk']);
registerLocaleData(localeEn, LANG_TO_LOCALE['en']);

function localeIdFactory(): string {
    const savedLang = localStorage.getItem('selectedLanguage') || 'uk';
    return LANG_TO_LOCALE[savedLang] || LANG_TO_LOCALE['en'];
}

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(withInterceptors([notFoundInterceptor])),
        provideTranslateService(),
        provideRouter(
            routes,
            withPreloading(PreloadAllModules),
            withComponentInputBinding(),
            withViewTransitions()
        ),
        {
            provide: LOCALE_ID,
            useFactory: localeIdFactory,
        },
    ],
}).catch((err) => console.error(err));
