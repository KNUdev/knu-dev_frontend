import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MultiLanguageField} from '../../../common/models/shared.model';
import {MultiLangFieldPipe} from '../../../common/pipes/multi-lang-field.pipe';

@Component({
    selector: 'learning-unit',
    templateUrl: './learning-unit-item.component.component.html',
    imports: [
        MultiLangFieldPipe
    ],
    styleUrls: ['./learning-unit-item.component.component.scss']
})
export class LearningUnitItem implements OnInit {
    @Input({required: true}) name!: MultiLanguageField;

    @Input({required: true}) orderIndex!: number;
    @Input({required: true}) isSelected!: boolean;

    /** Fires when user clicks the edit icon. */
    @Output() editClicked = new EventEmitter<void>();

    /** Fires when user clicks the delete icon. */
    @Output() deleteClicked = new EventEmitter<void>();

    ngOnInit(): void {
    }

    public onEditClick(): void {
        this.editClicked.emit();
    }

    public onDeleteClick(): void {
        this.deleteClicked.emit();
    }

}
