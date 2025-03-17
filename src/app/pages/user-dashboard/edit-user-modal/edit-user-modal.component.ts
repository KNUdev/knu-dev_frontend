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
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { BackdropWindowComponent } from '../../../common/components/backdrop-window/backdrop-window.component';
import { WriteDropDowns } from '../../../common/components/dropdown/write-dropdowns';
import { AdminAccount } from '../../../services/admin/accounts.model';
import { AdminAccountsService } from '../../../services/admin/admin-accounts.service';
import { FilterOptionGroup, getFilterOptions } from '../filter-options.model';
import { environment } from '../../../../environments/environment';

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
    ],
    templateUrl: './edit-user-modal.component.html',
    styleUrls: ['./edit-user-modal.component.scss'],
})
export class EditUserModalComponent implements OnInit {
    @Input() user!: AdminAccount;
    @Output() close = new EventEmitter<boolean>();

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

    // Keep track of original user data
    originalUserData: any;

    // Add properties for image handling
    avatarUrl: string | null = null;
    bannerUrl: string | null = null;
    deleteAvatar = false;
    deleteBanner = false;

    // Add property to store localized names
    departmentLocalizedName?: string;
    specialtyLocalizedName?: string;

    private adminAccountsService = inject(AdminAccountsService);
    private fb = inject(FormBuilder);
    private translate = inject(TranslateService);

    constructor() {
        this.filterOptions = getFilterOptions(this.translate);
    }

    ngOnInit(): void {
        this.initForm();
        this.loadDepartments();
        if (this.user.academicUnitsIds?.departmentId) {
            this.loadSpecialties(this.user.academicUnitsIds.departmentId);
        }

        // Set up avatar and banner URLs directly from user data
        if (this.user.avatarFilename) {
            this.avatarUrl = this.user.avatarFilename; // Use the URL directly
        }
        if (this.user.bannerFilename) {
            // Check if bannerFilename is a full URL or just a filename
            this.bannerUrl = this.user.bannerFilename.startsWith('http')
                ? this.user.bannerFilename
                : `${environment.apiBaseUrl}/files/${this.user.bannerFilename}`;
        }

        // Store original user data for comparison later
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

        // Set localized names
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
            // Changed from universityStudyYear to yearOfStudyOnRegistration for consistency with API
            yearOfStudyOnRegistration: [
                this.user.universityStudyYear?.toString() || '1',
                [Validators.required],
            ],
            unit: [this.user.unit || '', [Validators.required]],
            githubAccountUsername: [this.user.githubAccountUsername || '', []],
            departmentId: [this.user.academicUnitsIds?.departmentId || '', []],
            specialtyCodename: [
                // Renamed from specialtyCodename to specialtyCodename for consistency
                this.user.academicUnitsIds?.specialtyCodename?.toString() || '',
                [],
            ],
            expertise: [this.user.expertise || '', [Validators.required]],
        });

        // When department changes, load specialties
        this.editForm.get('departmentId')?.valueChanges.subscribe((value) => {
            if (value) {
                this.loadSpecialties(value);
            } else {
                this.specialties = [];
                this.editForm.get('specialtyCodename')?.setValue(''); // Updated field name here
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
                        id: spec.codeName.toString(), // Ensure ID is a string for proper comparison
                        displayName: spec.name, // Make sure the display name is accessible
                    }));

                    // After loading specialties, set the form value again to ensure it's selected
                    if (this.user.academicUnitsIds?.specialtyCodename) {
                        const specialtyValue =
                            this.user.academicUnitsIds.specialtyCodename.toString();
                        setTimeout(() => {
                            this.editForm
                                .get('specialtyCodename')
                                ?.setValue(specialtyValue); // Updated field name here
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

        // Create an object with only changed fields
        const formValues = this.editForm.value;
        const changedFields: any = {};

        // Check for name field changes individually rather than as a fullName object
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

        // Check for email change
        if (formValues.email !== this.originalUserData.email) {
            changedFields.email = formValues.email;
        }

        // Check for technical role change
        if (formValues.technicalRole !== this.originalUserData.technicalRole) {
            changedFields.technicalRole = formValues.technicalRole;
        }

        // Check for GitHub username change
        if (
            formValues.githubAccountUsername !==
            this.originalUserData.githubAccountUsername
        ) {
            changedFields.githubAccountUsername =
                formValues.githubAccountUsername;
        }

        // Check for expertise change
        if (formValues.expertise !== this.originalUserData.expertise) {
            changedFields.expertise = formValues.expertise;
        }

        // Check for study year change - convert to number for comparison
        // Using universityStudyYear from original data but sending as yearOfStudyOnRegistration
        const formStudyYear = parseInt(
            formValues.yearOfStudyOnRegistration,
            10
        );
        if (formStudyYear !== this.originalUserData.universityStudyYear) {
            changedFields.yearOfStudyOnRegistration = formStudyYear;
        }

        // Check for unit change
        if (formValues.unit !== this.originalUserData.unit) {
            changedFields.unit = formValues.unit;
        }

        // Check for department ID change - send directly at root level
        if (
            formValues.departmentId !==
            this.originalUserData.academicUnitsIds.departmentId
        ) {
            changedFields.departmentId = formValues.departmentId;
        }

        // Check for specialty change - send directly at root level
        const originalSpecialtyString =
            this.originalUserData.academicUnitsIds.specialtyCodename?.toString() ||
            '';
        if (formValues.specialtyCodename !== originalSpecialtyString) {
            // Updated field name here
            changedFields.specialtyCodename = formValues.specialtyCodename
                ? parseFloat(formValues.specialtyCodename)
                : null;
        }

        // Add deletion flags if set
        if (this.deleteAvatar) {
            changedFields.deleteAvatar = true;
        }

        if (this.deleteBanner) {
            changedFields.deleteBanner = true;
        }

        // If no fields were changed, just close the modal
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
                        this.close.emit(true); // true indicates successful update
                    }, 1500);
                },
                error: (error) => {
                    this.saveError = true;
                    this.errorMessage =
                        error.error?.message || 'Something went wrong';
                },
            });
    }

    onClose(): void {
        this.close.emit(false); // false indicates no update
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

    // Method to handle avatar deletion
    requestDeleteAvatar(): void {
        this.deleteAvatar = true;
        this.avatarUrl = null;
    }

    // Method to handle banner deletion
    requestDeleteBanner(): void {
        this.deleteBanner = true;
        this.bannerUrl = null;
    }
}
