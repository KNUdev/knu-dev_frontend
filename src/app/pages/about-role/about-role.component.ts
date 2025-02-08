import {Component, ElementRef, inject, QueryList, ViewChildren, ViewEncapsulation} from '@angular/core';
import { I18nService } from '../../services/languages/i18n.service';
import { LangChangeEvent, TranslateModule, TranslateService } from '@ngx-translate/core';
import { startWith, switchMap } from 'rxjs';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {RoleList} from '../../common/components/role-list/role-list.component';
import {AnimationService} from '../../services/animation.services';

@Component({
    selector: 'about-role',
    imports: [
        TranslateModule,
        MatIconModule,
        RoleList
    ],
    templateUrl: './about-role.component.html',
    styleUrls: ['./about-role.component.scss'],
})

export class AboutRoleComponent {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    readonly iconPaths = {
        arrowLeft: 'assets/icon/system/arrowLeft.svg',
        arrowRight: 'assets/icon/system/arrowRight.svg',
    } as const;

    constructor(private animationService: AnimationService) {
        this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/about-role',
                        event.lang
                    )
                )
            )
            .subscribe();

        this.registerIcons();
    }

    private registerIcons(): void {
        this.matIconRegistry.addSvgIcon(
            'arrowLeft',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.arrowLeft)
        );
        this.matIconRegistry.addSvgIcon(
            'arrowRight',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.arrowRight)
        );
    }

    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }

}
