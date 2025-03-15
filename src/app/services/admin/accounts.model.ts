export interface AdminAccountsResponse {
    content: AdminAccount[];
    pageable: Pageable;
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: Sort;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}

export interface AdminAccount {
    id: string;
    email: string;
    technicalRole: string;
    fullName: {
        firstName: string;
        lastName: string;
        middleName: string;
    };
    academicUnitsIds: {
        departmentId: string;
        specialtyCodename: number;
    } | null;
    avatarFilename: string | null;
    bannerFilename: string | null;
    githubAccountUsername: string;
    expertise: string;
    registeredAt: string;
    yearOfStudyOnRegistration: number;
    lastRoleUpdateDate: string | null;
    unit: string;
}

export interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: Sort;
    offset: number;
    unpaged: boolean;
    paged: boolean;
}

export interface Sort {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
}
