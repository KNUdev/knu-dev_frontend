import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer } from '@angular/platform-browser';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { Subject, finalize, startWith, switchMap, takeUntil } from 'rxjs';
import { I18nService } from 'src/app/services/languages/i18n.service';
import {
    SelectOption,
    WriteDropDowns,
} from '../../../common/components/dropdown/write-dropdowns';
import { LabelInput } from '../../../common/components/input/label-input/label-input';
import {
    Expertise,
    KNUdevUnit,
    getEnumValues,
} from '../../../common/models/enums';
import { RecruitmentService } from '../../../services/recruitments/recruitment.service';
import { ActiveRecruitmentDto } from './models/active-recruitment.model';
import { RecruitmentOpenRequest } from './models/recruitment-request.model';

@Component({
    selector: 'active-recruitments-management',
    standalone: true,
    imports: [
        TranslateModule,
        MatInputModule,
        MatIcon,
        CommonModule,
        ReactiveFormsModule,
        LabelInput,
        WriteDropDowns,
    ],
    templateUrl: './active-recruitments-management.component.html',
    styleUrls: ['./active-recruitments-management.component.scss'],
})
export class ActiveRecruitmentsManagementComponent
    implements OnInit, OnDestroy
{
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    private fb = inject(FormBuilder);
    private recruitmentService = inject(RecruitmentService);
    private destroy$ = new Subject<void>();

    readonly iconPaths = {
        close: 'assets/icon/system/close.svg',
        errorQuadrilateral: 'assets/icon/system/errorQuadrilateral.svg',
    } as const;

    activeRecruitments = signal<ActiveRecruitmentDto[]>([]);
    isLoadingRecruitments = signal<boolean>(false);
    isClosingRecruitment = signal<{ [id: string]: boolean }>({});
    closeError = signal<string>('');
    loadError = signal<string>('');

    recruitmentForm: FormGroup;
    isSubmitting = false;
    submitError = '';
    submitSuccess = false;

    expertiseOptions: SelectOption[] = [];
    today = new Date();

    constructor() {
        this.recruitmentForm = this.fb.group({
            recruitmentName: ['', [Validators.required]],
            expertise: ['', [Validators.required]],
            maxCandidates: [
                '',
                [
                    Validators.required,
                    Validators.min(1),
                    Validators.pattern('^[0-9]+$'),
                ],
            ],
            deadlineDate: ['', [Validators.required]],
        });

        this.initExpertiseOptions();

        this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/admin/active-recruitments-management',
                        event.lang
                    )
                ),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.initExpertiseOptions();
            });

        this.registerIcons();
    }

    ngOnInit(): void {
        this.loadActiveRecruitments();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initExpertiseOptions(): void {
        const expertiseValues = getEnumValues(Expertise);

        this.expertiseOptions = expertiseValues.map((value) => {
            let displayName = value;

            const translationKey = `expertise.${value}`;
            const translation = this.translate.instant(translationKey);

            if (translation !== translationKey) {
                displayName = translation;
            }

            return {
                id: value,
                displayedName: displayName,
            };
        });
    }

    private registerIcons(): void {
        this.matIconRegistry.addSvgIcon(
            'close',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.close
            )
        );

        this.matIconRegistry.addSvgIcon(
            'errorQuadrilateral',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.errorQuadrilateral
            )
        );
    }

    private loadActiveRecruitments(): void {
        this.isLoadingRecruitments.set(true);
        this.loadError.set('');

        this.recruitmentService
            .getActiveRecruitments()
            .pipe(
                finalize(() => {
                    this.isLoadingRecruitments.set(false);
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (response) => {
                    if (response && typeof response === 'string') {
                        this.loadError.set(response);
                        this.activeRecruitments.set([]);
                        console.error(
                            'Server returned error with 200 status:',
                            response
                        );
                    } else {
                        this.activeRecruitments.set(response);
                    }
                },
                error: (error) => {
                    console.error('Error loading active recruitments:', error);
                    this.loadError.set(
                        error.error?.message ||
                            this.translate.instant(
                                'errors.failedToLoadRecruitments'
                            )
                    );
                    this.activeRecruitments.set([]);
                },
            });
    }

    private refreshActiveRecruitments(): void {
        this.loadActiveRecruitments();
    }

    onSubmit(): void {
        if (this.recruitmentForm.invalid) {
            this.recruitmentForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.submitError = '';
        this.submitSuccess = false;

        const formValue = this.recruitmentForm.value;

        let deadlineDate = formValue.deadlineDate;
        if (deadlineDate && typeof deadlineDate === 'string') {
            deadlineDate = new Date(deadlineDate).toISOString();
        }

        const requestBody: RecruitmentOpenRequest = {
            recruitmentName: formValue.recruitmentName,
            expertise: formValue.expertise as Expertise,
            unit: KNUdevUnit.PRECAMPUS,
            autoCloseConditions: {
                deadlineDate: deadlineDate,
                maxCandidates: parseInt(formValue.maxCandidates, 10),
            },
        };

        this.recruitmentService
            .openRecruitment(requestBody)
            .pipe(
                finalize(() => {
                    this.isSubmitting = false;
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (response) => {
                    if (response && typeof response === 'string') {
                        this.submitError = response;
                        console.error('Server returned error:', response);
                    } else {
                        this.submitSuccess = true;
                        this.recruitmentForm.reset();
                        this.refreshActiveRecruitments();
                    }
                },
                error: (error) => {
                    console.error('Error creating recruitment:', error);

                    if (error.error) {
                        const errorMessages: any[] = [];

                        Object.keys(error.error).forEach((key) => {
                            if (Array.isArray(error.error[key])) {
                                errorMessages.push(...error.error[key]);
                            } else if (typeof error.error[key] === 'object') {
                                Object.keys(error.error[key]).forEach(
                                    (nestedKey) => {
                                        if (
                                            Array.isArray(
                                                error.error[key][nestedKey]
                                            )
                                        ) {
                                            errorMessages.push(
                                                ...error.error[key][nestedKey]
                                            );
                                        }
                                    }
                                );
                            }
                        });

                        if (errorMessages.length > 0) {
                            this.submitError = errorMessages.join('\n');
                        } else {
                            this.submitError =
                                error.error.message ||
                                'Failed to create recruitment';
                        }
                    } else {
                        this.submitError = 'Failed to create recruitment';
                    }
                },
            });
    }

    getFieldError(fieldName: string): string {
        const field = this.recruitmentForm.get(fieldName);
        if (!field || !field.errors || !field.touched) return '';

        if (field.errors['required']) {
            return this.translate.instant('errors.fieldRequired');
        }
        if (field.errors['min']) {
            return this.translate.instant('errors.minValue', {
                min: field.errors['min'].min,
            });
        }
        if (field.errors['pattern']) {
            return this.translate.instant('errors.numberOnly');
        }

        return this.translate.instant('errors.invalidField');
    }

    resetForm(): void {
        this.recruitmentForm.reset();
        this.submitError = '';
        this.submitSuccess = false;
    }

    getDefaultDeadlineDate(): string {
        const date = new Date();
        date.setDate(date.getDate() + 14);
        return date.toISOString().slice(0, 16);
    }

    formatDate(dateString: string): string {
        if (!dateString) {
            return '-';
        }

        try {
            return new Date(dateString).toLocaleString(
                this.translate.currentLang,
                {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                }
            );
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }

    getExpertiseDisplayName(expertise: string): string {
        const option = this.expertiseOptions.find(
            (opt) => opt.id === expertise
        );
        return option && option.displayedName
            ? option.displayedName
            : expertise;
    }

    closeRecruitment(recruitmentId: string): void {
        const updatedClosingState = { ...this.isClosingRecruitment() };
        updatedClosingState[recruitmentId] = true;
        this.isClosingRecruitment.set(updatedClosingState);
        this.closeError.set('');

        this.recruitmentService
            .closeRecruitment(recruitmentId)
            .pipe(
                finalize(() => {
                    const finalState = { ...this.isClosingRecruitment() };
                    finalState[recruitmentId] = false;
                    this.isClosingRecruitment.set(finalState);
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (response) => {
                    if (response && typeof response === 'string') {
                        this.closeError.set(response);
                        console.error(
                            'Server returned error with 200 status:',
                            response
                        );
                    } else {
                        this.refreshActiveRecruitments();
                    }
                },
                error: (error) => {
                    console.error('Error closing recruitment:', error);

                    this.closeError.set(
                        error.error?.message ||
                            this.translate.instant(
                                'errors.closeRecruitmentFailed'
                            )
                    );
                },
            });
    }
}
