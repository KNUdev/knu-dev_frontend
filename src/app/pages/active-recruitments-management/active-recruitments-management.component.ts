import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
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
import { finalize, startWith, switchMap } from 'rxjs';
import { I18nService } from 'src/app/services/languages/i18n.service';
import { environment } from '../../../environments/environment';
import {
    SelectOption,
    WriteDropDowns,
} from '../../common/components/dropdown/write-dropdowns';
import { LabelInput } from '../../common/components/input/label-input/label-input';
import { Expertise, getEnumValues } from '../../common/models/enums';

interface RecruitmentOpenRequest {
    recruitmentName: string;
    expertise: string;
    unit: string;
    autoCloseConditions: {
        deadlineDate: string;
        maxCandidates: number;
    };
}

interface ActiveRecruitmentDto {
    id: string;
    name: string;
    startedAt: string;
    deadlineDate: string;
    expertise: string;
    maxCandidates: number;
    joinedPeopleAmount: number;
}

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
export class ActiveRecruitmentsManagementComponent implements OnInit {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);

    readonly iconPaths = {
        close: 'assets/icon/system/close.svg',
        errorQuadrilateral: 'assets/icon/system/errorQuadrilateral.svg',
    } as const;

    recruitmentForm: FormGroup;
    isSubmitting = false;
    submitError = '';
    submitSuccess = false;

    expertiseOptions: SelectOption[] = [];
    activeRecruitments: ActiveRecruitmentDto[] = [];
    isLoadingRecruitments = false;
    isClosingRecruitment: { [id: string]: boolean } = {};
    closeError: string = '';

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
                        'pages/active-recruitments-management',
                        event.lang
                    )
                )
            )
            .subscribe(() => {
                this.initExpertiseOptions();
            });

        this.registerIcons();
    }

    ngOnInit(): void {
        this.loadActiveRecruitments();
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
        this.isLoadingRecruitments = true;

        this.http
            .get<ActiveRecruitmentDto[]>(
                `${environment.apiBaseUrl}/recruitment/active`
            )
            .pipe(
                finalize(() => {
                    this.isLoadingRecruitments = false;
                })
            )
            .subscribe({
                next: (recruitments) => {
                    this.activeRecruitments = recruitments;
                },
                error: (error) => {
                    console.error('Error loading active recruitments:', error);
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
            expertise: formValue.expertise,
            unit: 'PRECAMPUS',
            autoCloseConditions: {
                deadlineDate: deadlineDate,
                maxCandidates: parseInt(formValue.maxCandidates, 10),
            },
        };

        this.http
            .post(
                `${environment.apiBaseUrl}/admin/recruitment/open`,
                requestBody
            )
            .pipe(
                finalize(() => {
                    this.isSubmitting = false;
                })
            )
            .subscribe({
                next: () => {
                    this.submitSuccess = true;
                    this.recruitmentForm.reset();
                    this.refreshActiveRecruitments();
                },
                error: (error) => {
                    console.error('Error creating recruitment:', error);
                    this.submitError =
                        error.error?.message || 'Failed to create recruitment';
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
        this.isClosingRecruitment[recruitmentId] = true;
        this.closeError = '';

        this.http
            .post(
                `${environment.apiBaseUrl}/admin/recruitment/close`,
                JSON.stringify(recruitmentId),
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            )
            .pipe(
                finalize(() => {
                    this.isClosingRecruitment[recruitmentId] = false;
                })
            )
            .subscribe({
                next: () => {
                    this.refreshActiveRecruitments();
                },
                error: (error) => {
                    console.error('Error closing recruitment:', error);
                    this.closeError =
                        error.error?.message || 'Failed to close recruitment';
                },
            });
    }
}
