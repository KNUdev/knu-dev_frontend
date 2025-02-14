import {LangChangeEvent, TranslateModule, TranslateService} from '@ngx-translate/core';
import {Component, inject} from '@angular/core';
import {I18nService} from '../../services/languages/i18n.service';
import {startWith, switchMap} from 'rxjs';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    selector: 'origins-and-founders',
    imports: [
        TranslateModule,
        MatIconModule
    ],
    templateUrl: './origins-and-founders.component.html',
    styleUrls: ['./origins-and-founders.component.scss'],
})

export class OriginsAndFoundersComponent {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    readonly iconPaths = {
        origins: 'assets/icon/system/origins.svg',
        founderAvatar: 'assets/home/founder-avatar.jpg',
        jointPhoto: 'assets/home/joint-photo.jpg',
    } as const;

    constructor() {
        this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/origins-and-founders',
                        event.lang
                    )
                )
            )
            .subscribe();

        this.registerOriginIcon();
    }

    private registerOriginIcon(): void {
        this.matIconRegistry.addSvgIcon(
            'origins',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.origins)
        );
    }

}

