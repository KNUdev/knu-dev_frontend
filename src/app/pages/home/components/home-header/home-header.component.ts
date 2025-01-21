import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ButtonProps {
    text: string;
    variant: 'primary' | 'secondary';
    onClick?: () => void;
}

@Component({
    selector: 'home-header',
    templateUrl: './home-header.component.html',
    styleUrl: './home-header.component.scss',
    imports: [CommonModule],
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
