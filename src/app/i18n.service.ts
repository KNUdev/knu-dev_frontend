import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

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
            `app/${component}/i18n/${lang}.json`,
            `app/i18n/common/${lang}.json,`,
        ];

        const requests = paths.map((path) =>
            this.http.get(path).pipe(
                tap((translations) =>
                    console.log(
                        `Loaded translations from ${path}:`,
                        translations
                    )
                ),
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
