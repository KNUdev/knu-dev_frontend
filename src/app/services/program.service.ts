import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    EducationProgramDto,
    ProgramSectionDto,
    ProgramModuleDto,
    ProgramTopicDto, ProgramSummary
} from '../common/models/shared.model';
import {environment} from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class ProgramService {
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) {}

    public getAll(): Observable<ProgramSummary[]> {
        return this.http.get<ProgramSummary[]>(this.apiBaseUrl+`/admin/education/programs`);
    }

    public getProgramById(id: string): Observable<EducationProgramDto> {
        return this.http.get<EducationProgramDto>(this.apiBaseUrl+`/admin/education/program?id=${id}`);
    }

    /**
     * Single call that handles newly created items in one shot.
     */
    public saveProgramInOneCall(formData: FormData): Observable<EducationProgramDto> {
        return this.http.post<EducationProgramDto>(
            this.apiBaseUrl+'/admin/education/program/save',
            formData
        );
    }

    // ------------------------------------------------------------
    // Separate endpoints for immediate updates
    // ------------------------------------------------------------

    public updateProgram(
        programId: string,
        data: {
            ukName: string;
            enName: string;
            ukDesc: string;
            enDesc: string;
            expertise: string;
        },
        finalTaskFile?: File
    ): Observable<EducationProgramDto> {
        const formData = new FormData();
        // formData.append('existingProgramId', programId);
        // Only patch the name / desc / final task as needed
        formData.append('name.en', data.enName);
        formData.append('name.uk', data.ukName);
        formData.append('description.en', data.enDesc);
        formData.append('description.uk', data.ukDesc);
        formData.append('expertise', data.expertise.toUpperCase());
        if (finalTaskFile) {
            formData.append('finalTask', finalTaskFile);
        }
        return this.http.post<EducationProgramDto>(
            this.apiBaseUrl +
            `/admin/education/program/${programId}/update`,
            formData
        );
    }

    public updateSection(
        sectionId: string,
        data: {
            ukName: string;
            enName: string;
            ukDesc: string;
            enDesc: string;
        },
        finalTaskFile?: File
    ): Observable<ProgramSectionDto> {
        const formData = new FormData();
        // formData.append('existingSectionId', sectionId);
        formData.append('name.en', data.enName);
        formData.append('name.uk', data.ukName);
        formData.append('description.en', data.enDesc);
        formData.append('description.uk', data.ukDesc);
        if (finalTaskFile) {
            formData.append('finalTask', finalTaskFile);
        }
        return this.http.patch<ProgramSectionDto>(
            this.apiBaseUrl +
            `/admin/education/section/${sectionId}/update`,
            formData
        );
    }

    public updateModule(
        moduleId: string,
        data: {
            ukName: string;
            enName: string;
            ukDesc: string;
            enDesc: string;
        },
        finalTaskFile?: File
    ): Observable<ProgramModuleDto> {
        const formData = new FormData();
        // formData.append('existingModuleId', moduleId);
        formData.append('name.en', data.enName);
        formData.append('name.uk', data.ukName);
        formData.append('description.en', data.enDesc);
        formData.append('description.uk', data.ukDesc);
        if (finalTaskFile) {
            formData.append('finalTask', finalTaskFile);
        }
        return this.http.post<ProgramModuleDto>(
            this.apiBaseUrl +
            `/admin/education/module/${moduleId}/update`,
            formData
        );
    }

    public updateTopic(
        topicId: string,
        data: {
            ukName: string;
            enName: string;
            ukDesc: string;
            enDesc: string;
            difficulty: number;
            testId: string;
        },
        taskFile?: File
    ): Observable<ProgramTopicDto> {
        const formData = new FormData();
        // formData.append('existingTopicId', topicId);
        formData.append('name.en', data.enName);
        formData.append('name.uk', data.ukName);
        formData.append('description.en', data.enDesc);
        formData.append('description.uk', data.ukDesc);
        formData.append('difficulty', data.difficulty.toString());
        formData.append('testId', data.testId);
        if (taskFile) {
            formData.append('task', taskFile);
        }
        return this.http.patch<ProgramTopicDto>(
            this.apiBaseUrl +
            `/admin/education/topic/${topicId}/update`,
            formData
        );
    }
}
