import { Component, inject, signal } from '@angular/core';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { startWith, switchMap } from 'rxjs/operators';
import { I18nService } from '../i18n.service';

const DEPARTMENT_TRANSLATIONS = {
    INSTITUTES: 'footer.departments.institutes.items',
    FACULTIES: 'footer.departments.faculties.items',
} as const;

type Department = {
    name: string;
    link: string;
};

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    imports: [TranslateModule],
})
export class FooterComponent {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);

    institutes = signal<Department[]>([]);
    faculties = signal<Department[]>([]);

    constructor() {
        const langChange$ = this.translate.onLangChange.pipe(
            startWith({ lang: this.translate.currentLang } as LangChangeEvent)
        );

        const loadTranslations$ = langChange$.pipe(
            switchMap((event) =>
                this.i18nService.loadComponentTranslations('footer', event.lang)
            )
        );

        const departmentTranslations$ = loadTranslations$.pipe(
            switchMap(() =>
                this.translate.get([
                    DEPARTMENT_TRANSLATIONS.INSTITUTES,
                    DEPARTMENT_TRANSLATIONS.FACULTIES,
                ])
            )
        );

        departmentTranslations$.subscribe((translations) => {
            this.institutes.set(
                translations[DEPARTMENT_TRANSLATIONS.INSTITUTES] || []
            );
            this.faculties.set(
                translations[DEPARTMENT_TRANSLATIONS.FACULTIES] || []
            );
        });
    }

    get logoPath(): string {
        return 'assets/footer/KNULogo.svg';
    }

    socialLinks: { name: string; link: string }[] = [
        { name: 'instagram', link: 'assets/social networks/inst.svg' },
        { name: 'telegram', link: 'assets/social networks/tg.svg' },
    ];
}
