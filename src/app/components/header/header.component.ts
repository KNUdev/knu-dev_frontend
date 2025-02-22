import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    HostListener,
    inject,
    OnDestroy,
    QueryList,
    signal,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
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
import { I18nService } from '../../services/languages/i18n.service';
import { AccountProfileService } from '../../services/user/account-profile.service';
import { AuthService } from '../../services/user/auth.service';
import { UserStateService } from '../../services/user/user-state.service';
import { Avatar_dropdown } from './components/dropdown/avatar/avatar.component';
import { MenuNav_dropdown } from './components/dropdown/menunav/menunav.component';

interface Menu {
    name: string;
    link?: string;
    dropdown?: {
        name: string;
        link: string;
    }[];
}

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [
        FormsModule,
        CommonModule,
        TranslateModule,
        RouterModule,
        MenuNav_dropdown,
        MatIconModule,
        NoFillButtonComponent,
        Avatar_dropdown,
    ],
    encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnDestroy {
    technicalRoles = ['INTERN', 'DEVELOPER', 'PREMASTER', 'MASTER', 'TECHLEAD'];
    private readonly userState: UserStateService = inject(UserStateService);

    readonly user = computed(() => this.userState.currentUser);
    readonly isAuthenticated = computed(() => this.userState.isAuthenticated);
    readonly userProfile = computed(() => this.userState.userProfile);

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
        key: 'assets/icon/system/key.svg',
    } as const;
    menu$!: Observable<Menu[]>;
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

    private readonly BREAKPOINT = 1440;
    private readonly SCROLL_THRESHOLDS = {
        SHOW: 110,
        HIDE: 40,
    } as const;

    readonly technicalRole = computed(() => this.userState.getTechnicalRole());
    readonly administrativeRole = computed(() =>
        this.userState.getAdministrativeRole()
    );

    getUserTechnicalRole(): string {
        return this.technicalRole();
    }

    getUserAdministrativeRole(): string {
        return this.administrativeRole();
    }

    getTechnicalRoleColor(role: string): string {
        return this.userState.getTechnicalRoleColor(role);
    }

    constructor() {
        this.initializeUserProfile();
        this.initializeMenuTranslations();
        this.registerIcons();
        this.setupNavigationHandler();
    }

    private setupNavigationHandler(): void {
        this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.closeAllMenus();
            }
        });
    }

    private closeAllMenus(): void {
        this.isOpenLang.set(false);
        this.isMenuOpen.set(false);
        if (this.menuNavDropdowns) {
            this.menuNavDropdowns.forEach((dropdown) =>
                dropdown.isOpen.set(false)
            );
        }
        if (this.avatarDropdowns) {
            this.avatarDropdowns.forEach((dropdown) =>
                dropdown.isOpen.set(false)
            );
        }
    }

    @ViewChildren(MenuNav_dropdown)
    menuNavDropdowns?: QueryList<MenuNav_dropdown>;
    @ViewChildren(Avatar_dropdown) avatarDropdowns?: QueryList<Avatar_dropdown>;

    private initializeUserProfile(): void {
        if (this.isAuthenticated()) {
            const userId = this.user().id;
            if (userId) {
                this.userService
                    .getById(userId)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (profile) => {
                            this.userState.updateState({ profile });
                        },
                        error: (error) => {
                            console.error('Error fetching profile:', error);
                        },
                    });
            }
        }
    }

    @HostListener('window:scroll')
    onWindowScroll() {
        const scrollPosition =
            window.scrollY || document.documentElement.scrollTop;
        const shouldBeScrolled =
            (!this.isScrolled() &&
                scrollPosition > this.SCROLL_THRESHOLDS.SHOW) ||
            (this.isScrolled() && scrollPosition < this.SCROLL_THRESHOLDS.HIDE);

        if (shouldBeScrolled) {
            this.isScrolled.update((current) => !current);
        }
    }

    @HostListener('window:resize')
    onResize() {
        const isMobile = window.innerWidth < this.BREAKPOINT;
        this.isMobile.set(isMobile);
        if (!isMobile) this.isMenuOpen.set(false);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;

        if (!target.closest('.language-selector, .dropdown-menu')) {
            this.isOpenLang.set(false);
        }

        if (this.isMobile()) {
            if (!target.closest('.header')) {
                this.isMenuOpen.set(false);
            }
        }
    }

    toggleMenu(event?: MouseEvent) {
        if (event) {
            event.stopPropagation();
        }
        this.isMenuOpen.update((value) => !value);
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

    private initializeMenuTranslations() {
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
    }

    private registerIcons() {
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

        this.matIconRegistry.addSvgIcon(
            'key',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.key)
        );
    }
}
