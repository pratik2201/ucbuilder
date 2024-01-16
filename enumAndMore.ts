import { Usercontrol } from '@ucbuilder:/Usercontrol';
import { Template } from '@ucbuilder:/Template';
import { codeFileInfo } from '@ucbuilder:/build/codeFileInfo';
import { newObjectOpt } from '@ucbuilder:/global/objectOpt';

export type UCGenerateMode = "client" | "designer";
export type UcStates = "normal" | "dock" | "minimize" | "maximize";

export interface RootPathRow {
    id: number,
    path: string,
    alices: string, 
    index: number, // -1
    isAlreadyFullPath: boolean, // false
    cssVars: {key:string,value:string}[],
}
export const rootPathRow: RootPathRow = {
    id: -1,
    path: '',
    alices:'', 
    index: -1,
    isAlreadyFullPath: false,
    cssVars: [],
}



export interface RootPathParam {
    level: number,
    addIntoFileDataBankAlso: boolean,
    addModule: boolean,
    buildOption: {
        addPathInProjectBuild: boolean,
        removeSomeSpecialPathFromProjectBuild: boolean
    },
}
export const rootPathParam: RootPathParam = {
    level: 4,
    addIntoFileDataBankAlso: true,
    addModule: true,
    buildOption: {
        addPathInProjectBuild: true,
        removeSomeSpecialPathFromProjectBuild: true
    },
}



export interface SessionOptions {
    addNodeToParentSession: boolean;
    loadBySession: boolean;
    uniqueIdentity: string;
}
export const sessionOptions: SessionOptions = {
    addNodeToParentSession: false,
    loadBySession: false,
    uniqueIdentity: "",
};



interface SourceOptions {
    cfInfo?: codeFileInfo;
    nodeNameAs: "wrapper" | "targetElement" | "random";
    targetElementNodeName: string;
    templateName: string;
    reloadKey: string;
    reloadDesign: boolean;
    htmlContents?: string;
    cssContents?: string;
    beforeContentAssign: (uc: string) => void;
}
export const sourceOptions: SourceOptions = {
    nodeNameAs: "wrapper",
    targetElementNodeName: "as",
    templateName: "",
    reloadKey: "",
    reloadDesign: false,
    beforeContentAssign: (uc) => {

    },
};



export interface UcOptions {
    mode: UCGenerateMode;
    session: SessionOptions;
    source: SourceOptions;
    parentUc?: Usercontrol;
    loadAt?: HTMLElement;
    events: {
        beforeInitlize: (uc: Usercontrol) => void;
    };
    wrapperHT?: HTMLElement;
}
export const ucOptions: UcOptions = {
    mode:  'client',
    session: newObjectOpt.clone<SessionOptions>(sessionOptions),
    source: newObjectOpt.clone<SourceOptions>(sourceOptions),
    events: {
        beforeInitlize: (uc) => {

        },
    },
};



interface TemplatePathOptions {
    name: string;
    mainFilePath: string;
    htmlContents: string;
    cssContents: string;
    mainTpt?: Template;
}
export const templatePathOptions: TemplatePathOptions = {
    name: "",
    mainFilePath: "",
    htmlContents: "",
    cssContents: "",
};



interface TptOptions {
    elementHT?: HTMLElement;
    source: SourceOptions;
    parentUc?: Usercontrol;
}
export const tptOptions: TptOptions = {
    source: newObjectOpt.clone<SourceOptions>(sourceOptions),
};


