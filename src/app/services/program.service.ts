import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EducationProgramDto } from '../common/models/shared.model';
import {environment} from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class ProgramService {
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) {}

    /**
     * Get an existing program by ID (if updating).
     */
    public getProgramById(programId: string): Observable<EducationProgramDto> {
        // Adjust to your actual endpoint for fetching a program
        return this.http.get<EducationProgramDto>(this.apiBaseUrl +`/admin/education/program?id=${programId}`);
    }

    /**
     * The single call that sends the entire program in a single FormData
     * for both create and update scenarios.
     */
    public saveProgramInOneCall(formData: FormData): Observable<EducationProgramDto> {
        return this.http.post<EducationProgramDto>(
            this.apiBaseUrl+
            '/admin/education/program/save',
            formData
        );
    }
}
