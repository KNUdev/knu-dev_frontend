import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChildren,
    ViewEncapsulation,
} from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
    LangChangeEvent,
    TranslateModule,
    TranslateService,
} from '@ngx-translate/core';
import { filter, startWith, Subscription, switchMap } from 'rxjs';
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
        CommonModule,
    ],
    templateUrl: './about-role.component.html',
    styleUrls: ['./about-role.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class AboutRoleComponent implements OnInit, AfterViewInit, OnDestroy {
    private i18nService = inject(I18nService);
    private translate = inject(TranslateService);
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    public role!: string;
    public nextRole?: string;
    public prevRole?: string;
    public isAnimating = false;
    public swipeDirection: 'left' | 'right' | null = null;
    public pendingRole: string | null = null;
    public activeContainer: 'primary' | 'secondary' = 'primary';
    private routeSub?: Subscription;
    private navigationSub?: Subscription;
    private isInitialLoad = true;
    private urlUpdateInProgress = false;
    private animationTimeout?: number;
    private resetStateTimeout?: number;
    private urlUpdateTimeout?: number;

    readonly iconPaths = {
        arrowLeft: 'assets/icon/system/arrowLeft.svg',
        arrowRight: 'assets/icon/system/arrowRight.svg',
    } as const;

    private get availableRoles(): string[] {
        return Object.values(TechnicalRole).filter((role) => role !== 'NONE');
    }

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

        this.navigationSub = this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                this.urlUpdateInProgress = false;
            });
    }

    private completeRoleTransition(): void {
        if (!this.pendingRole) return;
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }
        if (this.resetStateTimeout) {
            clearTimeout(this.resetStateTimeout);
        }
        if (this.urlUpdateTimeout) {
            clearTimeout(this.urlUpdateTimeout);
        }

        this.urlUpdateInProgress = true;
        const url = this.router
            .createUrlTree(['/about-role'], {
                queryParams: { role: this.pendingRole },
            })
            .toString();
        window.history.replaceState({}, '', url);

        this.role = this.pendingRole!;
        this.updateAdjacentRoles();

        this.animationTimeout = window.setTimeout(() => {
            this.activeContainer =
                this.activeContainer === 'primary' ? 'secondary' : 'primary';

            this.resetStateTimeout = window.setTimeout(() => {
                this.isAnimating = false;
                this.pendingRole = null;
                this.swipeDirection = null;

                this.urlUpdateTimeout = window.setTimeout(() => {
                    this.urlUpdateInProgress = false;
                }, 50);
            }, 50);
        }, 500);
    }

    ngOnInit(): void {
        this.routeSub = this.route.queryParams.subscribe((params) => {
            if (this.isAnimating || this.urlUpdateInProgress) {
                return;
            }

            const roleParam = params['role'];

            if (roleParam === this.role) {
                return;
            }

            if (roleParam && this.availableRoles.includes(roleParam)) {
                if (this.isInitialLoad) {
                    this.role = roleParam;
                    this.updateAdjacentRoles();
                } else {
                    const currentIndex = this.availableRoles.indexOf(
                        this.role || ''
                    );
                    const newIndex = this.availableRoles.indexOf(roleParam);

                    if (currentIndex !== -1 && newIndex !== -1) {
                        this.pendingRole = roleParam;
                        this.swipeDirection =
                            newIndex > currentIndex ? 'left' : 'right';
                        this.isAnimating = true;

                        if (this.animationTimeout) {
                            clearTimeout(this.animationTimeout);
                        }
                        this.animationTimeout = window.setTimeout(() => {
                            this.completeRoleTransition();
                        }, 500);
                    } else {
                        this.role = roleParam;
                        this.updateAdjacentRoles();
                    }
                }
            } else {
                this.urlUpdateInProgress = true;
                const url = this.router
                    .createUrlTree(['/about-role'], {
                        queryParams: { role: TechnicalRole.INTERN },
                    })
                    .toString();

                window.history.replaceState({}, '', url);
                this.role = TechnicalRole.INTERN;
                this.updateAdjacentRoles();

                if (this.urlUpdateTimeout) {
                    clearTimeout(this.urlUpdateTimeout);
                }
                this.urlUpdateTimeout = window.setTimeout(() => {
                    this.urlUpdateInProgress = false;
                }, 100);
            }

            this.isInitialLoad = false;
        });
    }

    ngOnDestroy(): void {
        if (this.routeSub) {
            this.routeSub.unsubscribe();
        }
        if (this.navigationSub) {
            this.navigationSub.unsubscribe();
        }

        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }
        if (this.resetStateTimeout) {
            clearTimeout(this.resetStateTimeout);
        }
        if (this.urlUpdateTimeout) {
            clearTimeout(this.urlUpdateTimeout);
        }
    }

    private updateAdjacentRoles(): void {
        const roles = this.availableRoles;
        const currentIndex = roles.indexOf(this.role);

        this.prevRole = currentIndex > 0 ? roles[currentIndex - 1] : undefined;
        this.nextRole =
            currentIndex < roles.length - 1
                ? roles[currentIndex + 1]
                : undefined;
    }

    public onPrevRole(): void {
        if (this.isAnimating || !this.prevRole) return;

        this.pendingRole = this.prevRole;
        this.swipeDirection = 'right';
        this.isAnimating = true;

        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }
        this.animationTimeout = window.setTimeout(() => {
            this.completeRoleTransition();
        }, 500);
    }

    public onNextRole(): void {
        if (this.isAnimating || !this.nextRole) return;

        this.pendingRole = this.nextRole;
        this.swipeDirection = 'left';
        this.isAnimating = true;

        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }
        this.animationTimeout = window.setTimeout(() => {
            this.completeRoleTransition();
        }, 500);
    }

    public get previousRoleLabel(): string {
        const roles = this.availableRoles;
        const index = roles.indexOf(this.role);
        return index > 0
            ? roles[index - 1]
            : this.translate.instant('about-role.first-role');
    }

    public get nextRoleLabel(): string {
        const roles = this.availableRoles;
        const index = roles.indexOf(this.role);
        return index < roles.length - 1
            ? roles[index + 1]
            : this.translate.instant('about-role.last-role');
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
