import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FormErrorService {
    showValidationErrors = signal(false);
    backendErrors = signal<Record<string, string[]>>({});

    setShowValidationErrors(show: boolean) {
        this.showValidationErrors.set(show);
    }

    setBackendErrors(errors: Record<string, string[]>) {
        this.backendErrors.set(errors);
    }

    clearErrors() {
        this.showValidationErrors.set(false);
        this.backendErrors.set({});
    }
}
