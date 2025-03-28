import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Department } from '../../pages/auth/register/register.model';
import { AdminAccountsResponse } from './accounts.model';

export interface FilterParams {
    searchQuery?: string;
    registeredAt?: string;
    registeredBefore?: string;
    unit?: 'CAMPUS' | 'PRECAMPUS';
    expertise?: 'FULLSTACK' | 'BACKEND' | 'FRONTEND' | 'UI_UX_DESIGNER';
    departmentId?: string;
    specialtyCodename?: string;
    universityStudyYear?: number;
    technicalRole?:
        | 'INTERN'
        | 'DEVELOPER'
        | 'PREMASTER'
        | 'MASTER'
        | 'TECHLEAD';
    recruitmentId?: string;
}

export interface Recruitment {
    id: string;
    name: string;
    startedAt: string;
    closedAt: string;
    expertise: string;
    maxCandidates: number;
    joinedPeopleAmount: number;
}

@Injectable({
    providedIn: 'root',
})
export class AdminAccountsService {
    private apiUrl = environment.production
        ? `${environment.apiBaseUrl}/admin/accounts`
        : 'http://localhost:5001/admin/accounts';

    constructor(private http: HttpClient) {}

    getAccounts(
        pageNumber: number = 0,
        pageSize: number = 12,
        filters?: FilterParams
    ): Observable<AdminAccountsResponse> {
        let params = new HttpParams()
            .set('pageNumber', pageNumber.toString())
            .set('pageSize', pageSize.toString());

        if (filters) {
            if (filters.searchQuery) {
                params = params.set('searchQuery', filters.searchQuery);
            }
            if (filters.registeredAt) {
                params = params.set('registeredAt', filters.registeredAt);
            }
            if (filters.registeredBefore) {
                params = params.set(
                    'registeredBefore',
                    filters.registeredBefore
                );
            }
            if (filters.unit) {
                params = params.set('unit', filters.unit);
            }
            if (filters.expertise) {
                params = params.set('expertise', filters.expertise);
            }
            if (filters.departmentId) {
                params = params.set('departmentId', filters.departmentId);
            }
            if (filters.specialtyCodename) {
                params = params.set(
                    'specialtyCodename',
                    filters.specialtyCodename
                );
            }
            if (filters.universityStudyYear !== undefined) {
                params = params.set(
                    'universityStudyYear',
                    filters.universityStudyYear.toString()
                );
            }
            if (filters.recruitmentId) {
                params = params.set('recruitmentId', filters.recruitmentId);
            }
            if (filters.technicalRole) {
                params = params.set('technicalRole', filters.technicalRole);
            }
        }

        return this.http.get<AdminAccountsResponse>(this.apiUrl, { params });
    }

    getDepartments(): Observable<Department[]> {
        return this.http.get<Department[]>('http://localhost:5001/departments');
    }

    getSpecialties(departmentId: string): Observable<any[]> {
        return this.http.get<any[]>(
            `http://localhost:5001/departments/${departmentId}/specialties`
        );
    }

    getRecruitments(): Observable<Recruitment[]> {
        return this.http.get<Recruitment[]>(
            'http://localhost:5001/recruitment/closed'
        );
    }

    updateAccount(accountId: string, accountData: any): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/${accountId}/update`,
            accountData
        );
    }
}
