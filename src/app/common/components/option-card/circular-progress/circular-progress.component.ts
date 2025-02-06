import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { AnimationService } from '../../../../services/animation.services';

@Component({
    selector: 'app-circular-progress',
    templateUrl: './circular-progress.component.html',
    styleUrl: './circular-progress.component.scss',
})
export class CircularProgressComponent {
    @Input() targetProgress: number = 0;
    @Input() startOffset: number = 0;
    @ViewChild('progressContainer') progressContainer!: ElementRef;

    progress = 0;
    private animationService = inject(AnimationService);
    private isAnimationStarted = false;

    ngAfterViewInit() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !this.isAnimationStarted) {
                        this.startAnimation();
                        this.isAnimationStarted = true;
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2,
            }
        );

        observer.observe(this.progressContainer.nativeElement);
    }

    private startAnimation(): void {
        const duration = 1500;
        const interval = 20;
        const step = this.targetProgress / (duration / interval);

        const timer = setInterval(() => {
            this.progress += step;
            if (this.progress >= this.targetProgress) {
                this.progress = this.targetProgress;
                clearInterval(timer);
            }
        }, interval);
    }
}
