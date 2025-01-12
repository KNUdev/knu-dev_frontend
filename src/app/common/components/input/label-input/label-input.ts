import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
    ControlContainer,
    FormGroupDirective,
    ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FormErrorService } from './../../../../services/error.services';

@Component({
    selector: 'label-input',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatIconModule],
    viewProviders: [
        {
            provide: ControlContainer,
            useExisting: FormGroupDirective,
        },
    ],
    templateUrl: './label-input.html',
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
    @Input() errors: any[] = [];
    @Input() type: 'text' | 'password' | 'email' = 'text';
    @Input() preventClipboard: boolean = false;
    @Input() isEmail: boolean = false;
    @Input() domainSuffix: string = '@knu.ua';

    @Output() emailInput = new EventEmitter<Event>();
    @Output() emailBlur = new EventEmitter<void>();

    isPasswordVisible = false;
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

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
        return this.formErrorService.showValidationErrors();
    }

    get backendErrors() {
        return this.formErrorService.backendErrors();
    }
}
