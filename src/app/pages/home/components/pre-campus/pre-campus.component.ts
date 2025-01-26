import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CircularProgressComponent } from '../campus/circular-progress/circular-progress.component';

@Component({
    selector: 'pre-campus',
    templateUrl: './pre-campus.component.html',
    styleUrl: './pre-campus.component.scss',
    imports: [CommonModule, CircularProgressComponent],
})
export class PreCampusComponent {
    readonly iconPaths = {
        arrowDown: 'assets/icon/system/arrowDown.svg',
        preCampusImg: 'assets/home/preCampusImg.svg',
    } as const;
    onEnrollClick(): void {}
}
