import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { I18nService } from '../../services/languages/i18n.service';

const DEPARTMENT_TRANSLATIONS = {
    INSTITUTES: 'departments.institutes.items',
    FACULTIES: 'departments.faculties.items',
} as const;

const SOCIAL_ICONS = [
    {
        name: 'instagram',
        path: 'assets/icon/social-networks/inst.svg',
        url: '#',
    },
    {
        name: 'telegram',
        path: 'assets/icon/social-networks/tg.svg',
        url: '#',
    },
] as const;

type Department = {
    name: string;
    link: string;
};

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    imports: [TranslateModule, CommonModule, MatIconModule],
})
export class FooterComponent {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    readonly socialLinks = SOCIAL_ICONS;
    readonly logoPath = 'assets/logo/KNULogo.svg';

    institutes$: Observable<Department[]>;
    faculties$: Observable<Department[]>;

    constructor() {
        SOCIAL_ICONS.map((icon) =>
            this.matIconRegistry.addSvgIcon(
                icon.name,
                this.domSanitizer.bypassSecurityTrustResourceUrl(icon.path)
            )
        );

        const langChange$ = this.translate.onLangChange.pipe(
            startWith({ lang: this.translate.currentLang } as LangChangeEvent)
        );

        const loadTranslations$ = langChange$.pipe(
            switchMap((event) =>
                this.i18nService.loadComponentTranslations(
                    'components/footer',
                    event.lang
                )
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
}
