import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    HostListener,
    inject,
    Input,
    signal,
} from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { AuthService } from '../../../../../services/user/auth.service';

interface MenuItem {
    name: string;
    link: string;
}

@Component({
    selector: 'header-avatar-dropdown',
    imports: [CommonModule, MatIconModule, TranslateModule, RouterModule],
    templateUrl: './avatar.component.html',
    styleUrl: './avatar.component.scss',
})
export class Avatar_dropdown {
    @Input() avatar = '';
    @Input() userId = '';
    private elementRef = inject(ElementRef);
    private authService = inject(AuthService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    readonly iconPaths = {
        user: 'assets/icon/system/user.svg',
        log_out: 'assets/icon/system/log_out.svg',
        settings: 'assets/icon/system/settings.svg',
    } as const;

    isOpen = signal<boolean>(false);

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
        }
    }

    constructor(private router: Router) {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                this.isOpen.set(false);
            });
        this.registerIcons();
    }

    private registerIcons(): void {
        Object.entries(this.iconPaths).forEach(([name, path]) => {
            this.matIconRegistry.addSvgIcon(
                name,
                this.domSanitizer.bypassSecurityTrustResourceUrl(path)
            );
        });
    }

    toggleDropdown(event?: MouseEvent): void {
        if (event) {
            event.stopPropagation();
        }
        this.isOpen.update((current) => !current);
    }

    selectItem(item: MenuItem): void {
        console.log('Selected:', item);
        this.isOpen.set(false);
    }

    logout() {
        this.authService.logout();
    }
}
