import {CommonModule} from '@angular/common';
import {Component, EventEmitter, inject, Input, Output, signal,} from '@angular/core';
import {ControlContainer, FormGroupDirective, ReactiveFormsModule,} from '@angular/forms';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {TranslateModule} from '@ngx-translate/core';
import {FormErrorService} from '../../../../services/error.services';

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
    standalone: true
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
    @Input() required: boolean = false;

    @Output() emailInput = new EventEmitter<Event>();
    @Output() emailBlur = new EventEmitter<void>();

    isPasswordVisible = false;
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    private clipboardEvents = ['copy', 'cut', 'paste'];

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

    showDomainSuffix(): boolean {
        const value = this.formGroup.get(this.controlName)?.value;
        return this.isEmail && (!value || !value.includes('@'));
    }
}
