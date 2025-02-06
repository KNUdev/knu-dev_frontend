import {computed, Injectable, signal} from '@angular/core';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {catchError, map, startWith} from 'rxjs/operators';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {AVAILABLE_LANGUAGES, LANG_TO_LOCALE, LANGUAGE_KEY, LanguageCode} from "../../i18n.constants";

interface LanguageOption {
    code: LanguageCode;
    active: boolean;
    name: string;
    imgMiniPath: string;
    imgFullPath: string;
}

@Injectable({providedIn: 'root'})
export class I18nService {
    public currentLang = signal<LanguageCode>('uk');
    public supportedLanguages = computed<LanguageOption[]>(() => {
        return AVAILABLE_LANGUAGES.map((code) => ({
            code,
            active: this.currentLang() === code,
            name: code === 'uk' ? 'Українська' : code === 'en' ? 'English' : code,
            imgMiniPath: `assets/icon/language/${code}Round.svg`,
            imgFullPath: `assets/icon/language/${code}Square.svg`,
        }));
    });
    private currentLocaleSubject = new BehaviorSubject<string>(
        LANG_TO_LOCALE[(localStorage.getItem(LANGUAGE_KEY) as LanguageCode) || 'uk'] || 'uk-UA'
    );
    public currentLocale$ = this.currentLocaleSubject.asObservable();

    constructor(private translate: TranslateService, private http: HttpClient) {
        const savedLanguage = (localStorage.getItem(LANGUAGE_KEY) as LanguageCode) || 'uk';
        const browserLang = navigator.language.split('-')[0] as LanguageCode;
        const defaultLang = AVAILABLE_LANGUAGES.includes(browserLang) ? browserLang : savedLanguage;

        this.currentLang.set(defaultLang);
        this.translate.setDefaultLang(defaultLang);
        this.translate.use(defaultLang);

        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            const newLocale = LANG_TO_LOCALE[event.lang as LanguageCode] || 'en-UK';
            this.currentLocaleSubject.next(newLocale);
        });
    }

    public get currentLocale(): string {
        return this.currentLocaleSubject.value;
    }

    public switchLang(languageCode: LanguageCode): void {
        this.translate.use(languageCode);
        this.currentLang.set(languageCode);
        localStorage.setItem(LANGUAGE_KEY, languageCode);
    }

    public loadComponentTranslations(component: string, lang: string): Observable<any> {
        const paths = [
            `app/${component}/i18n/${lang}.json`,
            `app/common/i18n/${lang}.json`,
        ];

        const requests = paths.map((path) =>
            this.http.get(path).pipe(
                map((translations) => {
                    if (translations) {
                        // Merge new translations with existing ones.
                        return this.translate.setTranslation(lang, translations, true);
                    }
                    return {};
                }),
                catchError((error) => {
                    console.error(`Error loading translations from ${path}:`, error);
                    return of({});
                })
            )
        );

        return forkJoin(requests);
    }

    public getCurrentLanguage(): Observable<{ flagRound: string; flagSquare: string; name: string }> {
        return this.translate.onLangChange.pipe(
            startWith({lang: this.translate.currentLang}),
            map(() => ({
                flagRound: `assets/icon/language/${this.translate.currentLang}Round.svg`,
                flagSquare: `assets/icon/language/${this.translate.currentLang}Square.svg`,
                name: this.translate.currentLang === 'uk' ? 'Українська' : 'English',
            }))
        );
    }
}
