import {Component, Input} from '@angular/core';
import {
    ArrowButtonComponent,
    BorderColor
} from '../../../../common/components/buttons/arrow-button/arrow-button.component';
import {MultiLanguageField} from '../../../../common/models/shared.model';
import {MultiLangFieldPipe} from '../../../../common/pipes/multi-lang-field.pipe';

export interface ItemDetail {
    label: string;
    value: string;
}

@Component({
    selector: 'profile-item-card',
    templateUrl: './item-card.component.html',
    imports: [
        ArrowButtonComponent,
        MultiLangFieldPipe
    ],
    styleUrls: ['./item-card.component.scss'],
})
export class ItemCardComponent {
    @Input() banner: string = '';
    @Input({required: true}) title!: MultiLanguageField;
    @Input() description: MultiLanguageField = {};
    @Input() details: ItemDetail[] = [];
    @Input({required: true}) buttonText!: string;
    @Input() buttonAriaLabel: string = '';
    @Input() showButton: boolean = true;
    @Input({required: true}) buttonColor!: BorderColor;
}
