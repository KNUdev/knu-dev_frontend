import {Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {AccountProfileService} from '../../services/account-profile.service';
import {AccountProfile, Education} from './user-profile.model';
import {
    ProfileImageUploadDialogComponent,
    UploadMode
} from "./components/image-upload-dialog/profile-image-upload-dialog.component";
import {ItemCardComponent, ItemDetail} from './components/item-card/item-card.component';
import {FallbackCardComponent} from './components/fallback-card/fallback-card.component';
import {DatePipe, NgClass} from '@angular/common';
import {I18nService} from '../../services/languages/i18n.service';
import {finalize} from 'rxjs';
import {ArrowButtonComponent} from '../../common/components/buttons/arrow-button/arrow-button.component';
import {ButtonYellowComponent} from '../../common/components/buttons/button-yellow/button-yellow.component';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    imports: [
        MatIcon,
        ItemCardComponent,
        ArrowButtonComponent,
        ProfileImageUploadDialogComponent,
        FallbackCardComponent,
        DatePipe,
        ButtonYellowComponent,
        NgClass,
    ],
})
export class UserProfileComponent implements OnInit {
    @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;
    public userId = signal<string>('');
    public accountProfile = signal<AccountProfile | null>(null);
    locale: string;
    showUploadDialog = false;
    uploadMode: UploadMode = 'avatar';
    currentBannerUrl = signal<string>("");
    currentAvatarUrl = signal<string>("")
    private readonly iconPaths = {
        arrowRightUp: 'assets/icon/system/arrowRightUp.svg',
        addBanner: 'assets/icon/system/pluse.svg',
        changeAvatar: 'assets/icon/system/edit.svg',
        defaultAvatar: 'assets/icon/profile/Vector.svg',
        programsFoundFound: 'assets/icon/profile/education.svg',
        projectsNotFound: 'assets/icon/profile/project.svg',
    } as const;
    private i18nService = inject(I18nService);
    private matIconRegistry = inject(MatIconRegistry);
    private domSanitizer = inject(DomSanitizer);
    private route = inject(ActivatedRoute);
    private userService = inject(AccountProfileService);

    constructor() {
        this.locale = this.i18nService.currentLocale;
        console.log(this.i18nService.currentLocale)
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
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.programsFoundFound)
        );
        this.matIconRegistry.addSvgIcon(
            'projectsNotFound',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.projectsNotFound)
        );
    }

    get programsExist() {
        let programs = this.accountProfile()?.completedEducationPrograms;
        return programs && programs.length && programs.length > 0;
    }

    get projectsExist() {
        let projects = this.accountProfile()?.projects;
        return projects && projects.length && projects.length > 0;
    }

    handleBannerFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];

            const oldBannerUrl = this.currentBannerUrl();
            const newBannerUrl = URL.createObjectURL(file);
            this.currentBannerUrl.set(newBannerUrl);

            this.userService.updateBanner(this.userId(), file)
                // .pipe(finalize(() => {
                //     input.value = '';
                // }))
                .subscribe({
                    next: (serverBannerUrl: string) => {
                        console.log('Banner updated successfully:', serverBannerUrl);
                        // this.currentBannerUrl.set(serverBannerUrl);
                        // URL.revokeObjectURL(newBannerUrl);
                    },
                    error: (err) => {
                        console.error('Error updating banner', err);
                        // Revert optimistic update on error
                        this.currentBannerUrl.set(oldBannerUrl);
                    }
                });
        }
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('userId');
        if (id) {
            this.userId.set(id);
            this.userService.getById(id).subscribe(profile => {
                this.accountProfile.set(profile);
                this.currentBannerUrl.set(profile.bannerImageUrl)
                this.currentAvatarUrl.set(profile.avatarImageUrl)
            });
        }

        this.i18nService.currentLocale$.subscribe((locale) => {
            this.locale = locale;
        });
    }

    label(educationProgram: Education): ItemDetail[] {
        return [
            {
                label: "Експертиза",
                value: educationProgram.programExpertise.toString()
            },
            {
                label: "Тривалість у днях",
                value: educationProgram.durationInDays.toString()
            },
            {
                label: "Кількість завдань",
                value: educationProgram.totalTasks.toString()
            },
            {
                label: "Кількість тестів",
                value: educationProgram.totalTests.toString()
            },
        ]
    }

    openUploadDialog(mode: UploadMode): void {
        this.uploadMode = mode;
        this.showUploadDialog = true;
    }

    closeUploadDialog(): void {
        this.showUploadDialog = false;
    }

    handleFileSelected(file: File): void {
        const oldAvatarUrl = this.currentAvatarUrl;
        const newAvatarUrl = URL.createObjectURL(file);
        this.currentAvatarUrl.set(newAvatarUrl);

        this.userService.updateAvatar(this.userId(), file)
            .pipe(
                finalize(() => this.closeUploadDialog())
            )
            .subscribe({
                next: (newAvatarUrl) => {
                    console.log('Avatar updated successfully:', newAvatarUrl);
                    this.currentAvatarUrl.set(newAvatarUrl);
                    URL.revokeObjectURL(newAvatarUrl);
                },
                error: (err) => {
                    console.error('Error updating avatar', err);
                    this.currentAvatarUrl.set(oldAvatarUrl());
                }
            });
    }

    handleUpdateBanner(): void {
        if (this.bannerInput) {
            this.bannerInput.nativeElement.click();
        }
    }

    handleAvatarRemoved(): void {
        this.userService.removeAvatar(this.userId())
            .pipe(
                finalize(() => {
                    this.closeUploadDialog();
                    this.currentAvatarUrl.set('');
                })
            )
            .subscribe({
                next: () => console.log('Avatar removed successfully'),
                error: (err) => console.error('Error removing avatar', err)
            });
    }

    handleBannerRemoved(): void {
        const oldBannerUrl = this.currentBannerUrl;
        this.currentBannerUrl.set("");

        this.userService.removeBanner(this.userId())
            .subscribe({
                next: () => console.log('Avatar removed successfully'),
                error: (err) => {
                    console.error('Error removing avatar', err)
                    this.currentBannerUrl.set(oldBannerUrl());
                }
            });
    }

}
