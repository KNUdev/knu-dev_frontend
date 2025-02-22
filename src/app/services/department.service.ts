import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Department, Specialty } from '../pages/auth/register/register.model';

@Injectable({
    providedIn: 'root',
})
export class DepartmentService {
    constructor(private readonly http: HttpClient) {}

    getDepartments(): Observable<Department[]> {
        return this.http.get<Department[]>(environment.apiDepartmentsUrl).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => error);
            })
        );
    }

    getSpecialties(departmentId: string): Observable<Specialty[]> {
        return this.http
            .get<Specialty[]>(
                `${environment.apiDepartmentsUrl}/${departmentId}/specialties`
            )
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    return throwError(() => error);
                })
            );
    }
}
