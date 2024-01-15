import { Usercontrol } from '@ucbuilder:/Usercontrol';
import { Template } from '@ucbuilder:/Template';
import { codeFileInfo } from '@ucbuilder:/build/codeFileInfo';
import { newObjectOpt } from '@ucbuilder:/global/objectOpt';

interface rootPathParam {
    level: number,
    addIntoFileDataBankAlso: boolean,
    addModule: boolean,
    buildOption: {
        addPathInProjectBuild: boolean,
        removeSomeSpecialPathFromProjectBuild: boolean
    },
}
interface rootPathRow {
    id: number,
    path: string,
    alices: string, 
    index: number, // -1
    isAlreadyFullPath: boolean, // false
    cssVars: {key:string,value:string}[],
}

interface SessionOptions {
    addNodeToParentSession: boolean;
    loadBySession: boolean;
    uniqueIdentity: string;
}

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

interface UcOptions {
    mode: "client";
    session: SessionOptions;
    source: SourceOptions;
    parentUc?: Usercontrol;
    loadAt?: HTMLElement;
    events: {
        beforeInitlize: (uc: Usercontrol) => void;
    };
    wrapperHT?: HTMLElement;
}

interface TemplatePathOptions {
    name: string;
    mainFilePath: string;
    htmlContents: string;
    cssContents: string;
    mainTpt?: Template;
}

interface TptOptions {
    elementHT?: HTMLElement;
    source: SourceOptions;
    parentUc?: Usercontrol;
}

export const UCGenerateMode: "client" | "designer" = "client";

export const rootPathRow: rootPathRow = {
    id: -1,
    path: '',
    alices:'', 
    index: -1,
    isAlreadyFullPath: false,
    cssVars: [],
}
export const rootPathParam: rootPathParam = {
    level: 4,
    addIntoFileDataBankAlso: true,
    addModule: true,
    buildOption: {
        addPathInProjectBuild: true,
        removeSomeSpecialPathFromProjectBuild: true
    },
}


export const templatePathOptions: TemplatePathOptions = {
    name: "",
    mainFilePath: "",
    htmlContents: "",
    cssContents: "",
};





export const sessionOptions: SessionOptions = {
    addNodeToParentSession: false,
    loadBySession: false,
    uniqueIdentity: "",
};

export const sourceOptions: SourceOptions = {
    nodeNameAs: "wrapper",
    targetElementNodeName: "as",
    templateName: "",
    reloadKey: "",
    reloadDesign: false,
    beforeContentAssign: (uc) => {

    },
};
export const tptOptions: TptOptions = {
    source: newObjectOpt.clone<SourceOptions>(sourceOptions),
};
export const ucOptions: UcOptions = {
    mode: "client",
    session: newObjectOpt.clone<SessionOptions>(sessionOptions),
    source: newObjectOpt.clone<SourceOptions>(sourceOptions),
    events: {
        beforeInitlize: (uc) => {

        },
    },
};
export const ucStates: "normal" | "dock" | "minimize" | "maximize" = "normal";