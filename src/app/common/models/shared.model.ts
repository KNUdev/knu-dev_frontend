export interface MultiLanguageField {
    [key: string]: string | undefined;
    en?: string;
    uk?: string;
}

export interface EducationProgramDto {
    id: string;
    name: MultiLanguageField;
    description: MultiLanguageField;
    expertise: string; // or you can create an enum for Expertise
    isPublished: boolean;
    version: number;
    finalTaskUrl: string;
    sections: ProgramSectionDto[];
}

export interface ProgramSectionDto {
    id: string;
    name: MultiLanguageField;
    description: MultiLanguageField;
    modules: ProgramModuleDto[];
    finalTaskFile?: File; // <--- locally used for the UI
}

export interface ProgramModuleDto {
    id: string;
    name: MultiLanguageField;
    description: MultiLanguageField;
    finalTaskUrl: string;
    topics: ProgramTopicDto[];
    finalTaskFile?: File;    // <--- for local usage only
}

export interface ProgramTopicDto {
    id: string;
    name: MultiLanguageField;
    description: MultiLanguageField;
    learningResources: string[];
    taskUrl: string;
    taskFile?: File;         // <--- for local usage only
}


export interface SprintDto {
    sprintId: string;
    orderIndex: number;
    sprintType: string; // e.g., "TOPIC", "MODULE_FINAL", "SECTION_FINAL", "PROGRAM_FINAL"
    durationDays: number;
    title: string;       // e.g., topic name or "Module Final: [Module Name]"
    description: string; // optional short info
    sprintStatus: 'FUTURE' | 'ACTIVE' | 'COMPLETED';
    // When in an active session, extra details are available:
    detailedInfo?: DetailedSprintInfoDto;
}

export interface DetailedSprintInfoDto {
    submissionHistory: SprintAttemptDto[];
    sprintScore?: number;
    sprintPassingDate?: string; // ISO date string
    taskUrl?: string;
    learningResources?: string[];
    testMetadata?: TestMetadataDto;
}

export interface SprintAttemptDto {
    attemptId: string;
    attemptNumber: number;
    submittedAt: string; // ISO date string
    submissionFile: string;
    mentorFeedback?: string;
    score?: number;
    attemptStatus: string;
}

export interface TestMetadataDto {
    testId: string;
    testName: string;
    totalQuestions: number;
    // add additional fields as needed
}

export interface SessionFullDto {
    sessionId: string;
    program: EducationProgramDto;
    sessionStartDate: string; // ISO date string
    sessionEndDate: string;   // ISO date string
    status: string;           // e.g., "CREATED", "ONGOING", "COMPLETED"
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
    submissionFile: string; // or a file object, if using FormData
}

export interface SprintSubmissionDto {
    submissionId: string;
    participantId: string;
    lastSubmissionTime: string; // ISO date string
    attempts: SprintAttemptDto[];
}

export interface ReviewRequestDto {
    score?: number;
    comment: string;
    requestResend: boolean;
}


