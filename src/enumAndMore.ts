import { codeFileInfo } from "./build/codeFileInfo.js";
import { newObjectOpt } from "./global/objectOpt.js";
import { Usercontrol } from "./Usercontrol.js";



export type UCGenerateMode = "client" | "designer";
export type UcStates = "normal" | "dock" | "minimize" | "maximize";

export interface RootPathParam {
    addIntoFileDataBankAlso?: boolean,
    addModule?: boolean,
    buildOption?: {
        addPathInProjectBuild?: boolean,
        removeSomeSpecialPathFromProjectBuild?: boolean
    },
}
export const rootPathParam: RootPathParam = {
    addIntoFileDataBankAlso: true,
    addModule: true,
    buildOption: {
        addPathInProjectBuild: true,
        removeSomeSpecialPathFromProjectBuild: true
    },
}



export interface SessionOptions {
    addNodeToParentSession?: boolean;
    loadBySession?: boolean;
    uniqueIdentity?: string;
}
export const sessionOptions: SessionOptions = {
    addNodeToParentSession: false,
    loadBySession: false,
    uniqueIdentity: "",
};


export type WrapperNodeNameAs = "wrapper" | "targetElement" | "random";
export type StringExchangerCallback = (content: string) => string;
export interface ISourceOptions {
    htmlRow?: any;
    htmlImportMetaUrl?: string;
    htmlContents?: string;
    cssContents?: string;
    cssBaseFilePath?: string;
    htmlFilePath?: string;
    //beforeContentAssign: StringExchangerCallback;
}
export const SourceOptions: ISourceOptions = {
    /*beforeContentAssign: (content) => {
        return content;
    },*/
};

export interface ITemplatePathOptions {
    accessKey: string;
    objectKey: string;
    htmlContents?: string;
    cssContents?: string;
    tptCSSContents?: string;
}
export const TemplatePathOptions: ITemplatePathOptions = {
    accessKey: "",
    objectKey: "",
    htmlContents: "",
    cssContents: "",
};
export type WhatToDoWithTargetElement = "replace" | "append";

export interface IUcOptions {
    cfInfo?: codeFileInfo;
    mode?: UCGenerateMode;
    session?: SessionOptions;
    source?: ISourceOptions;
    parentUc?: Usercontrol;
    accessName?: string,
    context?: any,
    events?: {
        beforeInitlize?: (uc: Usercontrol) => void;
        afterInitlize?: (uc: Usercontrol) => void;
    };
    dialogUnder?: Usercontrol,
    //decisionForTargerElement?: WhatToDoWithTargetElement;
    targetElement?: HTMLElement;
}
export const UcOptions: IUcOptions = {
    mode: 'client',
    accessName: '',
    session: newObjectOpt.clone<SessionOptions>(sessionOptions),
    source: newObjectOpt.clone<ISourceOptions>(SourceOptions),
    //loadAt: document.body,
    // decisionForTargerElement: 'append',  // waitForDecision
    events: {
        beforeInitlize: async (uc) => {

        },
        afterInitlize: async (uc) => {

        }
    },
};


export interface ITptOptions {
    cfInfo?: codeFileInfo;
    MakeEmptyTemplate?: boolean;
    cssBaseFilePath?: string;
    /// elementHT?: HTMLElement;
    // source?: ISourceOptions;
    //beforeContentAssign?: (s: string) => string;
    // accessName?:string,
    parentUc?: Usercontrol;
}
export const TptOptions: ITptOptions = {
    MakeEmptyTemplate: false,

    //source: newObjectOpt.clone<ISourceOptions>(SourceOptions),
    //beforeContentAssign:(s)=>s,
    // accessName:'',
};
// export class UCConfig extends UcRunTimeConfig {

//     globalAlias?: { [alice: string]: string; } = {};
//     pathAlias?: { [alice: string]: string; } = {};
//     developer = new IDeveloperOptions();
//     importMap: IImportMap;
//     importMetaURL: string = "";
//     dependOn?: { [ucConfigPath: string]: string; };
//     projectPrimaryAlice?: string = "";
//     pathToAlice?: { [alice: string]: string; } = {};
//     aliceToPath?: { [alice: string]: string; } = {};
//     preference?: IUCConfigPreference = {
//         designerDir: "",
//         srcDir: "",
//         outDir: "",
//     };
//     type?: 'ts' | 'js' = 'ts';
//     projectName?: string = "";
//     projectPath?: string = "";
//     rootPath?: string = "";
//     children?: IUCConfig[] = [];
//     preloadMain?: string[];
// }
