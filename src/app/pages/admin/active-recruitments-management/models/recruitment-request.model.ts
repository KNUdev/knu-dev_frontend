import { Expertise, KNUdevUnit } from '../../../../common/models/enums';

export interface RecruitmentOpenRequest {
    recruitmentName: string;
    expertise: Expertise;
    unit: KNUdevUnit;
    autoCloseConditions: {
        deadlineDate: string;
        maxCandidates: number;
    };
}
