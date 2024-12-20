import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { I18nService } from '../i18n.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    imports: [TranslateModule],
})
export class FooterComponent implements OnInit {
    institutes: any[] = [];
    faculties: any[] = [];
    constructor(
        private i18nService: I18nService,
        private translate: TranslateService
    ) {}

    ngOnInit() {
        this.i18nService
            .loadComponentTranslations('footer', this.translate.currentLang)
            .subscribe();
        this.translate.onLangChange.subscribe((event) => {
            this.i18nService
                .loadComponentTranslations('footer', event.lang)
                .subscribe();
        });

        this.institutes = this.translate.instant(
            'footer.departments.institutes.items'
        );
        this.faculties = this.translate.instant(
            'footer.departments.faculties.items'
        );
    }
    get logoPath(): string {
        return 'assets/footer/KNULogo.svg';
    }

    socialLinks: { name: string; link: string }[] = [
        { name: 'instagram', link: 'assets/social networks/inst.svg' },
        { name: 'telegram', link: 'assets/social networks/tg.svg' },
    ];
}
