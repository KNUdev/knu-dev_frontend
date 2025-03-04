import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MultiLanguageField} from '../../../../common/models/shared.model';
import {MultiLangFieldPipe} from '../../../../common/pipes/multi-lang-field.pipe';

@Component({
    selector: 'learning-unit',
    templateUrl: './learning-unit-item.component.html',
    imports: [
        MultiLangFieldPipe
    ],
    standalone: true,
    styleUrls: ['./learning-unit-item.component.scss']
})
export class LearningUnitItem {
    @Input({required: true}) name!: MultiLanguageField;
    @Input({required: true}) orderIndex!: number;
    @Input({required: true}) isSelected!: boolean;
    @Output() editClicked = new EventEmitter<void>();
    @Output() deleteClicked = new EventEmitter<void>();

    public onEditClick(): void {
        this.editClicked.emit();
    }

    public onDeleteClick(): void {
        this.deleteClicked.emit();
    }

}
