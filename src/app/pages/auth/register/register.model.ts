export interface Specialty {
    id?: string;
    codeName: string;
    name: {
        enName: string;
        ukName: string;
    };
}

export interface Department {
    id: string;
    name: {
        enName: string;
        ukName: string;
    };
}

export interface ValidationErrors {
    [key: string]: string[];
}

export interface Course {
    id: number;
    displayedName: string;
}

export const ERROR_KEY_TO_CONTROL: Record<string, string> = {
    firstNameErrors: 'firstName',
    lastNameErrors: 'lastName',
    middleNameErrors: 'middleName',
    emailErrors: 'email',
    passwordErrors: 'password',
    departmentIdErrors: 'departmentId',
    specialtyCodenameErrors: 'specialtyCodename',
    courseErrors: 'course',
    expertiseErrors: 'expertise',
};
