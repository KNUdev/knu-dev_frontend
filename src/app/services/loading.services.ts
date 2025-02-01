import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LoadingService {
    isLoading = signal(true);

    show() {
        this.isLoading.set(true);
    }

    hide() {
        this.isLoading.set(false);
    }
}
