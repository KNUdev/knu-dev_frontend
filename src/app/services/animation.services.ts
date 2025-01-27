import { ElementRef, Injectable, QueryList } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AnimationService {
    setupIntersectionObserver(elements: QueryList<ElementRef> | ElementRef[]) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
            }
        );

        elements.forEach((element) => {
            observer.observe(element.nativeElement);
        });
    }
}
