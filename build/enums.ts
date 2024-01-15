import * as fs from 'fs';
import { buildOptions, pathInfo,strOpt } from '@ucbuilder:/build/common';
import { rootPathHandler, rootPathRow } from "@ucbuilder:/global/rootPathHandler";
import * as path from 'path';

namespace ucbuilder.build.enums {
   

    interface Control {
        name: string;
        type: buildOptions.extType;
        scope: "private" | "protected" | "package" | "public";
        proto: string;
        src: codeFileInfo | undefined;
        nodeName: string;
    }

    interface Template {
        name: string;
        scope: "private" | "protected" | "package" | "public";
        controls: Control[];
    }

    interface CommonRow {
        src: codeFileInfo | undefined;
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

    export class BuildRow {
        static templeteControls = {
            name: "",
            nodeName: "",
            scope: "" as "private" | "protected" | "package" | "public",
            proto: "",
        };

        static templete = {
            name: "",
            scope: "" as "private" | "protected" | "package" | "public",
            controls: [] as Control[],
        };

        static control = {
            name: "",
            type: buildOptions.extType.none,
            scope: "" as "private" | "protected" | "package" | "public",
            proto: "",
            src: undefined as codeFileInfo | undefined,
            nodeName: "",
        };

        static commonRow = {
            src: undefined as codeFileInfo | undefined,
            htmlFile: {
                reGenerate: false,
                content: "",
            },
            designer: {
                extType: "",
                baseClassName: "",
                className: "",
                templetes: [] as Template[],
                controls: [] as Control[],
            },
            codefile: {
                baseClassName: "",
                className: "",
            },
        };
    }


    



    class codefileObjRow {
        codefileObj: codeFileInfo | undefined;
        obj: any | undefined;
    }
    export class codefileHandler {
        nodes: codefileObjRow[] = [];
        usageCount = 0;

        getObj(path: string): codefileObjRow {
            let codefileObj = new codeFileInfo(codeFileInfo.getExtType(path));
            codefileObj.parseUrl(path);
            let index = this.exist(codefileObj);
            this.usageCount++;
            if (index == -1) {
                let node = new codefileObjRow();
                node.codefileObj = codefileObj;
                node.obj = require(codefileObj.code.fullPath);
                this.nodes.push(node);
                return node;
            } else {
                return this.nodes[index];
            }
        }

        exist(codefileObj: codeFileInfo): number {
            return this.nodes.findIndex(s => s.codefileObj.code.rootPath == codefileObj.code.rootPath);
        }
    }

    export class fileInfo {
        private _path = "";
        rootPath = "";
        declare rootInfo: rootPathRow;
        constructor() { }

        parse(val: string, parseRoot = true) {
            this._path = val;
            if (parseRoot) this.rootInfo = rootPathHandler.getInfo(this._path);
            if (this.rootInfo != undefined) {
                if (!this.rootInfo.isAlreadyFullPath) {
                    this.sortPath = strOpt._trim(this._path, `${this.rootInfo.alices}/`);
                    this.fullPath = `${this.rootInfo.path}/${this.sortPath}`;
                    this.rootPath = `${this.rootInfo.alices}/${this.sortPath}`;
                } else {
                    this.fullPath = this._path;
                    this.sortPath = strOpt._trim(this.fullPath, `${this.rootInfo.path}/`);
                    this.rootPath = `${this.rootInfo.alices}/${this.sortPath}`;
                }
            } else {
                console.log(`"${this._path}" not good path `);
                this.fullPath = this._path;
            }
        }

        fullPath = "";
        sortPath = "";

        get path(): string {
            return this._path;
        }

        get exist(): boolean {
            return pathInfo.existFile(this.fullPath);
        }

        get fileName(): string {
            return pathInfo.getFileNameFromPath(this.path);
        }

        get partlyInfo(): string {
            return pathInfo.getFileInfoPartly(this.path);
        }

        get pathWithoutFileExt(): string {
            return pathInfo.getFileNameWithoutExtFromPath(this.path);
        }

        get rootWithoutFileExt(): string {
            return pathInfo.getFileNameWithoutExtFromPath(this.rootPath);
        }
    }

    class htmlFileNode {
        static ___HTML_EXT = ".html";
        static ___STYLE_EXT = ".scss";
        rootInfo: rootPathRow | undefined;
        html = new fileInfo();
        style = new fileInfo();

        get existHtmlFile(): boolean {
            return pathInfo.existFile(this.html.fullPath);
        }

        get existStyleFile(): boolean {
            return pathInfo.existFile(this.style.fullPath);
        }

        get htmlFileName(): string {
            return this.name + this.extCode + htmlFileNode.___HTML_EXT;
        }

        get styleFileName(): string {
            return this.name + this.extCode + htmlFileNode.___STYLE_EXT;
        }

        get htmlExtLen(): number {
            return this.htmlExt.length;
        }

        get styleExtLen(): number {
            return this.styleExt.length;
        }

        parseURL() {
            this.html.parse(sortPath + this.htmlExt, false);
            this.style.parse(sortPath + this.styleExt, false);
        }
    }

    export class codeFileInfo {
        html = new fileInfo();
        style = new fileInfo();
        perameters = new fileInfo();
        designer = new fileInfo();
        code = new fileInfo();
        name = "";
        extCode = ".uc";

        constructor(extCode = this.extCode) {
            this.extCode = extCode;
        }

        static ___PERAMETERS_EXT = ".rowperameters.json";
        static ___DESIGNER_EXT = ".designer.js";
        static ___CODE_EXT = ".js";

        get htmlExt(): string {
            return this.extCode + htmlFileNode.___HTML_EXT;
        }

        get styleExt(): string {
            return this.extCode + htmlFileNode.___STYLE_EXT;
        }

        get deignerExt(): string {
            return this.extCode + codeFileInfo.___DESIGNER_EXT;
        }

        get perametersExt(): string {
            return this.extCode + codeFileInfo.___PERAMETERS_EXT;
        }

        get codeExt(): string {
            return this.extCode + codeFileInfo.___CODE_EXT;
        }

        get htmlFileName(): string {
            return this.name + this.extCode + htmlFileNode.___HTML_EXT;
        }

        get styleFileName(): string {
            return this.name + this.extCode + htmlFileNode.___STYLE_EXT;
        }

        get deignerFileName(): string {
            return this.name + this.extCode + codeFileInfo.___DESIGNER_EXT;
        }

        get perametersFileName(): string {
            return this.name + this.extCode + codeFileInfo.___PERAMETERS_EXT;
        }

        get codeFileName(): string {
            return this.name + this.extCode + codeFileInfo.___CODE_EXT;
        }

        get htmlExtLen(): number {
            return this.htmlExt.length;
        }

        get styleExtLen(): number {
            return this.styleExt.length;
        }

        get deignerExtLen(): number {
            return this.deignerExt.length;
        }

        get perametersExtLen(): number {
            return this.perametersExt.length;
        }

        get codeExtLen(): number {
            return this.codeExt.length;
        }

        static getExtType(path: string): string | undefined {
            let partly = pathInfo.getFileInfoPartly(path);
            if (partly.extension.includes(buildOptions.extType.Usercontrol)) return buildOptions.extType.Usercontrol;
            if (partly.extension.includes(buildOptions.extType.template)) return buildOptions.extType.template;
            return undefined;
        }

        partInfo = { dirPath: "", sortDirPath: "", fileName: "", extension: "", type: "" };
        rootInfo: rootPathRow | undefined;

        parseUrl(_url: string) {
            let url = pathInfo.cleanPath(_url);
            this.rootInfo = rootPathHandler.getInfo(url);
            if (this.rootInfo == undefined) {
                debugger;
                console.log(`"${_url}" at codeFileInfo`);
                return;
            }
            if (!this.rootInfo.isAlreadyFullPath) url = strOpt._trim(url, this.rootInfo.alices);
            this.html.rootInfo = this.style.rootInfo = this.designer.rootInfo = this.perameters.rootInfo = this.code.rootInfo = this.rootInfo;
            let fullPath = !this.rootInfo.isAlreadyFullPath ? (this.rootInfo.path + "" + url).toLowerCase() : url;
            this.partInfo = pathInfo.getFileInfoPartly(fullPath);
            let s = (this.partInfo.dirPath + "" + this.partInfo.fileName).toLowerCase();
            this.fullPathWithoutExt = s;
            let sortPath = strOpt._trim(s, this.rootInfo.path + "/");
            this.partInfo.sortDirPath = strOpt._trim(s, this.html.rootInfo.path + "/");
            this.rootInfo.isAlreadyFullPath = false;
            this.html.parse(sortPath + this.htmlExt, false);
            this.style.parse(sortPath + this.styleExt, false);
            this.perameters.parse(sortPath + this.perametersExt, false);
            this.designer.parse(sortPath + this.deignerExt, false);
            this.code.parse(sortPath + this.codeExt, false);
            this.name = this.partInfo.fileName;
            this.mainFilePath = s + this.extCode;
        }
    }
}