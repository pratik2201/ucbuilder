export interface ReplaceTextRow {
    id?: number;
    originalFinderText: string;
    originalLowerCaseText: string;
    textToFind: string;
    replaceWith: string;
    replaceLowerCaseText: string;
    cssVars?: { key: string, value: string }[];
}

export const replaceTextRow: ReplaceTextRow = {
    id: 0,
    originalFinderText: "",
    originalLowerCaseText: "",
    textToFind: "",
    replaceWith: "",
    replaceLowerCaseText: "",
    cssVars: [],
};