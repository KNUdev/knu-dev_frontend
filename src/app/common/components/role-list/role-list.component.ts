import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    inject,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ArrowNext } from '../../../../assets/icon/system/arrowNext';
import { AnimationService } from '../../../services/animation.services';

@Component({
    selector: 'app-role-list',
    imports: [CommonModule, MatIconModule, TranslateModule],
    templateUrl: './role-list.component.html',
    styleUrl: './role-list.component.scss',
})
export class RoleList {
    readonly roleColors = {
        intern: '#4264ed',
        developer: '#e5383a',
        premaster: '#3fcb49',
        master: '#9542ed',
        techlead: '#edd342',
    } as const;

    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }
    constructor(private animationService: AnimationService) {
        this.registerArrowIcons();
    }

    private registerArrowIcons() {
        const paths = [
            [
                'intern-developer',
                this.roleColors.intern,
                this.roleColors.developer,
            ],
            [
                'developer-premaster',
                this.roleColors.developer,
                this.roleColors.premaster,
            ],
            [
                'premaster-master',
                this.roleColors.premaster,
                this.roleColors.master,
            ],
            [
                'master-techlead',
                this.roleColors.master,
                this.roleColors.techlead,
            ],
        ];

        paths.forEach(([name, startColor, endColor]) => {
            const svg = ArrowNext(name, startColor, endColor);
            this.matIconRegistry.addSvgIconLiteral(
                name,
                this.domSanitizer.bypassSecurityTrustHtml(svg)
            );
        });
    }
}
