import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
    signal,
} from '@angular/core';
import {
    ControlContainer,
    FormGroupDirective,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { I18nService } from '../../../../services/languages/i18n.service';
import { FormErrorService } from './../../../../services/error.service';

@Component({
    selector: 'app-label-input',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        TranslateModule,
    ],
    viewProviders: [
        {
            provide: ControlContainer,
            useExisting: FormGroupDirective,
        },
    ],
    templateUrl: './label-input.html',
    styleUrl: './label-input.scss',
})
export class LabelInput {
    readonly iconPaths = {
        eyeClose: 'assets/icon/system/eyeClose.svg',
        eyeOpen: 'assets/icon/system/eyeOpen.svg',
        error: 'assets/icon/system/errorQuadrilateral.svg',
    } as const;

    @Input() controlName: string = '';
    @Input() placeholder: string = '';
    @Input() label: string = '';
    @Input() errors: readonly string[] = [];
    @Input() type: 'text' | 'password' | 'email' = 'text';
    @Input() preventClipboard: boolean = false;
    @Input() isEmail: boolean = false;
    @Input() domainSuffix: string = '@knu.ua';
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);

    @Output() emailInput = new EventEmitter<Event>();
    @Output() emailBlur = new EventEmitter<void>();

    isPasswordVisible = false;
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    private _showErrors = signal(false);

    constructor(
        private formGroupDirective: FormGroupDirective,
        private formErrorService: FormErrorService
    ) {
        this.matIconRegistry.addSvgIcon(
            'error',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.error
            )
        );
        this.formErrorService.showValidationErrors$.subscribe((value) => {
            this._showErrors.set(value);
        });
    }

    get formGroup() {
        return this.formGroupDirective.form;
    }

    private clipboardEvents = ['copy', 'cut', 'paste'];

    get getClipboardEvents() {
        return this.clipboardEvents;
    }

    togglePasswordVisibility(): void {
        this.isPasswordVisible = !this.isPasswordVisible;
    }

    preventClipboardAction(event: Event) {
        if (this.preventClipboard) {
            event.preventDefault();
        }
    }

    onEmailInput(event: Event) {
        this.emailInput.emit(event);
    }

    onEmailBlur() {
        this.emailBlur.emit();
    }

    showDomainSuffix(): boolean {
        const value = this.formGroup.get(this.controlName)?.value;
        return this.isEmail && (!value || !value.includes('@'));
    }

    get showErrors() {
        return this._showErrors();
    }

    get backendErrors() {
        return this.formErrorService.backendErrors();
    }
}
