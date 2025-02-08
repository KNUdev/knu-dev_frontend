import {Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {finalize, startWith, Subscription, switchMap} from 'rxjs';
import {DatePipe, NgClass} from '@angular/common';
import {AccountProfileService} from '../../services/account-profile.service';
import {ProjectService} from '../../services/project.service';
import {I18nService} from '../../services/languages/i18n.service';
import {AccountProfile, Education, Project} from './user-profile.model';
import {
    ProfileImageUploadDialogComponent
} from './components/image-upload-dialog/profile-image-upload-dialog.component';
import {ItemCardComponent, ItemDetail} from './components/item-card/item-card.component';
import {FallbackCardComponent} from './components/fallback-card/fallback-card.component';
import {ArrowButtonComponent} from '../../common/components/buttons/arrow-button/arrow-button.component';
import {ButtonYellowComponent} from '../../common/components/buttons/button-yellow/button-yellow.component';
import {LangChangeEvent, TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    imports: [
        DatePipe,
        ProfileImageUploadDialogComponent,
        ItemCardComponent,
        ArrowButtonComponent,
        FallbackCardComponent,
        ButtonYellowComponent,
        TranslatePipe,
        MatIcon,
        NgClass
    ]
})
export class UserProfileComponent implements OnInit, OnDestroy {
    @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;
    public userId = signal<string>('');
    public accountProfile = signal<AccountProfile | null>(null);
    public accountProjects = signal<Project[]>([]);
    public showLoadMore = false;
    public currentBannerUrl = signal<string>('');
    public currentAvatarUrl = signal<string>('');
    public showUploadDialog = false;
    public locale: string;
    private subscriptions = new Subscription();
    private readonly matIconRegistry = inject(MatIconRegistry);
    private readonly domSanitizer = inject(DomSanitizer);
    private readonly i18nService = inject(I18nService);
    private readonly route = inject(ActivatedRoute);
    private readonly userService = inject(AccountProfileService);
    private readonly projectService = inject(ProjectService);
    private readonly translate = inject(TranslateService);
    private readonly iconPaths = {
        addBanner: 'assets/icon/system/pluse.svg',
        changeAvatar: 'assets/icon/system/edit.svg',
        defaultAvatar: 'assets/icon/profile/Vector.svg',
        arrowRightUp: 'assets/icon/system/arrowRightUp.svg',
        programsNotFound: 'assets/icon/profile/education.svg',
        projectsNotFound: 'assets/icon/profile/project.svg'
    } as const;

    constructor() {
        const langSub = this.translate.onLangChange
            .pipe(
                startWith({lang: this.translate.currentLang} as LangChangeEvent),
                switchMap(event => this.i18nService.loadComponentTranslations('pages/user-profile', event.lang))
            )
            .subscribe();
        this.subscriptions.add(langSub);

        this.locale = this.i18nService.currentLocale;

        Object.entries(this.iconPaths).forEach(([name, path]) => {
            this.matIconRegistry.addSvgIcon(name, this.domSanitizer.bypassSecurityTrustResourceUrl(path));
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
        const localeSub = this.i18nService.currentLocale$.subscribe(locale => {
            this.locale = locale;
        });
        this.subscriptions.add(localeSub);

        const id = this.route.snapshot.paramMap.get('userId');
        if (!id) return;
        this.userId.set(id);

        const profileSub = this.userService.getById(id).subscribe(profile => {
            this.accountProfile.set(profile);
            this.currentBannerUrl.set(profile.bannerImageUrl);
            this.currentAvatarUrl.set(profile.avatarImageUrl);
            const projects = profile.projects ?? [];
            this.accountProjects.set(projects);
            if (projects.length === 3) {
                this.showLoadMore = true;
            }
        });
        this.subscriptions.add(profileSub);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    public loadAllProjects(): void {
        const loadSub = this.projectService.getAll(this.userId())
            .subscribe({
                next: allProjects => {
                    this.accountProjects.set(allProjects);
                    this.showLoadMore = false;
                },
                error: err => console.error('Error loading projects:', err)
            });
        this.subscriptions.add(loadSub);
    }

    public openUploadDialog(): void {
        this.showUploadDialog = true;
    }

    public closeUploadDialog(): void {
        this.showUploadDialog = false;
    }

    public onAvatarFileSubmitted(file: File): void {
        const previousUrl = this.currentAvatarUrl();
        const tempUrl = URL.createObjectURL(file);
        this.currentAvatarUrl.set(tempUrl);

        const avatarSub = this.userService.updateAvatar(this.userId(), file)
            .pipe(finalize(() => this.closeUploadDialog()))
            .subscribe({
                next: uploadedUrl => {
                    this.currentAvatarUrl.set(uploadedUrl);
                    URL.revokeObjectURL(tempUrl);
                },
                error: err => {
                    console.error('Error updating avatar:', err);
                    this.currentAvatarUrl.set(previousUrl);
                }
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

            const bannerSub = this.userService.updateBanner(this.userId(), file)
                .subscribe({
                    next: serverUrl => this.currentBannerUrl.set(serverUrl),
                    error: err => {
                        console.error('Error updating banner:', err);
                        this.currentBannerUrl.set(previousUrl);
                    },
                    complete: () => input.value = ''
                });
            this.subscriptions.add(bannerSub);
        }
    }

    public removeAvatar(): void {
        const removeSub = this.userService.removeAvatar(this.userId())
            .pipe(finalize(() => {
                this.closeUploadDialog();
                this.currentAvatarUrl.set('');
            }))
            .subscribe({
                next: () => console.log('Avatar removed'),
                error: err => console.error('Error removing avatar:', err)
            });
        this.subscriptions.add(removeSub);
    }

    public removeBanner(): void {
        const previousUrl = this.currentBannerUrl();
        this.currentBannerUrl.set('');
        const removeSub = this.userService.removeBanner(this.userId())
            .subscribe({
                next: () => console.log('Banner removed'),
                error: err => {
                    console.error('Error removing banner:', err);
                    this.currentBannerUrl.set(previousUrl);
                }
            });
        this.subscriptions.add(removeSub);
    }

    public generateEducationLabels(education: Education): ItemDetail[] {
        this.translate.get("accountProfile.role")
        return [
            {label: 'Експертиза', value: education.programExpertise.toString()},
            {label: 'Тривалість у днях', value: education.durationInDays.toString()},
            {label: 'Кількість завдань', value: education.totalTasks.toString()},
            {label: 'Кількість тестів', value: education.totalTests.toString()}
        ];
    }
}
