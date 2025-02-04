import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    Input,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../../../services/animation.services';

@Component({
    selector: 'cta',
    imports: [CommonModule, MatIconModule, TranslateModule],
    templateUrl: './cta.component.html',
    styleUrl: './cta.component.scss',
})
export class Cta {
    @Input() color: string = '';
    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }
    constructor(private animationService: AnimationService) {}

    onEnrollClick(): void {}
}
