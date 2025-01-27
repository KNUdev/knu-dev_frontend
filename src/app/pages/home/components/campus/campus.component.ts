import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    inject,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { MatIcon, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationService } from '../../../../services/animation.services';

@Component({
    selector: 'campus',
    templateUrl: './campus.component.html',
    styleUrl: './campus.component.scss',
    imports: [CommonModule, MatIcon, TranslateModule],
})
export class CampusComponent {
    readonly iconPaths = {
        book: 'assets/icon/button/book.svg',
        certificate: 'assets/icon/button/certificate.svg',
        interview: 'assets/icon/button/interview.svg',
        arrowLong: 'assets/icon/system/arrowLong.svg',
        arrowDown: 'assets/icon/system/arrowDown.svg',
        program: 'assets/icon/button/program.svg',
        chat: 'assets/icon/button/chat.svg',
        mentor: 'assets/icon/button/mentor.svg',
        realProject: 'assets/icon/button/realProject.svg',
    } as const;
    private domSanitizer = inject(DomSanitizer);
    private matIconRegistry = inject(MatIconRegistry);

    @ViewChildren('animatedElement') animatedElements!: QueryList<ElementRef>;

    constructor(private animationService: AnimationService) {
        this.matIconRegistry.addSvgIcon(
            'book',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.book
            )
        );

        this.matIconRegistry.addSvgIcon(
            'certificate',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.certificate
            )
        );
        this.matIconRegistry.addSvgIcon(
            'interview',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.interview
            )
        );

        this.matIconRegistry.addSvgIcon(
            'arrowLong',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowLong
            )
        );

        this.matIconRegistry.addSvgIcon(
            'arrowDown',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.arrowDown
            )
        );

        this.matIconRegistry.addSvgIcon(
            'program',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.program
            )
        );

        this.matIconRegistry.addSvgIcon(
            'chat',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.chat
            )
        );

        this.matIconRegistry.addSvgIcon(
            'mentor',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.mentor
            )
        );

        this.matIconRegistry.addSvgIcon(
            'realProject',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                this.iconPaths.realProject
            )
        );
    }

    ngAfterViewInit() {
        this.animationService.setupIntersectionObserver(this.animatedElements);
    }

    onEnrollClick(): void {}
}
