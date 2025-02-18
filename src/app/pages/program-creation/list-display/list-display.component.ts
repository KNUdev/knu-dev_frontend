import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import {NgForOf, NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'app-list-display',
    templateUrl: './list-display.component.html',
    imports: [
        NgForOf,
        NgTemplateOutlet
    ],
    styleUrls: ['./list-display.component.scss']
})
export class ListDisplayComponent<T> {
    @Input() items: T[] = [];
    @Input() itemTemplate!: TemplateRef<any>;
    @Output() selected = new EventEmitter<T>();

    trackByFn(index: number, item: T): any {
        // Assumes each item has an 'id' property.
        return (item as any).id || index;
    }

    onSelect(item: T): void {
        this.selected.emit(item);
    }
}
