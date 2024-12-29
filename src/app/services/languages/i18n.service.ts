import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class I18nService {
    constructor(
        private http: HttpClient,
        private translate: TranslateService
    ) {}

    loadComponentTranslations(
        component: string,
        lang: string
    ): Observable<any> {
        const paths = [
            `app/components/${component}/i18n/${lang}.json`,
            `app/common/i18n/${lang}.json`,
        ];

        const requests = paths.map((path) =>
            this.http.get(path).pipe(
                map((translations) => {
                    if (translations) {
                        return this.translate.setTranslation(
                            lang,
                            translations,
                            true
                        );
                    }
                    return {};
                }),
                catchError((error) => {
                    console.error(
                        `Error loading translations from ${path}:`,
                        error
                    );
                    return of({});
                })
            )
        );

        return forkJoin(requests);
    }
}
