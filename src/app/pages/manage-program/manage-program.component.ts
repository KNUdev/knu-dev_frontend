import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {Observable, startWith, Subject, switchMap, takeUntil} from 'rxjs';

import {
    EducationProgramDto,
    ProgramModuleDto,
    ProgramSectionDto,
    ProgramTopicDto
} from '../../common/models/shared.model';

import { ProgramService } from '../../services/program.service';
import { LearningUnitItem } from './components/learning-unit/learning-unit-item.component';
import { UploadDialogComponent } from './components/upload-dialog/upload-dialog.component';
import { BorderButtonComponent } from '../../common/components/button/arrow-button/border-button.component';
import { MultiLangFieldPipe } from '../../common/pipes/multi-lang-field.pipe';
import {DatePipe} from '@angular/common';
import {I18nService} from '../../services/languages/i18n.service';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent, ConfirmDialogData} from './components/confirm-dialog/confirm-dialog.component';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {LangChangeEvent, TranslatePipe, TranslateService} from '@ngx-translate/core';

interface DialogConfig {
    isOpen: boolean;
    mode: 'create' | 'edit';
    entityType: 'program' | 'section' | 'module' | 'topic';
    entityData?: EducationProgramDto | ProgramSectionDto | ProgramModuleDto | ProgramTopicDto;
    parentId?: string;
    defaultOrderIndex?:number;
}

@Component({
    selector: 'app-program-creation',
    templateUrl: './manage-program.component.html',
    styleUrls: ['./manage-program.component.scss'],
    imports: [
        LearningUnitItem,
        UploadDialogComponent,
        BorderButtonComponent,
        MultiLangFieldPipe,
        CdkDropList,
        CdkDrag,
        DatePipe,
        MatIcon,
        TranslatePipe
    ],
    standalone: true
})
export class ManageProgramComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    public programSignal = signal<EducationProgramDto | null>(null);
    public dialogConfig = signal<DialogConfig | null>(null);
    public areChangesPresent = signal<boolean>(false);
    public isErrorPresent = signal<boolean>(false);
    public errorText = signal<string>('');
    private isSectionsOrdersChanged = signal<boolean>(false);
    private isModulesOrdersChanged = signal<boolean>(false);
    private isTopicsOrdersChanged = signal<boolean>(false);
    public selectedSection: ProgramSectionDto | null = null;
    public selectedModule: ProgramModuleDto | null = null;
    public locale: string;
    private programId!: string;

    constructor(
        private route: ActivatedRoute,
        private programService: ProgramService,
        private router: Router,
        private i18nService: I18nService,
        private dialog: MatDialog,
        private matIconRegistry:MatIconRegistry,
        private domSanitizer:DomSanitizer,
        private translate: TranslateService
    ) {
        this.locale = this.i18nService.currentLocale;
        this.translate.onLangChange
            .pipe(
                takeUntil(this.destroy$),
                startWith({lang: this.translate.currentLang} as LangChangeEvent),
                switchMap(event => this.i18nService.loadComponentTranslations('pages/manage-program', event.lang))
            )
            .subscribe();
    }

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

    get cannotCreateModule() {
        if(this.programSignal()) {
            return !(this.programSignal()!.sections!.length > 0);
        }
        return false;
    }

    get cannotCreateTopic() {
        return !this.selectedModule;
    }

    ngOnInit(): void {
        this.programId = this.route.snapshot.paramMap.get('programId')!;
        const programObs: Observable<EducationProgramDto> =
            this.programService.getProgramById(this.programId);

        programObs.subscribe(program => {
            this.programSignal.set(program);
        });

        this.i18nService.currentLocale$
            .pipe(takeUntil(this.destroy$))
            .subscribe(locale => {
            this.locale = locale;
        });

        this.matIconRegistry.addSvgIcon(
            'flag',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system/flag.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'sweat',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system/sweat.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'goBack',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system/arrowLeft.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'clearErrors',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system/close.svg')
        );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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
        console.log("SECTION")
        console.log(section)
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
        const program = this.programSignal();
        const defaultOrderIndex = program ? program.sections.length + 1 : 1;
        this.dialogConfig.set({
            isOpen: true,
            mode: 'create',
            entityType: 'section',
            parentId: this.programSignal()?.id,
            defaultOrderIndex: defaultOrderIndex
        });
        this.areChangesPresent.set(true);
    }

    public onAddModule(section: ProgramSectionDto): void {
        const defaultOrderIndex = section.modules ? section.modules.length + 1 : 1;
        this.dialogConfig.set({
            isOpen: true,
            mode: 'create',
            entityType: 'module',
            parentId: section.id,
            defaultOrderIndex: defaultOrderIndex
        });
        this.areChangesPresent.set(true);
    }

    public onAddTopic(module: ProgramModuleDto): void {
        const defaultOrderIndex = module.topics ? module.topics.length + 1 : 1;
        this.dialogConfig.set({
            isOpen: true,
            mode: 'create',
            entityType: 'topic',
            parentId: module.id,
            defaultOrderIndex: defaultOrderIndex
        });
        this.areChangesPresent.set(true);
    }

    public onDeleteProgram(): void {
        this.openConfirmDialog({
            message: this.translate.instant('program.alert.program'),
            buttonText: this.translate.instant('program.buttons.delete')
        }).subscribe(result => {
            if (result) {
                if (!this.programId) return;
                this.programService.deleteProgramById(this.programId)
                    .subscribe(() => {
                        this.programSignal.set(null);
                        this.router.navigateByUrl('/program/create');
                    });
            }
        });
    }

    public onDeleteSection(section: ProgramSectionDto): void {
        this.openConfirmDialog({
            message: this.translate.instant('program.alert.section'),
            buttonText: this.translate.instant('program.buttons.delete')
        }).subscribe(result => {
            if (result) {
                if (!this.programId) return;
                this.programService.removeProgramSectionMapping(this.programId, section.id)
                    .subscribe(() => {
                        const program = this.programSignal();
                        if (!program) return;
                        program.sections = program.sections.filter(s => s.id !== section.id);
                        program.sections.forEach((s, index) => s.orderIndex = index + 1);
                        this.programSignal.set({ ...program });
                        if (this.selectedSection === section) {
                            this.selectedSection = null;
                            this.selectedModule = null;
                        }
                    });
            }
        });
    }

    public onDeleteModule(module: ProgramModuleDto): void {
        this.openConfirmDialog({
            message: this.translate.instant('program.alert.module'),
            buttonText: this.translate.instant('program.buttons.delete')
        }).subscribe(result => {
            if (result) {
                const program = this.programSignal();
                if (!program || !this.selectedSection) return;
                this.programService.removeSectionModuleMapping(
                    this.programId,
                    this.selectedSection.id,
                    module.id
                ).subscribe(() => {
                    this.selectedSection!.modules = this.selectedSection!.modules
                        .filter(m => m.id !== module.id);
                    this.selectedSection!.modules
                        .forEach((m, index) => m.orderIndex = index + 1);
                    this.programSignal.update(p => p);
                    if (this.selectedModule === module) {
                        this.selectedModule = null;
                    }
                });
            }
        });
    }

    public onDeleteTopic(topic: ProgramTopicDto): void {
        this.openConfirmDialog({
            message: this.translate.instant('program.alert.topic'),
            buttonText: this.translate.instant('program.buttons.delete')
        }).subscribe(result => {
            if (result) {
                const program = this.programSignal();
                if (!program || !this.selectedSection || !this.selectedModule) return;
                this.programService.removeModuleTopicMapping(
                    this.programId,
                    this.selectedSection.id,
                    this.selectedModule.id,
                    topic.id
                ).subscribe(() => {
                    this.selectedModule!.topics = this.selectedModule!.topics
                        .filter(t => t.id !== topic.id);
                    this.selectedModule!.topics
                        .forEach((t, index) => t.orderIndex = index + 1);
                    this.programSignal.update(p => p);
                });
            }
        });
    }

    public dropSection(event: CdkDragDrop<ProgramSectionDto[]>): void {
        const program = this.programSignal();
        if (!program) return;
        const oldOrder = program.sections.map(section => section.id);
        moveItemInArray(program.sections, event.previousIndex, event.currentIndex);
        const newOrder = program.sections.map(section => section.id);
        program.sections.forEach((section, index) => {
            section.orderIndex = index + 1;
        });
        this.programSignal.set({ ...program });
        if (!this.arraysEqual(oldOrder, newOrder)) {
            this.areChangesPresent.set(true);
            this.isSectionsOrdersChanged.set(true);
        }
    }

    public dropModule(event: CdkDragDrop<ProgramModuleDto[]>): void {
        if (!this.selectedSection) return;
        const oldOrder = this.selectedSection.modules.map(module => module.id);
        moveItemInArray(this.selectedSection.modules, event.previousIndex, event.currentIndex);
        const newOrder = this.selectedSection.modules.map(module => module.id);
        this.selectedSection.modules.forEach((module, index) => {
            module.orderIndex = index + 1;
        });
        this.programSignal.update(p => p);
        if (!this.arraysEqual(oldOrder, newOrder)) {
            this.areChangesPresent.set(true);
            this.isModulesOrdersChanged.set(true);
        }
    }

    public dropTopic(event: CdkDragDrop<ProgramTopicDto[]>): void {
        if (!this.selectedModule) return;
        const oldOrder = this.selectedModule.topics.map(topic => topic.id);
        moveItemInArray(this.selectedModule.topics, event.previousIndex, event.currentIndex);
        const newOrder = this.selectedModule.topics.map(topic => topic.id);
        this.selectedModule.topics.forEach((topic, index) => {
            topic.orderIndex = index + 1;
        });
        this.programSignal.update(p => p);
        if (!this.arraysEqual(oldOrder, newOrder)) {
            this.areChangesPresent.set(true);
            this.isTopicsOrdersChanged.set(true);
        }
    }

    public onErrorsClear() {
        this.isErrorPresent.set(false);
        this.errorText.set("");
    }

    public onDialogClose(result: any): void {
        if (!result) {
            this.dialogConfig.set(null);
            return;
        }

        if (result.updatedProgram) {
            const currentProgram = this.programSignal();
            if (currentProgram) {
                const mergedProgram: EducationProgramDto = {
                    ...currentProgram,
                    ...result.updatedProgram,
                    sections: currentProgram.sections
                };
                this.programSignal.set(mergedProgram);
            }
        }

        if (result.updatedSection) {
            const currentProgram = this.programSignal();
            if (currentProgram) {
                const idx = currentProgram.sections
                    .findIndex(s => s.id === result.updatedSection.id);
                if (idx >= 0) {
                    currentProgram.sections[idx] = {
                        ...currentProgram.sections[idx],
                        ...result.updatedSection,
                        modules: currentProgram.sections[idx].modules
                    };
                    this.programSignal.set({ ...currentProgram });
                }
            }
        }

        if (result.updatedModule && this.selectedSection) {
            const idx = this.selectedSection.modules
                .findIndex(m => m.id === result.updatedModule.id);
            if (idx >= 0) {
                this.selectedSection.modules[idx] = {
                    ...this.selectedSection.modules[idx],
                    ...result.updatedModule,
                    topics: this.selectedSection.modules[idx].topics
                };
                this.programSignal.update(p => p);
            }
        }

        if (result.updatedTopic && this.selectedModule) {
            const idx = this.selectedModule.topics
                .findIndex(t => t.id === result.updatedTopic.id);
            if (idx >= 0) {
                this.selectedModule.topics[idx] = {
                    ...this.selectedModule.topics[idx],
                    ...result.updatedTopic
                };
                this.programSignal.update(p => p);
            }
        }

        if (result.createdSection) {
            const currentProgram = this.programSignal();
            if (currentProgram) {
                currentProgram.sections.push(result.createdSection);
                this.programSignal.set({ ...currentProgram });
            }
        }
        if (result.createdModule && this.selectedSection) {
            this.selectedSection.modules.push(result.createdModule);
            this.programSignal.update(p => p);
        }
        if (result.createdTopic && this.selectedModule) {
            this.selectedModule.topics.push(result.createdTopic);
            this.programSignal.update(p => p);
        }

        this.dialogConfig.set(null);
    }

    public onSaveProgram(): void {
        const program = this.programSignal();
        if (!program) return;
        const formData = this.mapProgramToFormData(program);
        this.programService.saveProgramInOneCall(formData)
            .subscribe({
                next: newProgram => {
                    this.programSignal.set(newProgram);
                    this.areChangesPresent.set(false);
                },
                error: (err) => this.handleApiError(err)
            })
    }

    public onPublishProgram():void {
        const program = this.programSignal();
        if (!program) return;

        this.openConfirmDialog({
            message: this.translate.instant('program.alert.program'),
            buttonText: this.translate.instant('program.buttons.publish')
        }).subscribe(result => {
            if (result) {
                if (!this.programId) return;
                this.programService.publishProgram(program.id)
                    .subscribe({
                        next: newProgram => {
                            this.programSignal.set(newProgram);
                        },
                        error: (err) => this.handleApiError(err)
                    })
            }
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
            if (program.description.en) formData.append('description.en', program.description.en);
            if (program.description.uk) formData.append('description.uk', program.description.uk);
            if (program.finalTaskFile) formData.append('finalTask', program.finalTaskFile);
        }

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
                if (section.finalTaskFile) {
                    formData.append(`sections[${sIndex}].finalTask`, section.finalTaskFile);
                }
                formData.append(`sections[${sIndex}].orderIndex`, String(section.orderIndex));
            }
            if(this.isSectionsOrdersChanged()) {
                formData.append(`sections[${sIndex}].orderIndex`, String(section.orderIndex));
            }

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
                    if (module.finalTaskFile) {
                        formData.append(`sections[${sIndex}].modules[${mIndex}].finalTask`, module.finalTaskFile);
                    }
                    formData.append(`sections[${sIndex}].modules[${mIndex}].orderIndex`, String(module.orderIndex));
                }
                if(this.isModulesOrdersChanged()) {
                    formData.append(`sections[${sIndex}].modules[${mIndex}].orderIndex`, String(module.orderIndex));
                }

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
                        if (topic.finalTaskFile) {
                            formData.append(
                                `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].finalTask`,
                                topic.finalTaskFile
                            );
                        }
                        if(topic.learningResources) {
                            topic.learningResources.forEach((lr, index) => {
                                formData.append(
                                    `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].learningResources[${index}]`,
                                    lr
                                );
                            });
                        }
                        if(topic.difficulty) {
                            formData.append(
                                `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].difficulty`,
                                String(topic.difficulty)
                            );
                        }
                        formData.append(
                            `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].orderIndex`,
                            String(topic.orderIndex)
                        );
                    }
                    if(this.isTopicsOrdersChanged()) {
                        formData.append(
                            `sections[${sIndex}].modules[${mIndex}].topics[${tIndex}].orderIndex`,
                            String(topic.orderIndex)
                        );
                    }

                });
            });
        });

        return formData;
    }

    private handleApiError(err: any) {
        this.isErrorPresent.set(true);
        console.log(err)

        const errorObj = err?.error;
        console.log("!")
        if(typeof errorObj === 'string') {
            this.errorText.set(errorObj);
            return;
        }
        if (errorObj && typeof errorObj === 'object') {
            let allMessages: string[] = [];

            Object.keys(errorObj).forEach(key => {
                const value = errorObj[key];
                if (Array.isArray(value)) {
                    allMessages = allMessages.concat(value);
                } else if (typeof value === 'string') {
                    allMessages.push(value);
                }
            });
            this.errorText.set(allMessages.join(';\n'));
        } else {
            this.errorText.set(this.translate.instant("program.error.default"));
        }
    }

    private openConfirmDialog(data: ConfirmDialogData): Observable<boolean> {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: data
        });
        return dialogRef.afterClosed();
    }

    private arraysEqual<T>(a: T[], b: T[]): boolean {
        if (a.length !== b.length) return false;
        return a.every((val, index) => val === b[index]);
    }

}
