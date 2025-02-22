import { Component, OnInit, signal } from '@angular/core';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ProgramService } from '../../services/program.service';
import {EducationProgramDto, ProgramSummary} from '../../common/models/shared.model';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ProgramListItemComponent } from './components/program-list-item/program-list-item.component';
import { Router } from '@angular/router';
import {UploadDialogComponent} from '../program-creation/upload-dialog/upload-dialog.component';
import {BorderButtonComponent} from '../../common/components/button/arrow-button/border-button.component';

// If you use standalone components, import the template from 'program.component.html'
// or inline template - here we just show the TS file plus assume
// we have a local template reference.

@Component({
    selector: 'app-program',
    standalone: true,
    imports: [
        MatIcon,
        AsyncPipe,
        ProgramListItemComponent,
        UploadDialogComponent,
        BorderButtonComponent
    ],
    templateUrl: './program.component.html',
    styleUrls: ['./program.component.scss']
})
export class ProgramComponent implements OnInit {

    /**
     * The list of all programs fetched from backend as an observable.
     */
    programs$!: Observable<ProgramSummary[]>;

    /**
     * A boolean that controls whether the upload-dialog is visible.
     * If `true`, we render <upload-dialog> for creating a new program.
     */
    public dialogIsOpen = false;

    constructor(
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private programService: ProgramService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // Register icons
        this.matIconRegistry.addSvgIcon(
            'center',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/button/realProject.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'firstRight',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/button/program.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'secondRight',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/button/mentor.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'firstLeft',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/button/study.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'secondLeft',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/button/presentation.svg')
        );

        // Load programs
        this.programs$ = this.programService.getAll();
    }

    /**
     * Show the dialog in "create" mode for a program.
     */
    public onCreateProgramClick(): void {
        this.dialogIsOpen = true;
    }

    /**
     * Called when <upload-dialog> emits (close).
     * If a new program was actually created, we can do local refresh or redirect.
     */
    public onDialogClose(result: any): void {
        // Hide the dialog
        this.dialogIsOpen = false;
        if (!result) return;

        // If the dialog handled immediate creation:
        // we might get { updatedProgram: newlyCreatedProgram } back.
        if (result.updatedProgram) {
            // Possibly we want to redirect to /program-creation/:id
            // so we can manage the newly created program's details.
            const newId = result.updatedProgram.id;
            this.router.navigateByUrl(`program/${newId}/manage`);
        }
    }
}
