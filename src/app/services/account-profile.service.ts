import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {AccountProfile} from '../pages/user-profile/user-profile.model';
import {environment} from '../../environments/environment.development';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AccountProfileService {
    private apiBaseUrl = 'http://localhost:5001';

    constructor(private readonly http: HttpClient) {
    }

    getById(accountId: string): Observable<AccountProfile> {
        return this.http.get<AccountProfile>(`${environment.apiGetAccountUrl}/${accountId}`).pipe(
            map(user => user),
            // catchError((error: HttpErrorResponse) => {
            //     return throwError(() => error);
            // })
        );
    }

    updateAvatar(accountId: string, newBanner: File): Observable<string> {
        const formData = new FormData();
        formData.append('newAvatar', newBanner);

        return this.http.patch<string>(`${this.apiBaseUrl}/account/${accountId}/avatar/update`, formData).pipe(
            map(newAvatar => {
                console.log("NEW AVATAR: ", newAvatar);
                return newAvatar;
            }),
            catchError((error: HttpErrorResponse) => {
                console.log("ERROR: ", error);
                return throwError(() => error);
            })
        );
    }

    removeAvatar(accountId: string): Observable<void> {
        console.log("REMOVE")
        return this.http.delete<void>(`${this.apiBaseUrl}/account/${accountId}/avatar/remove`).pipe(
            catchError((error: HttpErrorResponse) => {
                console.log("ERROR: ", error);
                return throwError(() => error);
            })
        );
    }

    removeBanner(accountId: string): Observable<void> {
        console.log("REMOVE")
        return this.http.delete<void>(`${this.apiBaseUrl}/account/${accountId}/banner/remove`).pipe(
            catchError((error: HttpErrorResponse) => {
                console.log("ERROR: ", error);
                return throwError(() => error);
            })
        );
    }

    updateBanner(accountId: string, newBanner: File): Observable<string> {
        const formData = new FormData();
        formData.append('newBanner', newBanner);

        return this.http.patch(`${this.apiBaseUrl}/account/${accountId}/banner/update`, formData, {responseType: 'text'})
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    console.log("ERROR: ", error);
                    return throwError(() => error);
                })
            );
    }

}
