import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-circular-progress',
    templateUrl: './circular-progress.component.html',
    styleUrl: './circular-progress.component.scss',
})
export class CircularProgressComponent implements OnInit {
    @Input() targetProgress: number = 0;
    @Input() startOffset: number = 0;
    progress = 0;

    ngOnInit(): void {
        const duration = 2000;
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
