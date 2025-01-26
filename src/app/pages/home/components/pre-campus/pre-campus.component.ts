import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CircularProgressComponent } from '../campus/circular-progress/circular-progress.component';

@Component({
    selector: 'pre-campus',
    templateUrl: './pre-campus.component.html',
    styleUrl: './pre-campus.component.scss',
    imports: [
        CommonModule,
        CircularProgressComponent,
        MatIconModule,
        TranslateModule,
    ],
})
export class PreCampusComponent {
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    readonly iconPaths = {
        arrowDown: 'assets/icon/system/arrowDown.svg',
        preCampusImg: 'assets/home/preCampusImg.svg',
        education: 'assets/icon/system/education.svg',
        consult: 'assets/icon/button/consult.svg',
        work: 'assets/icon/button/work.svg',
        presentation: 'assets/icon/button/presentation.svg',
        study: 'assets/icon/button/study.svg',
    } as const;

    constructor() {
        this.matIconRegistry.addSvgIcon(
            'education',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.education
            )
        );
        this.matIconRegistry.addSvgIcon(
            'consult',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.consult
            )
        );
        this.matIconRegistry.addSvgIcon(
            'work',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.work
            )
        );
        this.matIconRegistry.addSvgIcon(
            'presentation',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.presentation
            )
        );
        this.matIconRegistry.addSvgIcon(
            'study',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.study
            )
        );
    }
    onEnrollClick(): void {}
}
