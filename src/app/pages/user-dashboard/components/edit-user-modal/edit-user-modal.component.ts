import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    inject,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { BackdropWindowComponent } from '../../../../common/components/backdrop-window/backdrop-window.component';
import { WriteDropDowns } from '../../../../common/components/dropdown/write-dropdowns';
import { LabelInput } from '../../../../common/components/input/label-input/label-input';
import { AdminAccount } from '../../../../services/admin/accounts.model';
import { AdminAccountsService } from '../../../../services/admin/admin-accounts.service';
import {
    FilterOptionGroup,
    getFilterOptions,
} from '../../filter-options.model';

@Component({
    selector: 'app-edit-user-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TranslateModule,
        MatIconModule,
        BackdropWindowComponent,
        WriteDropDowns,
        LabelInput,
    ],
    templateUrl: './edit-user-modal.component.html',
    styleUrls: ['./edit-user-modal.component.scss'],
})
export class EditUserModalComponent implements OnInit {
    @Input() user!: AdminAccount;
    @Output() close = new EventEmitter<boolean>();

    readonly iconPaths = {
        defaultAvatar: 'assets/icon/defaultAvatar.svg',
        errorQuadrilateral: 'assets/icon/system/errorQuadrilateral.svg',
        trash: 'assets/icon/system/trash.svg',
    } as const;

    editForm!: FormGroup;
    isLoading = false;
    editingField: string | null = null;
    saveSuccess = false;
    saveError = false;
    errorMessage = '';

    filterOptions: FilterOptionGroup;
    departments: any[] = [];
    specialties: any[] = [];
    isLoadingDepartments = false;
    isLoadingSpecialties = false;

    originalUserData: any;

    avatarUrl: string | null = null;
    bannerUrl: string | null = null;
    deleteAvatar = false;
    deleteBanner = false;

    departmentLocalizedName?: string;
    specialtyLocalizedName?: string;

    private adminAccountsService = inject(AdminAccountsService);
    private fb = inject(FormBuilder);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    private translate = inject(TranslateService);

    initialFormValues: any = {};

    showCloseConfirmation = false;
    showSaveConfirmation = false;
    hasUnsavedChanges = false;

    constructor() {
        this.filterOptions = getFilterOptions(this.translate);

        this.matIconRegistry.addSvgIcon(
            'arrowRightUp',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.errorQuadrilateral
            )
        );

        this.matIconRegistry.addSvgIcon(
            'trash',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.trash
            )
        );
    }

    ngOnInit(): void {
        this.initForm();
        this.loadDepartments();
        if (this.user.academicUnitsIds?.departmentId) {
            this.loadSpecialties(this.user.academicUnitsIds.departmentId);
        }

        if (this.user.avatarFilename) {
            this.avatarUrl = this.user.avatarFilename;
        }
        if (this.user.bannerFilename) {
            this.bannerUrl = this.user.bannerFilename.startsWith('http')
                ? this.user.bannerFilename
                : `${environment.apiBaseUrl}/files/${this.user.bannerFilename}`;
        }

        this.originalUserData = {
            email: this.user.email,
            technicalRole: this.user.technicalRole,
            fullName: {
                firstName: this.user.fullName.firstName,
                lastName: this.user.fullName.lastName,
                middleName: this.user.fullName.middleName,
            },
            academicUnitsIds: {
                departmentId: this.user.academicUnitsIds?.departmentId || '',
                specialtyCodename:
                    this.user.academicUnitsIds?.specialtyCodename || '',
            },
            githubAccountUsername: this.user.githubAccountUsername || '',
            expertise: this.user.expertise,
            universityStudyYear: this.user.universityStudyYear,
            unit: this.user.unit,
        };

        if (this.user.departmentName) {
            this.departmentLocalizedName =
                this.user.departmentName[
                    this.translate.currentLang as 'en' | 'uk'
                ] ||
                this.user.departmentName['en'] ||
                '';
        }

        if (this.user.specialtyName) {
            this.specialtyLocalizedName =
                this.user.specialtyName[
                    this.translate.currentLang as 'en' | 'uk'
                ] ||
                this.user.specialtyName['en'] ||
                '';
        }

        setTimeout(() => {
            this.initialFormValues = { ...this.editForm.value };
        }, 0);

        this.initialFormValues = {
            firstName: this.user.fullName.firstName,
            lastName: this.user.fullName.lastName,
            middleName: this.user.fullName.middleName || '',
            email: this.user.email,
            technicalRole: this.user.technicalRole,
            yearOfStudyOnRegistration:
                this.user.universityStudyYear?.toString() || '1',
            unit: this.user.unit,
            githubAccountUsername: this.user.githubAccountUsername || '',
            departmentId: this.user.academicUnitsIds?.departmentId || '',
            specialtyCodename:
                this.user.academicUnitsIds?.specialtyCodename?.toString() || '',
            expertise: this.user.expertise,
        };

        this.editForm.valueChanges.subscribe(() => {
            this.checkForChanges();
        });
    }

    initForm(): void {
        this.editForm = this.fb.group({
            firstName: [
                this.user.fullName.firstName || '',
                [Validators.required],
            ],
            lastName: [
                this.user.fullName.lastName || '',
                [Validators.required],
            ],
            middleName: [this.user.fullName.middleName || '', []],
            email: [
                this.user.email || '',
                [Validators.required, Validators.email],
            ],
            technicalRole: [
                this.user.technicalRole || '',
                [Validators.required],
            ],
            yearOfStudyOnRegistration: [
                this.user.universityStudyYear?.toString() || '1',
                [Validators.required],
            ],
            unit: [this.user.unit || '', [Validators.required]],
            githubAccountUsername: [this.user.githubAccountUsername || '', []],
            departmentId: [this.user.academicUnitsIds?.departmentId || '', []],
            specialtyCodename: [
                this.user.academicUnitsIds?.specialtyCodename?.toString() || '',
                [],
            ],
            expertise: [this.user.expertise || '', [Validators.required]],
        });

        this.editForm.get('departmentId')?.valueChanges.subscribe((value) => {
            if (value) {
                this.loadSpecialties(value);
            } else {
                this.specialties = [];
                this.editForm.get('specialtyCodename')?.setValue('');
            }
        });
    }

    loadDepartments(): void {
        this.isLoadingDepartments = true;

        this.adminAccountsService
            .getDepartments()
            .pipe(finalize(() => (this.isLoadingDepartments = false)))
            .subscribe({
                next: (departments) => {
                    this.departments = departments;
                },
                error: (error) => {
                    console.error('Error loading departments:', error);
                },
            });
    }

    loadSpecialties(departmentId: string): void {
        this.isLoadingSpecialties = true;

        this.adminAccountsService
            .getSpecialties(departmentId)
            .pipe(finalize(() => (this.isLoadingSpecialties = false)))
            .subscribe({
                next: (specialties) => {
                    this.specialties = specialties.map((spec) => ({
                        ...spec,
                        id: spec.codeName.toString(),
                        displayName: spec.name,
                        originalName: spec.name,
                    }));

                    if (this.user.academicUnitsIds?.specialtyCodename) {
                        const specialtyValue =
                            this.user.academicUnitsIds.specialtyCodename.toString();
                        setTimeout(() => {
                            this.editForm
                                .get('specialtyCodename')
                                ?.setValue(specialtyValue);
                        }, 0);
                    }
                },
                error: (error) => {
                    console.error('Error loading specialties:', error);
                },
            });
    }

    startEditing(field: string): void {
        this.editingField = field;
    }

    cancelEditing(): void {
        this.editingField = null;
    }

    updateField(field: string): void {
        if (this.editForm.get(field)?.invalid) {
            return;
        }
        this.editingField = null;
    }

    saveChanges(): void {
        if (this.editForm.invalid) {
            Object.keys(this.editForm.controls).forEach((key) => {
                const control = this.editForm.get(key);
                if (control) {
                    control.markAsTouched();
                }
            });
            return;
        }

        this.showSaveConfirmation = true;
    }

    confirmSave(): void {
        this.showSaveConfirmation = false;
        this.processSave();
    }

    cancelSave(): void {
        this.showSaveConfirmation = false;
    }

    processSave(): void {
        const formValues = this.editForm.value;
        const changedFields: any = {};

        if (formValues.firstName !== this.originalUserData.fullName.firstName) {
            changedFields.firstName = formValues.firstName;
        }
        if (formValues.lastName !== this.originalUserData.fullName.lastName) {
            changedFields.lastName = formValues.lastName;
        }
        if (
            formValues.middleName !== this.originalUserData.fullName.middleName
        ) {
            changedFields.middleName = formValues.middleName;
        }

        if (formValues.email !== this.originalUserData.email) {
            changedFields.email = formValues.email;
        }

        if (formValues.technicalRole !== this.originalUserData.technicalRole) {
            changedFields.technicalRole = formValues.technicalRole;
        }

        if (
            formValues.githubAccountUsername !==
            this.originalUserData.githubAccountUsername
        ) {
            changedFields.githubAccountUsername =
                formValues.githubAccountUsername;
        }

        if (formValues.expertise !== this.originalUserData.expertise) {
            changedFields.expertise = formValues.expertise;
        }

        const formStudyYear = parseInt(
            formValues.yearOfStudyOnRegistration,
            10
        );
        if (formStudyYear !== this.originalUserData.universityStudyYear) {
            changedFields.yearOfStudyOnRegistration = formStudyYear;
        }

        if (formValues.unit !== this.originalUserData.unit) {
            changedFields.unit = formValues.unit;
        }

        if (
            formValues.departmentId !==
            this.originalUserData.academicUnitsIds.departmentId
        ) {
            changedFields.departmentId = formValues.departmentId;
        }

        const originalSpecialtyString =
            this.originalUserData.academicUnitsIds.specialtyCodename?.toString() ||
            '';
        if (formValues.specialtyCodename !== originalSpecialtyString) {
            changedFields.specialtyCodename = formValues.specialtyCodename
                ? parseFloat(formValues.specialtyCodename)
                : null;
        }

        if (this.deleteAvatar) {
            changedFields.deleteAvatar = true;
        }

        if (this.deleteBanner) {
            changedFields.deleteBanner = true;
        }

        if (Object.keys(changedFields).length === 0) {
            this.onClose();
            return;
        }

        this.isLoading = true;
        this.saveSuccess = false;
        this.saveError = false;

        this.adminAccountsService
            .updateAccount(this.user.id, changedFields)
            .pipe(finalize(() => (this.isLoading = false)))
            .subscribe({
                next: () => {
                    this.saveSuccess = true;
                    setTimeout(() => {
                        this.close.emit(true);
                    }, 1500);
                },
                error: (error) => {
                    this.saveError = true;
                    this.errorMessage =
                        error.error?.message || 'Something went wrong';
                },
            });
    }

    resetErrorState(): void {
        this.saveError = false;
        this.errorMessage = '';
    }

    onClose(): void {
        if (this.saveError) {
            this.resetErrorState();
            return;
        }

        this.checkForChanges();

        if (this.hasUnsavedChanges) {
            this.showCloseConfirmation = true;
        } else {
            this.close.emit(false);
        }
    }

    confirmClose(): void {
        this.showCloseConfirmation = false;
        this.close.emit(false);
    }

    cancelClose(): void {
        this.showCloseConfirmation = false;
    }

    getFieldError(field: string): string {
        const control = this.editForm.get(field);
        if (control?.errors) {
            if (control.errors['required']) {
                return 'This field is required';
            }
            if (control.errors['email']) {
                return 'Please enter a valid email';
            }
        }
        return '';
    }

    requestDeleteAvatar(): void {
        this.deleteAvatar = true;
        this.avatarUrl = null;
    }

    requestDeleteBanner(): void {
        this.deleteBanner = true;
        this.bannerUrl = null;
    }

    isFieldChanged(fieldName: string): boolean {
        if (!this.editForm) return false;

        const currentValue = this.editForm.get(fieldName)?.value;
        const initialValue = this.initialFormValues[fieldName];

        return currentValue !== initialValue;
    }

    getOriginalValueFor(fieldName: string): string {
        const value = this.initialFormValues[fieldName];
        return this.getDisplayValueForField(fieldName, value);
    }

    getCurrentValueFor(fieldName: string): string {
        const value = this.editForm.get(fieldName)?.value;
        return this.getDisplayValueForField(fieldName, value);
    }

    getDisplayValueForField(fieldName: string, value: any): string {
        if (!value && value !== 0) return 'None';

        if (fieldName === 'technicalRole') {
            const option = this.filterOptions.technicalRoles.find(
                (opt) => opt.id === value
            );
            return option?.displayedName || value;
        } else if (fieldName === 'expertise') {
            const option = this.filterOptions.expertise.find(
                (opt) => opt.id === value
            );
            return option?.displayedName || value;
        } else if (fieldName === 'unit') {
            const option = this.filterOptions.units.find(
                (opt) => opt.id === value
            );
            return option?.displayedName || value;
        } else if (fieldName === 'yearOfStudyOnRegistration') {
            const option = this.filterOptions.studyYears.find(
                (opt) => opt.id === value
            );
            return option?.displayedName || value;
        } else if (fieldName === 'departmentId') {
            const option = this.departments.find((opt) => opt.id === value);
            if (option) {
                if (typeof option.name === 'object') {
                    return (
                        option.name[
                            this.translate.currentLang as 'en' | 'uk'
                        ] ||
                        option.name['en'] ||
                        option.id
                    );
                }
                return option.name || value;
            }
            return value || 'None';
        } else if (fieldName === 'specialtyCodename') {
            const option = this.specialties.find((opt) => opt.id === value);

            if (option) {
                const name =
                    typeof option.name === 'object'
                        ? option.name[
                              this.translate.currentLang as 'en' | 'uk'
                          ] || option.name['en']
                        : option.name || option.displayName;
                return `${option.id} - ${name}`;
            }

            if (
                this.specialtyLocalizedName &&
                value === this.initialFormValues.specialtyCodename
            ) {
                return `${value} - ${this.specialtyLocalizedName}`;
            }

            return value || 'None';
        }
        return value;
    }

    getFieldDisplayName(fieldName: string): string {
        const fieldDisplayNames: { [key: string]: string } = {
            firstName: this.translate.instant('users.edit.firstName'),
            lastName: this.translate.instant('users.edit.lastName'),
            middleName: this.translate.instant('users.edit.middleName'),
            email: this.translate.instant('users.email'),
            githubAccountUsername: this.translate.instant('users.github'),
            technicalRole: this.translate.instant('users.tech-role'),
            expertise: this.translate.instant('users.expertise'),
            unit: this.translate.instant('users.unit'),
            yearOfStudyOnRegistration:
                this.translate.instant('users.study-year'),
            departmentId: this.translate.instant('users.faculty'),
            specialtyCodename: this.translate.instant('users.specialty'),
        };

        return fieldDisplayNames[fieldName] || fieldName;
    }

    checkForChanges(): void {
        if (!this.editForm) return;

        const currentValues = this.editForm.value;
        this.hasUnsavedChanges =
            Object.keys(currentValues).some(
                (key) => currentValues[key] !== this.initialFormValues[key]
            ) ||
            this.deleteAvatar ||
            this.deleteBanner;
    }
}
