import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    HostListener,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../../../services/animation.services';

@Component({
    selector: 'home-header',
    templateUrl: './home-header.component.html',
    styleUrl: './home-header.component.scss',
    imports: [CommonModule, TranslateModule],
})
export class HomeHeaderComponent {
    readonly iconPaths = {
        bgHeader: 'assets/home/bgHeader.svg',
    } as const;

    onJoinCampus(): void {
        console.log('Join campus clicked');
    }

    onJoinPreCampus(): void {
        console.log('Join pre-campus clicked');
    }

    currentWidth: number = window.innerWidth;

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.currentWidth = window.innerWidth;
    }

    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    constructor(private animationService: AnimationService) {}

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }
}
