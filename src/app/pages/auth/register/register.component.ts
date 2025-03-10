import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, inject, signal } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import {
    BehaviorSubject,
    catchError,
    map,
    Observable,
    of,
    startWith,
    switchMap,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { LabelInput } from '../../../common/components/input/label-input/label-input';
import { DepartmentService } from '../../../services/department.service';
import { FormErrorService } from '../../../services/error.service';
import { I18nService } from '../../../services/languages/i18n.service';
import {
    SelectOption,
    WriteDropDowns,
} from './components/dropdown/write-dropdowns';
import {
    Department,
    ERROR_KEY_TO_CONTROL,
    Expertise,
    VALIDATION_KEYS,
    ValidationErrors,
    YearOfStudy,
} from './register.model';

const YEAR_OF_STUDY_TRANSLATIONS = 'yearOfStudy' as const;
const EXPERTISE_TRANSLATIONS = 'expertise' as const;

const REGISTER_CONSTANTS = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 64,
    EMAIL_DOMAIN: '@knu.ua',
    NAME_PATTERN: "^[A-Za-z'-]+$",
} as const;

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

@Component({
    selector: 'app-register',
    imports: [
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        LabelInput,
        MatIconModule,
        TranslateModule,
        WriteDropDowns,
    ],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
    isOpenLang = signal<boolean>(false);
    currentRegistrationPhase = signal(1);
    personalInfoForm = signal<FormGroup>(new FormGroup({}));
    academicInfoForm = signal<FormGroup>(new FormGroup({}));
    backendErrors = signal<ValidationErrors>({});
    departments$: Observable<Department[]>;
    departments: Department[] = [];
    specialties$: Observable<SelectOption[]>;
    yearOfStudy: SelectOption[] = [];
    expertise: SelectOption[] = [];
    departmentLoadError = signal<boolean>(false);
    specialtyLoadError = signal<boolean>(false);
    selectedDepartmentId$ = new BehaviorSubject<string | null>(null);
    isPasswordVisible = signal(false);
    isConfirmPasswordVisible = signal(false);
    showValidationErrors = signal(false);
    readonly iconPaths = {
        arrowLeft: 'assets/icon/system/arrowLeft.svg',
        arrowDown: 'assets/icon/system/arrowDown.svg',
        errorQuadrilateral: 'assets/icon/system/errorQuadrilateral.svg',
        errorTriangle: 'assets/icon/system/errorTriangle.svg',
    } as const;
    protected readonly VALIDATION_KEYS = VALIDATION_KEYS;
    protected i18nService = inject(I18nService);
    protected currentLanguage$ = this.i18nService.getCurrentLanguage();
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    constructor(
        private readonly fb: FormBuilder,
        private readonly http: HttpClient,
        private readonly departmentService: DepartmentService,
        readonly formErrorService: FormErrorService,
        private readonly router: Router
    ) {
        this.formErrorService.clearErrors();
        this.showValidationErrors.set(false);

        this.matIconRegistry.addSvgIcon(
            'arrowLeft',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowLeft
            )
        );

        this.matIconRegistry.addSvgIcon(
            'arrowDown',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowDown
            )
        );

        this.matIconRegistry.addSvgIcon(
            'errorTriangle',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.errorTriangle
            )
        );

        this.matIconRegistry.addSvgIcon(
            'errorQuadrilateral',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.errorQuadrilateral
            )
        );

        this.personalInfoForm.set(this.initPersonalInfoForm());
        this.academicInfoForm.set(this.initAcademicInfoForm());

        this.formErrorService.showValidationErrors$.subscribe((value) => {
            this.showValidationErrors.set(value);
        });

        this.departments$ = this.departmentService.getDepartments().pipe(
            catchError((error) => {
                console.error(error);
                this.departmentLoadError.set(true);
                return of([]);
            })
        );

        this.departments$.subscribe((deps) => {
            this.departments = deps.map((dep) => ({
                id: dep.id,
                name: {
                    en: dep.name.en,
                    uk: dep.name.uk,
                },
            }));
        });

        this.specialties$ = this.selectedDepartmentId$.pipe(
            switchMap((departmentId) =>
                departmentId
                    ? this.departmentService.getSpecialties(departmentId).pipe(
                          map((specialties) => {
                              this.specialtyLoadError.set(false);
                              return specialties.map((specialty) => ({
                                  id: specialty.codeName,
                                  codeName: specialty.codeName,
                                  name: {
                                      en: specialty.name.en,
                                      uk: specialty.name.uk,
                                  },
                              }));
                          }),
                          catchError(() => {
                              this.specialtyLoadError.set(true);
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
                    'pages/auth/register',
                    event.lang
                )
            )
        );

        const yearOfStudyTranslations$ = loadTranslations$.pipe(
            switchMap(() => this.translate.get(YEAR_OF_STUDY_TRANSLATIONS)),
            map((translations: YearOfStudy[]) => translations)
        );

        yearOfStudyTranslations$.subscribe((yearOfStudyData) => {
            this.yearOfStudy = yearOfStudyData.map((yearOfStudy) => ({
                id: yearOfStudy.id,
                displayedName: yearOfStudy.displayedName,
            }));
        });

        const expertiseTranslations$ = loadTranslations$.pipe(
            switchMap(() => this.translate.get(EXPERTISE_TRANSLATIONS)),
            map((translations: Expertise[]) => translations)
        );

        expertiseTranslations$.subscribe((expertiseData) => {
            this.expertise = expertiseData.map((expertise) => ({
                id: expertise.id,
                displayedName: expertise.displayedName,
            }));
        });
    }

    get supportedLanguages() {
        return this.i18nService.supportedLanguages;
    }

    get currentLang() {
        return this.i18nService.getCurrentLanguage();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.language-selector')) {
            this.isOpenLang.set(false);
        }
    }

    toggleDropdownLang() {
        this.isOpenLang.update((value) => !value);
    }

    selectLanguage(code: string) {
        this.i18nService.switchLang(code as any);
        this.isOpenLang.set(false);
    }

    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password');
        const confirmPassword = form.get('confirmPassword');

        if (password?.value !== confirmPassword?.value) {
            confirmPassword?.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }

        confirmPassword?.setErrors(null);
        return null;
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

        if (inputElement.type !== 'email') {
            setTimeout(() => {
                inputElement.setSelectionRange(cursorPosition, cursorPosition);
            }, 0);
        }
    }

    formatEmailOnBlur() {
        let value = this.personalInfoForm().get('email')?.value.trim();

        if (value && !value.includes('@')) {
            value += REGISTER_CONSTANTS.EMAIL_DOMAIN;
            this.personalInfoForm().get('email')?.setValue(value);
        } else if (value && !value.endsWith(REGISTER_CONSTANTS.EMAIL_DOMAIN)) {
            this.personalInfoForm().get('email')?.setErrors({
                invalidDomain: true,
            });
        }
    }

    goToNextStep() {
        this.formErrorService.setShowValidationErrors(true);
        if (this.personalInfoForm().valid) {
            this.formErrorService.setShowValidationErrors(false);
            this.currentRegistrationPhase.set(2);
        }
    }

    returnToPreviousStep() {
        this.currentRegistrationPhase.set(1);
    }

    onSubmit() {
        this.showValidationErrors.set(true);
        this.formErrorService.setShowValidationErrors(true);
        this.formErrorService.setBackendErrors({});

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
            formData.append('yearOfStudy', academicInfo.yearOfStudy);
            formData.append('expertise', academicInfo.expertise);

            this.http
                .post<AuthResponse>(environment.apiRegisterUrl, formData)
                .subscribe({
                    next: (response) => {
                        this.router.navigate(['/auth/login']);
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
                            console.error(error);
                        }
                    },
                });
        }
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
            { validators: [this.passwordMatchValidator], updateOn: 'change' }
        );
    }

    private initAcademicInfoForm(): FormGroup {
        return this.fb.group({
            departmentId: ['', Validators.required],
            specialtyCodename: ['', Validators.required],
            yearOfStudy: ['', Validators.required],
            expertise: ['', Validators.required],
        });
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

        this.formErrorService.setBackendErrors(newErrors);

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
