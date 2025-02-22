import {Component, inject, Input} from '@angular/core';
import {EducationProgramDto, ProgramSummary} from '../../../../common/models/shared.model';
import {MultiLangFieldPipe} from '../../../../common/pipes/multi-lang-field.pipe';
import {DatePipe} from '@angular/common';
import {LangChangeEvent, TranslatePipe} from '@ngx-translate/core';
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
  styleUrl: './program-list-item.component.scss'
})
export class ProgramListItemComponent {
    @Input({required: true}) program!: ProgramSummary;
    public locale: string;
    private readonly i18nService = inject(I18nService);

    get manageProgramLink():string {
        return `/program/${this.program.id}/manage`;
    }

    constructor() {
        this.locale = this.i18nService.currentLocale;
    }

}
