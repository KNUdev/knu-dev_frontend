import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { CircularProgressComponent } from './circular-progress/circular-progress.component';

@Component({
    selector: 'campus',
    templateUrl: './campus.component.html',
    styleUrl: './campus.component.scss',
    imports: [CommonModule, MatIcon, CircularProgressComponent],
})
export class CampusComponent {
    readonly iconPaths = {
        book: 'assets/icon/button/book.svg',
        certificate: 'assets/icon/button/certificate.svg',
        interview: 'assets/icon/button/interview.svg',
        arrowLong: 'assets/icon/system/arrowLong.svg',
        arrowDown: 'assets/icon/system/arrowDown.svg',
    } as const;
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    constructor() {
        this.matIconRegistry.addSvgIcon(
            'book',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.book
            )
        );

        this.matIconRegistry.addSvgIcon(
            'certificate',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.certificate
            )
        );
        this.matIconRegistry.addSvgIcon(
            'interview',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.interview
            )
        );

        this.matIconRegistry.addSvgIcon(
            'arrowLong',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowLong
            )
        );
    }

    onEnrollClick(): void {}
}
