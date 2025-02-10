import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccountProfile } from '../pages/user-profile/user-profile.model';
import {environment} from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class AccountProfileService {
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) {}

    getById(accountId: string): Observable<AccountProfile> {
        const url = `${this.apiBaseUrl}/account/${accountId}`;
        return this.http.get<AccountProfile>(url)
            .pipe(
                catchError(this.handleError)
            );
    }

    updateAvatar(accountId: string, newAvatar: File): Observable<string> {
        const url = `${this.apiBaseUrl}/account/${accountId}/avatar/update`;
        const formData = new FormData();
        formData.append('newAvatar', newAvatar);

        return this.http.patch(url, formData, { responseType: 'text' })
            .pipe(
                catchError(this.handleError)
            );
    }

    removeAvatar(accountId: string): Observable<void> {
        const url = `${this.apiBaseUrl}/account/${accountId}/avatar/remove`;
        return this.http.delete<void>(url)
            .pipe(
                catchError(this.handleError)
            );
    }

    removeBanner(accountId: string): Observable<void> {
        const url = `${this.apiBaseUrl}/account/${accountId}/banner/remove`;
        return this.http.delete<void>(url)
            .pipe(
                catchError(this.handleError)
            );
    }

    updateBanner(accountId: string, newBanner: File): Observable<string> {
        const url = `${this.apiBaseUrl}/account/${accountId}/banner/update`;
        const formData = new FormData();
        formData.append('newBanner', newBanner);

        return this.http.patch(url, formData, { responseType: 'text' })
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage: string;

        if (error.error instanceof ErrorEvent) {
            errorMessage = `A client-side error occurred: ${error.error.message}`;
        } else {
            errorMessage = `Server returned code ${error.status}: ${error.message}`;
        }

        console.error('AccountProfileService error:', errorMessage);

        return throwError(() => new Error(errorMessage));
    }
}
