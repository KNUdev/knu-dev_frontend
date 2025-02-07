import { Pipe, PipeTransform, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import {I18nService} from '../../services/languages/i18n.service';
import {MultiLanguageField} from '../models/shared.model';

/**
 * A pipe that picks the correct text from a MultiLanguageField (e.g. {en, uk}),
 * based on the current language from i18nService.
 * Will re-run automatically when language changes (pure: false).
 */
@Pipe({
    name: 'multiLangField',
    pure: false // important to re-check whenever we change currentLang
})
export class MultiLangFieldPipe implements PipeTransform, OnDestroy {
    private sub!: Subscription;

    // The current language code, default to 'uk' or 'en' as you prefer:
    private currentLang: 'uk' | 'en' = 'uk';

    constructor(
        private i18nService: I18nService,
        private cdr: ChangeDetectorRef
    ) {
        // 1) Subscribe to an observable that directly emits 'uk' or 'en'
        //    We'll define such an observable in I18nService below.
        this.sub = this.i18nService.currentLang$().subscribe(langCode => {
            this.currentLang = langCode;
            // 2) Force immediate pipe re-check
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
