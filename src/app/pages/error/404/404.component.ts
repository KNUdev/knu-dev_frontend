import { Component, inject, ViewEncapsulation } from '@angular/core';
import {Router} from '@angular/router';
import {I18nService} from '../../../services/languages/i18n.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'error-not-found',
    imports: [

    ],
    templateUrl: './404.component.html',
    styleUrl: './404.component.scss',
})
export class NotFoundPage {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private router = inject(Router);

    constructor() {
        // this.translate.onLangChange
        //     .pipe(
        //         startWith({
        //             lang: this.translate.currentLang,
        //         } as LangChangeEvent),
        //         switchMap((event) =>
        //             this.i18nService.loadComponentTranslations(
        //                 'pages/home',
        //                 event.lang
        //             )
        //         )
        //
        //     .subscribe();
    }
}
