import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
interface Specialty {
    id?: string;
    codeName?: string;
    name: {
        enName: string;
        ukName: string;
    };
}

interface Department {
    id: string;
    name: {
        enName: string;
        ukName: string;
    };
}
interface ValidationErrors {
    [key: string]: string[];
}

const REGISTER_CONSTANTS = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 64,
    EMAIL_DOMAIN: '@knu.ua',
    NAME_PATTERN: "[A-Za-z'-]+",
    PASSWORD_PATTERN: '(?=.*[A-Za-z])(?=.*\\d).+',
    EMAIL_PATTERN: '^[\\w.-]+@knu\\.ua$',
    COURSES: [1, 2, 3, 4, 5, 6],
    API_ENDPOINTS: {
        DEPARTMENTS: 'http://localhost:5001/departments',
        REGISTER: 'http://localhost:5001/account/register',
    },
} as const;
@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
    currentStep = 1;
    personalInfoForm: FormGroup;
    academicInfoForm: FormGroup;
    backendErrors: ValidationErrors = {};
    departments: Department[] = [];
    specialties: Specialty[] = [];
    courses = REGISTER_CONSTANTS.COURSES;

    public isPasswordVisible: boolean = false;
    public isConfirmPasswordVisible: boolean = false;
    public showValidationErrors: boolean = false;
    public isKnuDomain: boolean = true;

    constructor(private fb: FormBuilder, private http: HttpClient) {
        this.personalInfoForm = this.fb.group(
            {
                firstName: [
                    '',
                    [
                        Validators.required,
                        Validators.pattern(REGISTER_CONSTANTS.NAME_PATTERN),
                    ],
                ],
                lastName: [
                    '',
                    [
                        Validators.required,
                        Validators.pattern(REGISTER_CONSTANTS.NAME_PATTERN),
                    ],
                ],
                middleName: [
                    '',
                    [
                        Validators.required,
                        Validators.pattern(REGISTER_CONSTANTS.NAME_PATTERN),
                    ],
                ],
                email: [
                    '',
                    [
                        Validators.required,
                        Validators.pattern(REGISTER_CONSTANTS.EMAIL_PATTERN),
                    ],
                ],
                password: [
                    '',
                    [
                        Validators.required,
                        Validators.minLength(
                            REGISTER_CONSTANTS.PASSWORD_MIN_LENGTH
                        ),
                        Validators.maxLength(
                            REGISTER_CONSTANTS.PASSWORD_MAX_LENGTH
                        ),
                        Validators.pattern(REGISTER_CONSTANTS.PASSWORD_PATTERN),
                    ],
                ],
                confirmPassword: ['', Validators.required],
            },
            { validators: this.passwordMatchValidator }
        );

        this.academicInfoForm = this.fb.group({
            departmentId: ['', Validators.required],
            specialtyCodename: ['', Validators.required],
            course: ['', Validators.required],
            expertise: ['', Validators.required],
        });

        this.loadDepartments();
    }

    passwordMatchValidator(form: FormGroup) {
        return form.get('password')?.value ===
            form.get('confirmPassword')?.value
            ? null
            : { passwordMismatch: true };
    }

    preventPaste(event: ClipboardEvent) {
        event.preventDefault();
    }

    preventCopy(event: ClipboardEvent) {
        event.preventDefault();
    }

    preventCut(event: ClipboardEvent) {
        event.preventDefault();
    }

    public togglePasswordVisibility(): void {
        this.isPasswordVisible = !this.isPasswordVisible;
    }

    public toggleConfirmPasswordVisibility(): void {
        this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
    }

    loadDepartments() {
        this.http.get(REGISTER_CONSTANTS.API_ENDPOINTS.DEPARTMENTS).subscribe({
            next: (data: any) => {
                this.departments = data;
            },
            error: (error) => {
                console.error('Failed to load departments:', error);
            },
        });
    }

    onDepartmentChange() {
        const departmentId = this.academicInfoForm.get('departmentId')?.value;
        if (departmentId) {
            this.http
                .get(
                    `${REGISTER_CONSTANTS.API_ENDPOINTS.DEPARTMENTS}/${departmentId}/specialties`
                )
                .subscribe({
                    next: (data: any) => {
                        this.specialties = data;
                        this.academicInfoForm
                            .get('specialtyCodename')
                            ?.setValue('');
                    },
                    error: (error) => {
                        console.error('Failed to load specialties:', error);
                        this.specialties = [];
                        this.academicInfoForm
                            .get('specialtyCodename')
                            ?.setValue('');
                    },
                });
        }
    }
    onEmailInput(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const originalValue = inputElement.value;
        const cursorPosition = inputElement.selectionStart || 0;

        let value = originalValue.trim();

        this.personalInfoForm.get('email')?.setErrors(null);

        if (
            value.includes('@') &&
            !value.endsWith(REGISTER_CONSTANTS.EMAIL_DOMAIN)
        ) {
            this.personalInfoForm.get('email')?.setErrors({
                invalidDomain: true,
            });
        }

        this.personalInfoForm
            .get('email')
            ?.setValue(value, { emitEvent: false });

        setTimeout(() => {
            inputElement.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
    }

    formatEmailOnBlur() {
        let value = this.personalInfoForm.get('email')?.value.trim();

        if (!value.includes('@')) {
            value += REGISTER_CONSTANTS.EMAIL_DOMAIN;
            this.personalInfoForm.get('email')?.setValue(value);
        } else if (!value.endsWith(REGISTER_CONSTANTS.EMAIL_DOMAIN)) {
            this.personalInfoForm.get('email')?.setErrors({
                invalidDomain: true,
            });
        }
    }

    nextStep() {
        this.showValidationErrors = true;
        if (this.personalInfoForm.valid) {
            this.showValidationErrors = false;
            this.currentStep = 2;
        }
    }

    previousStep() {
        this.currentStep = 1;
    }

    onSubmit() {
        this.showValidationErrors = true;
        this.backendErrors = {};

        if (this.personalInfoForm.valid && this.academicInfoForm.valid) {
            const formData = new FormData();

            const { confirmPassword, ...personalInfo } =
                this.personalInfoForm.value;
            Object.keys(personalInfo).forEach((key) => {
                formData.append(key, personalInfo[key]);
            });

            const academicInfo = this.academicInfoForm.value;
            formData.append('departmentId', academicInfo.departmentId);
            formData.append(
                'specialtyCodename',
                academicInfo.specialtyCodename
            );
            formData.append('expertise', academicInfo.expertise);

            this.http
                .post(REGISTER_CONSTANTS.API_ENDPOINTS.REGISTER, formData)
                .subscribe({
                    next: (response) => {
                        console.log('Registration successful', response);
                    },
                    error: (error: HttpErrorResponse) => {
                        if (error.status === 400 && error.error) {
                            this.handleValidationErrors(error.error);
                        } else {
                            console.error('Registration failed', error);
                        }
                    },
                });
        }
    }

    private handleValidationErrors(errors: any) {
        this.backendErrors = {};
        const errorKeys = [
            'firstNameErrors',
            'lastNameErrors',
            'middleNameErrors',
            'emailErrors',
            'passwordErrors',
            'confirmPasswordErrors',
            'departmentIdErrors',
            'specialtyCodenameErrors',
            'courseErrors',
            'expertiseErrors',
        ];

        errorKeys.forEach((key) => {
            if (errors[key] && errors[key].length > 0) {
                const formControlName = this.mapErrorKeyToFormControl(key);
                if (formControlName) {
                    this.backendErrors[formControlName] = errors[key];
                }
            }
        });

        if (
            Object.keys(this.backendErrors).some((key) =>
                [
                    'firstName',
                    'lastName',
                    'middleName',
                    'email',
                    'password',
                ].includes(key)
            )
        ) {
            this.currentStep = 1;
        }
    }

    private mapErrorKeyToFormControl(errorKey: string): string | null {
        const mapping: { [key: string]: string } = {
            firstNameErrors: 'firstName',
            lastNameErrors: 'lastName',
            middleNameErrors: 'middleName',
            emailErrors: 'email',
            passwordErrors: 'password',
            departmentIdErrors: 'departmentId',
            specialtyCodenameErrors: 'specialtyCodename',
            courseErrors: 'course',
            expertiseErrors: 'expertise',
        };
        return mapping[errorKey] || null;
    }
}
