export interface ReplaceTextRow {
    id?: number;
    originalFinderText: string;
    //originalLowerCaseText: string;
    textToFind: string;
    replaceWith: string;
    //replaceLowerCaseText: string;
    cssVars?: { key: string, value: string }[];
}
export type LocationType = "root" | "out";
export interface LocationOf {
    /*html: string,
    style: string,
    perameters: string,
    designer: string,
    designerSrc: string,
    code: string,
    codeSrc: string, */

    outDir: string,
    //srcDir: string,
    rootDir: string,
   
}
export const rootDirectoryOf: LocationOf = {
    /*html: "",
    style: "",
    perameters: "",
    designer: "",
    designerSrc: "",
    code: "",
    codeSrc: "",*/
    outDir: "/",
    //srcDir: "",
    rootDir: "",
   
};
export const replaceTextRow: ReplaceTextRow = {
    id: 0,
    originalFinderText: "",
    //originalLowerCaseText: "",
    textToFind: "",
    replaceWith: "",
    //replaceLowerCaseText: "",
    cssVars: [],
};



export type PathType = "full" | "alice" | "sort" |  "none";
export interface RootPathRow {
    id: number,
    path: string,
    alices: string,
    index: number,
    isAlreadyFullPath: boolean,
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
        //originalLowerCaseText: "",
        textToFind: "",
        replaceWith: "",
        //replaceLowerCaseText: "",
          cssVars: [],
    },
    cssVars: [],
}