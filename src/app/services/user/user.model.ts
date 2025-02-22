import { MultiLanguageField } from '../../common/models/shared.model';
import {
    Department,
    Specialty,
} from '../../pages/auth/register/register.model';

export enum TechnicalRole {
    NONE = 'NONE',
    INTERN = 'INTERN',
    DEVELOPER = 'DEVELOPER',
    PREMASTER = 'PREMASTER',
    MASTER = 'MASTER',
    TECHLEAD = 'TECHLEAD',
}

export interface RoleColors {
    [TechnicalRole.NONE]: string;
    [TechnicalRole.INTERN]: string;
    [TechnicalRole.DEVELOPER]: string;
    [TechnicalRole.PREMASTER]: string;
    [TechnicalRole.MASTER]: string;
    [TechnicalRole.TECHLEAD]: string;
}

export const TECHNICAL_ROLE_COLORS: RoleColors = {
    [TechnicalRole.NONE]: '#a0a0a0',
    [TechnicalRole.INTERN]: '#4264ed',
    [TechnicalRole.DEVELOPER]: '#e5383a',
    [TechnicalRole.PREMASTER]: '#3fcb49',
    [TechnicalRole.MASTER]: '#9542ed',
    [TechnicalRole.TECHLEAD]: '#edd342',
} as const;

export const TECHNICAL_ROLES = Object.values(TechnicalRole);

export enum Expertise {
    BACKEND,
    FRONTEND,
    FULLSTACK,
}

export type AccountProfile = {
    id: string;
    email: string;
    fullName: string;
    technicalRole: TechnicalRole;
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
    name: MultiLanguageField;
    description: MultiLanguageField;
    banner: string;
};

export type Education = {
    name: MultiLanguageField;
    description: MultiLanguageField;
    banner: string;
    totalTasks: number;
    totalTests: number;
    durationInDays: number;
    programExpertise: Expertise;
};
