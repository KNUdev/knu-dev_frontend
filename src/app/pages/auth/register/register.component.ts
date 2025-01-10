import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import {
    BehaviorSubject,
    catchError,
    map,
    Observable,
    of,
    startWith,
    switchMap,
} from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { DepartmentService } from '../../../services/department.services';
import { I18nService } from '../../../services/languages/i18n.service';
import {
    Course,
    Department,
    ERROR_KEY_TO_CONTROL,
    Specialty,
    ValidationErrors,
} from './register.model';

const COURSE_TRANSLATIONS = 'course' as const;

const REGISTER_CONSTANTS = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 64,
    EMAIL_DOMAIN: '@knu.ua',
    NAME_PATTERN: "^[A-Za-z'-]+$",
} as const;
@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    currentRegistrationPhase = signal(1);
    personalInfoForm = signal<FormGroup>(new FormGroup({}));
    academicInfoForm = signal<FormGroup>(new FormGroup({}));
    backendErrors = signal<ValidationErrors>({});
    departments$: Observable<Department[]>;
    specialties$: Observable<Specialty[]>;
    private selectedDepartmentId$ = new BehaviorSubject<string>('');
    isPasswordVisible = signal(false);
    isConfirmPasswordVisible = signal(false);
    showValidationErrors = signal(false);
    isKnuDomain = signal(true);
    course$: Observable<Course[]>;

    constructor(
        private readonly fb: FormBuilder,
        private readonly http: HttpClient,
        private readonly departmentService: DepartmentService
    ) {
        this.personalInfoForm.set(this.initPersonalInfoForm());
        this.academicInfoForm.set(this.initAcademicInfoForm());

        this.departments$ = this.departmentService.getDepartments().pipe(
            catchError((error) => {
                console.error('Failed to load departments:', error);
                return of([]);
            })
        );

        this.specialties$ = this.selectedDepartmentId$.pipe(
            switchMap((departmentId) =>
                departmentId
                    ? this.departmentService.getSpecialties(departmentId).pipe(
                          catchError((error) => {
                              console.error(
                                  'Failed to load specialties:',
                                  error
                              );
                              return of([]);
                          })
                      )
                    : of([])
            )
        );

        const langChange$ = this.translate.onLangChange.pipe(
            startWith({ lang: this.translate.currentLang } as LangChangeEvent)
        );

        const loadTranslations$ = langChange$.pipe(
            switchMap((event) =>
                this.i18nService.loadComponentTranslations(
                    'register',
                    event.lang
                )
            )
        );

        const courseTranslations$ = loadTranslations$.pipe(
            switchMap(() => this.translate.get([COURSE_TRANSLATIONS]))
        );

        this.course$ = courseTranslations$.pipe(
            map((translations) => translations[COURSE_TRANSLATIONS] || [])
        );
    }

    private initPersonalInfoForm(): FormGroup {
        return this.fb.group(
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
                email: ['', [Validators.required]],
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
                    ],
                ],
                confirmPassword: ['', Validators.required],
            },
            { validators: this.passwordMatchValidator }
        );
    }

    private initAcademicInfoForm(): FormGroup {
        return this.fb.group({
            departmentId: ['', Validators.required],
            specialtyCodename: ['', Validators.required],
            course: ['', Validators.required],
            expertise: ['', Validators.required],
        });
    }

    passwordMatchValidator(form: FormGroup) {
        return form.get('password')?.value ===
            form.get('confirmPassword')?.value
            ? null
            : { passwordMismatch: true };
    }

    preventClipboardAction(event: ClipboardEvent) {
        event.preventDefault();
    }

    public togglePasswordVisibility(): void {
        this.isPasswordVisible.update((v) => !v);
    }

    public toggleConfirmPasswordVisibility(): void {
        this.isConfirmPasswordVisible.update((v) => !v);
    }

    onDepartmentChange() {
        const departmentId = this.academicInfoForm().get('departmentId')?.value;
        if (departmentId) {
            this.selectedDepartmentId$.next(departmentId);
            this.academicInfoForm().get('specialtyCodename')?.setValue('');
        }
    }

    onEmailInput(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const originalValue = inputElement.value;
        const cursorPosition = inputElement.selectionStart || 0;

        let value = originalValue.trim();

        this.personalInfoForm().get('email')?.setErrors(null);

        if (
            value.includes('@') &&
            !value.endsWith(REGISTER_CONSTANTS.EMAIL_DOMAIN)
        ) {
            this.personalInfoForm().get('email')?.setErrors({
                invalidDomain: true,
            });
        }

        this.personalInfoForm()
            .get('email')
            ?.setValue(value, { emitEvent: false });

        setTimeout(() => {
            inputElement.setSelectionRange(cursorPosition, cursorPosition);
        }, 0);
    }

    formatEmailOnBlur() {
        let value = this.personalInfoForm().get('email')?.value.trim();

        if (!value.includes('@')) {
            value += REGISTER_CONSTANTS.EMAIL_DOMAIN;
            this.personalInfoForm().get('email')?.setValue(value);
        } else if (!value.endsWith(REGISTER_CONSTANTS.EMAIL_DOMAIN)) {
            this.personalInfoForm().get('email')?.setErrors({
                invalidDomain: true,
            });
        }
    }

    goToNextStep() {
        this.showValidationErrors.set(true);
        if (this.personalInfoForm().valid) {
            this.showValidationErrors.set(false);
            this.currentRegistrationPhase.set(2);
        }
    }

    returnToPreviousStep() {
        this.currentRegistrationPhase.set(1);
    }

    onSubmit() {
        this.showValidationErrors.set(true);
        this.backendErrors.set({});

        if (this.personalInfoForm().valid && this.academicInfoForm().valid) {
            const formData = new FormData();

            const { confirmPassword, ...personalInfo } =
                this.personalInfoForm().value;
            Object.keys(personalInfo).forEach((key) => {
                formData.append(key, personalInfo[key]);
            });

            const academicInfo = this.academicInfoForm().value;
            formData.append('departmentId', academicInfo.departmentId);
            formData.append(
                'specialtyCodename',
                academicInfo.specialtyCodename
            );
            formData.append('course', academicInfo.course);
            formData.append('expertise', academicInfo.expertise);

            this.http.post(environment.apiRegisterUrl, formData).subscribe({
                next: (response) => {
                    console.log('Registration successful', response);
                },
                error: (error: HttpErrorResponse) => {
                    if (error.status === 400 && error.error) {
                        this.handleValidationErrors(error.error);
                    }
                    if (error.status === 200 && error.error) {
                        this.currentRegistrationPhase.set(1);
                        this.backendErrors.set({
                            email: ['This email is already registered'],
                        });
                    } else {
                        console.error('Registration failed', error);
                    }
                },
            });
        }
    }

    private handleValidationErrors(errors: any) {
        const newErrors: ValidationErrors = {};

        Object.entries(ERROR_KEY_TO_CONTROL).forEach(
            ([errorKey, formControlName]) => {
                if (errors[errorKey]?.length > 0) {
                    newErrors[formControlName] = errors[errorKey];
                }
            }
        );

        this.backendErrors.set(newErrors);

        const criticalFields = [
            'firstName',
            'lastName',
            'middleName',
            'email',
            'password',
        ];
        if (
            Object.keys(newErrors).some((key) => criticalFields.includes(key))
        ) {
            this.currentRegistrationPhase.set(1);
        }
    }
}
