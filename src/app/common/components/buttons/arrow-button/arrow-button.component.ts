import {Component, inject, input, Input} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgClass, NgStyle } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

export type BorderColor = 'red' | 'yellow' | 'green' | 'purple';

@Component({
    selector: 'arrow-button',
    templateUrl: './arrow-button.component.html',
    imports: [
        MatIcon,
        NgClass,
        NgStyle
    ],
    styleUrls: ['./arrow-button.component.scss']
})
export class ArrowButtonComponent {
    private readonly arrowIconPath = 'assets/icon/system/arrowRightUp.svg' as const;
    private matIconRegistry = inject(MatIconRegistry);
    private domSanitizer = inject(DomSanitizer);

    constructor() {
        this.matIconRegistry.addSvgIcon(
            'arrowRightUp',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.arrowIconPath)
        );
    }

    // Text to display inside the button
    @Input({required: true}) text!: string;

    // Aria-label for accessibility
    @Input() ariaLabel: string = '';

    // Determines if the button should span full width
    @Input() fullWidth: boolean = false;

    // Button type attribute (e.g., "button", "submit")
    @Input() type: string = 'button';

    // Use an input setter for borderColor so you can perform validation or transformation if needed.
    private _borderColor!: BorderColor;
    @Input({ required: true })
    set borderColor(value: BorderColor) {
        this._borderColor = value;
    }
    get borderColor(): BorderColor {
        return this._borderColor;
    }

    private static readonly BORDER_COLOR_MAP: Record<BorderColor, { default: string; hover: string }> = {
        red:    { default: '#E5383A', hover: '#301616' },
        yellow: { default: '#edd342', hover: '#3C371A' },
        // blue:   { default: '#0000ff', hover: '#4d4dff' },
        green:  { default: '#3FCB49', hover: '#223E1F' },
        purple: { default: '#9542ED', hover: '#2F124E' }
    };

    get borderColorHex(): string {
        return ArrowButtonComponent.BORDER_COLOR_MAP[this.borderColor].default;
    }

    get borderHoverColorHex(): string {
        return ArrowButtonComponent.BORDER_COLOR_MAP[this.borderColor].hover;
    }
}
