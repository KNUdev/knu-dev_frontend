import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import {environment} from 'src/environments/environment.development';
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
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }


}
