import { Expertise } from '../../../../common/models/enums';

export interface ClosedRecruitmentDto {
    id: string;
    name: string;
    startedAt: string;
    closedAt: string;
    expertise: Expertise;
    maxCandidates: number;
    joinedPeopleAmount: number;
}

export interface ClosedRecruitmentResponse {
    content: ClosedRecruitmentDto[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalPages: number;
    totalElements: number;
}

export interface ClosedRecruitmentFilter {
    name?: string;
    expertise?: Expertise;
    startedAt?: string;
    closedAt?: string;
    pageNumber: number;
    pageSize: number;
}
