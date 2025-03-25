export enum KNUdevUnit {
    CAMPUS = 'CAMPUS',
    PRECAMPUS = 'PRECAMPUS',
}

export enum TechnicalRole {
    INTERN = 'INTERN',
    DEVELOPER = 'DEVELOPER',
    PREMASTER = 'PREMASTER',
    MASTER = 'MASTER',
    TECHLEAD = 'TECHLEAD',
}

export enum Expertise {
    FULLSTACK = 'FULLSTACK',
    BACKEND = 'BACKEND',
    FRONTEND = 'FRONTEND',
    UI_UX_DESIGNER = 'UI_UX_DESIGNER',
}

export function getEnumValues<T extends Record<string, string>>(
    enumObj: T
): string[] {
    return Object.keys(enumObj)
        .filter((key) => isNaN(Number(key)))
        .map((key) => enumObj[key]);
}
