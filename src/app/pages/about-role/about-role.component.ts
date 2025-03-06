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
        this.loadTranslations();
        this.registerIcons();
        this.setupNavigationListener();
    }

    private loadTranslations(): void {
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
    }

    private setupNavigationListener(): void {
        this.navigationSub = this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(() => {
                this.urlUpdateInProgress = false;
            });
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
                this.handleValidRoleParam(roleParam);
            } else {
                this.navigateToDefaultRole();
            }

            this.isInitialLoad = false;
        });
        this.route.fragment.subscribe((fragment) => {
            if (fragment) {
                this.scrollToFragment(fragment);
            }
        });
    }

    private scrollToFragment(fragmentId: string): void {
        // Use requestAnimationFrame to ensure the DOM is ready
        requestAnimationFrame(() => {
            setTimeout(() => {
                const element = document.getElementById(fragmentId);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    });
                }
            }, 300);
        });
    }

    private handleValidRoleParam(roleParam: string): void {
        if (this.isInitialLoad) {
            this.role = roleParam;
            this.updateAdjacentRoles();
        } else {
            this.animateRoleTransition(roleParam);
        }
    }

    private animateRoleTransition(roleParam: string): void {
        const currentIndex = this.availableRoles.indexOf(this.role || '');
        const newIndex = this.availableRoles.indexOf(roleParam);

        if (currentIndex !== -1 && newIndex !== -1) {
            this.pendingRole = roleParam;
            this.swipeDirection = newIndex > currentIndex ? 'left' : 'right';
            this.isAnimating = true;

            this.scrollToFragment('info-card');

            document.querySelector('.info-card')?.classList.add('isAnimating');

            this.clearTimeout(this.animationTimeout);
            this.animationTimeout = window.setTimeout(() => {
                this.completeRoleTransition();
            }, 800);
        } else {
            this.role = roleParam;
            this.updateAdjacentRoles();
        }
    }

    private completeRoleTransition(): void {
        if (!this.pendingRole) return;

        this.updateUrlSilently();
        this.role = this.pendingRole;
        this.updateAdjacentRoles();

        this.activeContainer =
            this.activeContainer === 'primary' ? 'secondary' : 'primary';
        this.isAnimating = false;
        this.pendingRole = null;
        this.swipeDirection = null;

        document.querySelector('.info-card')?.classList.remove('isAnimating');

        this.clearTimeout(this.urlUpdateTimeout);
        this.urlUpdateTimeout = window.setTimeout(() => {
            this.urlUpdateInProgress = false;
        }, 100);
    }

    private navigateToDefaultRole(): void {
        this.urlUpdateInProgress = true;
        const url = this.router
            .createUrlTree(['/about-role'], {
                queryParams: { role: TechnicalRole.INTERN },
            })
            .toString();

        window.history.replaceState({}, '', url);
        this.role = TechnicalRole.INTERN;
        this.updateAdjacentRoles();

        this.clearTimeout(this.urlUpdateTimeout);
        this.urlUpdateTimeout = window.setTimeout(() => {
            this.urlUpdateInProgress = false;
        }, 100);
    }

    private clearTimeout(timeoutId?: number): void {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }
    }

    private clearAllTimeouts(): void {
        this.clearTimeout(this.animationTimeout);
        this.clearTimeout(this.resetStateTimeout);
        this.clearTimeout(this.urlUpdateTimeout);
    }

    private updateUrlSilently(): void {
        this.urlUpdateInProgress = true;
        const url = this.router
            .createUrlTree(['/about-role'], {
                queryParams: { role: this.pendingRole },
            })
            .toString();
        window.history.replaceState({}, '', url);
    }

    ngOnDestroy(): void {
        this.routeSub?.unsubscribe();
        this.navigationSub?.unsubscribe();
        this.clearAllTimeouts();
    }

    private updateAdjacentRoles(): void {
        const roles = this.availableRoles;
        const currentIndex = roles.indexOf(this.role);

        this.prevRole = currentIndex > 0 ? roles[currentIndex - 1] : undefined;
        this.nextRole =
            currentIndex < roles.length - 1
                ? roles[currentIndex + 1]
                : undefined;

        // No need to update side panel colors since we're not using role-specific styles
    }

    private touchStartX = 0;
    private touchEndX = 0;

    onTouchStart(event: TouchEvent): void {
        this.touchStartX = event.changedTouches[0].screenX;
    }

    onTouchMove(event: TouchEvent): void {
        this.touchEndX = event.changedTouches[0].screenX;
    }

    onTouchEnd(): void {
        const swipeThreshold = 30; // Even more responsive threshold

        if (
            this.touchStartX - this.touchEndX > swipeThreshold &&
            this.nextRole
        ) {
            this.onNextRole();
        }

        if (
            this.touchEndX - this.touchStartX > swipeThreshold &&
            this.prevRole
        ) {
            this.onPrevRole();
        }
    }

    public onPrevRole(): void {
        if (this.isAnimating || !this.prevRole) return;

        this.pendingRole = this.prevRole;
        this.swipeDirection = 'right';
        this.isAnimating = true;

        document.querySelector('.info-card')?.classList.add('isAnimating');

        this.clearTimeout(this.animationTimeout);
        this.animationTimeout = window.setTimeout(() => {
            this.completeRoleTransition();
        }, 800);
    }

    public onNextRole(): void {
        if (this.isAnimating || !this.nextRole) return;

        this.pendingRole = this.nextRole;
        this.swipeDirection = 'left';
        this.isAnimating = true;

        document.querySelector('.info-card')?.classList.add('isAnimating');

        this.clearTimeout(this.animationTimeout);
        this.animationTimeout = window.setTimeout(() => {
            this.completeRoleTransition();
        }, 800);
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
