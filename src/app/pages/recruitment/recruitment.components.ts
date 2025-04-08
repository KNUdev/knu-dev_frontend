import { CommonModule } from "@angular/common";
import {
    AfterViewInit,
    Component,
    ElementRef,
    QueryList,
    Renderer2,
    ViewChildren,
} from "@angular/core";
import { MatIconModule, MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: "app-recruitment",
    templateUrl: "./recruitment.component.html",
    styleUrls: ["./recruitment.component.scss"],
    imports: [MatIconModule, CommonModule],
})
export class RecruitmentPageComponent implements AfterViewInit {
    @ViewChildren("floatingIcon") icons!: QueryList<ElementRef>;

    mouseX = 0;
    mouseY = 0;

    private centerX = 0;
    private centerY = 0;

    ngAfterViewInit(): void {
        this.centerX = window.innerWidth / 1.5;
        this.centerY = window.innerHeight / 1.5;

        window.addEventListener("mousemove", (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        this.animateEachIconIndividually();
    }

    animateEachIconIndividually() {
        const iconConfigs = this.icons.toArray().map((_, i) => {
            return {
                el: _.nativeElement,
                speedX: 0.02 + Math.random() * 0.02,
                speedY: 0.02 + Math.random() * 0.02,
            };
        });

        const animate = () => {
            iconConfigs.forEach((icon) => {
                const offsetX = (this.mouseX - this.centerX) * icon.speedX;
                const offsetY = (this.mouseY - this.centerY) * icon.speedY;

                this.renderer.setStyle(
                    icon.el,
                    "transform",
                    `translate3d(${offsetX}px, ${offsetY}px, 0)`,
                );
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    constructor(
        private matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private renderer: Renderer2,
    ) {
        this.matIconRegistry.addSvgIcon(
            "bug_report",
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                "assets/icon/system/done.svg",
            ),
        );
        this.matIconRegistry.addSvgIcon(
            "mouse",
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                "assets/icon/system/done.svg",
            ),
        );
        this.matIconRegistry.addSvgIcon(
            "analytics",
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                "assets/icon/system/done.svg",
            ),
        );
        this.matIconRegistry.addSvgIcon(
            "edit",
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                "assets/icon/system/done.svg",
            ),
        );
        this.matIconRegistry.addSvgIcon(
            "calendar_today",
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                "assets/icon/system/done.svg",
            ),
        );
    }
}
