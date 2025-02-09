import {ChangeDetectorRef, OnDestroy, Pipe, PipeTransform} from '@angular/core';
import {Subscription} from 'rxjs';
import {I18nService} from '../../services/languages/i18n.service';
import {MultiLanguageField} from '../models/shared.model';


@Pipe({
    name: 'multiLangField',
    standalone: true,
    pure: false
})
export class MultiLangFieldPipe implements PipeTransform, OnDestroy {
    private sub!: Subscription;

    private currentLang: 'uk' | 'en' = 'uk';

    constructor(
        private i18nService: I18nService,
        private cdr: ChangeDetectorRef
    ) {
        this.sub = this.i18nService.currentLang$().subscribe(langCode => {
            this.currentLang = langCode;
            this.cdr.markForCheck();
        });
    }

    transform(field: MultiLanguageField | null | undefined, fallback = ''): string {
        if (!field) return fallback;
        return field[this.currentLang] ?? fallback;
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }
}
