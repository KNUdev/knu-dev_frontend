import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';

@Component({
    selector: 'campus',
    templateUrl: './campus.component.html',
    styleUrl: './campus.component.scss',
    imports: [CommonModule, MatIcon],
})
export class CampusComponent {
    readonly iconPaths = {
        book: 'assets/icon/button/book.svg',
        certificate: 'assets/icon/button/certificate.svg',
        interview: 'assets/icon/button/interview.svg',
        longArrow: 'assets/icon/longArrow.svg',
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
    }

    onEnrollClick(): void {}
}
