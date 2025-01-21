import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface CampusInfoProps {
    onEnrollClick: () => void;
}

@Component({
    selector: 'campus',
    templateUrl: './campus.component.html',
    styleUrl: './campus.component.scss',
    imports: [CommonModule],
})
export class CampusComponent {
    readonly iconPaths = {
        book: 'assets/icon/button/book.svg',
        certificate: 'assets/icon/button/certificate.svg',
        interview: 'assets/icon/button/interview.svg',
        longArrow: 'assets/icon/longArrow.svg',
        arrowDown: 'assets/icon/system/arrowDown.svg',
    } as const;

    onEnrollClick(): void {}
}
