import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RoleList } from '../../../../common/components/role-list/role-list.component';
import { AnimationService } from '../../../../services/animation.services';

@Component({
    selector: 'home-career-path',
    templateUrl: './career-path.component.html',
    styleUrl: './career-path.component.scss',
    imports: [CommonModule, TranslateModule, RoleList],
})
export class CareerPathComponent {
    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    constructor(private animationService: AnimationService) {}

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }
}
