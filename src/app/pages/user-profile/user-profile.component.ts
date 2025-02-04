import {Component, inject, OnInit, signal} from '@angular/core';
import {MatIcon, MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';
import {ItemCardComponent, ItemDetail} from './components/item-card/item-card.component';
import {AccountProfileService} from '../../services/account-profile.service';
import {AccountProfile} from './user-profile.model';
import {ArrowButtonComponent} from '../../common/components/buttons/arrow-button/arrow-button.component';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss'],
    imports: [
        MatIcon,
        ItemCardComponent,
        ArrowButtonComponent
    ]
})
export class UserProfileComponent implements OnInit {
    // (Replace "any" with a proper interface if available.)
    public userId = signal<string>('');
    public accountProfile = signal<AccountProfile | null>(null);
    // Sample details used for item cards (if needed)
    public details: ItemDetail[] = [
        {label: 'Label1', value: 'Value1'},
        {label: 'Label1', value: 'Value1'},
        {label: 'Label1', value: 'Value1'}
    ];
    // Define icon paths as readonly constants
    private readonly iconPaths = {
        arrowRightUp: 'assets/icon/system/arrowRightUp.svg',
        addBanner: 'assets/icon/system/pluse.svg',
        changeAvatar: 'assets/icon/system/edit.svg'
    } as const;
    // Inject required services using Angular's inject() helper
    private matIconRegistry = inject(MatIconRegistry);

    // Define signals for the userId and account profile.
    private domSanitizer = inject(DomSanitizer);
    private route = inject(ActivatedRoute);
    private userService = inject(AccountProfileService);

    constructor() {
        // Register custom icons using Angular Material's MatIconRegistry
        this.matIconRegistry.addSvgIcon(
            'addBanner',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.addBanner)
        );
        this.matIconRegistry.addSvgIcon(
            'changeAvatar',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.changeAvatar)
        );
        this.matIconRegistry.addSvgIcon(
            'arrowRightUp',
            this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPaths.arrowRightUp)
        );
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('userId');
        if (id) {
            this.userId.set(id);
            this.userService.getById(id).subscribe(profile => {
                this.accountProfile.set(profile);
            });
        }
    }
}
