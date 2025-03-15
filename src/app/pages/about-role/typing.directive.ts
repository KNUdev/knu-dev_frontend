import {
    AfterViewInit,
    Directive,
    ElementRef,
    Input,
    OnDestroy,
} from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Directive({
    selector: '[appLetterByLetter]',
})
export class LetterByLetterDirective implements AfterViewInit, OnDestroy {
    @Input('appLetterByLetter') translationKey!: string;
    private langSub!: Subscription;
    private timerIds: number[] = [];

    constructor(
        private el: ElementRef<HTMLElement>,
        private translate: TranslateService
    ) {}

    ngAfterViewInit(): void {
        const targetNode = this.el.nativeElement;

        const clearTimers = () => {
            this.timerIds.forEach((id) => clearTimeout(id));
            this.timerIds = [];
        };

        const startTypingCycle = (text: string) => {
            targetNode.innerHTML = '';
            const chars = text.split('');
            const n = chars.length;
            chars.forEach((char, index) => {
                const span = document.createElement('span');
                span.innerText = char === ' ' ? '\u00A0' : char;
                span.style.opacity = '0';
                span.style.display = 'inline-block';
                span.style.animation = `typeIn 0.1s steps(1) forwards`;
                span.style.animationDelay = `${index * 0.1}s`;
                targetNode.appendChild(span);
            });
            const typingDuration = n > 0 ? (n - 1) * 100 + 100 : 100;
            const deletionStart = window.setTimeout(() => {
                startDeletion();
            }, typingDuration + 5000);
            this.timerIds.push(deletionStart);
        };

        const startDeletion = () => {
            const spans = Array.from(targetNode.querySelectorAll('span'));
            const reversedSpans = spans.reverse();
            reversedSpans.forEach((span, index) => {
                const timeoutId = window.setTimeout(() => {
                    (
                        span as HTMLElement
                    ).style.animation = `typeOut 0.1s steps(1) forwards`;
                }, index * 100);
                this.timerIds.push(timeoutId);
            });
            const deletionDuration =
                reversedSpans.length > 0
                    ? (reversedSpans.length - 1) * 100 + 100
                    : 100;
            const restart = window.setTimeout(() => {
                updateText();
            }, deletionDuration);
            this.timerIds.push(restart);
        };

        const updateText = () => {
            clearTimers();
            const key = this.translationKey || targetNode.innerText.trim();
            this.translate.get(key).subscribe((translated: string) => {
                startTypingCycle(translated);
            });
        };

        const observer = new MutationObserver((mutations, obs) => {
            if (targetNode.classList.contains('visible')) {
                obs.disconnect();
                updateText();
            }
        });

        observer.observe(targetNode, {
            attributes: true,
            attributeFilter: ['class'],
            childList: true,
            subtree: true,
        });

        this.langSub = this.translate.onLangChange.subscribe(
            (event: LangChangeEvent) => {
                if (targetNode.classList.contains('visible')) {
                    window.setTimeout(() => updateText(), 200);
                }
            }
        );
    }

    ngOnDestroy(): void {
        if (this.langSub) {
            this.langSub.unsubscribe();
        }
        this.timerIds.forEach((id) => clearTimeout(id));
    }
}
