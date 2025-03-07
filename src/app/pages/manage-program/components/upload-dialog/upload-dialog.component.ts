import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    inject,
    Input,
    OnInit,
    Output,
    signal,
    ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {LangChangeEvent, TranslateModule, TranslateService} from '@ngx-translate/core';

import {BorderButtonComponent} from 'src/app/common/components/button/arrow-button/border-button.component';
import {LabelInput} from 'src/app/common/components/input/label-input/label-input';
import {
    EducationProgramDto,
    LearningUnit,
    ProgramModuleDto,
    ProgramSectionDto,
    ProgramTopicDto
} from 'src/app/common/models/shared.model';
import {ProgramService} from 'src/app/services/program.service';
import {SelectOption, WriteDropDowns} from '../../../auth/register/components/dropdown/write-dropdowns';
import {TestService} from 'src/app/services/test.service';
import {map, startWith, switchMap, tap} from 'rxjs/operators';
import {BackdropWindowComponent} from 'src/app/common/components/backdrop-window/backdrop-window.component';
import {I18nService} from 'src/app/services/languages/i18n.service';
import {EMPTY, Observable} from 'rxjs';
import {Expertise} from 'src/app/services/user/user.model';

@Component({
    selector: 'program-upload-dialog',
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
        WriteDropDowns,
        BackdropWindowComponent
    ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => UploadDialogComponent),
            multi: true
        }
    ]
})
export class UploadDialogComponent implements OnInit {
    @Input() mode: 'create' | 'edit' = 'create';
    @Input() entityType: 'program' | 'section' | 'module' | 'topic' = 'section';
    @Input() parentId?: string;
    @Input() entityData?: EducationProgramDto | ProgramSectionDto | ProgramModuleDto | ProgramTopicDto;
    @Input() defaultOrderIndex?: number;

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
    public isFileSelected = signal<boolean>(false);
    public testSelectOptions = signal<SelectOption[]>([]);
    public errorIsPresent = signal<boolean>(false);
    public errorText = signal<string>('');
    public existingLearningUnitOptions = signal<SelectOption[]>([]);
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    public topicLearningResources: string[] = [];
    private originalLearningUnits: LearningUnit[] = [];
    private fb = inject(FormBuilder);
    private matIconRegistry = inject(MatIconRegistry);
    private domSanitizer = inject(DomSanitizer);
    private programService = inject(ProgramService);
    private testService = inject(TestService);

    constructor(
        private translate: TranslateService,
        private i18nService: I18nService
    ) {
        this.translate.onLangChange
            .pipe(
                startWith({lang: this.translate.currentLang} as LangChangeEvent),
                switchMap(event =>
                    this.i18nService.loadComponentTranslations(
                        'pages/manage-program/components/upload-dialog',
                        event.lang
                    )
                )
            )
            .subscribe();
    }

    get form(): FormGroup {
        return this.dialogForm();
    }

    get topicTestId(): string {
        if (this.entityType === 'topic' && this.entityData) {
            return (this.entityData as ProgramTopicDto).testId || '';
        }
        return '';
    }

    get expertiseOptions(): SelectOption[] {
        return Object.values(Expertise).map((value) => ({
            id: value.toString(),
            name: {
                en: value.toString(),
                uk: value.toString(),
            }
        }));
    }

    get isAnyFilePresent(): boolean {
        return !!this.selectedFile() || !!this.existingFilename;
    }

    get currentFileName(): string {
        const file = this.selectedFile();
        if (file) {
            return file.name;
        }
        return this.existingFilename ?? '';
    }

    private get existingFilename(): string | undefined {
        if (!this.entityData) return undefined;
        if (this.entityData.finalTaskFile) {
            return this.entityData.finalTaskFile.name;
        }
        return this.entityData.finalTaskFilename;
    }

    ngOnInit(): void {
        this.matIconRegistry.addSvgIcon(
            'fileUploaded',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system/done.svg')
        );
        this.matIconRegistry.addSvgIcon(
            'closeDialog',
            this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icon/system/close.svg')
        );

        const group = this.fb.group({
            existingUnitId: [''],
            nameUk: ['', Validators.required],
            nameEn: ['', Validators.required],
            descriptionUk: ['', Validators.required],
            descriptionEn: ['', Validators.required],
            difficulty: [5],
            testId: [''],
            expertise: ['']
        });
        this.dialogForm.set(group);

        if (this.mode === 'edit' && this.entityData) {
            this.patchForm(this.entityData);
        }

        if (this.entityType === 'topic') {
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
                .subscribe({
                    next: options => this.testSelectOptions.set(options),
                    error: err => this.handleApiError(err)
                });
        }

        if (this.entityType !== 'program') {
            this.getLearningUnitOptions().subscribe({
                next: options => this.existingLearningUnitOptions.set(options),
                error: err => this.handleApiError(err)
            });
        }

        group.controls.existingUnitId.valueChanges.subscribe(selectedId => {
            if (selectedId) {
                const selectedUnit = this.originalLearningUnits
                    .find(unit => unit.id === selectedId);
                if (selectedUnit) {
                    const basePayload = {
                        ...selectedUnit,
                        ...(this.selectedFile() && {finalTaskFile: this.selectedFile()}),
                        orderIndex: this.defaultOrderIndex || 1
                    };

                    if (this.entityType === 'section') {
                        this.close.emit({
                            createdSection: {
                                ...basePayload,
                                modules: []
                            }
                        });
                    } else if (this.entityType === 'module') {
                        this.close.emit({
                            createdModule: {
                                ...basePayload,
                                topics: []
                            }
                        });
                    } else if (this.entityType === 'topic') {
                        const topicFromPayload = basePayload as ProgramTopicDto;

                        this.close.emit({
                            createdTopic: {
                                ...topicFromPayload,
                                learningResources: topicFromPayload.learningResources ?? [],
                                difficulty: topicFromPayload.difficulty ?? 5,
                                testId: topicFromPayload.testId ?? ''
                            }
                        });
                    }
                }
            }
        });
    }

    public onSelectDifficulty(value: number): void {
        this.form.patchValue({difficulty: value});
    }

    public range(count: number): number[] {
        return Array.from({length: count}, (_, i) => i);
    }

    public onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile.set(input.files[0]);
            this.isFileSelected.set(true);
        }
    }

    public removeFile(): void {
        this.selectedFile.set(undefined);
        this.isFileSelected.set(false);
        if (this.entityData) {
            if (this.entityType === 'topic') {
                (this.entityData as ProgramTopicDto).finalTaskUrl = undefined;
            } else {
                (this.entityData as any).finalTaskUrl = undefined;
            }
            this.entityData.finalTaskFilename = undefined;
            this.entityData.finalTaskFilename = undefined;
        }
    }

    public triggerFileDialog(): void {
        this.fileInput.nativeElement.click();
    }

    public onCloseClick(): void {
        this.close.emit(null);
    }

    public addTopicLearningResource(): void {
        if (this.entityType !== 'topic') return;
        const index = this.getLearningResourceCount();
        const controlName = 'learningResource' + index;
        this.form.addControl(controlName, new FormControl(''));
        this.topicLearningResources.push('');
    }

    public onSubmit(): void {
        this.form.markAllAsTouched();

        if (this.form.invalid) {
            this.errorText.set(this.translate.instant("dialog.error.fieldsRequired"));
            this.errorIsPresent.set(true);
            return;
        }
        this.errorIsPresent.set(false);

        if (this.mode === 'create') {
            this.handleCreate();
        } else {
            this.handleUpdate();
        }
    }

    public onErrorClose(): void {
        this.errorIsPresent.set(false);
    }

    private getLearningUnitOptions(): Observable<SelectOption[]> {
        const serviceCallMap: Record<string, () => Observable<LearningUnit[]>> = {
            module: () => this.programService.getModules(),
            section: () => this.programService.getSections(),
            topic: () => this.programService.getTopics(),
        };

        const serviceCall = serviceCallMap[this.entityType]?.();
        if (!serviceCall) {
            return EMPTY;
        }

        return serviceCall.pipe(
            tap((items: LearningUnit[]) => {
                this.originalLearningUnits = items;
            }),
            map((items: LearningUnit[]) =>
                items.map((item: LearningUnit) => ({
                    id: item.id,
                    name: {
                        en: item.name.en,
                        uk: item.name.uk
                    }
                } as SelectOption))
            )
        );
    }

    private getLearningResourceCount(): number {
        return Object.keys(this.form.controls).filter(key => key.startsWith('learningResource')).length;
    }

    private handleApiError(err: any) {
        console.log(err)
        this.errorIsPresent.set(true);

        const errorObj = err?.error;
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
            this.errorText.set(this.translate.instant("dialog.error.unknownEror"));
        }
    }

    private patchForm(entity: EducationProgramDto | ProgramSectionDto | ProgramModuleDto | ProgramTopicDto): void {
        this.form.patchValue({
            nameUk: entity.name.uk ?? '',
            nameEn: entity.name.en ?? '',
            descriptionUk: entity.description.uk ?? '',
            descriptionEn: entity.description.en ?? ''
        });

        if (this.entityType === 'topic') {
            const topic = entity as ProgramTopicDto;
            this.form.patchValue({
                difficulty: topic.difficulty ?? 5,
                testId: topic.testId ?? ''
            });

            this.topicLearningResources = [...(topic.learningResources || [])];
            this.topicLearningResources.forEach((res, i) => {
                this.form.addControl('learningResource' + i, new FormControl(res));
            });
        }

        if (this.entityType === 'program') {
            const p = entity as EducationProgramDto;
            if (p.expertise) {
                this.form.patchValue({expertise: p.expertise});
            }
        }
    }

    private handleCreate(): void {
        const fv = this.form.value;
        if (this.entityType !== 'program' && fv.existingUnitId) {
            switch (this.entityType) {
                case 'section':
                    this.close.emit({
                        createdSection: {
                            id: fv.existingUnitId,
                            name: {en: fv.nameEn, uk: fv.nameUk},
                            description: {en: fv.descriptionEn, uk: fv.descriptionUk},
                            modules: [],
                            orderIndex: this.defaultOrderIndex || 1,
                            ...(this.selectedFile() && {finalTaskFile: this.selectedFile()})
                        }
                    });
                    break;
                case 'module':
                    this.close.emit({
                        createdModule: {
                            id: fv.existingUnitId,
                            name: {en: fv.nameEn, uk: fv.nameUk},
                            description: {en: fv.descriptionEn, uk: fv.descriptionUk},
                            finalTaskUrl: '',
                            topics: [],
                            orderIndex: this.defaultOrderIndex || 1,
                            ...(this.selectedFile() && {finalTaskFile: this.selectedFile()})
                        }
                    });
                    break;
                case 'topic':
                    this.close.emit({
                        createdTopic: {
                            id: fv.existingUnitId,
                            name: {en: fv.nameEn, uk: fv.nameUk},
                            description: {en: fv.descriptionEn, uk: fv.descriptionUk},
                            learningResources: [],
                            finalTaskUrl: '',
                            difficulty: fv.difficulty,
                            testId: fv.testId,
                            orderIndex: this.defaultOrderIndex || 1,
                            ...(this.selectedFile() && {finalTaskFile: this.selectedFile()})
                        }
                    });
                    break;
                default:
                    this.close.emit(null);
            }
            return;
        }

        if (this.entityType === 'topic') {
            let learningResources: string[] = [];
            Object.keys(fv).forEach(key => {
                if (key.startsWith('learningResource')) {
                    learningResources.push(fv[key]);
                }
            });

            const newTopic: ProgramTopicDto = {
                id: '',
                name: {en: fv.nameEn, uk: fv.nameUk},
                description: {en: fv.descriptionEn, uk: fv.descriptionUk},
                learningResources: learningResources,
                finalTaskUrl: '',
                difficulty: fv.difficulty,
                testId: fv.testId,
                orderIndex: this.defaultOrderIndex || 1,
                ...(this.selectedFile() && {finalTaskFile: this.selectedFile()})
            };
            this.close.emit({createdTopic: newTopic});
        } else if (this.entityType === 'section') {
            const newSection: ProgramSectionDto = {
                id: '',
                name: {en: fv.nameEn, uk: fv.nameUk},
                description: {en: fv.descriptionEn, uk: fv.descriptionUk},
                modules: [],
                orderIndex: this.defaultOrderIndex || 1,
                ...(this.selectedFile() && {finalTaskFile: this.selectedFile()})
            };
            this.close.emit({createdSection: newSection});
        } else if (this.entityType === 'module') {
            const newModule: ProgramModuleDto = {
                id: '',
                name: {en: fv.nameEn, uk: fv.nameUk},
                description: {en: fv.descriptionEn, uk: fv.descriptionUk},
                finalTaskUrl: '',
                topics: [],
                orderIndex: this.defaultOrderIndex || 1,
                ...(this.selectedFile() && {finalTaskFile: this.selectedFile()})
            };
            this.close.emit({createdModule: newModule});
        } else if (this.entityType === 'program') {
            const newProgram: EducationProgramDto = {
                id: '',
                name: {en: fv.nameEn, uk: fv.nameUk},
                description: {en: fv.descriptionEn, uk: fv.descriptionUk},
                published: false,
                finalTaskUrl: '',
                expertise: fv.expertise as Expertise,
                sections: [],
                createdDate: '',
                lastModifiedDate: '',
                ...(this.selectedFile() && {finalTaskFile: this.selectedFile()})
            };

            const formData = new FormData();
            formData.append('name.en', newProgram.name.en ?? '');
            formData.append('name.uk', newProgram.name.uk ?? '');
            formData.append('description.en', newProgram.description.en ?? '');
            formData.append('description.uk', newProgram.description.uk ?? '');
            formData.append('expertise', newProgram.expertise.toString());
            if (newProgram.finalTaskFile) {
                formData.append('finalTask', newProgram.finalTaskFile);
            }

            this.programService.saveProgramInOneCall(formData)
                .subscribe({
                    next: createdProgram => this.close.emit({updatedProgram: createdProgram}),
                    error: err => this.handleApiError(err)
                });
        } else {
            this.close.emit(null);
        }
    }

    private handleUpdate(): void {
        if (!this.entityData) {
            this.close.emit(null);
            return;
        }
        const fv = this.form.value;
        const file = this.selectedFile();

        if (this.entityType === 'section') {
            const sec = this.entityData as ProgramSectionDto;
            if (!sec.id || sec.id.trim() === "") {
                sec.name = {en: fv.nameEn, uk: fv.nameUk};
                sec.description = {en: fv.descriptionEn, uk: fv.descriptionUk};
                if (file) {
                    sec.finalTaskFile = file;
                }
                this.close.emit({updatedSection: sec});
                return;
            }
            this.programService.updateSection(
                sec.id,
                {
                    ukName: fv.nameUk,
                    enName: fv.nameEn,
                    ukDesc: fv.descriptionUk,
                    enDesc: fv.descriptionEn
                },
                file
            ).subscribe({
                next: updatedSection => this.close.emit({updatedSection}),
                error: err => this.handleApiError(err)
            });
        } else if (this.entityType === 'module') {
            const mod = this.entityData as ProgramModuleDto;
            if (!mod.id || mod.id.trim() === "") {
                mod.name = {en: fv.nameEn, uk: fv.nameUk};
                mod.description = {en: fv.descriptionEn, uk: fv.descriptionUk};
                if (file) {
                    mod.finalTaskFile = file;
                }
                this.close.emit({updatedModule: mod});
                return;
            }
            this.programService.updateModule(
                mod.id,
                {
                    ukName: fv.nameUk,
                    enName: fv.nameEn,
                    ukDesc: fv.descriptionUk,
                    enDesc: fv.descriptionEn
                },
                file
            ).subscribe({
                next: updatedModule => this.close.emit({updatedModule}),
                error: err => this.handleApiError(err)
            });
        } else if (this.entityType === 'topic') {
            const top = this.entityData as ProgramTopicDto;
            if (!top.id || top.id.trim() === "") {
                top.name = {en: fv.nameEn, uk: fv.nameUk};
                top.description = {en: fv.descriptionEn, uk: fv.descriptionUk};
                top.difficulty = fv.difficulty;
                top.testId = fv.testId;
                top.learningResources = Object.keys(fv)
                    .filter(key => key.startsWith('learningResource'))
                    .map(key => fv[key]);
                if (file) {
                    top.finalTaskFile = file;
                }
                this.close.emit({updatedTopic: top});
                return;
            }
            this.programService.updateTopic(
                top.id,
                {
                    ukName: fv.nameUk,
                    enName: fv.nameEn,
                    ukDesc: fv.descriptionUk,
                    enDesc: fv.descriptionEn,
                    difficulty: fv.difficulty,
                    testId: fv.testId,
                    learningResources: Object.keys(fv)
                        .filter(key => key.startsWith('learningResource'))
                        .map(key => fv[key])
                },
                file
            ).subscribe({
                next: updatedTopic => this.close.emit({updatedTopic}),
                error: err => this.handleApiError(err)
            });
        } else if (this.entityType === 'program') {
            const prog = this.entityData as EducationProgramDto;
            this.programService.updateProgram(
                prog.id,
                {
                    ukName: fv.nameUk,
                    enName: fv.nameEn,
                    ukDesc: fv.descriptionUk,
                    enDesc: fv.descriptionEn,
                    expertise: fv.expertise
                },
                file
            ).subscribe({
                next: updatedProgram => this.close.emit({updatedProgram}),
                error: err => this.handleApiError(err)
            });
        } else {
            this.close.emit(null);
        }
    }

}
