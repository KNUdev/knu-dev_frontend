import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'button-yellow',
    templateUrl: './button-yellow.component.html',
    styleUrls: ['./button-yellow.component.scss'],
    standalone: true
})
export class ButtonYellowComponent {
    // Text to display inside the button
    @Input({ required: true }) text!: string;

    // Aria-label for accessibility
    @Input() ariaLabel: string = '';

    // Determines if the button should span full width
    @Input() fullWidth: boolean = false;

    // Button type attribute (e.g., "button", "submit")
    @Input() type: string = 'button';

    // Output event that emits when the button is clicked
    @Output() buttonClick = new EventEmitter<Event>();

    onClick(event: Event): void {
        event.stopPropagation(); // Prevent the event from bubbling up
        this.buttonClick.emit(event);
    }
}
