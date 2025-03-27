import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    ClosedRecruitmentFilter,
    ClosedRecruitmentResponse,
} from '../../pages/admin/closed-recruitments/models/closed-recruitment.model';

@Injectable({
    providedIn: 'root',
})
export class ClosedRecruitmentService {
    constructor(private http: HttpClient) {}

    getClosedRecruitments(
        filters: ClosedRecruitmentFilter
    ): Observable<ClosedRecruitmentResponse> {
        let params = new HttpParams()
            .set('pageNumber', filters.pageNumber.toString())
            .set('pageSize', filters.pageSize.toString());

        if (filters.name) {
            params = params.set('name', filters.name);
        }

        if (filters.expertise) {
            params = params.set('expertise', filters.expertise);
        }

        if (filters.startedAt) {
            params = params.set('startedAt', filters.startedAt);
        }

        if (filters.closedAt) {
            params = params.set('closedAt', filters.closedAt);
        }

        return this.http.get<ClosedRecruitmentResponse>(
            `${environment.apiBaseUrl}/recruitment/closed`,
            { params }
        );
    }
}
