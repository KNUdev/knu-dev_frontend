import {Component, Input, OnInit} from '@angular/core';
import {ProgramSummary} from '../../../../common/models/shared.model';
import {MultiLangFieldPipe} from '../../../../common/pipes/multi-lang-field.pipe';
import {DatePipe} from '@angular/common';
import {LangChangeEvent, TranslatePipe, TranslateService} from '@ngx-translate/core';
import {startWith, switchMap} from 'rxjs';
import {I18nService} from '../../../../services/languages/i18n.service';
import {BorderButtonComponent} from '../../../../common/components/button/arrow-button/border-button.component';

@Component({
    selector: 'program-list-item',
    imports: [
        MultiLangFieldPipe,
        DatePipe,
        TranslatePipe,
        BorderButtonComponent
    ],
    templateUrl: './program-list-item.component.html',
    standalone: true,
    styleUrl: './program-list-item.component.scss'
})
export class ProgramListItemComponent implements OnInit {
    @Input({required: true}) program!: ProgramSummary;
    public locale: string;

    constructor(
        private translate: TranslateService,
        private i18nService: I18nService,
    ) {
        this.locale = this.i18nService.currentLocale;
    }

    get manageProgramLink(): string {
        return `/program/${this.program.id}/manage`;
    }

    ngOnInit(): void {
        this.translate.onLangChange
            .pipe(
                startWith({lang: this.translate.currentLang} as LangChangeEvent),
                switchMap(event => this.i18nService.loadComponentTranslations('pages/program', event.lang))
            )
            .subscribe();
    }

}
