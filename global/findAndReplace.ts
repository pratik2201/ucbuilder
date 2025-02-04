import { SourceNode } from "ucbuilder/lib/stylers/StampGenerator";
import { UcConfig } from "ucbuilder/start";

export interface ReplaceTextRow {
    id?: number;
    originalFinderText: string;
    textToFind: string;
    replaceWith: string;
    //cssVars?: { key: string, value: string }[];
}
export type LocationType = "root" | "out" | "designer";
/*export interface LocationOf {
    outDir: string,
    designerDir: string,
    rootDir: string,
}
export const rootDirectoryOf: LocationOf = {
    outDir: "/",
    designerDir: "/",
    rootDir: "",
};*/
export const replaceTextRow: ReplaceTextRow = {
    id: 0,
    originalFinderText: "",
    textToFind: "",
    replaceWith: "",
    //cssVars: [],
};



export type PathType = "full" | "alice" | "sort" | "none";
export interface RootPathRow {
    id: number,
    path: string,
    alices: string,
    index: number,
    stampSRC: SourceNode;
    isAlreadyFullPath: boolean,
    defaultLoadAt?: HTMLElement,
    pathType: PathType,
    outputDirectory: string,
    location: UcConfig,
    tInfo: ReplaceTextRow,

    //cssVars: { key: string, value: string }[],
}

export const rootPathRow: RootPathRow = {
    id: -1,
    path: '',
    alices: '',
    index: -1,
    outputDirectory: '',
    pathType: "none",
    stampSRC:undefined,
    isAlreadyFullPath: false,
    location: {
        projectName: '',
        outDir: "/",
        designerDir: "/",
        rootDir: "",
        type:'js',
        paths:{},
    },
    tInfo: {
        id: 0,
        originalFinderText: "",
        textToFind: "",
        replaceWith: "",
        //cssVars: [],
    },
    //cssVars: [],
}