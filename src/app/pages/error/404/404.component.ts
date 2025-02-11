import { Component, inject, ViewEncapsulation } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {I18nService} from '../../../services/languages/i18n.service';
import {LangChangeEvent, TranslatePipe, TranslateService} from '@ngx-translate/core';
import {startWith, switchMap} from 'rxjs';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    selector: 'error-not-found',
    imports: [
        TranslatePipe,
        RouterLink
    ],
    templateUrl: './404.component.html',
    styleUrl: './404.component.scss',
})
export class NotFoundPage {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private router = inject(Router);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    readonly iconPaths = {
        error: 'assets/icon/system/error404.svg',
    } as const;

    constructor() {
        this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/error/404',
                        event.lang
                    )
                )
            )
            .subscribe();

        this.registerOriginIcon();
    }

    private registerOriginIcon(): void {
        this.matIconRegistry.addSvgIcon(
            'error',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.error)
        );
    }
}
