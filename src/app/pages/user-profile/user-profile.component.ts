import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import {finalize, startWith, switchMap} from 'rxjs';
import { DatePipe, NgClass } from '@angular/common';

// Import your services, models, and components
import { AccountProfileService } from '../../services/account-profile.service';
import { ProjectService } from '../../services/project.service';
import { I18nService } from '../../services/languages/i18n.service';
import { AccountProfile, Education, Project } from './user-profile.model';
import { ProfileImageUploadDialogComponent, UploadMode } from './components/image-upload-dialog/profile-image-upload-dialog.component';
import { ItemCardComponent, ItemDetail } from './components/item-card/item-card.component';
import { FallbackCardComponent } from './components/fallback-card/fallback-card.component';
import { ArrowButtonComponent } from '../../common/components/buttons/arrow-button/arrow-button.component';
import { ButtonYellowComponent } from '../../common/components/buttons/button-yellow/button-yellow.component';
import {LangChangeEvent, TranslatePipe, TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    imports: [
        // Angular
        DatePipe,
        NgClass,
        // Your custom components
        ProfileImageUploadDialogComponent,
        ItemCardComponent,
        ArrowButtonComponent,
        FallbackCardComponent,
        ButtonYellowComponent,
        MatIcon,
        TranslatePipe
    ]
})
export class UserProfileComponent implements OnInit {
    @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;

    // The account ID in signals
    public userId = signal<string>('');

    // The entire profile (partial projects)
    public accountProfile = signal<AccountProfile | null>(null);

    // Only the projects we want to display in the template (starts partial)
    public accountProjects = signal<Project[]>([]);

    // Whether to show "Load More" projects button
    public showLoadMore = false;

    // For language handling
    locale: string;

    // For the image dialogs
    showUploadDialog = false;
    uploadMode: UploadMode = 'avatar';
    currentBannerUrl = signal<string>('');
    currentAvatarUrl = signal<string>('');

    // Icon registry
    private readonly matIconRegistry = inject(MatIconRegistry);
    private readonly domSanitizer = inject(DomSanitizer);

    // Services
    private readonly i18nService = inject(I18nService);
    private readonly route = inject(ActivatedRoute);
    private readonly userService = inject(AccountProfileService);
    private readonly projectService = inject(ProjectService);
    private translate = inject(TranslateService);

    // Icon paths
    private readonly iconPaths = {
        arrowRightUp: 'assets/icon/system/arrowRightUp.svg',
        addBanner: 'assets/icon/system/pluse.svg',
        changeAvatar: 'assets/icon/system/edit.svg',
        defaultAvatar: 'assets/icon/profile/Vector.svg',
        programsNotFound: 'assets/icon/profile/education.svg',
        projectsNotFound: 'assets/icon/profile/project.svg'
    } as const;

    constructor() {
        this.translate.onLangChange
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
        this.locale = this.i18nService.currentLocale;

        // Register your SVG icons
        this.matIconRegistry.addSvgIcon(
            'addBanner',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.addBanner)
        );
        this.matIconRegistry.addSvgIcon(
            'changeAvatar',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.changeAvatar)
        );
        this.matIconRegistry.addSvgIcon(
            'defaultAvatar',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.defaultAvatar)
        );
        this.matIconRegistry.addSvgIcon(
            'arrowRightUp',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.arrowRightUp)
        );
        this.matIconRegistry.addSvgIcon(
            'programsNotFound',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.programsNotFound)
        );
        this.matIconRegistry.addSvgIcon(
            'projectsNotFound',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.projectsNotFound)
        );
    }

    ngOnInit(): void {
        // Listen for language changes
        this.i18nService.currentLocale$.subscribe(locale => {
            this.locale = locale;
        });

        // Grab userId from route
        const id = this.route.snapshot.paramMap.get('userId');
        if (!id) return;
        this.userId.set(id);

        // 1) Fetch user data. Suppose this returns partial projects (3 or fewer).
        this.userService.getById(id).subscribe(profile => {
            this.accountProfile.set(profile);

            // Banner & avatar
            this.currentBannerUrl.set(profile.bannerImageUrl);
            this.currentAvatarUrl.set(profile.avatarImageUrl);

            // Partial projects from the server
            const partialProjects = profile.projects ?? [];
            this.accountProjects.set(partialProjects);

            // If the server indicates there's more than 3
            // (You might have something like `profile.hasMoreProjects`)
            // or you can guess: partialProjects.length === 3 => possibly more
            if (partialProjects.length === 3) {
                this.showLoadMore = true;
            }
        });
    }

    // Called by the "Load More" button in the template
    handleLoadAllAccountProjects(): void {
        // 2) Load the full set from a separate API endpoint
        this.projectService.getAll(this.userId())
            .subscribe({
                next: (allProjects) => {
                    // Replace partial list with the entire set
                    this.accountProjects.set(allProjects);
                    // Hide the "Load more" button now that we have them all
                    this.showLoadMore = false;
                },
                error: (err) => {
                    console.error('Error loading all projects:', err);
                }
            });
    }

    // Helper used in the template to check if we have any projects
    get projectsExist() {
        return this.accountProjects().length > 0;
    }

    get programsExist() {
        const programs = this.accountProfile()?.completedEducationPrograms;
        return programs && programs.length > 0;
    }

    openUploadDialog(mode: UploadMode): void {
        this.uploadMode = mode;
        this.showUploadDialog = true;
    }

    closeUploadDialog(): void {
        this.showUploadDialog = false;
    }

    handleFileSelected(file: File): void {
        const oldAvatarUrl = this.currentAvatarUrl();
        const newAvatarUrl = URL.createObjectURL(file);
        // Optimistically update
        this.currentAvatarUrl.set(newAvatarUrl);

        this.userService.updateAvatar(this.userId(), file)
            .pipe(finalize(() => this.closeUploadDialog()))
            .subscribe({
                next: (uploadedUrl) => {
                    console.log('Avatar updated successfully:', uploadedUrl);
                    this.currentAvatarUrl.set(uploadedUrl);
                    URL.revokeObjectURL(newAvatarUrl);
                },
                error: (err) => {
                    console.error('Error updating avatar', err);
                    // revert on error
                    this.currentAvatarUrl.set(oldAvatarUrl);
                }
            });
    }

    handleUpdateBanner(): void {
        if (this.bannerInput) {
            this.bannerInput.nativeElement.click();
        }
    }

    handleBannerFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            const oldBannerUrl = this.currentBannerUrl();
            const newBannerUrl = URL.createObjectURL(file);

            // Optimistic update
            this.currentBannerUrl.set(newBannerUrl);

            this.userService.updateBanner(this.userId(), file)
                .subscribe({
                    next: (serverBannerUrl: string) => {
                        console.log('Banner updated successfully:', serverBannerUrl);
                        // Optionally set the server URL:
                        // this.currentBannerUrl.set(serverBannerUrl);
                        // URL.revokeObjectURL(newBannerUrl);
                    },
                    error: (err) => {
                        console.error('Error updating banner', err);
                        // revert on error
                        this.currentBannerUrl.set(oldBannerUrl);
                    },
                    complete: () => {
                        // Clear the file input
                        input.value = '';
                    }
                });
        }
    }

    handleAvatarRemoved(): void {
        // remove from server
        this.userService.removeAvatar(this.userId())
            .pipe(finalize(() => {
                this.closeUploadDialog();
                this.currentAvatarUrl.set('');
            }))
            .subscribe({
                next: () => console.log('Avatar removed successfully'),
                error: (err) => console.error('Error removing avatar', err)
            });
    }

    handleBannerRemoved(): void {
        const oldBannerUrl = this.currentBannerUrl();
        this.currentBannerUrl.set('');

        this.userService.removeBanner(this.userId())
            .subscribe({
                next: () => console.log('Banner removed successfully'),
                error: (err) => {
                    console.error('Error removing banner', err);
                    // revert on error
                    this.currentBannerUrl.set(oldBannerUrl);
                }
            });
    }

    // Example for labeling an Education item
    label(educationProgram: Education): ItemDetail[] {
        return [
            { label: 'Експертиза', value: educationProgram.programExpertise.toString() },
            { label: 'Тривалість у днях', value: educationProgram.durationInDays.toString() },
            { label: 'Кількість завдань', value: educationProgram.totalTasks.toString() },
            { label: 'Кількість тестів', value: educationProgram.totalTests.toString() }
        ];
    }
}

