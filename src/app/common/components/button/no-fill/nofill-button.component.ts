// nofill-button.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-nofill-button',
    imports: [CommonModule, MatIconModule, RouterModule],
    templateUrl: './nofill-button.component.html',
    styleUrls: ['./nofill-button.component.scss'],
})
export class NoFillButtonComponent {
    @Input() text: string = '';
    @Input() icon?: string;
    @Input() route: string = '';
    @Input() disabled: boolean = false;
}
