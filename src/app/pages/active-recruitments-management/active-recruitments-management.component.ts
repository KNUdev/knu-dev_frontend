import {LangChangeEvent, TranslateModule, TranslateService} from '@ngx-translate/core';
import {MatInputModule} from '@angular/material/input';
import {Component, inject} from '@angular/core';
import {I18nService} from 'src/app/services/languages/i18n.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {startWith, switchMap} from 'rxjs';

@Component({
    selector: 'active-recruitments-management',
    imports: [
        TranslateModule,
        MatInputModule,
        MatIcon
    ],
    templateUrl: './active-recruitments-management.component.html',
    styleUrls: ['./active-recruitments-management.component.scss'],
})

export class ActiveRecruitmentsManagementComponent {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    readonly iconPaths = {
        close: 'assets/icon/system/close.svg',
        arrowDown: 'assets/icon/system/arrowDown.svg',
    } as const;

    constructor() {
        this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/active-recruitments-management',
                        event.lang
                    )
                )
            )
            .subscribe();

        this.registerIcons();
    }

    private registerIcons(): void {

        this.matIconRegistry.addSvgIcon(
            'close',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.close)
        );

        this.matIconRegistry.addSvgIcon(
            'arrowDown',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.arrowDown)
        );
    }

}
