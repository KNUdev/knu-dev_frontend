import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'team-button',
    templateUrl: './team-button.component.html',
    styleUrl: './team-button.component.scss',
    imports: [CommonModule],
})
export class TeamButtonComponent {
    readonly iconPaths = {
        code: 'assets/icon/button/code.svg',
        teamBg: 'assets/home/teamBg.svg',
    } as const;
}
