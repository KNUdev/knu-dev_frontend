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
    ProgramSectionDto,
    ProgramModuleDto,
    ProgramTopicDto
} from '../../../common/models/shared.model';

/**
 * Dialog to create or update a single entity: section, module, or topic.
 */
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

    /**
     * 'create' => a new section/module/topic. 'edit' => update existing.
     */
    @Input() mode: 'create' | 'edit' = 'create';

    /**
     * The type of entity we manage: 'section', 'module', or 'topic'.
     */
    @Input() entityType: 'section' | 'module' | 'topic' = 'section';

    /**
     * If creating, might need a parentId to know which parent (program or section) it belongs to.
     */
    @Input() parentId?: string;

    /**
     * If editing, pass the existing data for pre-population.
     */
    @Input() entityData?: ProgramSectionDto | ProgramModuleDto | ProgramTopicDto;

    /**
     * Emitted when the user finishes creating/updating the item.
     * The parent merges this result into the local data model.
     */
    @Output() close = new EventEmitter<{
        createdSection?: ProgramSectionDto;
        updatedSection?: ProgramSectionDto;
        createdModule?: ProgramModuleDto;
        updatedModule?: ProgramModuleDto;
        createdTopic?: ProgramTopicDto;
        updatedTopic?: ProgramTopicDto;
    } | null>();

    /**
     * We create this signal with an empty FormGroup initially,
     * then define it in ngOnInit (avoiding TS2729).
     */
    public dialogForm = signal<FormGroup>(new FormGroup({}));

    public selectedFile = signal<File | undefined>(undefined);
    public isFileSelectedd = signal<boolean>(false);

    // We'll instantiate our FormBuilder in the constructor so it's available in ngOnInit
    private fb = inject(FormBuilder);
    private matIconRegistry = inject(MatIconRegistry);
    private domSanitizer = inject(DomSanitizer);

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    ngOnInit(): void {
        // Register icons if needed
        this.matIconRegistry.addSvgIcon(
            'fileUploaded',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system/done.svg')
        );

        // Now we can safely build the form (since fb is available)
        const group = this.fb.group({
            nameUk: [''],
            nameEn: [''],
            descriptionUk: [''],
            descriptionEn: ['']
            // If you had more fields (like 'difficulty'), add them here if entityType === 'topic'.
        });
        this.dialogForm.set(group);

        // If editing, patch existing data
        if (this.mode === 'edit' && this.entityData) {
            this.patchForm(this.entityData);
        }
    }

    private patchForm(entity: ProgramSectionDto | ProgramModuleDto | ProgramTopicDto): void {
        // All have "name" and "description".
        const patchValues = {
            nameUk: entity.name.uk ?? '',
            nameEn: entity.name.en ?? '',
            descriptionUk: entity.description.uk ?? '',
            descriptionEn: entity.description.en ?? ''
        };

        this.dialogForm().patchValue(patchValues);

        // If there's a file in the existing entity, show it as selected.
        if (this.entityType === 'section') {
            const section = entity as ProgramSectionDto;
            if (section.finalTaskFile) {
                this.selectedFile.set(section.finalTaskFile);
                this.isFileSelectedd.set(true);
            }
        }
        else if (this.entityType === 'module') {
            const module = entity as ProgramModuleDto;
            if (module.finalTaskFile) {
                this.selectedFile.set(module.finalTaskFile);
                this.isFileSelectedd.set(true);
            }
        }
        else if (this.entityType === 'topic') {
            const topic = entity as ProgramTopicDto;
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
        const formVals = this.dialogForm().value;
        if (this.mode === 'create') {
            this.createEntity(formVals);
        } else {
            this.updateEntity(formVals);
        }
    }

    private createEntity(formVals: any): void {
        if (this.entityType === 'section') {
            // No ID => let the backend generate it
            const newSection: ProgramSectionDto = {
                id: '', // or undefined
                name: {
                    en: formVals.nameEn,
                    uk: formVals.nameUk
                },
                description: {
                    en: formVals.descriptionEn,
                    uk: formVals.descriptionUk
                },
                modules: [],
                // If user selected a file for the final task:
                ...(this.selectedFile() && { finalTaskFile: this.selectedFile() })
            };
            this.close.emit({ createdSection: newSection });
        }
        else if (this.entityType === 'module') {
            const newModule: ProgramModuleDto = {
                id: '', // or undefined
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
                id: '', // or undefined
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
        else {
            this.close.emit(null);
        }
    }

    private updateEntity(formVals: any): void {
        if (!this.entityData) {
            this.close.emit(null);
            return;
        }

        if (this.entityType === 'section') {
            const currentSection = this.entityData as ProgramSectionDto;
            const updatedSection: ProgramSectionDto = {
                ...currentSection,
                name: {
                    en: formVals.nameEn,
                    uk: formVals.nameUk
                },
                description: {
                    en: formVals.descriptionEn,
                    uk: formVals.descriptionUk
                },
                modules: currentSection.modules,
                // If new file is chosen, set finalTaskFile. Otherwise keep the old.
                finalTaskFile: this.selectedFile() || currentSection.finalTaskFile
            };
            this.close.emit({ updatedSection });
        }
        else if (this.entityType === 'module') {
            const currentModule = this.entityData as ProgramModuleDto;
            const updatedModule: ProgramModuleDto = {
                ...currentModule,
                name: {
                    en: formVals.nameEn,
                    uk: formVals.nameUk
                },
                description: {
                    en: formVals.descriptionEn,
                    uk: formVals.descriptionUk
                },
                // preserve finalTaskUrl & topics
                finalTaskUrl: currentModule.finalTaskUrl,
                topics: currentModule.topics,
                // if new file is selected, store it in finalTaskFile; else keep old
                finalTaskFile: this.selectedFile() || currentModule.finalTaskFile
            };
            this.close.emit({ updatedModule });
        }
        else if (this.entityType === 'topic') {
            const currentTopic = this.entityData as ProgramTopicDto;
            const updatedTopic: ProgramTopicDto = {
                ...currentTopic,
                name: {
                    en: formVals.nameEn,
                    uk: formVals.nameUk
                },
                description: {
                    en: formVals.descriptionEn,
                    uk: formVals.descriptionUk
                },
                learningResources: currentTopic.learningResources,
                taskUrl: currentTopic.taskUrl,
                // if new file is selected, store it; else keep old
                taskFile: this.selectedFile() || currentTopic.taskFile
            };
            this.close.emit({ updatedTopic });
        }
        else {
            this.close.emit(null);
        }
    }

    /**
     * Optional close button event
     */
    public onCloseClick(): void {
        this.close.emit(null);
    }
}
