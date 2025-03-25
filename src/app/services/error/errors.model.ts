export interface LocalizedErrorMessages {
    [field: string]: { en: string; uk: string } | string;
}

export interface LocalizedErrorMessagesArray {
    [field: string]: Array<{ en: string; uk: string } | string>;
}
