import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { I18nService } from '../../i18n.service';

const DEPARTMENT_TRANSLATIONS = {
    INSTITUTES: 'departments.institutes.items',
    FACULTIES: 'departments.faculties.items',
} as const;

type Department = {
    name: string;
    link: string;
};

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    imports: [TranslateModule, CommonModule],
})
export class FooterComponent {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);

    institutes$: Observable<Department[]>;
    faculties$: Observable<Department[]>;

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

        this.institutes$ = departmentTranslations$.pipe(
            map(
                (translations) =>
                    translations[DEPARTMENT_TRANSLATIONS.INSTITUTES] || []
            )
        );

        this.faculties$ = departmentTranslations$.pipe(
            map(
                (translations) =>
                    translations[DEPARTMENT_TRANSLATIONS.FACULTIES] || []
            )
        );
    }

    get logoPath(): string {
        return 'assets/logo/KNULogo.svg';
    }

    socialLinks: { name: string; link: string }[] = [
        { name: 'instagram', link: 'assets/icon/social networks/inst.svg' },
        { name: 'telegram', link: 'assets/icon/social networks/tg.svg' },
    ];
}
