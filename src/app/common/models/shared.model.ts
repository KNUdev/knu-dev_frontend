import {Expertise} from '../../pages/user-profile/user-profile.model';
import {buildApplication} from '@angular-devkit/build-angular';

/**
 * Common interface that can hold a finalTaskUrl for
 * programs/sections/modules (or potentially `taskUrl` for topics).
 * We'll keep it optional.
 */
export interface LearningUnit {
    finalTaskUrl?: string;
    finalTaskFilename?: string;
}

/**
 * Multi-language fields: both en/uk optional, plus string index signature if needed.
 */
export interface MultiLanguageField {
    [key: string]: string | undefined;
    en?: string;
    uk?: string;
}

/**
 * Program:
 * - extends LearningUnit for finalTaskUrl
 * - finalTaskFile is optional for new or updated programs
 */
export interface EducationProgramDto extends LearningUnit {
    id: string;
    name: MultiLanguageField;
    description: MultiLanguageField;
    expertise: Expertise;
    isPublished: boolean;
    sections: ProgramSectionDto[];

    /**
     * Locally used to store a new or updated file, optional.
     */
    finalTaskFile?: File;
}

/**
 * Section:
 * - extends LearningUnit for finalTaskUrl
 * - finalTaskFile optional for new or updated file
 */
export interface ProgramSectionDto extends LearningUnit {
    id: string;
    name: MultiLanguageField;
    description: MultiLanguageField;
    modules: ProgramModuleDto[];
    finalTaskFile?: File; // UI usage
    orderIndex: number;
}

export interface ProgramModuleDto extends LearningUnit {
    id: string;
    name: MultiLanguageField;
    description: MultiLanguageField;
    topics: ProgramTopicDto[];
    finalTaskFile?: File;
    orderIndex: number;
}

export interface ProgramTopicDto extends LearningUnit {
    id: string;
    name: MultiLanguageField;
    description: MultiLanguageField;
    learningResources: string[];
    difficulty: number;
    finalTaskFile?: File;
    testId: string;
    orderIndex: number;
}

export interface ProgramSummary {
    id: string;
    name: MultiLanguageField;
    totalSections: number;
    totalModules: number;
    totalTopics: number;
    expertise: Expertise;
    totalActiveSessions: number;
    isPublished: boolean;
    createdAt: Date;
    lastUpdatedAt: Date;
}

/** Sprints, etc. remain unchanged (no finalTaskFile) */
export interface SprintDto {
    sprintId: string;
    orderIndex: number;
    sprintType: string;
    durationDays: number;
    title: string;
    description: string;
    sprintStatus: 'FUTURE' | 'ACTIVE' | 'COMPLETED';
    detailedInfo?: DetailedSprintInfoDto;
}

export interface DetailedSprintInfoDto {
    submissionHistory: SprintAttemptDto[];
    sprintScore?: number;
    sprintPassingDate?: string;
    taskUrl?: string;
    learningResources?: string[];
    testMetadata?: TestMetadataDto;
}

export interface SprintAttemptDto {
    attemptId: string;
    attemptNumber: number;
    submittedAt: string;
    submissionFile: string;
    mentorFeedback?: string;
    score?: number;
    attemptStatus: string;
}

export interface TestMetadataDto {
    testId: string;
    testName: string;
    totalQuestions: number;
}

export interface SessionFullDto {
    sessionId: string;
    program: EducationProgramDto;
    sessionStartDate: string;
    sessionEndDate: string;
    status: string;
    sprints: SprintDto[];
}

export interface SessionSprintPlanDto {
    sections: SectionSprintPlanDto[];
    programFinalSprint: SprintDto;
}

export interface SectionSprintPlanDto {
    sectionId: string;
    sectionName: string;
    modules: ModuleSprintPlanDto[];
    sectionFinalSprint: SprintDto;
}

export interface ModuleSprintPlanDto {
    moduleId: string;
    moduleName: string;
    topicSprints: SprintDto[];
    moduleFinalSprint: SprintDto;
}

export interface CreateSessionRequestDto {
    programId: string;
    mentorIds: string[];
    sprintAdjustments: SprintAdjustmentDto[];
}

export interface SprintAdjustmentDto {
    sprintId: string;
    orderIndex: number;
    durationDays: number;
}

export interface TaskSubmissionRequestDto {
    submissionFile: string;
}

export interface SprintSubmissionDto {
    submissionId: string;
    participantId: string;
    lastSubmissionTime: string;
    attempts: SprintAttemptDto[];
}

export interface ReviewRequestDto {
    score?: number;
    comment: string;
    requestResend: boolean;
}

export type ShortTest = {
    id: string;
    enName: string;
}
