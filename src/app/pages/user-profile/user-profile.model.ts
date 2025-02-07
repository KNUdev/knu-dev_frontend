import {Department, Specialty} from '../auth/register/register.model';
import {MultiLanguageField} from '../../common/models/shared.model';

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
    registeredAt: string;
    projects: Project[];
    hasMoreProjects: boolean;
    completedEducationPrograms: Education[];
};

export type Project = {
    name: MultiLanguageField,
    description: MultiLanguageField,
    avatarFilename: string;
}

export type Education = {
    name: MultiLanguageField,
    description: MultiLanguageField,
    banner: string;
    totalTasks: number,
    totalTests: number,
    durationInDays: number,
    programExpertise: Expertise
}
