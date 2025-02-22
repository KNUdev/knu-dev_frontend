import {Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, signal, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {TranslateModule} from '@ngx-translate/core';

import {BorderButtonComponent} from '../../../common/components/button/arrow-button/border-button.component';
import {LabelInput} from '../../../common/components/input/label-input/label-input';
import {
    EducationProgramDto,
    ProgramModuleDto,
    ProgramSectionDto,
    ProgramTopicDto
} from '../../../common/models/shared.model';
import {ProgramService} from '../../../services/program.service';
import {SelectOption, WriteDropDowns} from '../../auth/register/components/dropdown/write-dropdowns';
import {TestService} from '../../../services/test.service';
import {map} from 'rxjs/operators';
import {Expertise} from '../../user-profile/user-profile.model';

@Component({
    selector: 'upload-dialog',
    templateUrl: './upload-dialog.component.html',
    styleUrls: ['./upload-dialog.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        TranslateModule,
        LabelInput,
        BorderButtonComponent,
        WriteDropDowns
    ]
})
export class UploadDialogComponent implements OnInit {

    @Input() mode: 'create' | 'edit' = 'create';
    @Input() entityType: 'program' | 'section' | 'module' | 'topic' = 'section';
    @Input() parentId?: string;
    @Input() entityData?: EducationProgramDto | ProgramSectionDto | ProgramModuleDto | ProgramTopicDto;

    @Output() close = new EventEmitter<{
        updatedProgram?: EducationProgramDto;
        updatedSection?: ProgramSectionDto;
        updatedModule?: ProgramModuleDto;
        updatedTopic?: ProgramTopicDto;
        createdSection?: ProgramSectionDto;
        createdModule?: ProgramModuleDto;
        createdTopic?: ProgramTopicDto;
    } | null>();

    /**
     * The main reactive form. Holds name, description, and difficulty if it's a topic.
     */
    public dialogForm = signal<FormGroup>(new FormGroup({}));

    /**
     * If the user selects a new PDF file, we store it here for creation or update calls.
     */
    public selectedFile = signal<File | undefined>(undefined);

    /**
     * Tracks whether we *logically* have a file, either from backend (existing URL) or newly selected.
     */
    public isFileSelectedd = signal<boolean>(false);

    /**
     * If you load tests from a backend to populate <register-write-dropdowns>.
     */
    public testSelectOptions = signal<SelectOption[]>([]);

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    get test() {
        if(this.entityType === 'topic') {
            return (this.entityData as ProgramTopicDto).testId;
        }
        return '';
    }

    private fb = inject(FormBuilder);
    private matIconRegistry = inject(MatIconRegistry);
    private domSanitizer = inject(DomSanitizer);
    private programService = inject(ProgramService);
    private testService = inject(TestService);

    /**
     * Lifecycle: Build the form, load tests, register icons, pre-populate if editing.
     */
    ngOnInit(): void {
        // Register your custom icons if needed
        this.matIconRegistry.addSvgIcon(
            'fileUploaded',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system/done.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'closeDialog',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system/close.svg')
        );

        // Build default form: name, description are always required.
        // Difficulty is included (for topics).
        const group = this.fb.group({
            nameUk: ['', Validators.required],
            nameEn: ['', Validators.required],
            descriptionUk: ['', Validators.required],
            descriptionEn: ['', Validators.required],
            difficulty: [5],
            expertise: '',
            testId: ''
        });
        this.dialogForm.set(group);

        // If we are editing an existing item, patch data
        if (this.mode === 'edit' && this.entityData) {
            this.patchForm(this.entityData);
        }

        // If you have a test service that loads tests for the <register-write-dropdowns>
        this.testService.getAllShort()
            .pipe(
                map(tests => tests.map(test => ({
                    id: test.id,
                    name: {
                        en: test.enName,
                        uk: test.enName
                    }
                } as SelectOption)))
            )
            .subscribe(options => this.testSelectOptions.set(options));
    }

    /**
     * Returns the actual FormGroup object for convenience.
     */
    public get form() {
        return this.dialogForm();
    }

    get expertiseOptions():SelectOption[] {
        return Object.values(Expertise).map(value => ({
            id: value.toString(),
            name: {
                en: value.toString(),
                uk: value.toString(),
            }
        }));
    }

    public onSelectDifficulty(value: number): void {
        this.dialogForm().patchValue({ difficulty: value });
    }

    /**
     * Tells us if there's any file present (either newly selectedFile or an existing file name).
     */
    get isAnyFilePresent(): boolean {
        return !!this.selectedFile() || !!this.existingFilename;
    }

    /**
     * The displayed file name or the newly selected file name.
     */
    get currentFileName(): string {
        const file = this.selectedFile();
        if (file) {
            return file.name;
        }
        return this.existingFilename ?? '';
    }

    private get existingFilename(): string | undefined {
        if (!this.entityData) return undefined;
        return this.entityData.finalTaskFilename;
    }

    /**
     * Utility function: returns an array of [1..count].
     * Used to generate the difficulty items in the template.
     */
    public range(count: number): number[] {
        return Array.from({ length: count }, (_, i) => i + 1);
    }

    /**
     * Called when a user picks a file from their system.
     */
    public onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile.set(input.files[0]);
            this.isFileSelectedd.set(true);
        }
    }

    /**
     * Remove file references:
     * 1) Clears newly selected file
     * 2) Clears finalTaskUrl or taskUrl from the entityData so the UI doesn't show an existing file
     */
    public removeFile(): void {
        // Clear the new file
        this.selectedFile.set(undefined);
        this.isFileSelectedd.set(false);

        // Clear the existing finalTaskUrl or taskUrl in the local entity
        if (this.entityData) {
            if (this.entityType === 'topic') {
                (this.entityData as ProgramTopicDto).finalTaskUrl = undefined;
            } else {
                (this.entityData as any).finalTaskUrl = undefined;
            }
        }
    }

    /**
     * Programmatically trigger the hidden file input for PDF upload.
     */
    public triggerFileDialog(): void {
        this.fileInput.nativeElement.click();
    }

    /**
     * Called if user closes the dialog (clicking X).
     */
    public onCloseClick(): void {
        this.close.emit(null);
    }

    /**
     * On form submit, either create or update, depending on `mode`.
     */
    public onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        if (this.mode === 'create') {
            this.handleCreate();
        } else {
            this.handleUpdate();
        }
    }

    private patchForm(entity: EducationProgramDto | ProgramSectionDto | ProgramModuleDto | ProgramTopicDto): void {
        if (!entity) return;

        this.form.patchValue({
            nameUk: entity.name.uk ?? '',
            nameEn: entity.name.en ?? '',
            descriptionUk: entity.description.uk ?? '',
            descriptionEn: entity.description.en ?? ''
        });

        if (this.entityType === 'topic' && 'difficulty' in entity) {
            this.form.patchValue({
                difficulty: (entity as any).difficulty ?? 5
            });
        }
        if (this.entityType === 'topic' && 'testId' in entity) {
            this.form.patchValue({
                testId: (entity as any).testId ?? ''
            });
        }
        if (this.entityType === 'program') {
            const p = entity as EducationProgramDto;
            if (p.expertise) {
                this.form.patchValue({ expertise: p.expertise });
            }
        }
    }

    /**
     * Handle creating a new item (section/module/topic/program).
     * Changed to IMMEDIATELY create a program using `saveProgramInOneCall`.
     */
    private handleCreate(): void {
        const formVals = this.form.value;

        if (this.entityType === 'topic') {
            const newTopic: ProgramTopicDto = {
                id: '',
                name: {
                    en: formVals.nameEn,
                    uk: formVals.nameUk
                },
                description: {
                    en: formVals.descriptionEn,
                    uk: formVals.descriptionUk
                },
                learningResources: [],
                finalTaskUrl: '',
                // store difficulty from form
                difficulty: formVals.difficulty,
                testId: formVals.testId,
                // attach file if present
                ...(this.selectedFile() && { finalTaskFile: this.selectedFile() })
            };
            this.close.emit({ createdTopic: newTopic });
        }
        else if (this.entityType === 'section') {
            const newSection: ProgramSectionDto = {
                id: '',
                name: {
                    en: formVals.nameEn,
                    uk: formVals.nameUk
                },
                description: {
                    en: formVals.descriptionEn,
                    uk: formVals.descriptionUk
                },
                modules: [],
                // file if present
                ...(this.selectedFile() && { finalTaskFile: this.selectedFile() })
            };
            this.close.emit({ createdSection: newSection });
        }
        else if (this.entityType === 'module') {
            const newModule: ProgramModuleDto = {
                id: '',
                name: {
                    en: formVals.nameEn,
                    uk: formVals.nameUk
                },
                description: {
                    en: formVals.descriptionEn,
                    uk: formVals.descriptionUk
                },
                finalTaskUrl: '',
                topics: [],
                ...(this.selectedFile() && { finalTaskFile: this.selectedFile() })
            };
            this.close.emit({ createdModule: newModule });
        }
        else if (this.entityType === 'program') {
            // 1) Build minimal program object
            const newProgram: EducationProgramDto = {
                id: '',
                name: {
                    en: formVals.nameEn,
                    uk: formVals.nameUk
                },
                description: {
                    en: formVals.descriptionEn,
                    uk: formVals.descriptionUk
                },
                isPublished: false,
                finalTaskUrl: '',
                expertise: formVals.expertise as Expertise,
                sections: [],
                // If there's a PDF file chosen
                ...(this.selectedFile() && { finalTaskFile: this.selectedFile() })
            };

            // 2) Convert to FormData
            const formData = new FormData();
            formData.append('name.en', newProgram.name.en ?? '');
            formData.append('name.uk', newProgram.name.uk ?? '');
            formData.append('description.en', newProgram.description.en ?? '');
            formData.append('description.uk', newProgram.description.uk ?? '');
            formData.append('expertise', newProgram.expertise);
            if (newProgram.finalTaskFile) {
                formData.append('finalTask', newProgram.finalTaskFile);
            }

            // 3) IMMEDIATELY call the single-endpoint method
            this.programService.saveProgramInOneCall(formData)
                .subscribe(createdProgram => {
                    // 4) Emit the newly created program back to parent
                    this.close.emit({ updatedProgram: createdProgram });
                });

            // (Old code was: this.close.emit({ updatedProgram: newProgram });
            // We comment that out to avoid sending unsaved data.)
        }
        else {
            this.close.emit(null);
        }
    }

    /**
     * Handle updating an existing item (section/module/topic/program).
     */
    private handleUpdate(): void {
        if (!this.entityData) {
            this.close.emit(null);
            return;
        }

        const formVals = this.form.value;
        const file = this.selectedFile();

        if (this.entityType === 'topic') {
            const top = this.entityData as ProgramTopicDto;
            this.programService.updateTopic(
                top.id,
                {
                    ukName: formVals.nameUk,
                    enName: formVals.nameEn,
                    ukDesc: formVals.descriptionUk,
                    enDesc: formVals.descriptionEn,
                    difficulty: formVals.difficulty,
                    testId: formVals.testId
                },
                file
            ).subscribe(updatedTopic => {
                this.close.emit({ updatedTopic });
            });
        }
        else if (this.entityType === 'section') {
            const sec = this.entityData as ProgramSectionDto;
            this.programService.updateSection(
                sec.id,
                {
                    ukName: formVals.nameUk,
                    enName: formVals.nameEn,
                    ukDesc: formVals.descriptionUk,
                    enDesc: formVals.descriptionEn
                },
                file
            ).subscribe(updatedSection => {
                this.close.emit({ updatedSection });
            });
        }
        else if (this.entityType === 'module') {
            const mod = this.entityData as ProgramModuleDto;
            this.programService.updateModule(
                mod.id,
                {
                    ukName: formVals.nameUk,
                    enName: formVals.nameEn,
                    ukDesc: formVals.descriptionUk,
                    enDesc: formVals.descriptionEn
                },
                file
            ).subscribe(updatedModule => {
                this.close.emit({ updatedModule });
            });
        }
        else if (this.entityType === 'program') {
            const prog = this.entityData as EducationProgramDto;
            this.programService.updateProgram(
                prog.id,
                {
                    ukName: formVals.nameUk,
                    enName: formVals.nameEn,
                    ukDesc: formVals.descriptionUk,
                    enDesc: formVals.descriptionEn,
                    expertise: formVals.expertise as Expertise
                },
                file
            ).subscribe(updatedProgram => {
                this.close.emit({ updatedProgram });
            });
        }
        else {
            this.close.emit(null);
        }
    }
}
