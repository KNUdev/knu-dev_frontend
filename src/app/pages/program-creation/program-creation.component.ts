import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';

import {
    EducationProgramDto,
    ProgramSectionDto,
    ProgramModuleDto,
    ProgramTopicDto
} from '../../common/models/shared.model';

import { ProgramService } from '../../services/program.service';
import { LearningUnitItem } from './components/learning-unit-item.component.component';
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component';

/**
 * A local interface representing how we open the "upload-dialog"
 * for a single entity (section, module, or topic).
 */
interface DialogConfig {
    isOpen: boolean;
    mode: 'create' | 'edit';
    // entityType: 'program' | 'section' | 'module' | 'topic';
    entityType: 'section' | 'module' | 'topic';
    parentId?: string; // e.g., if creating a module, we store the sectionId
    entityData?: ProgramSectionDto | ProgramModuleDto | ProgramTopicDto; // used for editing
}

@Component({
    selector: 'app-program-creation',
    templateUrl: './program-creation.component.html',
    styleUrls: ['./program-creation.component.scss'],
    imports: [
        LearningUnitItem,
        UploadDialogComponent
    ]
})
export class ProgramCreationComponent implements OnInit {

    /**
     * Holds the entire program in memory (sections, modules, topics).
     * If `id` is present, we are editing an existing program. Otherwise new.
     */
    public programSignal = signal<EducationProgramDto | null>(null);

    /**
     * If we are showing a dialog to create or edit a section/module/topic.
     */
    public dialogConfig = signal<DialogConfig | null>(null);

    /**
     * Selected items for highlighting in the UI
     */
    public selectedSection: ProgramSectionDto | null = null;
    public selectedModule: ProgramModuleDto | null = null;

    private programId!: string;

    constructor(
        private route: ActivatedRoute,
        private programService: ProgramService
    ) {}

    ngOnInit(): void {
        this.programId = this.route.snapshot.paramMap.get('programId')!;

        // If editing an existing program, load it. Otherwise, start a new empty program locally.
        const program$: Observable<EducationProgramDto> =
            this.programService.getProgramById(this.programId);

        program$.subscribe(program => {
            // Store in signal
            this.programSignal.set(program);
        });
    }

    // ---------------------------------------------
    // Selection
    // ---------------------------------------------

    public onSelectSection(section: ProgramSectionDto): void {
        this.selectedSection = section;
        this.selectedModule = null;
    }

    public onSelectModule(module: ProgramModuleDto): void {
        this.selectedModule = module;
    }

    // ---------------------------------------------
    // CREATE / EDIT (open the dialog)
    // ---------------------------------------------

    public onAddSection(): void {
        this.dialogConfig.set({
            isOpen: true,
            mode: 'create',
            entityType: 'section',
            parentId: this.programSignal()?.id ?? undefined
        });
    }

    public onEditSection(section: ProgramSectionDto): void {
        this.dialogConfig.set({
            isOpen: true,
            mode: 'edit',
            entityType: 'section',
            entityData: section
        });
    }

    public onAddModule(section: ProgramSectionDto): void {
        this.dialogConfig.set({
            isOpen: true,
            mode: 'create',
            entityType: 'module',
            parentId: section.id
        });
    }

    public onEditModule(module: ProgramModuleDto): void {
        this.dialogConfig.set({
            isOpen: true,
            mode: 'edit',
            entityType: 'module',
            entityData: module
        });
    }

    public onAddTopic(module: ProgramModuleDto): void {
        this.dialogConfig.set({
            isOpen: true,
            mode: 'create',
            entityType: 'topic',
            parentId: module.id
        });
    }

    public onEditTopic(topic: ProgramTopicDto): void {
        this.dialogConfig.set({
            isOpen: true,
            mode: 'edit',
            entityType: 'topic',
            entityData: topic
        });
    }

    // ---------------------------------------------
    // DELETE
    // (Exact logic depends on your approach. Typically you'd just remove from local data.)
    // ---------------------------------------------

    public onDeleteSection(section: ProgramSectionDto): void {
        const program = this.programSignal();
        if (!program) return;
        program.sections = program.sections.filter(s => s !== section);
        this.programSignal.set({ ...program });
    }

    public onDeleteModule(module: ProgramModuleDto): void {
        if (!this.selectedSection) return;
        this.selectedSection.modules = this.selectedSection.modules.filter(m => m !== module);
        this.programSignal.update(p => p);
    }

    public onDeleteTopic(topic: ProgramTopicDto): void {
        if (!this.selectedModule) return;
        this.selectedModule.topics = this.selectedModule.topics.filter(t => t !== topic);
        this.programSignal.update(p => p);
    }

    // ---------------------------------------------
    // Handle dialog close
    // (the dialog returns a partial item that we
    // either push or patch in our local data).
    // ---------------------------------------------

    public onDialogClose(result?: {
        createdSection?: ProgramSectionDto;
        updatedSection?: ProgramSectionDto;
        createdModule?: ProgramModuleDto;
        updatedModule?: ProgramModuleDto;
        createdTopic?: ProgramTopicDto;
        updatedTopic?: ProgramTopicDto;
    }): void {
        if (!result) {
            // The dialog was cancelled
            this.dialogConfig.set(null);
            return;
        }

        const program = this.programSignal();
        if (!program) {
            this.dialogConfig.set(null);
            return;
        }

        // If we created a new section
        if (result.createdSection) {
            program.sections.push(result.createdSection);
            this.programSignal.set({ ...program });
        }

        // If we updated a section
        if (result.updatedSection) {
            const idx = program.sections.findIndex(s => s.id === result.updatedSection?.id);
            if (idx >= 0) {
                program.sections[idx] = result.updatedSection;
            }
            this.programSignal.set({ ...program });
        }

        // If we created a module
        if (result.createdModule && this.selectedSection) {
            this.selectedSection.modules.push(result.createdModule);
            this.programSignal.update(p => p);
        }

        // If we updated a module
        if (result.updatedModule && this.selectedSection) {
            const idx = this.selectedSection.modules.findIndex(m => m.id === result.updatedModule?.id);
            if (idx >= 0) {
                this.selectedSection.modules[idx] = result.updatedModule;
                this.programSignal.update(p => p);
            }
        }

        // If we created a topic
        if (result.createdTopic && this.selectedModule) {
            this.selectedModule.topics.push(result.createdTopic);
            this.programSignal.update(p => p);
        }

        // If we updated a topic
        if (result.updatedTopic && this.selectedModule) {
            const idx = this.selectedModule.topics.findIndex(t => t.id === result.updatedTopic?.id);
            if (idx >= 0) {
                this.selectedModule.topics[idx] = result.updatedTopic;
                this.programSignal.update(p => p);
            }
        }

        this.dialogConfig.set(null);
    }

    // ---------------------------------------------
    // Convert the local `EducationProgramDto`
    // into `FormData` that matches your
    // "EducationProgramCreationRequest" structure.
    // Then send to /save in a single call.
    // ---------------------------------------------

    public onSaveProgram(): void {
        const program = this.programSignal();
        if (!program) return;

        // Build the FormData
        const formData = this.mapProgramToFormData(program);

        // Post it
        this.programService.saveProgramInOneCall(formData).subscribe(updated => {
            // Update local data
            this.programSignal.set(updated);
        });
    }

    /**
     * Map the entire program to a single FormData structure
     * matching your `EducationProgramCreationRequest`
     * (and nested SectionCreationRequest, ModuleCreationRequest, TopicCreationRequest).
     */
    private mapProgramToFormData(program: EducationProgramDto): FormData {
        const formData = new FormData();

        // -- Program-level fields
        if (program.id) {
            formData.append('existingProgramId', program.id);
        }

        // MultiLanguageFieldDto for name
        formData.append('name.en', program.name.en ?? '');
        formData.append('name.uk', program.name.uk ?? '');

        // Program-level description
        formData.append('description.en', program.description.en ?? '');
        formData.append('description.uk', program.description.uk ?? '');

        // Example: if you track "expertise" somewhere
        // If your program has an `expertise` field
        // formData.append('expertise', program.expertise);

        // If you store a File object for finalTask in `program.finalTaskFile`, for example
        if ((program as any).finalTaskFile) {
            formData.append('finalTask', (program as any).finalTaskFile);
        }

        // If there's a banner file
        if ((program as any).bannerFile) {
            formData.append('banner', (program as any).bannerFile);
        }

        // -- Sections
        const sections = program.sections || [];
        sections.forEach((section, sectionIndex) => {
            if (section.id) {
                formData.append(`sections[${sectionIndex}].existingSectionId`, section.id);
            }
            // Name
            formData.append(`sections[${sectionIndex}].name.en`, section.name.en ?? '');
            formData.append(`sections[${sectionIndex}].name.uk`, section.name.uk ?? '');
            // Description
            formData.append(`sections[${sectionIndex}].description.en`, section.description.en ?? '');
            formData.append(`sections[${sectionIndex}].description.uk`, section.description.uk ?? '');
            // If you keep an orderIndex
            formData.append(`sections[${sectionIndex}].orderIndex`, String(sectionIndex));

            // If there's a file for this section's finalTask
            if ((section as any).finalTaskFile) {
                formData.append(`sections[${sectionIndex}].finalTask`, (section as any).finalTaskFile);
            }

            // modules
            const modules = section.modules || [];
            modules.forEach((module, moduleIndex) => {
                if (module.id) {
                    formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].existingModuleId`, module.id);
                }
                formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].name.en`, module.name.en ?? '');
                formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].name.uk`, module.name.uk ?? '');
                formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].description.en`, module.description.en ?? '');
                formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].description.uk`, module.description.uk ?? '');
                // orderIndex
                formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].orderIndex`, String(moduleIndex));

                // If there's a file for this module's finalTask
                if ((module as any).finalTaskFile) {
                    formData.append(
                        `sections[${sectionIndex}].modules[${moduleIndex}].finalTask`,
                        (module as any).finalTaskFile
                    );
                }

                // topics
                const topics = module.topics || [];
                topics.forEach((topic, topicIndex) => {
                    if (topic.id) {
                        formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].topics[${topicIndex}].existingTopicId`, topic.id);
                    }
                    formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].topics[${topicIndex}].name.en`, topic.name.en ?? '');
                    formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].topics[${topicIndex}].name.uk`, topic.name.uk ?? '');
                    formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].topics[${topicIndex}].description.en`, topic.description.en ?? '');
                    formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].topics[${topicIndex}].description.uk`, topic.description.uk ?? '');
                    // orderIndex
                    formData.append(`sections[${sectionIndex}].modules[${moduleIndex}].topics[${topicIndex}].orderIndex`, String(topicIndex));

                    // If there's a file for this topic's "task"
                    if ((topic as any).taskFile) {
                        formData.append(
                            `sections[${sectionIndex}].modules[${moduleIndex}].topics[${topicIndex}].task`,
                            (topic as any).taskFile
                        );
                    }
                });
            });
        });

        return formData;
    }
}
