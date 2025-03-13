import { SelectOption } from '../../common/components/dropdown/write-dropdowns';

export interface FilterOptionGroup {
    units: SelectOption[];
    expertise: SelectOption[];
    studyYears: SelectOption[];
    technicalRoles: SelectOption[];
}

export function getFilterOptions(): FilterOptionGroup {
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
        studyYears: Array.from({ length: 6 }, (_, i) => ({
            id: (i + 1).toString(),
            displayedName: (i + 1).toString(),
        })),
        technicalRoles: [
            { id: 'INTERN', displayedName: 'Intern' },
            { id: 'DEVELOPER', displayedName: 'Developer' },
            { id: 'PREMASTER', displayedName: 'Premaster' },
            { id: 'MASTER', displayedName: 'Master' },
            { id: 'TECHLEAD', displayedName: 'Techlead' },
        ],
    };
}
