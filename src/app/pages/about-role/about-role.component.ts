import {
    AfterViewInit,
    Component,
    ElementRef,
    inject,
    OnInit,
    QueryList,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { startWith, switchMap } from 'rxjs';
import { RoleList } from '../../common/components/role-list/role-list.component';
import { AnimationService } from '../../services/animation.services';
import { I18nService } from '../../services/languages/i18n.service';
import { TechnicalRole } from '../../services/user/user.model';
import { LetterByLetterDirective } from './typing.directive';

@Component({
    selector: 'about-role',
    imports: [
        TranslateModule,
        MatIconModule,
        RoleList,
        LetterByLetterDirective,
    ],
    templateUrl: './about-role.component.html',
    styleUrls: ['./about-role.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AboutRoleComponent implements OnInit, AfterViewInit {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    public roleFromUrl!: string;

    readonly iconPaths = {
        arrowLeft: 'assets/icon/system/arrowLeft.svg',
        arrowRight: 'assets/icon/system/arrowRight.svg',
    } as const;

    constructor(
        private animationService: AnimationService,
        private route: ActivatedRoute,
        private router: Router
    ) {
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

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const roleFromUrl = params['role'];

            if (
                roleFromUrl &&
                Object.values(TechnicalRole).includes(roleFromUrl)
            ) {
                this.roleFromUrl = roleFromUrl; // assign the value here
            } else {
                // set default value and navigate if needed
                this.router.navigate(['/about-role'], {
                    queryParams: { role: 'INTERN' },
                });
                this.roleFromUrl = 'INTERN';
            }
        });
    }

    private registerIcons(): void {
        this.matIconRegistry.addSvgIcon(
            'arrowLeft',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowLeft
            )
        );
        this.matIconRegistry.addSvgIcon(
            'arrowRight',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowRight
            )
        );
    }

    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }
}
