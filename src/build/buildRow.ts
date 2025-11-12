import { SpecialExtType } from "../global/ucUtil.js";
import { codeFileInfo } from "./codeFileInfo.js";
import { ScopeType } from "./common.js";

 

export class Control {
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
    get nameQT() { return this._nameQT };
    _nameThis: string = '';
    get nameThis() { return this._nameThis };

    codeFilePath: string = "";
    type?: SpecialExtType = 'none';
    generic?: string = '';
    scope: ScopeType = "public";
    proto: string = "";
    importedClassName?: string = undefined;
    //importedClass?: ImportClassNode = undefined;
    src?: codeFileInfo = undefined;
    nodeName: string = "";
    constructor() {

    }
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
export interface ImportClassNameAlices {
    name: string;
    alias: string;
    asText?: string;
}
export interface ImportClassNode {
    //name: string;
    //alice: string;
    url: string;
    names?: ImportClassNameAlices[];
    //get importText(): string;
    //get objText(): string;
}
export class CommonRow {
    src: codeFileInfo;

    codeFilePath = "";
    designerFilePath = "";
    htmlFilePath?: string;
    htmlFileContent?: string;
    baseClassName = "";
    designer = {
        extType: "",
        getterFunk: "",
        className: "",
        templetes: [] as Template[],
        controls: [] as Control[],
        importClasses: [] as ImportClassNode[],
    }
    codefile = {
        className: "",
    }
    _extends = {
        _importedNames: {} as { [name: string]: number },
        addImport: (names: string[], url: string) => {
            let _urlLowerCase = url.toLowerCase();
            let _importclasses = this.designer.importClasses;
            let impNames = this._extends._importedNames;
            let _import = _importclasses.find(s => s.url.toLowerCase() == _urlLowerCase);
            let rtrn: string[] = [];
            function getNameNumber(name: string) {
                let impName = impNames[name];
                if (impName == undefined) {
                    impNames[name] = 0;
                    return name;
                }
                else {
                    impName++;
                    impNames[name] = impName;
                    return `${name}${impName}`;
                }
            }

            if (_import != undefined) {
                names.forEach(name => {
                    let fnd = _import.names.find(s => s.name == name);
                    if (fnd == undefined) {
                        fnd = {
                            alias: getNameNumber(name),
                            name: name
                        };
                        fnd.asText = fnd.alias === fnd.name ? fnd.alias : `${fnd.name} as ${fnd.alias}`
                        _import.names.push(fnd);
                    }
                    rtrn.push(fnd.alias);
                });
            } else {
                _import = {
                    names: [],
                    url: url,
                }
                _importclasses.push(_import);
                names.forEach(name => {
                    let fnd: ImportClassNameAlices = {
                        alias: getNameNumber(name),
                        name: name
                    };
                    fnd.asText = fnd.alias === fnd.name ? fnd.alias : `${fnd.name} as ${fnd.alias}`;
                    _import.names.push(fnd);
                    rtrn.push(fnd.alias);
                });
            }
            return rtrn;
        }
    }
}


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
