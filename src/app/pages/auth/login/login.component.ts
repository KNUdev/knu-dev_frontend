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
    isPasswordVisible = signal(false);
    showValidationErrors = signal(false);
    private localizedErrorMessages = signal<{
        [field: string]: { en: string; uk: string } | string;
    }>({});

    readonly iconPaths = {
        arrowLeft: 'assets/icon/system/arrowLeft.svg',
        arrowDown: 'assets/icon/system/arrowDown.svg',
        errorQuadrilateral: 'assets/icon/system/errorQuadrilateral.svg',
        errorTriangle: 'assets/icon/system/errorTriangle.svg',
    } as const;

    protected readonly VALIDATION_KEYS = VALIDATION_KEYS;
    protected i18nService = inject(I18nService);
    protected currentLanguage$ = this.i18nService.getCurrentLanguage();
    protected formErrorService = inject(FormErrorService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    constructor(
        private readonly fb: FormBuilder,
        private readonly http: HttpClient,
        private readonly router: Router,
        private readonly authService: AuthService
    ) {
        this.formErrorService.clearErrors();
        this.showValidationErrors.set(false);
        this.registerIcons();
        this.initForm();
        this.initTranslations();
        this.translate.onLangChange.subscribe(() => {
            this.updateErrorMessagesForCurrentLanguage();
        });
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
                        this.localizedErrorMessages.set({});

                        this.handleLocalizedError(error, 'password');
                    },
                });
        }
    }

    private handleLocalizedError(error: HttpErrorResponse, field: string) {
        if (
            typeof error.error === 'object' &&
            (error.error.en || error.error.uk)
        ) {
            const localizedError = {
                en: error.error.en || 'An error occurred',
                uk: error.error.uk || 'Виникла помилка',
            };

            this.localizedErrorMessages.update((current) => ({
                ...current,
                [field]: localizedError,
            }));

            const currentLang = this.translate.currentLang;
            const errorMessage =
                localizedError[currentLang as keyof typeof localizedError] ||
                localizedError.en;

            this.formErrorService.setBackendErrors({
                [field]: [errorMessage],
            });
        } else {
            let errorMessage =
                typeof error.error === 'string'
                    ? error.error
                    : error.error?.message
                    ? error.error.message
                    : 'An unexpected error occurred';

            this.localizedErrorMessages.update((current) => ({
                ...current,
                [field]: errorMessage,
            }));

            this.formErrorService.setBackendErrors({
                [field]: [errorMessage],
            });
        }
    }

    private updateErrorMessagesForCurrentLanguage() {
        const storedErrors = this.localizedErrorMessages();
        if (!storedErrors || Object.keys(storedErrors).length === 0) {
            return;
        }

        const currentLang = this.translate.currentLang;
        const newErrors: { [field: string]: string[] } = {};

        Object.entries(storedErrors).forEach(([field, errorInfo]) => {
            if (
                typeof errorInfo === 'object' &&
                (errorInfo.en || errorInfo.uk)
            ) {
                newErrors[field] = [
                    errorInfo[currentLang as keyof typeof errorInfo] ||
                        errorInfo.en ||
                        errorInfo.uk,
                ];
            } else if (typeof errorInfo === 'string') {
                newErrors[field] = [errorInfo];
            }
        });

        if (Object.keys(newErrors).length > 0) {
            this.formErrorService.setBackendErrors(newErrors);
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
    }
}
