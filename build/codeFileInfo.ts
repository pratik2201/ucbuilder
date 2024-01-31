import { pathInfo, strOpt, buildOptions, FilePartlyInfo, ExtensionType } from "ucbuilder/build/common";
import {  RootPathRow } from "ucbuilder/enumAndMore";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";


export class FileInfo {
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
    html = new FileInfo();
    style = new FileInfo();
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
export class FileNameInfo{
    private extensionType: ExtensionType = 'none';
    private name: string = '';
    private filetype: '';
    private length = 4;
    init(name: string = '',extensionType: ExtensionType = 'none',filetype: '') {
        this.name = name;
        this.extensionType = extensionType;
        this.filetype = filetype;
    }
    get ext() { return this.extensionType + '' + this.filetype; }
    get filename() { return this.name + '' + this.ext; }
}
export class codeFileInfo {
    html = new FileInfo();
    style = new FileInfo();
    perameters = new FileInfo();
    designer = new FileInfo();
    designerSrc = new FileInfo();
    code = new FileInfo();
    codeSrc = new FileInfo();
    name = "";
    extCode : ExtensionType;
    fullPathWithoutExt = "";
    mainFilePath = "";
    mainFileRootPath = "";
    constructor(extCode:ExtensionType) {
        this.extCode = extCode;
    }
    
    get existHtmlFile() { return pathInfo.existFile(this.html.fullPath); }
    get existStyleFile() { return pathInfo.existFile(this.style.fullPath); }
    get existDeignerFile() { return pathInfo.existFile(this.designer.fullPath); }
    get existDeignerSrcFile() { return pathInfo.existFile(this.designerSrc.fullPath); }
    get existPerametersFile() { return pathInfo.existFile(this.perameters.fullPath); }
    get existCodeFile() { return pathInfo.existFile(this.code.fullPath); }
    get existCodeSrcFile() { return pathInfo.existFile(this.codeSrc.fullPath); }

    static ___PERAMETERS_EXT = ".rowperameters.json";
    static ___DESIGNER_EXT = ".designer.ts";
    static ___DESIGNER_SRC_EXT = ".designer.js";
    static ___CODE_EXT = ".ts";
    static ___CODE_SRC_EXT = ".js";

    get htmlExt(): string { return this.extCode + htmlFileNode.___HTML_EXT; }
    get styleExt(): string {  return this.extCode + htmlFileNode.___STYLE_EXT; }
    get deignerExt(): string {  return this.extCode + codeFileInfo.___DESIGNER_EXT; }
    get deignerSrcExt(): string {  return this.extCode + codeFileInfo.___DESIGNER_SRC_EXT; }
    get perametersExt(): string { return this.extCode + codeFileInfo.___PERAMETERS_EXT; }
    get codeExt(): string { return this.extCode + codeFileInfo.___CODE_EXT; }
    get codeSrcExt(): string { return this.extCode + codeFileInfo.___CODE_SRC_EXT; }



    get htmlFileName(): string { return this.name + this.extCode + htmlFileNode.___HTML_EXT; }
    get styleFileName(): string { return this.name + this.extCode + htmlFileNode.___STYLE_EXT; }
    get deignerFileName(): string {  return this.name + this.extCode + codeFileInfo.___DESIGNER_EXT; }
    get deignerSrcFileName(): string {  return this.name + this.extCode + codeFileInfo.___DESIGNER_SRC_EXT; }
    get perametersFileName(): string { return this.name + this.extCode + codeFileInfo.___PERAMETERS_EXT; }
    get codeFileName(): string { return this.name + this.extCode + codeFileInfo.___CODE_EXT; }
    get codeFileSrcName(): string { return this.name + this.extCode + codeFileInfo.___CODE_SRC_EXT; }
   

    get htmlExtLen(): number { return this.htmlExt.length; }
    get styleExtLen(): number { return this.styleExt.length; }
    get deignerExtLen(): number { return this.deignerExt.length; }
    get deignerSrcExtLen(): number { return this.deignerSrcExt.length; }
    get perametersExtLen(): number { return this.perametersExt.length; }
    get codeExtLen(): number { return this.codeExt.length; }
    get codeExtSrcLen(): number { return this.codeSrcExt.length; }
   
    static getExtType(path: string): ExtensionType {
        let partly = pathInfo.getFileInfoPartly(path);       
        if (partly.extension.includes('.tpt')) return '.tpt';
        if (partly.extension.includes('.uc')) return '.uc';
        return 'none';
    }
    
    partInfo: FilePartlyInfo = { dirPath: "", sortDirPath: "", fileName: "", extension: 'none', type: "" };
    rootInfo: RootPathRow | undefined;

    parseUrl(_url: string):boolean {
        let url = pathInfo.cleanPath(_url);
        this.rootInfo = rootPathHandler.getInfo(url);
        if (this.rootInfo == undefined) {
            //debugger;
            console.log(`"${_url}" at codeFileInfo`);
            return false;
        }
        if (!this.rootInfo.isAlreadyFullPath) url = strOpt._trim(url, this.rootInfo.alices);
        this.html.rootInfo = this.style.rootInfo = this.designer.rootInfo = this.perameters.rootInfo = this.code.rootInfo =
            this.codeSrc.rootInfo =
            this.designerSrc.rootInfo = this.rootInfo;
        let fullPath = !this.rootInfo.isAlreadyFullPath ? (this.rootInfo.path + "" + url) : url;
        this.partInfo = pathInfo.getFileInfoPartly(fullPath);
       
    //    console.log(_url);
       
    //     console.log(this);
        
        let s = (this.partInfo.dirPath.toLowerCase() + "" + this.partInfo.fileName);
        this.fullPathWithoutExt = s;
        let sortPath = strOpt._trim(s, this.rootInfo.path + "/");
        this.partInfo.sortDirPath = strOpt._trim(s, this.html.rootInfo.path + "/");
        this.rootInfo.isAlreadyFullPath = false;
        this.html.parse(sortPath + this.htmlExt, false);
        this.style.parse(sortPath + this.styleExt, false);
        this.perameters.parse(sortPath + this.perametersExt, false);
        this.designer.parse(sortPath + this.deignerExt, false);
        this.designerSrc.parse(sortPath + this.deignerSrcExt, false);
        this.code.parse(sortPath + this.codeExt, false);
        this.codeSrc.parse(sortPath + this.codeSrcExt, false);
        this.name = this.partInfo.fileName;
        this.mainFilePath = s + this.extCode;
        this.mainFileRootPath =this.rootInfo.alices+'/'+ sortPath + this.extCode;
        return true;
    }
}