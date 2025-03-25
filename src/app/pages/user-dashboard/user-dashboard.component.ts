import { CommonModule } from '@angular/common';
import {
    Component,
    inject,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import {
    BehaviorSubject,
    debounceTime,
    distinctUntilChanged,
    finalize,
    startWith,
    Subscription,
    switchMap,
} from 'rxjs';
import { I18nService } from 'src/app/services/languages/i18n.service';
import { BorderButtonComponent } from '../../common/components/button/arrow-button/border-button.component';
import {
    SelectOption,
    WriteDropDowns,
} from '../../common/components/dropdown/write-dropdowns';
import { PaginationComponent } from '../../common/components/pagination/pagination.component';
import {
    Expertise,
    getEnumValues,
    KNUdevUnit,
    TechnicalRole,
} from '../../common/models/enums';
import {
    AdminAccount,
    AdminAccountsResponse,
} from '../../services/admin/accounts.model';
import {
    AdminAccountsService,
    FilterParams,
} from '../../services/admin/admin-accounts.service';
import { EditUserModalComponent } from './components/edit-user-modal/edit-user-modal.component';
import { UserFiltersComponent } from './components/user-filters/user-filters.component';
import { FilterOptionGroup, getFilterOptions } from './filter-options.model';

@Component({
    selector: 'user-dashboard',
    imports: [
        TranslateModule,
        MatIconModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        BorderButtonComponent,
        EditUserModalComponent,
        PaginationComponent,
        UserFiltersComponent,
    ],
    templateUrl: './user-dashboard.component.html',
    styleUrls: ['./user-dashboard.component.scss'],
    standalone: true,
})
export class UserDashboardComponent implements OnInit, OnDestroy {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    private adminAccountsService = inject(AdminAccountsService);
    private subscriptions = new Subscription();
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    @ViewChildren(WriteDropDowns) filterDropdowns!: QueryList<WriteDropDowns>;
    @ViewChild(UserFiltersComponent)
    userFiltersComponent!: UserFiltersComponent;

    filters: FilterParams = {};
    filterOptions: FilterOptionGroup = {
        units: [],
        expertise: [],
        studyYears: [],
        technicalRoles: [],
    };
    departments: SelectOption[] = [];
    specialties: SelectOption[] = [];
    isLoadingDepartments = false;
    isLoadingSpecialties = false;

    accounts: AdminAccount[] = [];
    totalPages = 0;
    totalAccounts = 0;
    currentPage = 0;
    pageSize = 12;
    isLoading = false;
    paginationArray: (number | string)[] = [];

    readonly iconPaths = {
        defaultAvatar: 'assets/icon/profile/defaultAvatar.svg',
        flag: 'assets/icon/system/flag.svg',
    } as const;

    private searchQuerySubject = new BehaviorSubject<string>('');

    recruitments: SelectOption[] = [];
    isLoadingRecruitments = false;

    private isNavigatingFromCode = false;

    isEditModalOpen = false;
    selectedUser: AdminAccount | null = null;

    searchInputValue = '';

    private initialSearchFromUrl = false;

    searchFormControl = new FormControl('');

    searchForm: FormGroup;

    constructor(private fb: FormBuilder) {
        this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/user-dashboard',
                        event.lang
                    )
                )
            )
            .subscribe(() => {
                this.filterOptions = getFilterOptions(this.translate);
            });

        this.registerIcons();

        this.searchForm = this.fb.group({
            searchInput: [''],
        });

        const searchSubscription = this.searchForm
            .get('searchInput')!
            .valueChanges.pipe(debounceTime(500), distinctUntilChanged())
            .subscribe((query) => {
                if (!this.initialSearchFromUrl) {
                    this.searchInputValue = query || '';
                    this.triggerSearch();
                }
                this.initialSearchFromUrl = false;
            });

        this.subscriptions.add(searchSubscription);
    }

    ngOnInit(): void {
        this.loadDepartments();
        this.loadRecruitments();

        const queryParamsSubscription = this.route.queryParams.subscribe(
            (params) => {
                if (!this.isNavigatingFromCode) {
                    this.parseQueryParams(params);
                }
                this.isNavigatingFromCode = false;
            }
        );

        this.subscriptions.add(queryParamsSubscription);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    loadDepartments(): void {
        this.isLoadingDepartments = true;

        const subscription = this.adminAccountsService
            .getDepartments()
            .pipe(finalize(() => (this.isLoadingDepartments = false)))
            .subscribe({
                next: (departments) => {
                    this.departments = departments.map((dept) => ({
                        id: dept.id,
                        name: dept.name,
                    }));
                },
                error: (error) => {
                    console.error('Error loading departments:', error);
                },
            });

        this.subscriptions.add(subscription);
    }

    loadSpecialties(departmentId: string): void {
        if (!departmentId) {
            this.specialties = [];
            this.filters.specialtyCodename = undefined;
            return;
        }

        this.isLoadingSpecialties = true;

        const subscription = this.adminAccountsService
            .getSpecialties(departmentId)
            .pipe(finalize(() => (this.isLoadingSpecialties = false)))
            .subscribe({
                next: (specialties) => {
                    this.specialties = specialties.map((spec) => {
                        const id = spec.codeName.toString();

                        let displayName;
                        if (spec.name) {
                            if (typeof spec.name === 'object') {
                                const localizedName =
                                    spec.name[
                                        this.translate.currentLang as
                                            | 'en'
                                            | 'uk'
                                    ] || spec.name['en'];
                                displayName = `${spec.codeName} - ${localizedName}`;
                            } else {
                                displayName = `${spec.codeName} - ${spec.name}`;
                            }
                        } else {
                            displayName = spec.codeName.toString();
                        }

                        return {
                            id,
                            displayedName: displayName,
                            name: spec.name,
                            codeName: spec.codeName,
                        };
                    });
                },
                error: (error) => {
                    console.error('Error loading specialties:', error);
                },
            });

        this.subscriptions.add(subscription);
    }

    loadRecruitments(): void {
        const subscription = this.loadRecruitmentsWithCallback();
        this.subscriptions.add(subscription);
    }

    loadAccounts(pageNumber: number = this.currentPage): void {
        this.isLoading = true;

        const subscription = this.adminAccountsService
            .getAccounts(pageNumber, this.pageSize, this.filters)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            )
            .subscribe({
                next: (response: AdminAccountsResponse) => {
                    this.accounts = response.content;
                    this.totalPages = response.totalPages;
                    this.totalAccounts = response.totalElements;
                    this.currentPage = response.number;
                },
                error: (error) => {
                    console.error('Error fetching accounts:', error);
                },
            });

        this.subscriptions.add(subscription);
    }

    onPageChange(page: number): void {
        this.currentPage = page;
        this.loadAccounts(page);
        this.isNavigatingFromCode = true;
        this.updateUrlParams();
    }

    getFullName(account: AdminAccount): string {
        if (!account.fullName) return 'Not found';
        return `${account.fullName.lastName} ${account.fullName.firstName} ${account.fullName.middleName}`;
    }

    getDepartmentId(account: AdminAccount): string {
        return account.academicUnitsIds?.departmentId || 'Not found';
    }

    getSpecialtyCodename(account: AdminAccount): string | number {
        return account.academicUnitsIds?.specialtyCodename || 'Not found';
    }

    getDepartmentName(account: AdminAccount): string {
        if (account.departmentName) {
            return (
                account.departmentName[
                    this.translate.currentLang as 'en' | 'uk'
                ] ||
                account.departmentName['en'] ||
                'Not found'
            );
        }
        return account.academicUnitsIds?.departmentId || 'Not found';
    }

    getSpecialtyName(account: AdminAccount): string {
        if (account.specialtyName) {
            return (
                account.specialtyName[
                    this.translate.currentLang as 'en' | 'uk'
                ] ||
                account.specialtyName['en'] ||
                'Not found'
            );
        }
        return (
            account.academicUnitsIds?.specialtyCodename?.toString() ||
            'Not found'
        );
    }

    onSearchChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.searchInputValue = target.value;
        this.searchForm
            .get('searchInput')
            ?.setValue(this.searchInputValue, { emitEvent: false });
    }

    onSearchBlur(): void {
        const currentSearchValue =
            this.searchForm.get('searchInput')?.value || '';
        this.searchInputValue = currentSearchValue;

        if (this.searchInputValue !== (this.filters.searchQuery || '')) {
            if (this.searchInputValue === '') {
                this.handleEmptySearch();
            } else {
                this.triggerSearch();
            }
        }
    }

    onSearchKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            const currentSearchValue =
                this.searchForm.get('searchInput')?.value || '';
            this.searchInputValue = currentSearchValue;

            if (this.searchInputValue === '') {
                this.handleEmptySearch();
            } else {
                this.triggerSearch();
            }

            (event.target as HTMLElement).blur();
        }
    }

    onDateFilterChange(): void {
        this.loadAccounts(0);
        this.updateUrlParams();
    }

    onDropdownChange(field: keyof FilterParams, value: any): void {
        if (field === 'departmentId' && this.filters.departmentId !== value) {
            this.filters.specialtyCodename = undefined;
            if (value) {
                this.loadSpecialties(value);
            } else {
                this.specialties = [];
            }
        }

        if (field === 'universityStudyYear' && typeof value === 'string') {
            this.filters[field] = parseInt(value, 10);
        } else {
            this.filters[field] = value;
        }

        this.loadAccounts(0);
        this.updateUrlParams();
    }

    resetFilters(): void {
        this.filters = {};
        this.specialties = [];
        this.currentPage = 0;
        this.searchInputValue = '';
        this.searchQuerySubject.next('');

        const searchInputs = document.querySelectorAll(
            '.first-line-filters__initials-or-email, .first-line-filters__reg-date, .first-line-filters__reg-end-date'
        );
        searchInputs.forEach((element) => {
            const input = element as HTMLInputElement;
            input.value = '';
        });

        if (this.userFiltersComponent) {
            this.userFiltersComponent.resetDropdownSelections();
        }

        this.searchForm.get('searchInput')!.setValue('', { emitEvent: false });

        this.loadAccounts(0);
        this.updateUrlParams(true);
    }

    private registerIcons(): void {
        this.matIconRegistry.addSvgIcon(
            'defaultAvatar',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.defaultAvatar
            )
        );

        this.matIconRegistry.addSvgIcon(
            'flag',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.flag
            )
        );
    }

    private parseQueryParams(params: any): void {
        this.filters = {};

        if (params.search) {
            this.filters.searchQuery = params.search;
            this.searchInputValue = params.search;
            this.searchForm
                .get('searchInput')!
                .setValue(params.search, { emitEvent: false });
            this.initialSearchFromUrl = true;
            this.searchQuerySubject.next(params.search);
        } else {
            this.searchInputValue = '';
            this.searchForm
                .get('searchInput')!
                .setValue('', { emitEvent: false });
        }

        if (params.registeredAt) {
            this.filters.registeredAt = params.registeredAt;
        }

        if (params.registeredBefore) {
            this.filters.registeredBefore = params.registeredBefore;
        }

        if (params.unit) {
            this.filters.unit = params.unit;
        }

        if (params.expertise) {
            this.filters.expertise = params.expertise;
        }

        if (params.technicalRole) {
            this.filters.technicalRole = params.technicalRole;
        }

        if (params.departmentId) {
            this.filters.departmentId = params.departmentId;
            this.loadSpecialties(params.departmentId);
        }

        if (params.specialtyCodename) {
            this.filters.specialtyCodename = params.specialtyCodename;
        }

        if (params.universityStudyYear) {
            const year = Number(params.universityStudyYear);
            if (!isNaN(year)) {
                this.filters.universityStudyYear = year;
            }
        }

        if (params.recruitmentId) {
            this.filters.recruitmentId = params.recruitmentId;
        }

        if (!this.isNavigatingFromCode) {
            this.loadAccounts(this.currentPage);
        }

        this.updateDateInputs();

        setTimeout(() => {
            this.updateDropdownsFromFilters();
        }, 0);
    }

    private updateDateInputs(): void {
        if (this.filters.registeredAt) {
            const startDateInput = document.querySelector(
                '.first-line-filters__reg-date'
            ) as HTMLInputElement;
            if (startDateInput) {
                startDateInput.value = this.filters.registeredAt;
            }
        }

        if (this.filters.registeredBefore) {
            const endDateInput = document.querySelector(
                '.first-line-filters__reg-end-date'
            ) as HTMLInputElement;
            if (endDateInput) {
                endDateInput.value = this.filters.registeredBefore;
            }
        }
    }

    private updateDropdownsFromFilters(): void {
        if (!this.filterDropdowns || this.filterDropdowns.length === 0) return;

        setTimeout(() => {
            Promise.all([
                this.departments.length > 0 || !this.filters.departmentId
                    ? Promise.resolve()
                    : new Promise((resolve) => {
                          const interval = setInterval(() => {
                              if (this.departments.length > 0) {
                                  clearInterval(interval);
                                  resolve(true);
                              }
                          }, 100);
                      }),

                this.specialties.length > 0 ||
                !this.filters.departmentId ||
                !this.filters.specialtyCodename
                    ? Promise.resolve()
                    : new Promise((resolve) => {
                          const interval = setInterval(() => {
                              if (this.specialties.length > 0) {
                                  clearInterval(interval);
                                  resolve(true);
                              }
                          }, 100);
                      }),

                this.recruitments.length > 0 || !this.filters.recruitmentId
                    ? Promise.resolve()
                    : new Promise((resolve) => {
                          const interval = setInterval(() => {
                              if (this.recruitments.length > 0) {
                                  clearInterval(interval);
                                  resolve(true);
                              }
                          }, 100);
                      }),
            ]).then(() => {
                this.filterDropdowns.forEach((dropdown) => {
                    const filterKey = this.getFilterKeyForDropdown(dropdown);
                    if (!filterKey || !this.filters[filterKey]) return;

                    let targetValue = this.filters[filterKey];

                    if (
                        filterKey === 'universityStudyYear' &&
                        typeof targetValue === 'number'
                    ) {
                        targetValue = targetValue.toString();
                    }

                    const valueStr = String(targetValue);

                    const options = dropdown.options || [];
                    const option = options.find(
                        (opt) => String(opt.id) === valueStr
                    );

                    if (option) {
                        dropdown.writeValue(option.id);
                        dropdown.selectOption(option);
                    }
                });
            });
        }, 500);
    }

    private getFilterKeyForDropdown(
        dropdown: WriteDropDowns
    ): keyof FilterParams | null {
        const placeholder = dropdown.placeholder.toLowerCase();

        if (placeholder.includes('unit') || placeholder.includes('campus'))
            return 'unit';
        if (
            placeholder.includes('expertise') ||
            placeholder.includes('напрямок')
        )
            return 'expertise';
        if (
            placeholder.includes('faculty') ||
            placeholder.includes('факультет')
        )
            return 'departmentId';
        if (
            placeholder.includes('specialty') ||
            placeholder.includes('спеціальність')
        )
            return 'specialtyCodename';
        if (placeholder.includes('study-year') || placeholder.includes('курс'))
            return 'universityStudyYear';
        if (
            placeholder.includes('tech-role') ||
            placeholder.includes('технічна роль')
        )
            return 'technicalRole';
        if (
            placeholder.includes('recruitment') ||
            placeholder.includes('набір')
        )
            return 'recruitmentId';

        const options = dropdown.options || [];
        if (options.length) {
            const unitValues = getEnumValues(KNUdevUnit);
            const technicalRoleValues = getEnumValues(TechnicalRole);
            const expertiseValues = getEnumValues(Expertise);

            if (options.some((o) => unitValues.includes(String(o.id))))
                return 'unit';
            if (options.some((o) => technicalRoleValues.includes(String(o.id))))
                return 'technicalRole';
            if (options.some((o) => expertiseValues.includes(String(o.id))))
                return 'expertise';
        }

        return null;
    }

    private createQueryParamsFromFilters(
        includeSearchQuery: boolean = true
    ): any {
        const queryParams: any = {};

        if (
            includeSearchQuery &&
            this.filters.searchQuery &&
            this.filters.searchQuery.trim() !== ''
        ) {
            queryParams.search = this.filters.searchQuery;
        }

        if (this.filters.registeredAt)
            queryParams.registeredAt = this.filters.registeredAt;
        if (this.filters.registeredBefore)
            queryParams.registeredBefore = this.filters.registeredBefore;
        if (this.filters.unit) queryParams.unit = this.filters.unit;
        if (this.filters.expertise)
            queryParams.expertise = this.filters.expertise;
        if (this.filters.departmentId)
            queryParams.departmentId = this.filters.departmentId;
        if (this.filters.specialtyCodename)
            queryParams.specialtyCodename = this.filters.specialtyCodename;
        if (this.filters.universityStudyYear !== undefined) {
            queryParams.universityStudyYear = this.filters.universityStudyYear;
        }
        if (this.filters.technicalRole)
            queryParams.technicalRole = this.filters.technicalRole;
        if (this.filters.recruitmentId)
            queryParams.recruitmentId = this.filters.recruitmentId;

        return queryParams;
    }

    private updateUrlParams(reset: boolean = false): void {
        if (reset) {
            this.isNavigatingFromCode = true;
            this.searchInputValue = '';
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: {},
                queryParamsHandling: '',
                replaceUrl: true,
            });
            return;
        }

        const queryParams = this.createQueryParamsFromFilters(true);
        this.isNavigatingFromCode = true;

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams,
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }

    private updateUrlParamsWithEmptySearch(): void {
        const queryParams = this.createQueryParamsFromFilters(false);
        this.isNavigatingFromCode = true;

        this.router.navigate([], {
            relativeTo: this.route,
            queryParams,
            queryParamsHandling: '',
            replaceUrl: true,
        });
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'Not available';

        const date = new Date(dateString);
        return date.toLocaleDateString(this.translate.currentLang, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    getStudyYearTranslation(yearNumber: number): string {
        if (!yearNumber || yearNumber < 1 || yearNumber > 10) {
            return 'Not found';
        }

        const translation = this.translate.instant(
            `yearOfStudy.${yearNumber - 1}.displayedName`
        );

        if (translation === `yearOfStudy.${yearNumber - 1}.displayedName`) {
            return yearNumber.toString();
        }

        return translation;
    }

    openEditModal(account: AdminAccount): void {
        this.selectedUser = account;
        this.isEditModalOpen = true;
    }

    onEditModalClose(updated: boolean): void {
        if (updated) {
            this.loadAccounts(this.currentPage);
        }
        this.isEditModalOpen = false;
        this.selectedUser = null;
    }

    private loadRecruitmentsWithCallback(callback?: () => void): Subscription {
        this.isLoadingRecruitments = true;

        return this.adminAccountsService
            .getRecruitments()
            .pipe(
                finalize(() => {
                    this.isLoadingRecruitments = false;
                    if (callback) callback();
                })
            )
            .subscribe({
                next: (recruitments) => {
                    this.recruitments = recruitments.map((recruitment) => ({
                        id: recruitment.id,
                        displayedName: recruitment.name,
                        description: `${recruitment.expertise} (${new Date(
                            recruitment.closedAt
                        ).toLocaleDateString()})`,
                    }));
                },
                error: (error) => {
                    console.error('Error loading recruitments:', error);
                },
            });
    }

    private triggerSearch(): void {
        this.filters.searchQuery = this.searchInputValue || undefined;
        this.currentPage = 0;
        this.loadAccounts(0);
        this.updateUrlParams();
    }

    private handleEmptySearch(): void {
        this.filters.searchQuery = undefined;
        this.currentPage = 0;
        this.loadAccounts(0);
        this.updateUrlParamsWithEmptySearch();
    }

    // Handle filter events from the filter component
    onFiltersChanged(event: FilterParams): void {
        this.filters = event;
        this.loadAccounts(0);
        this.updateUrlParams();
    }

    onFilterSearchChange(value: string): void {
        this.searchInputValue = value;
        this.searchForm
            .get('searchInput')
            ?.setValue(this.searchInputValue, { emitEvent: false });
    }

    onFilterSearchBlur(): void {
        const currentSearchValue =
            this.searchForm.get('searchInput')?.value || '';
        this.searchInputValue = currentSearchValue;

        if (this.searchInputValue !== (this.filters.searchQuery || '')) {
            if (this.searchInputValue === '') {
                this.handleEmptySearch();
            } else {
                this.triggerSearch();
            }
        }
    }

    onFilterSearchKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            const currentSearchValue =
                this.searchForm.get('searchInput')?.value || '';
            this.searchInputValue = currentSearchValue;

            if (this.searchInputValue === '') {
                this.handleEmptySearch();
            } else {
                this.triggerSearch();
            }

            (event.target as HTMLElement).blur();
        }
    }

    onFilterDropdownChange(event: {
        field: keyof FilterParams;
        value: any;
    }): void {
        const { field, value } = event;

        if (field === 'departmentId' && this.filters.departmentId !== value) {
            this.filters.specialtyCodename = undefined;
            if (value) {
                this.loadSpecialties(value);
            } else {
                this.specialties = [];
            }
        }

        if (field === 'universityStudyYear' && typeof value === 'string') {
            this.filters[field] = parseInt(value, 10);
        } else {
            this.filters[field] = value;
        }

        this.loadAccounts(0);
        this.updateUrlParams();
    }
}
