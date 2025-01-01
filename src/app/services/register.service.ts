import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
interface Specialty {
    id: string;
    codeName: string;
    name: {
        enName: string;
        ukName: string;
    };
}

interface Department {
    id: string;
    name: {
        enName: string;
        ukName: string;
    };
}

interface RegisterFormData {
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    password: string;
    departmentId: string;
    specialtyCodename: string;
    expertise: string;
    course: number;
}

const REGISTER_CONSTANTS = {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 64,
    EMAIL_DOMAIN: '@knu.ua',
    NAME_PATTERN: "[A-Za-z'-]+",
    PASSWORD_PATTERN: '(?=.*[A-Za-z])(?=.*\\d).+',
    EMAIL_PATTERN: '^[\\w.-]+@knu\\.ua$',
    COURSES: [1, 2, 3, 4, 5, 6],
    API_ENDPOINTS: {
        DEPARTMENTS: 'http://localhost:5001/departments',
        REGISTER: 'http://localhost:5001/account/register',
    },
} as const;

@Injectable({
    providedIn: 'root',
})
export class RegisterService {
    constructor(private http: HttpClient) {}

    getDepartments(): Observable<Department[]> {
        return this.http.get<Department[]>(
            REGISTER_CONSTANTS.API_ENDPOINTS.DEPARTMENTS
        );
    }

    getSpecialties(departmentId: string): Observable<Specialty[]> {
        return this.http.get<Specialty[]>(
            `${REGISTER_CONSTANTS.API_ENDPOINTS.DEPARTMENTS}/${departmentId}/specialties`
        );
    }

    register(formData: RegisterFormData): Observable<any> {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });
        return this.http.post(REGISTER_CONSTANTS.API_ENDPOINTS.REGISTER, data);
    }
}
