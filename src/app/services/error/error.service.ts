import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class FormErrorService {
    private showValidationErrorsSubject = new BehaviorSubject<boolean>(false);
    showValidationErrors$ = this.showValidationErrorsSubject.asObservable();
    backendErrors = signal<Record<string, string[]>>({});

    setShowValidationErrors(value: boolean) {
        this.showValidationErrorsSubject.next(value);
    }

    setBackendErrors(errors: Record<string, string[]>) {
        this.backendErrors.set(errors);
    }

    clearErrors() {
        this.showValidationErrorsSubject.next(false);
        this.backendErrors.set({});
    }
}
