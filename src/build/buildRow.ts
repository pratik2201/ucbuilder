import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { SpecialExtType, ScopeType } from "ucbuilder/build/common";
export interface IControl {
    name: string;
    type?: SpecialExtType;
    scope: ScopeType;
    generic?: string,
    proto: string;
    importedClass?: ImportClassNode;
    src?: codeFileInfo;
    nodeName: string;
}
export class Control /*implements IControl*/ {
    private _name: string;
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value; 
        if (value.match(/^(?!\d)\w+$/) != null) {
            this._nameQT = value;
            this._nameThis = `.${value}`;
        } else {
            this._nameQT = `"${value}"`;
            this._nameThis = `["${value}"]`;
        } 
        
    }
    _nameQT: string = '';
    get nameQT() { return  this._nameQT };
    _nameThis: string = '';
    get nameThis() { return this._nameThis };
    
    type?: SpecialExtType = 'none';
    generic?: string = '';
    scope: ScopeType = "public";
    proto: string = "";
    importedClass?: ImportClassNode = undefined;
    src?: codeFileInfo = undefined;
    nodeName: string = "";
    constructor() {

    }
    /*name: "",
    type: 'none',
    generic:'',
    scope: "public",
    proto: "",
    importedClass:undefined,
    src: undefined,
    nodeName: "",*/
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
    get importText(): string;
    get objText(): string;
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
        getterFunk: string;
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
        getterFunk: "",
        className: "",
        templetes: [],
        controls: [],
        importClasses: [],
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
