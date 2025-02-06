import { CommonModule } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../../../services/animation.services';

@Component({
    selector: 'team-button',
    templateUrl: './team-button.component.html',
    styleUrl: './team-button.component.scss',
    imports: [CommonModule, TranslateModule],
})
export class TeamButtonComponent {
    readonly iconPaths = {
        code: 'assets/icon/button/code.svg',
        teamBg: 'assets/home/teamBg.svg',
    } as const;

    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    constructor(private animationService: AnimationService) {}

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }
}
