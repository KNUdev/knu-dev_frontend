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
    selector: 'benefit-card',
    imports: [CommonModule, MatIconModule, TranslateModule],
    templateUrl: './benefit-card.component.html',
    styleUrl: './benefit-card.component.scss',
})
export class Benefit_card {
    @Input() icon: string = '';
    @Input() title: string = '';
    @Input() description: string = '';
    @Input() color: string = '';
    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    readonly iconPaths = {
        arrowDown: 'assets/icon/system/arrowDown.svg',
    } as const;

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }
    constructor(private animationService: AnimationService) {}
}
