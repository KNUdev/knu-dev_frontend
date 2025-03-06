import {Component, inject} from '@angular/core';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {LangChangeEvent, TranslateModule, TranslateService} from '@ngx-translate/core';
import {I18nService} from 'src/app/services/languages/i18n.service';
import {DomSanitizer} from '@angular/platform-browser';
import {startWith, switchMap} from 'rxjs';

@Component({
    selector: 'user-dashboard',
    imports: [
        TranslateModule,
        MatIconModule
    ],
    templateUrl: './user-dashboard.component.html',
    styleUrls: ['./user-dashboard.component.scss'],
})

export class UserDashboardComponent {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    readonly iconPaths = {
        arrowRightUp: 'assets/icon/system/arrowRightUp.svg',
        arrowDown: 'assets/icon/system/arrowDown.svg',
        testAvatar: 'assets/icon/profile/test-avatar.svg',
    } as const;

    constructor() {
        this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/user-dashboard',
                        event.lang
                    )
                )
            )
            .subscribe();

        this.registerIcons();
    }

    private registerIcons(): void {
        this.matIconRegistry.addSvgIcon(
            'arrowRightUp',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.arrowRightUp)
        );

        this.matIconRegistry.addSvgIcon(
            'arrowDown',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.arrowDown)
        );
        this.matIconRegistry.addSvgIcon(
            'testAvatar',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.testAvatar)
        );
    }
}
