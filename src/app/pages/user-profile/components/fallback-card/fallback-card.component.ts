import {Component, Input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

@Component({
    selector: 'profile-fallback-card',
    templateUrl: './fallback-card.component.html',
    imports: [
        MatIcon
    ],
    styleUrls: ['./fallback-card.component.scss']
})
export class FallbackCardComponent {
    @Input({required: true}) fallbackText!: string;

    @Input({required: true}) fallbackIconName!: string;
}
