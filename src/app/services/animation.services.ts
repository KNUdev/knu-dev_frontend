import { ElementRef, Injectable, QueryList } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AnimationService {
    private isStylesLoaded(element: HTMLElement): Promise<boolean> {
        return new Promise((resolve) => {
            const checkStyles = () => {
                const styles = window.getComputedStyle(element);
                return styles && styles.opacity !== '';
            };

            if (checkStyles()) {
                resolve(true);
                return;
            }

            const observer = new MutationObserver((mutations, obs) => {
                if (checkStyles()) {
                    obs.disconnect();
                    resolve(true);
                }
            });

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class'],
            });

            setTimeout(() => {
                observer.disconnect();
                resolve(true);
            }, 500);
        });
    }

    setupIntersectionObserver(elements: QueryList<ElementRef> | ElementRef[]) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(async (entry) => {
                    if (entry.isIntersecting) {
                        await this.isStylesLoaded(entry.target as HTMLElement);
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2,
            }
        );

        if (document.readyState === 'complete') {
            elements.forEach((element) =>
                observer.observe(element.nativeElement)
            );
        } else {
            window.addEventListener('load', () => {
                elements.forEach((element) =>
                    observer.observe(element.nativeElement)
                );
            });
        }
    }
}
