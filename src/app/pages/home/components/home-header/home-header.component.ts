import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'home-header',
    templateUrl: './home-header.component.html',
    styleUrl: './home-header.component.scss',
    imports: [CommonModule, TranslateModule],
})
export class HomeHeaderComponent {
    readonly iconPaths = {
        bgHeader: 'assets/home/bgHeader.svg',
    } as const;

    onJoinCampus(): void {
        console.log('Join campus clicked');
    }

    onJoinPreCampus(): void {
        console.log('Join pre-campus clicked');
    }
}
