import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {
    EducationProgramDto,
    ProgramModuleDto,
    ProgramSectionDto,
    ProgramSummary,
    ProgramTopicDto
} from '../common/models/shared.model';
import {environment} from 'src/environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class ProgramService {
    private readonly apiBaseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) {
    }

    public getAll(): Observable<ProgramSummary[]> {
        return this.http.get<ProgramSummary[]>(this.apiBaseUrl + `/admin/education/programs`);
    }

    public getSections(): Observable<ProgramSectionDto[]> {
        return this.http.get<ProgramSectionDto[]>(this.apiBaseUrl + `/admin/education/sections`);
    }

    public getModules(): Observable<ProgramModuleDto[]> {
        return this.http.get<ProgramModuleDto[]>(this.apiBaseUrl + `/admin/education/modules`);
    }

    public getTopics(): Observable<ProgramTopicDto[]> {
        return this.http.get<ProgramTopicDto[]>(this.apiBaseUrl + `/admin/education/topics`);
    }

    public getProgramById(id: string): Observable<EducationProgramDto> {
        return this.http.get<EducationProgramDto>(
            this.apiBaseUrl + `/admin/education/program?id=${id}`
        );
    }

    public saveProgramInOneCall(formData: FormData): Observable<EducationProgramDto> {
        console.log(formData);
        return this.http.post<EducationProgramDto>(
            this.apiBaseUrl + '/admin/education/program/save',
            formData
        );
    }

    public publishProgram(programId: string): Observable<EducationProgramDto> {
        return this.http.patch<EducationProgramDto>(
            `${this.apiBaseUrl}/admin/education/program/${programId}/publish`,
            {}
        );
    }

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
        formData.append('name.en', data.enName);
        formData.append('name.uk', data.ukName);
        formData.append('description.en', data.enDesc);
        formData.append('description.uk', data.ukDesc);
        formData.append('expertise', data.expertise.toUpperCase());
        if (finalTaskFile) {
            formData.append('finalTask', finalTaskFile);
        }
        return this.http.patch<EducationProgramDto>(
            this.apiBaseUrl + `/admin/education/program/${programId}/update`,
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
        formData.append('name.en', data.enName);
        formData.append('name.uk', data.ukName);
        formData.append('description.en', data.enDesc);
        formData.append('description.uk', data.ukDesc);
        if (finalTaskFile) {
            formData.append('finalTask', finalTaskFile);
        }
        return this.http.patch<ProgramSectionDto>(
            this.apiBaseUrl + `/admin/education/section/${sectionId}/update`,
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
        formData.append('name.en', data.enName);
        formData.append('name.uk', data.ukName);
        formData.append('description.en', data.enDesc);
        formData.append('description.uk', data.ukDesc);
        if (finalTaskFile) {
            formData.append('finalTask', finalTaskFile);
        }
        return this.http.post<ProgramModuleDto>(
            this.apiBaseUrl + `/admin/education/module/${moduleId}/update`,
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
            learningResources: string[];
        },
        taskFile?: File
    ): Observable<ProgramTopicDto> {
        const formData = new FormData();

        formData.append('name.en', data.enName);
        formData.append('name.uk', data.ukName);
        formData.append('description.en', data.enDesc);
        formData.append('description.uk', data.ukDesc);
        formData.append('difficulty', data.difficulty.toString());
        formData.append('testId', data.testId);

        data.learningResources.forEach((lr, index) => {
            formData.append(`learningResources[${index}]`, lr);
        });

        if (taskFile) {
            formData.append('task', taskFile);
        }

        return this.http.patch<ProgramTopicDto>(
            this.apiBaseUrl + `/admin/education/topic/${topicId}/update`,
            formData
        );
    }


    public deleteProgramById(programId: string): Observable<void> {
        return this.http.delete<void>(
            `${this.apiBaseUrl}/admin/education/mapping/program/${programId}/delete`
        );
    }

    public removeProgramSectionMapping(
        programId: string,
        sectionId: string
    ): Observable<void> {
        return this.http.delete<void>(
            `${this.apiBaseUrl}/admin/education/mapping/program/${programId}/section/${sectionId}/delete`
        );
    }

    public removeSectionModuleMapping(
        programId: string,
        sectionId: string,
        moduleId: string
    ): Observable<void> {
        return this.http.delete<void>(
            `${this.apiBaseUrl}/admin/education/mapping/program/${programId}/section/${sectionId}/module/${moduleId}/delete`
        );
    }

    public removeModuleTopicMapping(
        programId: string,
        sectionId: string,
        moduleId: string,
        topicId: string
    ): Observable<void> {
        return this.http.delete<void>(
            `${this.apiBaseUrl}/admin/education/mapping/program/${programId}/section/${sectionId}/module/${moduleId}/topic/${topicId}/delete`
        );
    }
}
