import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { I18nService } from '../i18n.service';
interface Department {
    name: string;
    link: string;
}
@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss',
    imports: [TranslateModule],
})
export class FooterComponent implements OnInit {
    institutes: Department[] = [];
    faculties: Department[] = [];
    constructor(
        private i18nService: I18nService,
        private translate: TranslateService
    ) {}

    ngOnInit() {
        this.loadTranslationsAndData();
        this.translate.onLangChange.subscribe(() => {
            this.loadTranslationsAndData();
        });
    }

    private loadTranslationsAndData() {
        this.i18nService
            .loadComponentTranslations('footer', this.translate.currentLang)
            .subscribe(() => {
                this.loadDepartments();
            });
    }

    private loadDepartments() {
        this.translate
            .get([
                'footer.departments.institutes.items',
                'footer.departments.faculties.items',
            ])
            .subscribe((translations) => {
                this.institutes =
                    translations['footer.departments.institutes.items'] || [];
                this.faculties =
                    translations['footer.departments.faculties.items'] || [];
            });
    }
    get logoPath(): string {
        return 'assets/footer/KNULogo.svg';
    }

    socialLinks: { name: string; link: string }[] = [
        { name: 'instagram', link: 'assets/social networks/inst.svg' },
        { name: 'telegram', link: 'assets/social networks/tg.svg' },
    ];
}
