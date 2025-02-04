import {Component, Input} from '@angular/core';
import {
    ArrowButtonComponent,
    BorderColor
} from '../../../../common/components/buttons/arrow-button/arrow-button.component';

export interface ItemDetail {
    label: string;
    value: string;
}

@Component({
    selector: 'profile-item-card',
    templateUrl: './item-card.component.html',
    imports: [
        ArrowButtonComponent
    ],
    styleUrls: ['./item-card.component.scss']
})
export class ItemCardComponent {
    @Input() imageUrl: string = '';

    @Input() title: string = '';

    // Description text (for projects)
    @Input() description: string = '';

    // Optional details (for education items, etc.)
    @Input() details: ItemDetail[] = [];

    // Button text to display
    @Input() buttonText: string = 'Action';

    // aria-label for the button
    @Input() buttonAriaLabel: string = '';

    // Control whether to show the button (for example, you may sometimes hide it)
    @Input() showButton: boolean = true;

    @Input({required: true}) buttonColor!: BorderColor;
}
