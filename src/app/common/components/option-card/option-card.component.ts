import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    Input,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { AnimationService } from '../../../services/animation.services';
import { CircularProgressComponent } from './circular-progress/circular-progress.component';

@Component({
    selector: 'option-card',
    imports: [CommonModule, CircularProgressComponent],
    templateUrl: './option-card.component.html',
    styleUrl: './option-card.component.scss',
})
export class OptionCard {
    @Input() title_highlight: string = '';
    @Input() title: string = '';
    @Input() color: string = '';
    @Input() targetProgress: number = 0;
    @Input() startOffset: number = 0;

    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    constructor(private animationService: AnimationService) {}

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }
}
