import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { debounceTime, finalize, startWith, switchMap } from 'rxjs';
import { I18nService } from 'src/app/services/languages/i18n.service';
import { environment } from '../../../environments/environment';
import {
    SelectOption,
    WriteDropDowns,
} from '../../common/components/dropdown/write-dropdowns';
import { LabelInput } from '../../common/components/input/label-input/label-input';
import { PaginationComponent } from '../../common/components/pagination/pagination.component';
import { Expertise, getEnumValues } from '../../common/models/enums';

interface ClosedRecruitmentResponse {
    content: ClosedRecruitmentDto[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalPages: number;
    totalElements: number;
}

interface ClosedRecruitmentDto {
    id: string;
    name: string;
    startedAt: string;
    closedAt: string;
    expertise: string;
    maxCandidates: number;
    joinedPeopleAmount: number;
}

@Component({
    selector: 'finished-recruitments',
    standalone: true,
    imports: [
        TranslateModule,
        MatIconModule,
        CommonModule,
        ReactiveFormsModule,
        LabelInput,
        WriteDropDowns,
        PaginationComponent,
    ],
    templateUrl: './finished-recruitments.component.html',
    styleUrls: ['./finished-recruitments.component.scss'],
})
export class FinishedRecruitmentsComponent implements OnInit {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);

    readonly iconPaths = {
        arrowDown: 'assets/icon/system/arrowDown.svg',
        arrowRightUp: 'assets/icon/system/arrowRightUp.svg',
    } as const;

    filterForm: FormGroup;
    expertiseOptions: SelectOption[] = [];
    closedRecruitments: ClosedRecruitmentDto[] = [];

    currentPage = 0;
    pageSize = 12;
    totalPages = 0;
    totalElements = 0;

    isLoading = false;
    error = '';

    constructor(private router: Router, private route: ActivatedRoute) {
        this.filterForm = this.fb.group({
            name: [''],
            expertise: [''],
            startedAt: [''],
            closedAt: [''],
        });

        this.initExpertiseOptions();

        this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/finished-recruitments',
                        event.lang
                    )
                )
            )
            .subscribe(() => {
                this.initExpertiseOptions();
            });

        this.registerIcons();

        this.filterForm
            .get('expertise')
            ?.valueChanges.pipe(debounceTime(300))
            .subscribe(() => {
                this.currentPage = 0;
                this.applyFilters();
            });

        this.filterForm
            .get('startedAt')
            ?.valueChanges.pipe(debounceTime(300))
            .subscribe(() => {
                this.currentPage = 0;
                this.applyFilters();
            });

        this.filterForm
            .get('closedAt')
            ?.valueChanges.pipe(debounceTime(300))
            .subscribe(() => {
                this.currentPage = 0;
                this.applyFilters();
            });
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            if (Object.keys(params).length === 0) {
                this.filterForm.reset(
                    {
                        name: '',
                        expertise: '',
                        startedAt: '',
                        closedAt: '',
                    },
                    { emitEvent: false }
                );
                this.currentPage = 0;
                this.loadClosedRecruitments();
                return;
            }

            const pageNumber = params['page']
                ? parseInt(params['page'], 10)
                : 0;
            this.currentPage = pageNumber;

            this.filterForm.patchValue(
                {
                    name: params['name'] || '',
                    expertise: params['expertise'] || '',
                    startedAt: params['startedAt'] || '',
                    closedAt: params['closedAt'] || '',
                },
                { emitEvent: false }
            );

            this.loadClosedRecruitments();
        });
    }

    private initExpertiseOptions(): void {
        const expertiseValues = getEnumValues(Expertise);

        this.expertiseOptions = [
            {
                id: '',
                displayedName: this.translate.instant('filters.all-expertise'),
            },
            ...expertiseValues.map((value) => {
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
            }),
        ];
    }

    private registerIcons(): void {
        this.matIconRegistry.addSvgIcon(
            'arrowDown',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowDown
            )
        );

        this.matIconRegistry.addSvgIcon(
            'arrowRightUp',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowRightUp
            )
        );
    }

    loadClosedRecruitments(): void {
        this.isLoading = true;
        this.error = '';

        const formValues = this.filterForm.value;
        let params = new HttpParams()
            .set('pageNumber', this.currentPage.toString())
            .set('pageSize', this.pageSize.toString());

        if (formValues.name) {
            params = params.set('name', formValues.name);
        }

        if (formValues.expertise) {
            params = params.set('expertise', formValues.expertise);
        }

        if (formValues.startedAt) {
            params = params.set(
                'startedAt',
                new Date(formValues.startedAt).toISOString()
            );
        }

        if (formValues.closedAt) {
            params = params.set(
                'closedAt',
                new Date(formValues.closedAt).toISOString()
            );
        }

        this.http
            .get<ClosedRecruitmentResponse>(
                `${environment.apiBaseUrl}/recruitment/closed`,
                { params }
            )
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (response) => {
                    this.closedRecruitments = response.content;
                    this.currentPage = response.pageable.pageNumber;
                    this.pageSize = response.pageable.pageSize;
                    this.totalPages = response.totalPages;
                    this.totalElements = response.totalElements;
                },
                error: (error) => {
                    console.error('Error loading closed recruitments:', error);
                    this.error =
                        error.error?.message ||
                        'Failed to load closed recruitments';
                },
            });
    }

    onNameBlur(): void {
        this.currentPage = 0;
        this.applyFilters();
    }

    applyFilters(): void {
        const formValues = this.filterForm.value;
        const queryParams: any = {};

        if (this.currentPage > 0) {
            queryParams.page = this.currentPage;
        }

        if (formValues.name) {
            queryParams.name = formValues.name;
        }

        if (formValues.expertise) {
            queryParams.expertise = formValues.expertise;
        }

        if (formValues.startedAt) {
            queryParams.startedAt = formValues.startedAt;
        }

        if (formValues.closedAt) {
            queryParams.closedAt = formValues.closedAt;
        }

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: queryParams,
            replaceUrl: true,
        });

        this.loadClosedRecruitments();
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.applyFilters();
    }

    resetFilters(): void {
        this.filterForm.reset(
            {
                name: '',
                expertise: '',
                startedAt: '',
                closedAt: '',
            },
            { emitEvent: false }
        );

        this.currentPage = 0;

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true,
        });

        this.loadClosedRecruitments();
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
}
