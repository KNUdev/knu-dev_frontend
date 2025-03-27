import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '../../../common/components/dropdown/write-dropdowns';
import {
    Expertise,
    KNUdevUnit,
    TechnicalRole,
    getEnumValues,
} from '../../../common/models/enums';

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
        units: getEnumValues(KNUdevUnit).map((id) => ({
            id,
            displayedName: id === KNUdevUnit.CAMPUS ? 'Campus' : 'Pre-campus',
        })),
        expertise: getEnumValues(Expertise).map((id) => ({
            id,
            displayedName:
                id === Expertise.UI_UX_DESIGNER
                    ? 'UI/UX Designer'
                    : id.charAt(0) + id.slice(1).toLowerCase(),
        })),
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
        technicalRoles: getEnumValues(TechnicalRole).map((id) => ({
            id,
            displayedName: id.charAt(0) + id.slice(1).toLowerCase(),
        })),
    };
}
