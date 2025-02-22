import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {Project} from '../pages/user-profile/user-profile.model';
import {environment} from '../../environments/environment.development';
import {map} from 'rxjs/operators';
import {SelectOption} from '../pages/auth/register/components/dropdown/write-dropdowns';
import {ShortTest} from '../common/models/shared.model';

@Injectable({
    providedIn: 'root',
})
export class TestService {
    private apiBaseUrl = environment.apiBaseUrl;

    constructor(private readonly http: HttpClient) {
    }

    getAllShort(): Observable<ShortTest[]> {
        return this.http.get<ShortTest[]>(`${this.apiBaseUrl}/admin/test/all`).pipe(
            // map(test => {
            //     const option:SelectOption = {
            //         id: test.
            //     }
            // }),
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }


}
