import { pathInfo, strOpt, buildOptions, FilePartlyInfo, ExtensionType } from "@ucbuilder:/build/common";
import { rootPathHandler } from "@ucbuilder:/global/rootPathHandler";
import {  RootPathRow } from "@ucbuilder:/enumAndMore";

class row {
    codefileObj: codeFileInfo | undefined;
    obj: any | undefined;
}

class codefileHandler {
    nodes: row[] = [];
    usageCount = 0;

    getObj(path: string): row {
        let codefileObj = new codeFileInfo(codeFileInfo.getExtType(path));
        codefileObj.parseUrl(path);
        let index = this.exist(codefileObj);
        this.usageCount++;
        if (index == -1) {
            let node = new row();
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

class fileInfo {
    private _path = "";
    rootPath = "";
    rootInfo: RootPathRow;
    constructor() {}

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

    get partlyInfo(): FilePartlyInfo {
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
    rootInfo:  RootPathRow | undefined;
    html = new fileInfo();
    style = new fileInfo();
    name: string = '';
    extCode: string = '';
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
        return htmlFileNode.___HTML_EXT.length;
    }

    get styleExtLen(): number {
        return htmlFileNode.___STYLE_EXT.length;
    }

    parseURL() {
        let sortPath = this.html.sortPath;
        //this.html.parse(sortPath + this.htmlExt, false);
        //this.style.parse(sortPath + this.styleExt, false);
    }
}

class codeFileInfo {
    html = new fileInfo();
    style = new fileInfo();
    perameters = new fileInfo();
    designer = new fileInfo();
    code = new fileInfo();
    name = "";
    extCode : ExtensionType;
    fullPathWithoutExt = "";
    mainFilePath = "";
    constructor(extCode:ExtensionType) {
        this.extCode = extCode;
    }
    get existHtmlFile() { return pathInfo.existFile(this.html.fullPath); }
    get existStyleFile() { return pathInfo.existFile(this.style.fullPath); }
    get existDeignerFile() { return pathInfo.existFile(this.designer.fullPath); }
    get existPerametersFile() { return pathInfo.existFile(this.perameters.fullPath); }
    get existCodeFile() { return pathInfo.existFile(this.code.fullPath); }

    static ___PERAMETERS_EXT = ".rowperameters.json";
    static ___DESIGNER_EXT = ".designer.js";
    static ___CODE_EXT = ".js";

    get htmlExt(): string { return this.extCode + htmlFileNode.___HTML_EXT; }
    get styleExt(): string {  return this.extCode + htmlFileNode.___STYLE_EXT; }
    get deignerExt(): string {  return this.extCode + codeFileInfo.___DESIGNER_EXT; }
    get perametersExt(): string { return this.extCode + codeFileInfo.___PERAMETERS_EXT; }
    get codeExt(): string { return this.extCode + codeFileInfo.___CODE_EXT; }
    get htmlFileName(): string { return this.name + this.extCode + htmlFileNode.___HTML_EXT; }
    get styleFileName(): string { return this.name + this.extCode + htmlFileNode.___STYLE_EXT; }
    get deignerFileName(): string {  return this.name + this.extCode + codeFileInfo.___DESIGNER_EXT; }
    get perametersFileName(): string { return this.name + this.extCode + codeFileInfo.___PERAMETERS_EXT; }
    get codeFileName(): string {  return this.name + this.extCode + codeFileInfo.___CODE_EXT; }
    get htmlExtLen(): number { return this.htmlExt.length; }
    get styleExtLen(): number { return this.styleExt.length; }
    get deignerExtLen(): number { return this.deignerExt.length; }
    get perametersExtLen(): number { return this.perametersExt.length; }
    get codeExtLen(): number { return this.codeExt.length; }

    static getExtType(path: string): ExtensionType {
        let partly = pathInfo.getFileInfoPartly(path);
        switch (partly.extension) {
            case '.tpt': return '.tpt';
            case '.uc': return '.uc';
            default: return 'none';
        }
        /*if (partly.extension.includes(buildOptions.extType.Usercontrol)) return buildOptions.extType.Usercontrol;
        if (partly.extension.includes(buildOptions.extType.template)) return buildOptions.extType.template;
        return undefined;*/
    }

    partInfo: FilePartlyInfo = { dirPath: "", sortDirPath: "", fileName: "", extension: 'none', type: "" };
    rootInfo: RootPathRow | undefined;

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

export { codeFileInfo, fileInfo, codefileHandler };