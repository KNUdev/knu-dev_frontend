import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Department, Specialty } from '../pages/auth/register/register.model';

const API_ENDPOINTS = {
    DEPARTMENTS: `${environment.apiUrl}/departments`,
} as const;

@Injectable({
    providedIn: 'root',
})
export class DepartmentService {
    constructor(private readonly http: HttpClient) {}

    getDepartments(): Observable<Department[]> {
        return this.http.get<Department[]>(API_ENDPOINTS.DEPARTMENTS);
    }

    getSpecialties(departmentId: string): Observable<Specialty[]> {
        return this.http.get<Specialty[]>(
            `${API_ENDPOINTS.DEPARTMENTS}/${departmentId}/specialties`
        );
    }
}
