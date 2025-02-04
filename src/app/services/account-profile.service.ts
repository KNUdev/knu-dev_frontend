import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {AccountProfile} from '../pages/user-profile/user-profile.model';
import {environment} from '../../environments/environment.development';
import {map} from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AccountProfileService {
    constructor(private readonly http: HttpClient) {
    }

    getById(accountId: string):Observable<AccountProfile> {
        return this.http.get<AccountProfile>(`${environment.apiGetAccountUrl}/${accountId}`).pipe(
            map(user => user),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

}
