import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import {
    ControlContainer,
    FormGroupDirective,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { FormErrorService } from 'src/app/services/error/error.service';

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
    standalone: true,
})
export class LabelInput {
    readonly iconPaths = {
        eyeClose: 'assets/icon/system/eyeClose.svg',
        eyeOpen: 'assets/icon/system/eyeOpen.svg',
        error: 'assets/icon/system/errorQuadrilateral.svg',
    } as const;

    @Input() translationPrefix: string = '';
    @Input() controlName: string = '';
    @Input() placeholder: string = '';
    @Input() label: string = '';
    @Input() errors: readonly string[] = [];
    @Input() type: 'text' | 'password' | 'email' = 'text';
    @Input() preventClipboard: boolean = false;
    @Input() isEmail: boolean = false;
    @Input() domainSuffix: string = '@knu.ua';
    @Input() required: boolean = false;

    @Output() emailInput = new EventEmitter<Event>();
    @Output() emailBlur = new EventEmitter<void>();
    @Output() blur = new EventEmitter<void>();

    isPasswordVisible = false;
    private clipboardEvents = ['copy', 'cut', 'paste'];

    constructor(
        private formGroupDirective: FormGroupDirective,
        private formErrorService: FormErrorService,
        private domSanitizer: DomSanitizer,
        private matIconRegistry: MatIconRegistry
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

    private _showErrors = signal(false);

    get showErrors() {
        return this._showErrors();
    }

    get formGroup() {
        return this.formGroupDirective.form;
    }

    get getClipboardEvents() {
        return this.clipboardEvents;
    }

    get backendErrors() {
        return this.formErrorService.backendErrors();
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

    onInputBlur() {
        this.emailBlur.emit(); // Keep for backward compatibility
        this.blur.emit(); // Add standard blur event
    }

    showDomainSuffix(): boolean {
        const value = this.formGroup.get(this.controlName)?.value;
        return this.isEmail && (!value || !value.includes('@'));
    }
}
