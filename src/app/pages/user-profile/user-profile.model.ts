import {Department, Specialty} from '../auth/register/register.model';

export enum AccountTechnicalRole {
    INTERN,
    DEVELOPER,
    PREMASTER,
    MASTER,
    TECHLEAD
}

export enum Expertise {
    BACKEND,
    FRONTEND,
    FULLSTACK
}

export type AccountProfile = {
    id: string;
    email: string;
    fullName: string;
    technicalRole: AccountTechnicalRole;
    expertise: Expertise;
    avatarImageUrl: string;
    bannerImageUrl: string;
    department: Department;
    specialty: Specialty;
    registeredAt: Date;
    projects: Project[];
    completedEducationPrograms: Education[]
};

type Project = {
    name: {
        en: string;
        uk: string;
    },
    description: {
        en: string;
        uk: string;
    },
    avatarFilename: string;
}

type Education = {
    totalTasks: number,
    totalTests: number,
    durationInDays: number,
    programExpertise: Expertise
}
