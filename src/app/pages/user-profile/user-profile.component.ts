import { DatePipe } from '@angular/common';
import {
    Component,
    ElementRef,
    inject,
    OnDestroy,
    OnInit,
    signal,
    ViewChild,
} from '@angular/core';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
    LangChangeEvent,
    TranslatePipe,
    TranslateService,
} from '@ngx-translate/core';
import { finalize, startWith, Subscription, switchMap } from 'rxjs';
import { BorderButtonComponent } from '../../common/components/button/arrow-button/border-button.component';
import { MultiLangFieldPipe } from '../../common/pipes/multi-lang-field.pipe';
import { I18nService } from '../../services/languages/i18n.service';
import { ProjectService } from '../../services/project.service';
import { AccountProfileService } from '../../services/user/account-profile.service';
import { UserStateService } from '../../services/user/user-state.module';
import {
    AccountProfile,
    Education,
    Project,
} from '../../services/user/user.model';
import { FallbackCardComponent } from './components/fallback-card/fallback-card.component';
import { ProfileImageUploadDialogComponent } from './components/image-upload-dialog/profile-image-upload-dialog.component';
import {
    ItemCardComponent,
    ItemDetail,
} from './components/item-card/item-card.component';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    imports: [
        DatePipe,
        ProfileImageUploadDialogComponent,
        ItemCardComponent,
        FallbackCardComponent,
        TranslatePipe,
        MatIcon,
        MultiLangFieldPipe,
        BorderButtonComponent,
    ],
    standalone: true,
})
export class UserProfileComponent implements OnInit, OnDestroy {
    @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;
    public accountProfile = signal<AccountProfile | null>(null);
    public accountProjects = signal<Project[]>([]);
    public showLoadMore = signal<boolean>(false);
    public currentBannerUrl = signal<string>('');
    public currentAvatarUrl = signal<string>('');
    public showUploadDialog = signal<boolean>(false);
    public locale: string;
    private userId: string;
    public uploadErrorMessage = signal<string>('');
    private subscriptions = new Subscription();
    private readonly matIconRegistry = inject(MatIconRegistry);
    private readonly domSanitizer = inject(DomSanitizer);
    private readonly i18nService = inject(I18nService);
    private readonly userService = inject(AccountProfileService);
    private readonly projectService = inject(ProjectService);
    private readonly translate = inject(TranslateService);
    private readonly userState = inject(UserStateService);
    private readonly iconPaths = {
        addBanner: 'assets/icon/system/pluse.svg',
        changeAvatar: 'assets/icon/system/edit.svg',
        defaultAvatar: 'assets/icon/profile/default-profile-avatar.svg',
        arrowRightUp: 'assets/icon/system/arrowRightUp.svg',
        programsNotFound: 'assets/icon/system/education.svg',
        projectsNotFound: 'assets/icon/button/work.svg',
    } as const;

    constructor() {
        const langSub = this.translate.onLangChange
            .pipe(
                startWith({
                    lang: this.translate.currentLang,
                } as LangChangeEvent),
                switchMap((event) =>
                    this.i18nService.loadComponentTranslations(
                        'pages/user-profile',
                        event.lang
                    )
                )
            )
            .subscribe();
        this.subscriptions.add(langSub);

        this.locale = this.i18nService.currentLocale;

        this.userId = this.userState.currentUser.id;

        Object.entries(this.iconPaths).forEach(([name, path]) => {
            this.matIconRegistry.addSvgIcon(
                name,
                this.domSanitizer.bypassSecurityTrustResourceUrl(path)
            );
        });
    }

    public get projectsExist(): boolean {
        return this.accountProjects().length > 0;
    }

    public get programsExist(): boolean {
        const programs = this.accountProfile()?.completedEducationPrograms;
        return !!(programs && programs.length);
    }

    ngOnInit(): void {
        const localeSub = this.i18nService.currentLocale$.subscribe(
            (locale) => {
                this.locale = locale;
            }
        );
        this.subscriptions.add(localeSub);

        const userId = this.userState.currentUser.id;
        if (!userId) {
            console.warn('No userId available');
            return;
        }

        this.loadUserProfile(userId);
    }

    private loadUserProfile(userId: string): void {
        const profileSub = this.userService.getById(userId).subscribe({
            next: (profile) => {
                this.accountProfile.set(profile);
                this.currentBannerUrl.set(profile.bannerImageUrl);
                this.currentAvatarUrl.set(profile.avatarImageUrl);
                this.userState.updateState({ profile });
                const projects = profile.projects ?? [];
                this.accountProjects.set(projects);
                if (projects.length === 3) {
                    this.showLoadMore.set(true);
                }
            },
            error: (error) => {
                console.error('Error fetching profile:', error);
            },
        });
        this.subscriptions.add(profileSub);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    public loadAllProjects(): void {
        const loadSub = this.projectService.getAll(this.userId).subscribe({
            next: (allProjects) => {
                this.accountProjects.set(allProjects);
                this.showLoadMore.set(true);
            },
            error: (err) => console.error(err),
        });
        this.subscriptions.add(loadSub);
    }

    public openUploadDialog(): void {
        this.showUploadDialog.set(true);
    }

    public closeUploadDialog(): void {
        this.showUploadDialog.set(false);
        this.uploadErrorMessage.set('');
    }

    public onAvatarFileSubmitted(file: File): void {
        const previousUrl = this.currentAvatarUrl();
        const tempUrl = URL.createObjectURL(file);
        this.currentAvatarUrl.set(tempUrl);

        const userId = this.userState.currentUser.id;
        const avatarSub = this.userService
            .updateAvatar(userId, file)
            .subscribe({
                next: (uploadedUrl) => {
                    this.currentAvatarUrl.set(uploadedUrl);
                    const currentProfile = this.userState.userProfile;
                    if (currentProfile) {
                        this.userState.updateState({
                            profile: {
                                ...currentProfile,
                                avatarImageUrl: uploadedUrl,
                            },
                        });
                    }
                    URL.revokeObjectURL(tempUrl);
                    this.uploadErrorMessage.set('');
                    this.closeUploadDialog();
                },
                error: (err) => {
                    console.error(err);
                    this.currentAvatarUrl.set(previousUrl);
                    this.uploadErrorMessage.set(
                        this.translate.instant(
                            'accountProfile.button.avatar.errorMessage'
                        )
                    );
                },
            });
        this.subscriptions.add(avatarSub);
    }

    public triggerBannerUpdate(): void {
        this.bannerInput.nativeElement.click();
    }

    public onBannerFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const previousUrl = this.currentBannerUrl();
            const tempUrl = URL.createObjectURL(file);
            this.currentBannerUrl.set(tempUrl);

            const bannerSub = this.userService
                .updateBanner(this.userId, file)
                .subscribe({
                    next: (serverUrl) => this.currentBannerUrl.set(serverUrl),
                    error: (err) => this.currentBannerUrl.set(previousUrl),
                    complete: () => (input.value = ''),
                });
            this.subscriptions.add(bannerSub);
        }
    }

    public removeAvatar(): void {
        const userId = this.userState.currentUser.id;
        const removeSub = this.userService
            .removeAvatar(userId)
            .pipe(
                finalize(() => {
                    this.closeUploadDialog();
                    this.currentAvatarUrl.set('');
                    const currentProfile = this.userState.userProfile;
                    if (currentProfile) {
                        this.userState.updateState({
                            profile: { ...currentProfile, avatarImageUrl: '' },
                        });
                    }
                })
            )
            .subscribe({
                next: () => console.log('Avatar removed'),
                error: (err) => console.error(err),
            });
        this.subscriptions.add(removeSub);
    }

    public removeBanner(event: Event): void {
        event.stopPropagation();

        const previousUrl = this.currentBannerUrl();
        this.currentBannerUrl.set('');
        const removeSub = this.userService.removeBanner(this.userId).subscribe({
            error: () => this.currentBannerUrl.set(previousUrl),
        });
        this.subscriptions.add(removeSub);
    }

    public generateEducationLabels(education: Education): ItemDetail[] {
        return [
            {
                label: this.translate.instant('accountProfile.expertise'),
                value: education.programExpertise.toString(),
            },
            {
                label: this.translate.instant(
                    'accountProfile.educationPrograms.meta.duration'
                ),
                value: education.durationInDays.toString(),
            },
            {
                label: this.translate.instant(
                    'accountProfile.educationPrograms.meta.totalTasks'
                ),
                value: education.totalTasks.toString(),
            },
            {
                label: this.translate.instant(
                    'accountProfile.educationPrograms.meta.totalTests'
                ),
                value: education.totalTests.toString(),
            },
        ];
    }
}
