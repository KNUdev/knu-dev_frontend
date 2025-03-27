import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import {
    Subject,
    debounceTime,
    finalize,
    startWith,
    switchMap,
    takeUntil,
} from 'rxjs';
import { I18nService } from 'src/app/services/languages/i18n.service';
import { BorderButtonComponent } from '../../../common/components/button/arrow-button/border-button.component';
import {
    SelectOption,
    WriteDropDowns,
} from '../../../common/components/dropdown/write-dropdowns';
import { LabelInput } from '../../../common/components/input/label-input/label-input';
import { PaginationComponent } from '../../../common/components/pagination/pagination.component';
import { Expertise, getEnumValues } from '../../../common/models/enums';
import { ClosedRecruitmentService } from '../../../services/recruitments/closed-recruitment.service';
import {
    ClosedRecruitmentDto,
    ClosedRecruitmentFilter,
} from './models/closed-recruitment.model';

@Component({
    selector: 'closed-recruitments',
    standalone: true,
    imports: [
        TranslateModule,
        MatIconModule,
        CommonModule,
        ReactiveFormsModule,
        LabelInput,
        WriteDropDowns,
        PaginationComponent,
        BorderButtonComponent,
    ],
    templateUrl: './closed-recruitments.component.html',
    styleUrls: ['./closed-recruitments.component.scss'],
})
export class ClosedRecruitmentsComponent implements OnInit, OnDestroy {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    private fb = inject(FormBuilder);
    private closedRecruitmentService = inject(ClosedRecruitmentService);
    private destroy$ = new Subject<void>();

    readonly iconPaths = {
        arrowDown: 'assets/icon/system/arrowDown.svg',
        arrowRightUp: 'assets/icon/system/arrowRightUp.svg',
    } as const;

    filterForm: FormGroup;
    expertiseOptions: SelectOption[] = [];

    // Convert to signals
    closedRecruitments = signal<ClosedRecruitmentDto[]>([]);
    currentPage = signal<number>(0);
    pageSize = signal<number>(12);
    totalPages = signal<number>(0);
    totalElements = signal<number>(0);
    isLoading = signal<boolean>(false);
    error = signal<string>('');

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
                        'pages/admin/finished-recruitments',
                        event.lang
                    )
                ),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.initExpertiseOptions();
            });

        this.registerIcons();

        this.filterForm
            .get('expertise')
            ?.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$))
            .subscribe(() => {
                this.currentPage.set(0);
                this.applyFilters();
            });

        this.filterForm
            .get('startedAt')
            ?.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$))
            .subscribe(() => {
                this.currentPage.set(0);
                this.applyFilters();
            });

        this.filterForm
            .get('closedAt')
            ?.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$))
            .subscribe(() => {
                this.currentPage.set(0);
                this.applyFilters();
            });
    }

    ngOnInit(): void {
        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe((params) => {
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
                    this.currentPage.set(0);
                    this.loadClosedRecruitments();
                    return;
                }

                const pageNumber = params['page']
                    ? parseInt(params['page'], 10)
                    : 0;
                this.currentPage.set(pageNumber);

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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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
        this.isLoading.set(true);
        this.error.set('');

        const formValues = this.filterForm.value;
        const filters: ClosedRecruitmentFilter = {
            pageNumber: this.currentPage(),
            pageSize: this.pageSize(),
        };

        if (formValues.name) {
            filters.name = formValues.name;
        }

        if (formValues.expertise) {
            filters.expertise = formValues.expertise as Expertise;
        }

        if (formValues.startedAt) {
            filters.startedAt = new Date(formValues.startedAt).toISOString();
        }

        if (formValues.closedAt) {
            filters.closedAt = new Date(formValues.closedAt).toISOString();
        }

        this.closedRecruitmentService
            .getClosedRecruitments(filters)
            .pipe(
                finalize(() => {
                    this.isLoading.set(false);
                }),
                takeUntil(this.destroy$)
            )
            .subscribe({
                next: (response) => {
                    this.closedRecruitments.set(response.content);
                    this.currentPage.set(response.pageable.pageNumber);
                    this.pageSize.set(response.pageable.pageSize);
                    this.totalPages.set(response.totalPages);
                    this.totalElements.set(response.totalElements);
                },
                error: (error) => {
                    console.error('Error loading closed recruitments:', error);
                    this.error.set(
                        error.error?.message ||
                            this.translate.instant(
                                'errors.failedToLoadRecruitments'
                            )
                    );
                },
            });
    }

    onNameBlur(): void {
        this.currentPage.set(0);
        this.applyFilters();
    }

    applyFilters(): void {
        const formValues = this.filterForm.value;
        const queryParams: any = {};

        if (this.currentPage() > 0) {
            queryParams.page = this.currentPage();
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
        this.currentPage.set(page);
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

        this.currentPage.set(0);

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
