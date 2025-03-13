import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
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
import {
    SelectOption,
    WriteDropDowns,
} from '../../common/components/dropdown/write-dropdowns';
import {
    AdminAccount,
    AdminAccountsResponse,
} from '../../models/admin/accounts.model';
import {
    FilterOptionGroup,
    getFilterOptions,
} from '../../models/admin/filter-options.model';
import {
    AdminAccountsService,
    FilterParams,
} from '../../services/admin/admin-accounts.service';

@Component({
    selector: 'user-dashboard',
    imports: [
        TranslateModule,
        MatIconModule,
        CommonModule,
        FormsModule,
        WriteDropDowns,
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

    filters: FilterParams = {};
    filterOptions: FilterOptionGroup = getFilterOptions();
    departments: SelectOption[] = [];
    specialties: SelectOption[] = [];
    isLoadingDepartments = false;
    isLoadingSpecialties = false;

    accounts: AdminAccount[] = [];
    totalPages = 0;
    totalAccounts = 0;
    currentPage = 0;
    pageSize = 9;
    isLoading = false;
    paginationArray: number[] = [];

    readonly iconPaths = {
        arrowRightUp: 'assets/icon/system/arrowRightUp.svg',
        arrowDown: 'assets/icon/system/arrowDown.svg',
        testAvatar: 'assets/icon/profile/test-avatar.svg',
    } as const;

    private searchQuerySubject = new BehaviorSubject<string>('');

    constructor() {
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
            .subscribe();

        this.registerIcons();

        const searchSubscription = this.searchQuerySubject
            .pipe(debounceTime(500), distinctUntilChanged())
            .subscribe((query) => {
                this.filters.searchQuery = query;
                this.loadAccounts(0);
            });

        this.subscriptions.add(searchSubscription);
    }

    ngOnInit(): void {
        this.loadDepartments();
        this.loadAccounts();
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
            this.filters.specialtyCodeName = undefined;
            return;
        }

        this.isLoadingSpecialties = true;

        const subscription = this.adminAccountsService
            .getSpecialties(departmentId)
            .pipe(finalize(() => (this.isLoadingSpecialties = false)))
            .subscribe({
                next: (specialties) => {
                    this.specialties = specialties.map((spec) => ({
                        id: spec.codeName.toString(),
                        name: spec.name,
                    }));
                },
                error: (error) => {
                    console.error('Error loading specialties:', error);
                },
            });

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
                    this.generatePaginationArray();
                },
                error: (error) => {
                    console.error('Error fetching accounts:', error);
                },
            });

        this.subscriptions.add(subscription);
    }

    generatePaginationArray(): void {
        this.paginationArray = [];

        const maxVisiblePages = 5;
        let startPage = Math.max(
            0,
            this.currentPage - Math.floor(maxVisiblePages / 2)
        );
        let endPage = Math.min(
            this.totalPages - 1,
            startPage + maxVisiblePages - 1
        );

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            this.paginationArray.push(i);
        }
    }

    goToPage(page: number): void {
        if (page !== this.currentPage && page >= 0 && page < this.totalPages) {
            this.loadAccounts(page);
        }
    }

    previousPage(): void {
        if (this.currentPage > 0) {
            this.goToPage(this.currentPage - 1);
        }
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages - 1) {
            this.goToPage(this.currentPage + 1);
        }
    }

    getFullName(account: AdminAccount): string {
        if (!account.fullName) return 'Not found';
        return `${account.fullName.lastName} ${account.fullName.firstName} ${account.fullName.middleName}`;
    }

    getDepartmentId(account: AdminAccount): string {
        return account.academicUnitsIds?.departmentId || 'Not found';
    }

    getSpecialtyCodeName(account: AdminAccount): string | number {
        return account.academicUnitsIds?.specialtyCodename || 'Not found';
    }

    onSearchChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.searchQuerySubject.next(target.value);
    }

    onDateFilterChange(): void {
        this.loadAccounts(0);
    }

    onDropdownChange(field: keyof FilterParams, value: any): void {
        if (field === 'departmentId' && this.filters.departmentId !== value) {
            this.filters.specialtyCodeName = undefined;
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
    }

    resetFilters(): void {
        this.filters = {};
        this.specialties = [];
        this.loadAccounts(0);
    }

    private registerIcons(): void {
        this.matIconRegistry.addSvgIcon(
            'arrowRightUp',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowRightUp
            )
        );

        this.matIconRegistry.addSvgIcon(
            'arrowDown',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowDown
            )
        );

        this.matIconRegistry.addSvgIcon(
            'testAvatar',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.testAvatar
            )
        );
    }
}
