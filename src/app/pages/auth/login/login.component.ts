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
import { startWith, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LabelInput } from '../../../common/components/input/label-input/label-input';
import { FormErrorService } from '../../../services/error.service';
import { I18nService } from '../../../services/languages/i18n.service';
import { AuthService } from '../../../services/user/auth.service';
export interface ValidationErrors {
    [key: string]: string[];
}

export const ERROR_KEY_TO_CONTROL: Record<string, string> = {
    emailErrors: 'email',
    passwordErrors: 'password',
};

export const VALIDATION_KEYS = {
    password: ['required'],
    email: ['required', 'invalidDomain'],
} as const;

const LOGIN_CONSTANTS = {
    EMAIL_DOMAIN: '@knu.ua',
} as const;

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: string;
    roles: string[];
    email: string;
}

@Component({
    selector: 'app-login',
    imports: [
        ReactiveFormsModule,
        CommonModule,
        RouterModule,
        LabelInput,
        MatIconModule,
        TranslateModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    isOpenLang = signal<boolean>(false);
    personalInfoForm = signal<FormGroup>(new FormGroup({}));
    backendErrors = signal<ValidationErrors>({});
    isPasswordVisible = signal(false);
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
        private readonly formErrorService: FormErrorService,
        private readonly router: Router,
        private readonly authService: AuthService
    ) {
        this.formErrorService.clearErrors();
        this.showValidationErrors.set(false);
        this.registerIcons();
        this.initForm();
        this.initTranslations();
    }

    private registerIcons(): void {
        Object.entries(this.iconPaths).forEach(([name, path]) => {
            this.matIconRegistry.addSvgIcon(
                name,
                this.domSanitizer.bypassSecurityTrustResourceUrl(path)
            );
        });
    }

    private initForm(): void {
        this.personalInfoForm.set(this.initPersonalInfoForm());
        this.formErrorService.showValidationErrors$.subscribe((value) => {
            this.showValidationErrors.set(value);
        });
    }

    private initTranslations(): void {
        this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/auth/login',
                        event.lang
                    )
                )
            )
            .subscribe();
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

    preventClipboardAction(event: ClipboardEvent) {
        event.preventDefault();
    }

    public togglePasswordVisibility(): void {
        this.isPasswordVisible.update((v) => !v);
    }

    onEmailInput(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const originalValue = inputElement.value;
        const cursorPosition = inputElement.selectionStart || 0;

        let value = originalValue.trim();

        this.personalInfoForm().get('email')?.setErrors(null);

        if (
            value.includes('@') &&
            !value.endsWith(LOGIN_CONSTANTS.EMAIL_DOMAIN)
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
            value += LOGIN_CONSTANTS.EMAIL_DOMAIN;
            this.personalInfoForm().get('email')?.setValue(value);
        } else if (value && !value.endsWith(LOGIN_CONSTANTS.EMAIL_DOMAIN)) {
            this.personalInfoForm().get('email')?.setErrors({
                invalidDomain: true,
            });
        }
    }

    onSubmit() {
        this.showValidationErrors.set(true);
        this.formErrorService.setShowValidationErrors(true);
        this.formErrorService.setBackendErrors({});

        if (this.personalInfoForm().valid) {
            const loginData = {
                email: this.personalInfoForm().get('email')?.value,
                password: this.personalInfoForm().get('password')?.value,
            };

            this.http
                .post<AuthResponse>(
                    `${environment.apiBaseUrl}/auth/login`,
                    loginData
                )
                .subscribe({
                    next: (response) => {
                        this.authService.updateAuthState(response);
                        this.router.navigate([
                            '/profile/',
                            this.authService.getCurrentUserId(),
                        ]);
                    },
                    error: (error: HttpErrorResponse) => {
                        if (error.status === 400) {
                            this.handleValidationErrors(error.error);
                        } else if (error.status === 401) {
                            this.formErrorService.setBackendErrors({
                                password: ['Invalid email or password'],
                            });
                        } else {
                            console.error('Login failed:', error);
                            this.formErrorService.setBackendErrors({
                                email: [
                                    'An unexpected error occurred. Please try again later.',
                                ],
                            });
                        }
                    },
                });
        }
    }

    private initPersonalInfoForm(): FormGroup {
        return this.fb.group({
            email: ['', [Validators.required]],
            password: ['', [Validators.required]],
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

        const criticalFields = ['email', 'password'];
        Object.keys(newErrors).some((key) => criticalFields.includes(key));
    }
}
