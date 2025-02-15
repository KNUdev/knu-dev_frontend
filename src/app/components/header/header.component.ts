import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    HostListener,
    inject,
    OnDestroy,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import {
    map,
    Observable,
    startWith,
    Subject,
    switchMap,
    takeUntil,
} from 'rxjs';
import { NoFillButtonComponent } from '../../common/components/button/no-fill/nofill-button.component';
import { AccountProfileService } from '../../services/account-profile.service';
import { AuthService } from '../../services/auth.service';
import { AvatarService } from '../../services/avatar.service';
import { I18nService } from '../../services/languages/i18n.service';
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
    userid: string;
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
export class HeaderComponent implements OnDestroy {
    readonly isAuthenticated: any;
    readonly userInfo: any;
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
    private authService = inject(AuthService);
    private readonly userService = inject(AccountProfileService);
    private destroy$ = new Subject<void>();
    currentAvatarUrl = signal<string>('');

    constructor(private avatarService: AvatarService) {
        this.isAuthenticated = this.authService.isAuthenticated;
        this.userInfo = computed(() => this.authService.getUserInfo());

        this.authService.authStateChange$
            .pipe(takeUntil(this.destroy$))
            .subscribe((isAuthenticated) => {
                if (isAuthenticated) {
                    const userId = this.authService.getCurrentUserId();
                    if (userId) {
                        this.userService.getById(userId).subscribe({
                            next: (profile) => {
                                this.currentAvatarUrl.set(
                                    profile.avatarImageUrl
                                );
                                this.avatarService.updateAvatarUrl(
                                    profile.avatarImageUrl
                                );
                            },
                            error: (error) => {
                                console.error('Error fetching avatar:', error);
                                this.currentAvatarUrl.set(
                                    this.iconPaths.defaultAvatarPath
                                );
                            },
                        });
                    }
                } else {
                    this.currentAvatarUrl.set(this.iconPaths.defaultAvatarPath);
                    this.avatarService.updateAvatarUrl('');
                }
            });

        this.avatarService.currentAvatarUrl$
            .pipe(takeUntil(this.destroy$))
            .subscribe((url) => {
                if (url) {
                    this.currentAvatarUrl.set(url);
                } else {
                    this.currentAvatarUrl.set(this.iconPaths.defaultAvatarPath);
                }
            });

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
                this.translate.get(['header.menu.' + this.getUserRoles()[0]])
            )
        );

        this.menu$ = menuTranslations$.pipe(
            map(
                (translations) =>
                    translations['header.menu.' + this.getUserRoles()[0]] || []
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

    logout() {
        this.authService.logout();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
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

    private getUserRoles(): string[] {
        return this.authService.getUserInfo().roles;
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
}
