import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { NoFillButtonComponent } from '../../common/components/button/no-fill/nofill-button.component';
import { I18nService } from '../../services/languages/i18n.service';
import { AuthService } from '../../services/login.service';
import { MenuNav_dropdown } from './components/dropdown/menunav.component';

interface Menu {
    name: string;
    link?: string;
    dropdown?: {
        name: string;
        link: string;
    }[];
}

interface JwtPayload {
    iat: string;
    sub: string; // email или имя пользователя
    roles: string[];
    // ...допустимые поля из токена
}

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    standalone: true,
    imports: [
        FormsModule,
        CommonModule,
        TranslateModule,
        RouterModule,
        MenuNav_dropdown,
        MatIconModule,
        NoFillButtonComponent,
    ],
})
export class HeaderComponent {
    isOpenLang = signal<boolean>(false);
    isScrolled = signal<boolean>(false);
    isMobile = signal<boolean>(window.innerWidth < 1440);
    isMenuOpen = signal<boolean>(false);
    readonly iconPaths = {
        logoFullPath: 'assets/logo/KNUDEVLogoFull.svg',
        logoMiniPath: 'assets/logo/KNUDEVLogoMini.svg',
        arrowDown: 'assets/icon/system/arrowDown.svg',
        defaultAvatarPath: 'assets/icon/defaultAvatar.svg',
        menuIconPath: 'assets/icon/system/menu.svg',
        closeIconPath: 'assets/icon/system/close.svg',
    } as const;
    menu$: Observable<Menu[]>;
    public i18nService = inject(I18nService);
    protected currentLanguage$ = this.i18nService.getCurrentLanguage();
    private translate = inject(TranslateService);
    private router = inject(Router);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    public authService = inject(AuthService);

    public userEmail = signal<string>('');
    public userRoles = signal<string[]>(['noAuth']);
    public userId = signal<string>('');

    logout() {
        this.authService.logout();
    }

    constructor() {
        const token = this.getCookie('accessToken');
        if (token) {
            const payload = this.decodeJwt(token);
            if (payload) {
                this.userId.set(payload.iat);
                this.userEmail.set(payload.sub);
                this.userRoles.set(payload.roles); // Now accepts string[]
            }
        }

        console.log(this.userRoles()[0]);

        const langChange$ = this.translate.onLangChange.pipe(
            startWith({ lang: this.translate.currentLang } as LangChangeEvent)
        );

        const loadTranslations$ = langChange$.pipe(
            switchMap((event) =>
                this.i18nService.loadComponentTranslations(
                    'components/header',
                    event.lang
                )
            )
        );

        const menuTranslations$ = loadTranslations$.pipe(
            switchMap(() =>
                this.translate.get(['header.menu.' + this.userRoles()[0]])
            )
        );

        this.menu$ = menuTranslations$.pipe(
            map(
                (translations) =>
                    translations['header.menu.' + this.userRoles()[0]] || []
            )
        );

        this.matIconRegistry.addSvgIcon(
            'arrowDown',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowDown
            )
        );

        this.matIconRegistry.addSvgIcon(
            'closeMenu',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.closeIconPath
            )
        );
        this.matIconRegistry.addSvgIcon(
            'openMenu',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.menuIconPath
            )
        );
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        const scrollPosition =
            window.scrollY || document.documentElement.scrollTop;
        const currentState = this.isScrolled();

        if (!currentState && scrollPosition > 110) {
            this.isScrolled.set(true);
        } else if (currentState && scrollPosition < 40) {
            this.isScrolled.set(false);
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.isMobile.set(window.innerWidth < 1440);
        if (!this.isMobile()) {
            this.isMenuOpen.set(false);
        }
    }

    toggleMenu(event?: MouseEvent) {
        if (event) {
            event.stopPropagation();
        }
        this.isMenuOpen.update((value) => !value);
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;

        if (this.isMobile()) {
            const isMenuLink = target.closest(
                'a:not(.language-selector *, .dropdown-menu *)'
            );

            if (isMenuLink) {
                this.isMenuOpen.set(false);
                return;
            }

            if (!target.closest('.header')) {
                this.isMenuOpen.set(false);
            }
        }
    }

    toggleDropdownLang() {
        this.isOpenLang.update((value) => !value);
    }

    selectLanguage(code: string) {
        this.i18nService.switchLang(code as any);
        this.isOpenLang.set(false);
    }

    isAuthPage(): boolean {
        return this.router.url.includes('auth');
    }

    isHomePage(): boolean {
        return this.router.url === '/';
    }

    getLogo(): string {
        if (this.isAuthPage()) {
            return this.iconPaths.logoFullPath;
        }

        if (this.isHomePage()) {
            return this.isScrolled()
                ? this.iconPaths.logoMiniPath
                : this.iconPaths.logoFullPath;
        }

        return this.iconPaths.logoMiniPath;
    }

    private getCookie(name: string): string | null {
        const matches = document.cookie.match(
            new RegExp(
                '(?:^|; )' +
                    name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
                    '=([^;]*)'
            )
        );
        return matches ? decodeURIComponent(matches[1]) : null;
    }

    private decodeJwt(token: string): JwtPayload | null {
        try {
            const payloadPart = token.split('.')[1];
            const decoded = atob(payloadPart);
            return JSON.parse(decoded);
        } catch (e) {
            console.error('Не удалось декодировать токен:', e);
            return null;
        }
    }
}
