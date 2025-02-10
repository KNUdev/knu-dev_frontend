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
import { MenuNav_dropdown } from './components/dropdown/menunav.component';
import { I18nService } from '../../services/languages/i18n.service';
import { LanguageSwitcherService } from '../../services/languages/language-switcher.service';
import {CommonModule} from '@angular/common';
import {Component, HostListener, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {LangChangeEvent, TranslateModule, TranslateService} from '@ngx-translate/core';
import {map, Observable, startWith, switchMap} from 'rxjs';
import {I18nService} from '../../services/languages/i18n.service';

const MENU_TRANSLATIONS = 'header.menu.items' as const;

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
    standalone: true,
    imports: [
        FormsModule,
        CommonModule,
        TranslateModule,
        RouterModule,
        MenuNav_dropdown,
        MatIconModule,
    ],
})
export class HeaderComponent {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private router = inject(Router);
    protected languageSwitcher = LanguageSwitcherService(this.translate);
    protected currentLanguage$ = this.i18nService.getCurrentLanguage();
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
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
    // protected currentLanguage$ = this.i18nService.getCurrentLanguage();

    constructor() {
        const langChange$ = this.translate.onLangChange.pipe(
            startWith({lang: this.translate.currentLang} as LangChangeEvent)
        );

        const menuTranslations$ = loadTranslations$.pipe(
            switchMap(() => this.translate.get([MENU_TRANSLATIONS]))
        );

        this.menu$ = menuTranslations$.pipe(
            map((translations) => translations[MENU_TRANSLATIONS] || [])
        );


        const loadTranslations$ = langChange$.pipe(
            switchMap((event) =>
                this.i18nService.loadComponentTranslations(
                    'components/header',
                    event.lang
                )
            )
        );

        this.menu$ = menuTranslations$.pipe(
            map(
                (translations) =>
                    translations['header.menu.' + this.userRole] || []
            )
        );

        this.matIconRegistry.addSvgIcon(
            'arrowDown',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowDown
            )
        );
    }
    userRole = 'noAuth';

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

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.language-selector')) {
            this.isOpenLang.set(false);
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.isMobile.set(window.innerWidth < 1440);
        if (!this.isMobile()) {
            this.isMenuOpen.set(false);
        }
    }

    toggleMenu() {
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

    dropdownName = 'menu_nav';

    navigationItems: Menu[] = [
        { name: 'Відкриті набори', link: '/open-sets' },
        { name: 'Закриті набори', link: '/closed-sets' },
    ];
}

