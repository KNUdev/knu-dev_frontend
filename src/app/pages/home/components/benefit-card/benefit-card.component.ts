import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    inject,
    Input,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../../../services/animation.services';

@Component({
    selector: 'home-benefit-card',
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
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    readonly iconPaths = {
        arrowDown: 'assets/icon/system/arrowDown.svg',
    } as const;

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }
    constructor(private animationService: AnimationService) {
        this.matIconRegistry.addSvgIcon(
            'arrowDown',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowDown
            )
        );
    }

    toggleDetails(event: Event, details: HTMLDetailsElement) {
        event.preventDefault();
        details.open = !details.open;
    }
}
