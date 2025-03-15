import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '../../common/components/dropdown/write-dropdowns';

export interface FilterOptionGroup {
    units: SelectOption[];
    expertise: SelectOption[];
    studyYears: SelectOption[];
    technicalRoles: SelectOption[];
}

export function getFilterOptions(
    translateService: TranslateService
): FilterOptionGroup {
    return {
        units: [
            { id: 'CAMPUS', displayedName: 'Campus' },
            { id: 'PRECAMPUS', displayedName: 'Pre-campus' },
        ],
        expertise: [
            { id: 'FULLSTACK', displayedName: 'Fullstack' },
            { id: 'BACKEND', displayedName: 'Backend' },
            { id: 'FRONTEND', displayedName: 'Frontend' },
            { id: 'UI_UX_DESIGNER', displayedName: 'UI/UX Designer' },
        ],
        studyYears: Array.from({ length: 10 }, (_, i) => {
            const year = i + 1;
            const translation = translateService.instant(
                `yearOfStudy.${i}.displayedName`
            );
            return {
                id: year.toString(),
                displayedName:
                    translation !== `yearOfStudy.${i}.displayedName`
                        ? translation
                        : year.toString(),
            };
        }),
        technicalRoles: [
            { id: 'INTERN', displayedName: 'Intern' },
            { id: 'DEVELOPER', displayedName: 'Developer' },
            { id: 'PREMASTER', displayedName: 'Premaster' },
            { id: 'MASTER', displayedName: 'Master' },
            { id: 'TECHLEAD', displayedName: 'Techlead' },
        ],
    };
}
