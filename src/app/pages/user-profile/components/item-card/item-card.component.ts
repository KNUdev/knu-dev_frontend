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
    styleUrls: ['./item-card.component.scss'],
})
export class ItemCardComponent {
    @Input() imageUrl: string = '';
    @Input() title: string = '';
    @Input() description: string = '';
    @Input() details: ItemDetail[] = [];
    @Input() buttonText: string = 'Action';
    @Input() buttonAriaLabel: string = '';
    @Input() showButton: boolean = true;
    @Input({required: true}) buttonColor!: BorderColor;
}
