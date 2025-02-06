import {CommonModule} from '@angular/common';
import {Component, HostListener, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {LangChangeEvent, TranslateModule, TranslateService} from '@ngx-translate/core';
import {map, Observable, startWith, switchMap} from 'rxjs';
import {I18nService} from '../../services/languages/i18n.service';

const MENU_TRANSLATIONS = 'header.menu.items' as const;

type Menu = {
    name: string;
    link: string;
};

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [FormsModule, CommonModule, TranslateModule, RouterModule],
    standalone: true,
})
export class HeaderComponent {
    isOpenLang = signal<boolean>(false);
    isScrolled = signal<boolean>(false);
    isMobile = signal<boolean>(window.innerWidth < 1440);
    isMenuOpen = signal<boolean>(false);

    readonly logoFullPath = 'assets/logo/KNUDEVLogoFull.svg';
    readonly logoMiniPath = 'assets/logo/KNUDEVLogoMini.svg';
    readonly arrowDownPath = 'assets/icon/system/arrowDown.svg';
    readonly defaultAvatarPath = 'assets/icon/defaultAvatar.svg';
    readonly menuIconPath = 'assets/icon/system/menu.svg';
    readonly closeIconPath = 'assets/icon/system/close.svg';
    menu$: Observable<Menu[]>;
    protected i18nService = inject(I18nService);
    protected currentLanguage$ = this.i18nService.getCurrentLanguage();
    private translate = inject(TranslateService);
    private router = inject(Router);

    constructor() {
        const langChange$ = this.translate.onLangChange.pipe(
            startWith({lang: this.translate.currentLang} as LangChangeEvent)
        );

        const loadTranslations$ = langChange$.pipe(
            switchMap((event) =>
                this.i18nService.loadComponentTranslations('components/header', event.lang)
            )
        );

        const menuTranslations$ = loadTranslations$.pipe(
            switchMap(() => this.translate.get([MENU_TRANSLATIONS]))
        );

        this.menu$ = menuTranslations$.pipe(
            map((translations) => translations[MENU_TRANSLATIONS] || [])
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
}

