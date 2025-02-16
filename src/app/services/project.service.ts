import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';
import { Project } from './user/user.model';

@Injectable({
    providedIn: 'root',
})
export class ProjectService {
    private apiBaseUrl = 'http://localhost:5001';

    constructor(private readonly http: HttpClient) {}

    getAll(accountId: string): Observable<Project[]> {
        return this.http
            .get<Project[]>(
                `${environment.apiGetAllProjectsByAccountId}/${accountId}/all`
            )
            .pipe(
                map((project) => project),
                catchError((error: HttpErrorResponse) => {
                    return throwError(() => error);
                })
            );
    }
}
