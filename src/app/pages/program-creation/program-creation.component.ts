import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import {
    EducationProgramDto,
    ProgramModuleDto,
    ProgramSectionDto,
    ProgramTopicDto
} from '../../common/models/shared.model';

import { ProgramService } from '../../services/program.service';
import { LearningUnitItem } from './components/learning-unit-item.component.component';
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component';
import { BorderButtonComponent } from '../../common/components/button/arrow-button/border-button.component';
import { MultiLangFieldPipe } from '../../common/pipes/multi-lang-field.pipe';

interface DialogConfig {
    isOpen: boolean;
    mode: 'create' | 'edit';
    entityType: 'program' | 'section' | 'module' | 'topic';
    entityData?: EducationProgramDto | ProgramSectionDto | ProgramModuleDto | ProgramTopicDto;
    parentId?: string; // used for create
}

@Component({
    selector: 'app-program-creation',
    templateUrl: './program-creation.component.html',
    styleUrls: ['./program-creation.component.scss'],
    imports: [
        LearningUnitItem,
        UploadDialogComponent,
        BorderButtonComponent,
        MultiLangFieldPipe
    ]
})
export class ProgramCreationComponent implements OnInit {

    /** Holds the entire program loaded from backend. */
    public programSignal = signal<EducationProgramDto | null>(null);

    /** Controls when the dialog is open and what entity is being created/edited. */
    public dialogConfig = signal<DialogConfig | null>(null);

    /** Currently selected section / module */
    public selectedSection: ProgramSectionDto | null = null;
    public selectedModule: ProgramModuleDto | null = null;

    private programId!: string;

    constructor(
        private route: ActivatedRoute,
        private programService: ProgramService
    ) {}

    get totalSectionsCount() {
        return this.programSignal()?.sections.length || 0;
    }

    get totalModulesCount() {
        return this.programSignal()?.sections
            .flatMap(s => s.modules)
            .length || 0;
    }

    get totalTopicsCount() {
        return this.programSignal()?.sections
            .flatMap(s => s.modules)
            .flatMap(m => m.topics)
            .length || 0;
    }

    ngOnInit(): void {
        this.programId = this.route.snapshot.paramMap.get('programId')!;
        const programObs: Observable<EducationProgramDto> =
            this.programService.getProgramById(this.programId);

        programObs.subscribe(program => {
            console.log(program);
            this.programSignal.set(program);
        });
    }

    public onSelectSection(section: ProgramSectionDto): void {
        this.selectedSection = section;
        this.selectedModule = null;
    }
    public onSelectModule(module: ProgramModuleDto): void {
        this.selectedModule = module;
    }

    public onEditProgram(): void {
        const program = this.programSignal();
        if (!program) return;

        this.dialogConfig.set({
            isOpen: true,
            mode: 'edit',
            entityType: 'program',
            entityData: program
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
    public onEditModule(module: ProgramModuleDto): void {
        this.dialogConfig.set({
            isOpen: true,
            mode: 'edit',
            entityType: 'module',
            entityData: module
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

    public onAddSection(): void {
        this.dialogConfig.set({
            isOpen: true,
            mode: 'create',
            entityType: 'section',
            parentId: this.programSignal()?.id
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
    public onAddTopic(module: ProgramModuleDto): void {
        this.dialogConfig.set({
            isOpen: true,
            mode: 'create',
            entityType: 'topic',
            parentId: module.id
        });
    }

    // -----------------------------------------------------------------
    // Deleting - calls the new API endpoints
    // -----------------------------------------------------------------

    /** FULL Program */
    public onDeleteProgram(): void {
        if (!this.programId) return;
        // Confirm if needed
        this.programService.deleteProgramById(this.programId)
            .subscribe(() => {
                // Perhaps navigate away, or set local to null
                this.programSignal.set(null);
                // e.g. maybe navigate to /programs
            });
    }

    /** Single Section bridging */
    public onDeleteSection(section: ProgramSectionDto): void {
        if (!this.programId) return;

        this.programService.removeProgramSectionMapping(this.programId, section.id)
            .subscribe(() => {
                // Locally remove the section from our array
                const program = this.programSignal();
                if (!program) return;
                program.sections = program.sections.filter(s => s.id !== section.id);
                this.programSignal.set({ ...program });
                // If the section was selected, clear it
                if (this.selectedSection === section) {
                    this.selectedSection = null;
                    this.selectedModule = null;
                }
            });
    }

    /** Single Module bridging */
    public onDeleteModule(module: ProgramModuleDto): void {
        const program = this.programSignal();
        if (!program || !this.selectedSection) return;

        this.programService.removeSectionModuleMapping(
            this.programId,
            this.selectedSection.id,
            module.id
        ).subscribe(() => {
            // locally remove
            this.selectedSection!.modules =
                this.selectedSection!.modules.filter(m => m.id !== module.id);
            this.programSignal.update(p => p);
            if (this.selectedModule === module) {
                this.selectedModule = null;
            }
        });
    }

    /** Single Topic bridging */
    public onDeleteTopic(topic: ProgramTopicDto): void {
        const program = this.programSignal();
        if (!program || !this.selectedSection || !this.selectedModule) return;

        this.programService.removeModuleTopicMapping(
            this.programId,
            this.selectedSection.id,
            this.selectedModule.id,
            topic.id
        ).subscribe(() => {
            // locally remove
            this.selectedModule!.topics =
                this.selectedModule!.topics.filter(t => t.id !== topic.id);
            this.programSignal.update(p => p);
        });
    }

    // -----------------------------------------------------------------
    // Closing Dialog
    // -----------------------------------------------------------------
    public onDialogClose(result: any): void {
        if (!result) {
            this.dialogConfig.set(null);
            return;
        }

        // 1) If user created a new section
        if (result.createdSection) {
            const program = this.programSignal();
            if (!program) {
                this.dialogConfig.set(null);
                return;
            }
            program.sections.push(result.createdSection);
            this.programSignal.set({ ...program });
        }

        // 2) If user created a new module
        if (result.createdModule && this.selectedSection) {
            this.selectedSection.modules.push(result.createdModule);
            this.programSignal.update(p => p);
        }

        // 3) If user created a new topic
        if (result.createdTopic && this.selectedModule) {
            this.selectedModule.topics.push(result.createdTopic);
            this.programSignal.update(p => p);
        }

        if (result.updatedProgram) {
            this.programSignal.set(result.updatedProgram);
        }
        if (result.updatedSection) {
            const program = this.programSignal();
            if (!program) {
                this.dialogConfig.set(null);
                return;
            }
            const idx = program.sections.findIndex(s => s.id === result.updatedSection.id);
            if (idx >= 0) {
                program.sections[idx] = result.updatedSection;
                this.programSignal.set({ ...program });
            }
        }
        if (result.updatedModule && this.selectedSection) {
            const idx = this.selectedSection.modules
                .findIndex(m => m.id === result.updatedModule.id);
            if (idx >= 0) {
                this.selectedSection.modules[idx] = result.updatedModule;
                this.programSignal.update(p => p);
            }
        }
        if (result.updatedTopic && this.selectedModule) {
            const idx = this.selectedModule.topics
                .findIndex(t => t.id === result.updatedTopic.id);
            if (idx >= 0) {
                this.selectedModule.topics[idx] = result.updatedTopic;
                this.programSignal.update(p => p);
            }
        }

        this.dialogConfig.set(null);
    }

    public onSaveProgram(): void {
        const program = this.programSignal();
        if (!program) return;

        const formData = this.mapProgramToFormData(program);
        console.log(formData);

        this.programService.saveProgramInOneCall(formData)
            .subscribe(updatedProgram => {
                this.programSignal.set(updatedProgram);
            });
    }

    private mapProgramToFormData(program: EducationProgramDto): FormData {
        const formData = new FormData();
        const isProgramExisting = !!program.id && program.id.trim() !== '';

        if (isProgramExisting) {
            formData.append('existingProgramId', program.id);
        } else {
            if (program.name.en) formData.append('name.en', program.name.en);
            if (program.name.uk) formData.append('name.uk', program.name.uk);
            if (program.description.en) {
                formData.append('description.en', program.description.en);
            }
            if (program.description.uk) {
                formData.append('description.uk', program.description.uk);
            }
            if (program.finalTaskFile) {
                formData.append('finalTask', program.finalTaskFile);
            }
        }

        // sections
        const sections = program.sections || [];
        sections.forEach((section, sIndex) => {
            const isSecExisting = !!section.id && section.id.trim() !== '';
            if (isSecExisting) {
                formData.append(`sections[${sIndex}].existingSectionId`, section.id);
            } else {
                if (section.name.en) {
                    formData.append(`sections[${sIndex}].name.en`, section.name.en);
                }
                if (section.name.uk) {
                    formData.append(`sections[${sIndex}].name.uk`, section.name.uk);
                }
                if (section.description.en) {
                    formData.append(`sections[${sIndex}].description.en`, section.description.en);
                }
                if (section.description.uk) {
                    formData.append(`sections[${sIndex}].description.uk`, section.description.uk);
                }
                formData.append(`sections[${sIndex}].orderIndex`, String(sIndex + 1));
                if (section.finalTaskFile) {
                    formData.append(`sections[${sIndex}].finalTask`, section.finalTaskFile);
                }
            }

            // modules
            const modules = section.modules || [];
            modules.forEach((module, mIndex) => {
                const isModExisting = !!module.id && module.id.trim() !== '';
                if (isModExisting) {
                    formData.append(`sections[${sIndex}].modules[${mIndex}].existingModuleId`, module.id);
                } else {
                    if (module.name.en) {
                        formData.append(`sections[${sIndex}].modules[${mIndex}].name.en`, module.name.en);
                    }
                    if (module.name.uk) {
                        formData.append(`sections[${sIndex}].modules[${mIndex}].name.uk`, module.name.uk);
                    }
                    if (module.description.en) {
                        formData.append(`sections[${sIndex}].modules[${mIndex}].description.en`, module.description.en);
                    }
                    if (module.description.uk) {
                        formData.append(`sections[${sIndex}].modules[${mIndex}].description.uk`, module.description.uk);
                    }
                    formData.append(`sections[${sIndex}].modules[${mIndex}].orderIndex`, String(mIndex + 1));
                    if (module.finalTaskFile) {
                        formData.append(`sections[${sIndex}].modules[${mIndex}].finalTask`, module.finalTaskFile);
                    }
                }

                // topics
                const topics = module.topics || [];
                topics.forEach((topic, tIndex) => {
                    const isTopicExisting = !!topic.id && topic.id.trim() !== '';
                    if (isTopicExisting) {
                        formData.append(
                            `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].existingTopicId`,
                            topic.id
                        );
                    } else {
                        if (topic.name.en) {
                            formData.append(
                                `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].name.en`,
                                topic.name.en
                            );
                        }
                        if (topic.name.uk) {
                            formData.append(
                                `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].name.uk`,
                                topic.name.uk
                            );
                        }
                        if (topic.description.en) {
                            formData.append(
                                `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].description.en`,
                                topic.description.en
                            );
                        }
                        if (topic.description.uk) {
                            formData.append(
                                `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].description.uk`,
                                topic.description.uk
                            );
                        }
                        if (topic.testId) {
                            formData.append(
                                `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].testId`,
                                topic.testId
                            );
                        }
                        formData.append(
                            `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].orderIndex`,
                            String(tIndex + 1)
                        );
                        formData.append(
                            `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].difficulty`,
                            String(topic.difficulty)
                        );
                        if (topic.finalTaskFile) {
                            formData.append(
                                `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].finalTask`,
                                topic.finalTaskFile
                            );
                        }
                    }
                });
            });
        });

        return formData;
    }
}
