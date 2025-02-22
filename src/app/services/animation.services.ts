import {
    DestroyRef,
    ElementRef,
    Injectable,
    QueryList,
    effect,
    inject,
} from '@angular/core';
import { LoadingService } from './loading.service';

@Injectable({
    providedIn: 'root',
})
export class AnimationService {
    private destroyRef = inject(DestroyRef);
    private isReady = false;

    constructor(private loadingService: LoadingService) {
        effect(() => {
            this.isReady = !this.loadingService.isLoading();
        });
    }

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

            const observer = new MutationObserver((_, obs) => {
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

    private waitForReady(): Promise<void> {
        return new Promise((resolve) => {
            if (this.isReady) {
                resolve();
                return;
            }

            const checkReady = () => {
                if (this.isReady) {
                    resolve();
                } else {
                    requestAnimationFrame(checkReady);
                }
            };
            checkReady();
        });
    }

    setupIntersectionObserver(
        elements: QueryList<ElementRef> | ElementRef[]
    ): void {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(async (entry) => {
                    if (!entry.isIntersecting) return;

                    try {
                        await this.waitForReady();
                        await this.isStylesLoaded(entry.target as HTMLElement);
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    } catch (error) {
                        console.error(error);
                    }
                });
            },
            { threshold: 0.2 }
        );

        const setupObserver = async () => {
            await this.waitForReady();
            elements.forEach((element) =>
                observer.observe(element.nativeElement)
            );
        };

        if (document.readyState === 'complete') {
            setupObserver();
        } else {
            window.addEventListener('load', () => setupObserver(), {
                once: true,
            });
        }

        this.destroyRef.onDestroy(() => observer.disconnect());
    }
}
