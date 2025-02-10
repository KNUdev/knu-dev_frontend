import {Component, Input} from '@angular/core';
import {MultiLanguageField} from '../../../../common/models/shared.model';
import {
    BorderButtonComponent,
    BorderColor
} from '../../../../common/components/button/arrow-button/border-button.component';
import {MultiLangFieldPipe} from '../../../../common/pipes/multi-lang-field.pipe';

export interface ItemDetail {
    label: string;
    value: string;
}

@Component({
    selector: 'profile-item-card',
    templateUrl: './item-card.component.html',
    imports: [
        MultiLangFieldPipe,
        BorderButtonComponent,
    ],
    styleUrls: ['./item-card.component.scss'],
    standalone: true
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
