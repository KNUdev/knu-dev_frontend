export interface Specialty {
    codeName: string;
    name: {
        enName: string;
        ukName: string;
    };
}

export interface Department {
    id: string;
    name: {
        enName: string;
        ukName: string;
    };
}

export interface ValidationErrors {
    [key: string]: string[];
}

export interface Course {
    id: number;
    name: string;
}
