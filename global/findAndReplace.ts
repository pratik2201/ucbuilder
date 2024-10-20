export interface ReplaceTextRow {
    id?: number;
    originalFinderText: string;
    textToFind: string;
    replaceWith: string;
    cssVars?: { key: string, value: string }[];
}
export type LocationType = "root" | "out";
export interface LocationOf {
    outDir: string,
    rootDir: string,
}
export const rootDirectoryOf: LocationOf = {
    outDir: "/",
    rootDir: "",
   
};
export const replaceTextRow: ReplaceTextRow = {
    id: 0,
    originalFinderText: "",
    textToFind: "",
    replaceWith: "",
    cssVars: [],
};



export type PathType = "full" | "alice" | "sort" |  "none";
export interface RootPathRow {
    id: number,
    path: string,
    alices: string,
    index: number,
    isAlreadyFullPath: boolean,
    defaultLoadAt?:HTMLElement,
    pathType : PathType,
    outputDirectory: string,
    location: LocationOf,
    tInfo: ReplaceTextRow,

    cssVars: { key: string, value: string }[],
}

export const rootPathRow: RootPathRow = {
    id: -1,
    path: '',
    alices: '',
    index: -1,
    outputDirectory: '',    
    pathType:"none",
    isAlreadyFullPath: false,
    location: {
        outDir: "/",
        rootDir: "",
    },
    tInfo: {
        id: 0,
        originalFinderText: "",
        textToFind: "",
        replaceWith: "",
          cssVars: [],
    },
    cssVars: [],
}