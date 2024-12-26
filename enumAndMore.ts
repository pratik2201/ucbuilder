import { Usercontrol } from "ucbuilder/Usercontrol";
import { Template } from "ucbuilder/Template";
import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import crypto from "crypto";
export type UCGenerateMode = "client" | "designer";
export type UcStates = "normal" | "dock" | "minimize" | "maximize";  
   
export const uniqOpt = {
    get guid(): string {
        return crypto.randomBytes(16).toString('hex');
    },
    
    get guidAs_(): string {
        return crypto.randomBytes(16).toString('hex');
    },
    randomNo(min: number = 0, max: number = 1000000): number {
        let difference = max - min;
        let rand = Math.random();
        rand = Math.floor(rand * difference);
        rand = rand + min;
        return rand;
    },
};


        
export const ROW_ACCESS_KEY = uniqOpt.guid;



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
export interface SourceOptions {
    cfInfo?: codeFileInfo;
    //nodeNameAs: WrapperNodeNameAs;
    targetElementNodeName: string;
    templateName: string;
    reloadKey: string;
    reloadDesign: boolean;
    htmlContents?: string;
    cssContents?: string;
    beforeContentAssign: StringExchangerCallback;
}
export const sourceOptions: SourceOptions = {
    //nodeNameAs: 'wrapper',
    targetElementNodeName: "as",
    templateName: "",
    reloadKey: "",
    reloadDesign: false,
    beforeContentAssign: (content) => {
        return content;
    },
};

export type WhatToDoWithTargetElement = "waitForDecision" | "replace" | "append" | "prepend";

export interface UcOptions {
    mode?: UCGenerateMode;
    session?: SessionOptions;
    source?: SourceOptions;
    parentUc?: Usercontrol;
    accessName?:string,
    events?: {
        beforeInitlize: (uc: Usercontrol) => void;
    };

    decisionForTargerElement?: WhatToDoWithTargetElement;
    targetElement?: HTMLElement;
    loadAt?: HTMLElement;
}
export const ucOptions: UcOptions = {
    mode: 'client',
    accessName: '',
    session: newObjectOpt.clone<SessionOptions>(sessionOptions),
    source: newObjectOpt.clone<SourceOptions>(sourceOptions),
    //loadAt: document.body,
    decisionForTargerElement:'waitForDecision',
    events: {
        beforeInitlize: (uc) => {

        },
    },
};



export interface TemplatePathOptions {
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



export interface TptOptions {
    elementHT?: HTMLElement;
    source?: SourceOptions;
    accessName?:string,
    parentUc?: Usercontrol;
}
export const tptOptions: TptOptions = {
    source: newObjectOpt.clone<SourceOptions>(sourceOptions),
    accessName:'',
};
