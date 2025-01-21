import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface PreCampusProps {
    onEnrollClick?: () => void;
}

@Component({
    selector: 'pre-campus',
    templateUrl: './pre-campus.component.html',
    styleUrl: './pre-campus.component.scss',
    imports: [CommonModule],
})
export class PreCampusComponent {
    readonly iconPaths = {
        arrowDown: 'assets/icon/system/arrowDown.svg',
        preCampusImg: 'assets/home/preCampusImg.svg',
    } as const;
    onEnrollClick(): void {}
}
