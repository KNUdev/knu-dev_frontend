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
    selector: 'app-join-organization',
    imports: [CommonModule, MatIconModule, TranslateModule],
    templateUrl: './join-organization.component.html',
    styleUrl: './join-organization.component.scss',
})
export class Join_organization {
    @Input() color: string = '';
    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }
    constructor(private animationService: AnimationService) {}

    onEnrollClick(): void {}
}
