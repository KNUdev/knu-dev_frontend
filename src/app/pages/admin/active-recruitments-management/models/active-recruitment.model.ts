import { Expertise } from '../../../../common/models/enums';

export interface ActiveRecruitmentDto {
    id: string;
    name: string;
    startedAt: string;
    deadlineDate: string;
    expertise: Expertise;
    maxCandidates: number;
    joinedPeopleAmount: number;
}
