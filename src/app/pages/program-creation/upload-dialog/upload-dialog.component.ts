import {
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    signal,
    ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { BorderButtonComponent } from '../../../common/components/button/arrow-button/border-button.component';
import { LabelInput } from '../../../common/components/input/label-input/label-input';

import {
    EducationProgramDto,
    ProgramSectionDto,
    ProgramModuleDto,
    ProgramTopicDto
} from '../../../common/models/shared.model';
import { ProgramService } from '../../../services/program.service';

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
        BorderButtonComponent
    ]
})
export class UploadDialogComponent implements OnInit {

    @Input() mode: 'create' | 'edit' = 'create';

    /**
     * 'program', 'section', 'module', or 'topic'
     */
    @Input() entityType: 'program' | 'section' | 'module' | 'topic' = 'section';

    /**
     * If creating, we might need the parentId
     */
    @Input() parentId?: string;

    /**
     * If editing, we pass the existing data
     */
    @Input() entityData?: EducationProgramDto | ProgramSectionDto | ProgramModuleDto | ProgramTopicDto;

    /**
     * Emitted when the user finishes
     */
    @Output() close = new EventEmitter<{
        updatedProgram?: EducationProgramDto;
        updatedSection?: ProgramSectionDto;
        updatedModule?: ProgramModuleDto;
        updatedTopic?: ProgramTopicDto;
        createdSection?: ProgramSectionDto;
        createdModule?: ProgramModuleDto;
        createdTopic?: ProgramTopicDto;
    } | null>();

    public dialogForm = signal<FormGroup>(new FormGroup({}));
    public selectedFile = signal<File | undefined>(undefined);
    public isFileSelectedd = signal<boolean>(false);

    private fb = inject(FormBuilder);
    private matIconRegistry = inject(MatIconRegistry);
    private domSanitizer = inject(DomSanitizer);
    private programService = inject(ProgramService);

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    ngOnInit(): void {
        // Register icon if needed
        this.matIconRegistry.addSvgIcon(
            'fileUploaded',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system/done.svg')
        );

        // Build form
        const group = this.fb.group({
            nameUk: [''],
            nameEn: [''],
            descriptionUk: [''],
            descriptionEn: ['']
        });
        this.dialogForm.set(group);

        // If editing, patch
        if (this.mode === 'edit' && this.entityData) {
            this.patchForm(this.entityData);
        }
    }

    private patchForm(entity: EducationProgramDto | ProgramSectionDto | ProgramModuleDto | ProgramTopicDto): void {
        // For a program
        if (this.entityType === 'program') {
            const prog = entity as EducationProgramDto;
            this.dialogForm().patchValue({
                nameUk: prog.name.uk ?? '',
                nameEn: prog.name.en ?? '',
                descriptionUk: prog.description.uk ?? '',
                descriptionEn: prog.description.en ?? ''
            });
            // If program had a finalTaskFile or bannerFile, you could show it
        }
        else if (this.entityType === 'section') {
            const sec = entity as ProgramSectionDto;
            this.dialogForm().patchValue({
                nameUk: sec.name.uk ?? '',
                nameEn: sec.name.en ?? '',
                descriptionUk: sec.description.uk ?? '',
                descriptionEn: sec.description.en ?? ''
            });
            if (sec.finalTaskFile) {
                this.selectedFile.set(sec.finalTaskFile);
                this.isFileSelectedd.set(true);
            }
        }
        else if (this.entityType === 'module') {
            const mod = entity as ProgramModuleDto;
            this.dialogForm().patchValue({
                nameUk: mod.name.uk ?? '',
                nameEn: mod.name.en ?? '',
                descriptionUk: mod.description.uk ?? '',
                descriptionEn: mod.description.en ?? ''
            });
            if (mod.finalTaskFile) {
                this.selectedFile.set(mod.finalTaskFile);
                this.isFileSelectedd.set(true);
            }
        }
        else if (this.entityType === 'topic') {
            const topic = entity as ProgramTopicDto;
            this.dialogForm().patchValue({
                nameUk: topic.name.uk ?? '',
                nameEn: topic.name.en ?? '',
                descriptionUk: topic.description.uk ?? '',
                descriptionEn: topic.description.en ?? ''
            });
            if (topic.taskFile) {
                this.selectedFile.set(topic.taskFile);
                this.isFileSelectedd.set(true);
            }
        }
    }

    public onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.selectedFile.set(file);
            this.isFileSelectedd.set(true);
        }
    }

    public removeFile(): void {
        this.selectedFile.set(undefined);
        this.isFileSelectedd.set(false);
    }

    public triggerFileDialog(): void {
        this.fileInput.nativeElement.click();
    }

    get isFileSelected() {
        return this.isFileSelectedd();
    }

    public onSubmit(): void {
        if (this.dialogForm().invalid) {
            this.dialogForm().markAllAsTouched();
            return;
        }

        if (this.mode === 'create') {
            this.handleCreate();
        } else {
            this.handleUpdate();
        }
    }

    private handleCreate(): void {
        // For a new item, we do local creation, or we can call an API if you want immediate creation
        const formVals = this.dialogForm().value;

        if (this.entityType === 'section') {
            const newSection: ProgramSectionDto = {
                id: '', // let backend assign
                name: {
                    en: formVals.nameEn,
                    uk: formVals.nameUk
                },
                description: {
                    en: formVals.descriptionEn,
                    uk: formVals.descriptionUk
                },
                modules: [],
                ...(this.selectedFile() && { finalTaskFile: this.selectedFile() })
            };
            // We can create it locally or call an immediate API
            // For now, let's just emit it:
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
        else if (this.entityType === 'topic') {
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
                taskUrl: '',
                ...(this.selectedFile() && { taskFile: this.selectedFile() })
            };
            this.close.emit({ createdTopic: newTopic });
        }
        else if (this.entityType === 'program') {
            // Possibly create a new program?
            // Typically you'd do that from a different screen, but here's how:
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
                version: 1,
                expertise: '',
                // finalTaskUrl: '',
                sections: [],
                ...(this.selectedFile()! && { finalTaskFile: this.selectedFile()! })
            };
            this.close.emit({ updatedProgram: newProgram }); // or createdProgram
        }
        else {
            this.close.emit(null);
        }
    }

    private handleUpdate(): void {
        // For immediate updates, we call separate endpoints in ProgramService
        if (!this.entityData) {
            this.close.emit(null);
            return;
        }

        const formVals = this.dialogForm().value;
        const file = this.selectedFile();

        if (this.entityType === 'program') {
            const prog = this.entityData as EducationProgramDto;
            this.programService.updateProgram(prog.id, {
                ukName: formVals.nameUk,
                enName: formVals.nameEn,
                ukDesc: formVals.descriptionUk,
                enDesc: formVals.descriptionEn
            }, file).subscribe(updatedProgram => {
                this.close.emit({ updatedProgram });
            });
        }
        else if (this.entityType === 'section') {
            const sec = this.entityData as ProgramSectionDto;
            this.programService.updateSection(sec.id, {
                ukName: formVals.nameUk,
                enName: formVals.nameEn,
                ukDesc: formVals.descriptionUk,
                enDesc: formVals.descriptionEn
            }, file).subscribe(updatedSection => {
                this.close.emit({ updatedSection });
            });
        }
        else if (this.entityType === 'module') {
            const mod = this.entityData as ProgramModuleDto;
            this.programService.updateModule(mod.id, {
                ukName: formVals.nameUk,
                enName: formVals.nameEn,
                ukDesc: formVals.descriptionUk,
                enDesc: formVals.descriptionEn
            }, file).subscribe(updatedModule => {
                this.close.emit({ updatedModule });
            });
        }
        else if (this.entityType === 'topic') {
            const top = this.entityData as ProgramTopicDto;
            this.programService.updateTopic(top.id, {
                ukName: formVals.nameUk,
                enName: formVals.nameEn,
                ukDesc: formVals.descriptionUk,
                enDesc: formVals.descriptionEn
            }, file).subscribe(updatedTopic => {
                this.close.emit({ updatedTopic });
            });
        }
        else {
            this.close.emit(null);
        }
    }

    public onCloseClick(): void {
        this.close.emit(null);
    }
}
