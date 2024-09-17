import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { SpecialExtType,ScopeType } from "ucbuilder/build/common";
export interface Control {
    name: string;
    type?: SpecialExtType;
    scope: ScopeType;
    proto: string;
    src?: codeFileInfo;
    nodeName: string;
}
export const control: Control = {
    name: "",
    type: 'none',
    scope: "public",
    proto: "",
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
