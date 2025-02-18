import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'learning-unit',
    templateUrl: './learning-unit-item.component.component.html',
    styleUrls: ['./learning-unit-item.component.component.scss']
})
export class LearningUnitItem implements OnInit {

    @Input({ required: true }) name!: string;

    @Output() editClicked = new EventEmitter<void>();
    @Output() deleteClicked = new EventEmitter<void>();

    ngOnInit(): void {}

    public onEditClick(): void {
        this.editClicked.emit();
    }

    public onDeleteClick(): void {
        this.deleteClicked.emit();
    }
}
