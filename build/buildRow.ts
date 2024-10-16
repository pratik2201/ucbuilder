import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { SpecialExtType,ScopeType } from "ucbuilder/build/common";
export interface Control {
    name: string;
    type?: SpecialExtType;
    scope: ScopeType;
    proto: string;
    importedClass?: ImportClassNode;
    src?: codeFileInfo;
    nodeName: string;
}
export const control: Control = {
    name: "",
    type: 'none',
    scope: "public",
    proto: "",
    importedClass:undefined,
    src: undefined,
    nodeName: "",
};
export interface Template {
    name: string;
    scope: ScopeType;
    controls: Control[];
}
export const templete: Template = {
    name: "",
    scope: 'public',
    controls: [],
};

export interface ImportClassNode {
    name: string;
    alice: string;
    url: string;
    get importText():string;
    get objText():string;
}
export interface CommonRow {
    src: codeFileInfo;
    htmlFile: {
        reGenerate: boolean;
        content: string;
    };
    designer: {
        extType: string;
        baseClassName: string;
        className: string;
        templetes: Template[];
        controls: Control[];
        importClasses: ImportClassNode[];
    };
    codefile: {
        baseClassName: string;
        className: string;
    };
}
export const commonRow: CommonRow = {
    src: undefined,
    htmlFile: {
        reGenerate: false,
        content: "",
    },
    designer: {
        extType: "",
        baseClassName: "",
        className: "",
        templetes: [],
        controls: [],
        importClasses:[],
    },
    codefile: {
        baseClassName: "",
        className: "",
    },
};

export interface TempleteControl {
    name: string;
    nodeName: string;
    scope: ScopeType;
    proto: string;
}
export const templeteControl: TempleteControl = {
    name: "",
    nodeName: "",
    scope: "public",
    proto: "",
};
