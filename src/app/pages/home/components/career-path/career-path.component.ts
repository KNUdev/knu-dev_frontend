import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ArrowNext } from '../../../../../assets/icon/system/arrowNext';

@Component({
    selector: 'career-path',
    templateUrl: './career-path.component.html',
    styleUrl: './career-path.component.scss',
    imports: [CommonModule, MatIconModule],
})
export class CareerPathComponent {
    readonly roleColors = {
        intern: '#4264ed',
        developer: '#e5383a',
        premaster: '#3fcb49',
        master: '#9542ed',
        teamlead: '#edd342',
    } as const;

    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    constructor() {
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
                'master-teamlead',
                this.roleColors.master,
                this.roleColors.teamlead,
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
