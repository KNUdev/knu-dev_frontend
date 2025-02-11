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
import { RouterModule } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { startWith, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { LabelInput } from '../../../common/components/input/label-input/label-input';
import { FormErrorService } from '../../../services/error.services';
import { I18nService } from '../../../services/languages/i18n.service';
import {
    ERROR_KEY_TO_CONTROL,
    VALIDATION_KEYS,
    ValidationErrors,
} from '../register/register.model';

const REGISTER_CONSTANTS = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 64,
    EMAIL_DOMAIN: '@knu.ua',
    NAME_PATTERN: "^[A-Za-z'-]+$",
} as const;

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
    currentRegistrationPhase = signal(1);
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
        private readonly formErrorService: FormErrorService
    ) {
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

        this.formErrorService.showValidationErrors$.subscribe((value) => {
            this.showValidationErrors.set(value);
        });

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

    onSubmit() {
        this.showValidationErrors.set(true);
        this.formErrorService.setShowValidationErrors(true);
        this.formErrorService.setBackendErrors({});

        if (this.personalInfoForm().valid) {
            const formData = new FormData();

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
                        console.error(error);
                    }
                },
            });
        }
    }

    private initPersonalInfoForm(): FormGroup {
        return this.fb.group({
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
