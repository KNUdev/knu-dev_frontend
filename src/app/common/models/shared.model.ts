export interface MultiLanguageField {
    [key: string]: string | undefined;
    // Additionally, you can still define known fields
    en?: string;
    uk?: string;
    // ...
}
