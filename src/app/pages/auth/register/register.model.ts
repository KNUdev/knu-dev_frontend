export interface Specialty {
    id?: string;
    codeName: string;
    name: {
        en: string;
        uk: string;
    };
}

export interface Department {
    id: string;
    name: {
        en: string;
        uk: string;
    };
}

export interface ValidationErrors {
    [key: string]: string[];
}

export interface YearOfStudy {
    id: string;
    displayedName: string;
}

export interface Expertise {
    id: string;
    displayedName: string;
}

export const ERROR_KEY_TO_CONTROL: Record<string, string> = {
    firstNameErrors: 'firstName',
    lastNameErrors: 'lastName',
    middleNameErrors: 'middleName',
    emailErrors: 'email',
    passwordErrors: 'password',
    githubAccountUsernameErrors: 'githubAccount',
    departmentIdErrors: 'departmentId',
    specialtyCodenameErrors: 'specialtyCodename',
    yearOfStudyErrors: 'yearOfStudy',
    expertiseErrors: 'expertise',
};

export const VALIDATION_KEYS = {
    firstName: ['required', 'pattern'],
    lastName: ['required', 'pattern'],
    middleName: ['required', 'pattern'],
    password: ['required', 'minlength', 'maxlength', 'pattern'],
    confirmPassword: ['required', 'passwordMismatch'],
    email: ['required', 'invalidDomain'],
    githubAccount: ['required'],
} as const;
