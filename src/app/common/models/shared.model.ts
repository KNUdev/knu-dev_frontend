import {Expertise} from '../../pages/user-profile/user-profile.model';

export interface LearningUnit {
    finalTaskUrl?: string;
    finalTaskFilename?: string;
    id: string;
    name: MultiLanguageField;
    description: MultiLanguageField;
}

export interface MultiLanguageField {
    en?: string;
    uk?: string;

    [key: string]: string | undefined;
}

export interface EducationProgramDto extends LearningUnit {
    expertise: Expertise;
    published: boolean;
    sections: ProgramSectionDto[];
    finalTaskFile?: File;
    createdDate: string;
    lastModifiedDate: string;
}

export interface ProgramSectionDto extends LearningUnit {
    modules: ProgramModuleDto[];
    finalTaskFile?: File;
    orderIndex: number;
}

export interface ProgramModuleDto extends LearningUnit {
    topics: ProgramTopicDto[];
    finalTaskFile?: File;
    orderIndex: number;
}

export interface ProgramTopicDto extends LearningUnit {
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
