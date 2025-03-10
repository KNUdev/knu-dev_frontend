import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    inject,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { Join_organization } from '../../../../common/components/button/join-organization/join-organization.component';
import { OptionCard } from '../../../../common/components/option-card/option-card.component';
import { AnimationService } from '../../../../services/animation.services';
import { Benefit_card } from '../benefit-card/benefit-card.component';
@Component({
    selector: 'home-pre-campus',
    templateUrl: './pre-campus.component.html',
    styleUrl: './pre-campus.component.scss',
    imports: [
        CommonModule,
        MatIconModule,
        TranslateModule,
        OptionCard,
        Benefit_card,
        Join_organization,
    ],
})
export class PreCampusComponent {
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);
    readonly iconPaths = {
        arrowDown: 'assets/icon/system/arrowDown.svg',
        preCampusImg: 'assets/home/preCampusImg.svg',
        education: 'assets/icon/system/education.svg',
        consult: 'assets/icon/button/consult.svg',
        work: 'assets/icon/button/work.svg',
        presentation: 'assets/icon/button/presentation.svg',
        study: 'assets/icon/button/study.svg',
    } as const;

    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }

    constructor(private animationService: AnimationService) {
        this.matIconRegistry.addSvgIcon(
            'education',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.education
            )
        );
        this.matIconRegistry.addSvgIcon(
            'consult',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.consult
            )
        );
        this.matIconRegistry.addSvgIcon(
            'work',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.work
            )
        );
        this.matIconRegistry.addSvgIcon(
            'presentation',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.presentation
            )
        );
        this.matIconRegistry.addSvgIcon(
            'study',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.study
            )
        );
    }
    onEnrollClick(): void {}
}
