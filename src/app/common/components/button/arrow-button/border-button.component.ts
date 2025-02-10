import {Component, inject, Input} from '@angular/core';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {NgClass, NgStyle} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';

export type BorderColor = 'red' | 'yellow' | 'green' | 'purple';

@Component({
    selector: 'border-button',
    templateUrl: './border-button.component.html',
    imports: [
        MatIcon,
        NgClass,
        NgStyle
    ],
    standalone: true,
    styleUrls: ['./border-button.component.scss']
})
export class BorderButtonComponent {
    private static readonly BORDER_COLOR_MAP: Record<BorderColor, { default: string; hover: string }> = {
        red: {default: '#E5383A', hover: '#301616'},
        yellow: {default: '#edd342', hover: '#3C371A'},
        green: {default: '#3FCB49', hover: '#223E1F'},
        purple: {default: '#9542ED', hover: '#2F124E'}
    };
    @Input({required: true}) text!: string;
    @Input() ariaLabel: string = '';
    @Input() fullWidth: boolean = false;
    @Input() type: string = 'button';
    private readonly arrowIconPath = 'assets/icon/system/arrowRightUp.svg' as const;
    private matIconRegistry = inject(MatIconRegistry);
    private domSanitizer = inject(DomSanitizer);

    constructor() {
        this.matIconRegistry.addSvgIcon(
            'arrowRightUp',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.arrowIconPath)
        );
    }

    private _borderColor!: BorderColor;

    get borderColor(): BorderColor {
        return this._borderColor;
    }

    @Input({required: true})
    set borderColor(value: BorderColor) {
        this._borderColor = value;
    }

    get borderColorHex(): string {
        return BorderButtonComponent.BORDER_COLOR_MAP[this.borderColor].default;
    }

    get borderHoverColorHex(): string {
        return BorderButtonComponent.BORDER_COLOR_MAP[this.borderColor].hover;
    }
}
