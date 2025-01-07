import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { map, Observable, startWith, switchMap } from 'rxjs';
import { I18nService } from '../../services/languages/i18n.service';
import { LanguageSwitcherService } from '../../services/languages/language-switcher.service';

const MENU_TRANSLATIONS = 'header.menu.items' as const;

type Menu = {
    name: string;
    link: string;
};

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [FormsModule, CommonModule, TranslateModule],
})
export class HeaderComponent {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private router = inject(Router);
    protected languageSwitcher = LanguageSwitcherService(this.translate);
    isOpenLang = false;
    isScrolled = false;
    isMobile = window.innerWidth < 1024;
    isMenuOpen = false;
    readonly logoFullPath = 'assets/logo/KNUDEVLogoFull.svg';
    readonly logoMiniPath = 'assets/logo/KNUDEVLogoMini.svg';
    readonly arrowDownPath = 'assets/icon/system/arrowDown.svg';
    readonly avatarNotFoundPath = 'assets/icon/avatarNotFound.svg';
    readonly menuIconPath = 'assets/icon/system/menu.svg';
    readonly closeIconPath = 'assets/icon/system/close.svg';

    menu$: Observable<Menu[]>;

    @HostListener('window:scroll', [])
    onWindowScroll() {
        const scrollPosition =
            window.scrollY || document.documentElement.scrollTop;
        this.isScrolled = scrollPosition > 50;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.language-selector')) {
            this.isOpenLang = false;
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.isMobile = window.innerWidth < 1440;
        if (!this.isMobile) {
            this.isMenuOpen = false;
        }
    }
    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
    }
    toggleDropdownLang() {
        this.isOpenLang = !this.isOpenLang;
    }

    selectLanguage(code: string) {
        this.languageSwitcher.switchLang(code as any);
        this.isOpenLang = false;
    }

    getCurrentLanguageFlag() {
        return this.languageSwitcher
            .supportedLanguages()
            .find((lang) => lang.code === this.languageSwitcher.currentLang())
            ?.imgMiniPath;
    }

    getCurrentLanguageName() {
        return this.languageSwitcher
            .supportedLanguages()
            .find((lang) => lang.code === this.languageSwitcher.currentLang())
            ?.name;
    }

    isAuthPage(): boolean {
        return this.router.url.includes('auth');
    }

    constructor() {
        const langChange$ = this.translate.onLangChange.pipe(
            startWith({ lang: this.translate.currentLang } as LangChangeEvent),
        );

        const loadTranslations$ = langChange$.pipe(
            switchMap((event) =>
                this.i18nService.loadComponentTranslations(
                    'header',
                    event.lang,
                ),
            ),
        );

        const menuTranslations$ = loadTranslations$.pipe(
            switchMap(() => this.translate.get([MENU_TRANSLATIONS])),
        );

        this.menu$ = menuTranslations$.pipe(
            map((translations) => translations[MENU_TRANSLATIONS] || []),
        );
    }
}
