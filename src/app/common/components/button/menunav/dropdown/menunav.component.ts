import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    HostListener,
    inject,
    Input,
} from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface MenuItem {
    name: string;
    link: string;
}

@Component({
    selector: 'app-menunav-dropdown',
    imports: [CommonModule, MatIconModule, TranslateModule, RouterModule],
    templateUrl: './menunav.component.html',
    styleUrl: './menunav.component.scss',
})
export class MenuNav_dropdown {
    @Input() label = '';
    @Input() items: MenuItem[] = [];
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    private elementRef = inject(ElementRef);

    readonly iconPaths = {
        arrowDown: 'assets/icon/system/arrowDown.svg',
    } as const;

    isOpen = false;

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen = false;
        }
    }

    toggleDropdown(event?: MouseEvent): void {
        if (event) {
            event.stopPropagation();
        }
        this.isOpen = !this.isOpen;
    }

    selectItem(item: MenuItem): void {
        console.log('Selected:', item);
        this.isOpen = false;
    }

    constructor() {
        this.matIconRegistry.addSvgIcon(
            'arrowDown',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowDown
            )
        );
    }
}
