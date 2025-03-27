import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
    LangChangeEvent,
    TranslatePipe,
    TranslateService,
} from '@ngx-translate/core';
import { Observable, startWith, switchMap } from 'rxjs';
import { ProgramSummary } from '../../common/models/shared.model';
import { I18nService } from '../../services/languages/i18n.service';
import { ProgramService } from '../../services/program.service';
import { UploadDialogComponent } from '../admin/manage-program/components/upload-dialog/upload-dialog.component';
import { ProgramListItemComponent } from './components/program-list-item/program-list-item.component';

@Component({
    selector: 'app-create-program',
    standalone: true,
    imports: [
        MatIcon,
        AsyncPipe,
        ProgramListItemComponent,
        UploadDialogComponent,
        TranslatePipe,
    ],
    templateUrl: './create-program.component.html',
    styleUrls: ['./create-program.component.scss'],
})
export class CreateProgramComponent implements OnInit {
    programs$!: Observable<ProgramSummary[]>;

    public dialogIsOpen = false;

    constructor(
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private programService: ProgramService,
        private router: Router,
        private translate: TranslateService,
        private i18nService: I18nService
    ) {}

    ngOnInit(): void {
        this.matIconRegistry.addSvgIcon(
            'center',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                'assets/icon/button/realProject.svg'
            )
        );
        this.matIconRegistry.addSvgIcon(
            'firstRight',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                'assets/icon/button/program.svg'
            )
        );
        this.matIconRegistry.addSvgIcon(
            'secondRight',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                'assets/icon/button/mentor.svg'
            )
        );
        this.matIconRegistry.addSvgIcon(
            'firstLeft',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                'assets/icon/button/study.svg'
            )
        );
        this.matIconRegistry.addSvgIcon(
            'secondLeft',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                'assets/icon/button/presentation.svg'
            )
        );

        this.programs$ = this.programService.getAll();

        this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/create-program',
                        event.lang
                    )
                )
            )
            .subscribe();
    }

    public onCreateProgramClick(): void {
        this.dialogIsOpen = true;
    }

    public onDialogClose(result: any): void {
        this.dialogIsOpen = false;
        if (!result) return;

        if (result.updatedProgram) {
            const newId = result.updatedProgram.id;
            this.router.navigateByUrl(`program/${newId}/manage`);
        }
    }
}
