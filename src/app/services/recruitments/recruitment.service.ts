import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActiveRecruitmentDto } from '../../pages/admin/active-recruitments-management/models/active-recruitment.model';
import { RecruitmentOpenRequest } from '../../pages/admin/active-recruitments-management/models/recruitment-request.model';

@Injectable({
    providedIn: 'root',
})
export class RecruitmentService {
    constructor(private http: HttpClient) {}

    getActiveRecruitments(): Observable<ActiveRecruitmentDto[]> {
        return this.http.get<ActiveRecruitmentDto[]>(
            `${environment.apiBaseUrl}/recruitment/active`
        );
    }

    openRecruitment(request: RecruitmentOpenRequest): Observable<any> {
        return this.http.post(
            `${environment.apiBaseUrl}/admin/recruitment/open`,
            request
        );
    }

    closeRecruitment(recruitmentId: string): Observable<any> {
        return this.http.post(
            `${environment.apiBaseUrl}/admin/recruitment/close`,
            JSON.stringify(recruitmentId),
            {
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
