import {Component, Input} from '@angular/core';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {NgStyle} from '@angular/common';
import {DomSanitizer} from '@angular/platform-browser';
import {RouterLink} from '@angular/router';

export type BorderColor = 'red' | 'yellow' | 'green' | 'purple';

@Component({
    selector: 'app-border-button',
    templateUrl: './border-button.component.html',
    imports: [
        MatIcon,
        NgStyle,
        RouterLink
    ],
    standalone: true,
    styleUrls: ['./border-button.component.scss']
})

export class BorderButtonComponent {
    private static readonly BORDER_COLOR_MAP: Record<
        BorderColor,
        { default: string; hover: string }
    > = {
        red: {default: '#E5383A', hover: '#301616'},
        yellow: {default: '#edd342', hover: '#3C371A'},
        green: {default: '#3FCB49', hover: '#223E1F'},
        purple: {default: '#9542ED', hover: '#2F124E'},
    };
    @Input() href?: string;
    @Input({required: true}) text!: string;
    @Input() ariaLabel: string = '';
    @Input() fullWidth: boolean = false;
    @Input() type: string = 'button';
    @Input() iconPresent: boolean = true;
    @Input() isDisabled: boolean = false;
    private readonly arrowIconPath = 'assets/icon/system/arrowRightUp.svg' as const;

    constructor(
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer
    ) {
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
