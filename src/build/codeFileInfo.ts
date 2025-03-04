import { FilePartlyInfo, getSpecialExtTypeValue, pathInfo, SpecialExtType, strOpt } from "ucbuilder/build/common";
import { LocationType, RootPathRow } from "ucbuilder/global/findAndReplace";
//import {  RootPathRow } from "ucbuilder/enumAndMore";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";


export class FileInfo {
    private _path = "";
    rootPath = "";
    rootInfo: RootPathRow;
    constructor() { }
    get rootPathSkippingExtension() { let s = this.rootPath; return s.slice(0, s.lastIndexOf('.')); }

    parse(val: string, parseRoot = true, locationType: LocationType = 'root') {
        this._path = val;
        if (parseRoot) this.rootInfo = rootPathHandler.getInfo(this._path);
        //let before = this._path;
        //let outLc = locationType == 'out' ? this.rootInfo.location.outDir : '/';
        //console.log("-------------------parse----------------");
        //console.log(this.rootInfo.isAlreadyFullPath+"\n"+this._path);
        let spath = '';
        let odText = '';
        //console.log(val+"\n\n"+this.rootInfo.pathType);
        if (this.rootInfo != undefined) {
            switch (locationType) {
                case 'out': odText = this.rootInfo.location.outDir; break;
                case 'designer': odText = this.rootInfo.location.designerDir; break;
            }
            switch (this.rootInfo.pathType) {
                case 'alice':
                    //odText = (locationType == 'out' ? this.rootInfo.location.outDir : '');
                    spath = strOpt._trim(this._path, this.rootInfo.alices);
                    this.sortPath = (odText + "/" + spath).toFilePath(); ///(odText+(spath._trim('/'))._trim('/'));
                    this.fullPath = (this.rootInfo.path + "/" + this.sortPath).toFilePath();
                    this.rootPath = (this.rootInfo.alices + "/" + this.sortPath).toFilePath();
                    break;
                case 'full':
                    //odText = (locationType == 'out' ? this.rootInfo.location.outDir : '');
                    spath = strOpt._trim(this._path, this.rootInfo.path);
                    this.sortPath = (odText + "/" + spath).toFilePath();
                    this.fullPath = (this.rootInfo.path + "/" + this.sortPath).toFilePath();
                    this.rootPath = (this.rootInfo.alices + "/" + this.sortPath).toFilePath();
                    break;
            }

        } else {
            console.log(`"${this._path}" not good path `);
            // this.fullPath = this._path;
        }
        //console.log(before + "\n" + this.rootInfo.pathType + "\n" + this.sortPath);

    }

    fullPath = "";
    sortPath = "";

    /*get path(): string {
        return this._path;
    }*/

    get exist(): boolean {
        return pathInfo.existFile(this.fullPath);
    }

    get fileName(): string {
        return pathInfo.getFileNameFromPath(this.fullPath);
    }

    get partlyInfo(): FilePartlyInfo {
        return pathInfo.getFileInfoPartly(this.fullPath);
    }

    get pathWithoutFileExt(): string {
        return pathInfo.getFileNameWithoutExtFromPath(this.fullPath);
    }

    get rootWithoutFileExt(): string {
        return pathInfo.getFileNameWithoutExtFromPath(this.rootPath);
    }
}


export class FileNameInfo {
    private extensionType: SpecialExtType = 'none';
    private name: string = '';
    private filetype: '';
    private length = 4;
    init(name: string = '', extensionType: SpecialExtType = 'none', filetype: '') {
        this.name = name;
        this.extensionType = extensionType;
        this.filetype = filetype;
    }
    get ext() { return this.extensionType + '' + this.filetype; }
    get filename() { return this.name + '' + this.ext; }
}
export type Exts =
    | ".uc.designer.ts"
    | ".uc.designer.js"
    | ".uc.ts"
    | ".uc.js"
    | ".tpt.designer.ts"
    | ".tpt.designer.js"
    | ".tpt.ts"
    | ".tpt.js";
export class codeFileInfo {
    html = new FileInfo();
    style = new FileInfo();
    designer = new FileInfo();
    //designerSrc = new FileInfo();
    code = new FileInfo();
    //codeSrc = new FileInfo();
    name = "";
    extCode: SpecialExtType;
    fullPathWithoutExt = "";
    mainFilePath = "";
    mainFileRootPath = "";
    constructor(extCode: SpecialExtType) {
        this.extCode = extCode;
    }

    get existHtmlFile() { return pathInfo.existFile(this.html.fullPath); }
    get existStyleFile() { return pathInfo.existFile(this.style.fullPath); }
    get existDeignerFile() { return pathInfo.existFile(this.designer.fullPath); }
    //get existDeignerSrcFile() { return pathInfo.existFile(this.designerSrc.fullPath); }
    get existCodeFile() { return pathInfo.existFile(this.code.fullPath); }
   // get existCodeSrcFile() { return pathInfo.existFile(this.codeSrc.fullPath); }
    static ___HTML_EXT = ".html";
    static ___STYLE_EXT = ".scss";
    static ___DESIGNER_EXT = ".designer.ts";
    static ___DESIGNER_SRC_EXT = ".designer.js";
    static ___CODE_EXT = ".ts";
    static ___CODE_SRC_EXT = ".js";

    get htmlExt(): string { return this.extCode + codeFileInfo.___HTML_EXT; }
    get styleExt(): string { return this.extCode + codeFileInfo.___STYLE_EXT; }
    get deignerExt(): string { return this.extCode + codeFileInfo.___DESIGNER_EXT; }
    //get deignerSrcExt(): string { return this.extCode + codeFileInfo.___DESIGNER_SRC_EXT; }
    get codeExt(): string { return this.extCode + codeFileInfo.___CODE_EXT; }
    //get codeSrcExt(): string { return this.extCode + codeFileInfo.___CODE_SRC_EXT; }



    get htmlFileName(): string { return this.name + this.extCode + codeFileInfo.___HTML_EXT; }
    get styleFileName(): string { return this.name + this.extCode + codeFileInfo.___STYLE_EXT; }
    get deignerFileName(): string { return this.name + this.extCode + codeFileInfo.___DESIGNER_EXT; }
    //get deignerSrcFileName(): string { return this.name + this.extCode + codeFileInfo.___DESIGNER_SRC_EXT; }
    get codeFileName(): string { return this.name + this.extCode + codeFileInfo.___CODE_EXT; }
    //get codeFileSrcName(): string { return this.name + this.extCode + codeFileInfo.___CODE_SRC_EXT; }


    get htmlExtLen(): number { return this.htmlExt.length; }
    get styleExtLen(): number { return this.styleExt.length; }
    get deignerExtLen(): number { return this.deignerExt.length; }
    //get deignerSrcExtLen(): number { return this.deignerSrcExt.length; }
    get codeExtLen(): number { return this.codeExt.length; }
   // get codeExtSrcLen(): number { return this.codeSrcExt.length; }

    static getExtType(path: string): SpecialExtType {
        let partly = pathInfo.getFileInfoPartly(path);
        if (partly.extension.includes('.tpt')) return '.tpt';
        if (partly.extension.includes('.uc')) return '.uc';
        return 'none';
    }

    partInfo: FilePartlyInfo = { dirPath: "", sortDirPath: "", fileName: "", extension: 'none', type: "" };
    rootInfo: RootPathRow | undefined;

    parseUrl(_url: string): boolean {
        let url = _url.toFilePath();//pathInfo.cleanPath(_url);
        console.log(url);
        this.rootInfo = rootPathHandler.getInfo(url);
        //console.log(_url);


        if (this.rootInfo == undefined) {
            //debugger;
            console.log(`"${_url}" at codeFileInfo`);
            return false;
        }
        if (!this.rootInfo.isAlreadyFullPath) url = strOpt._trim(url, this.rootInfo.alices);
        this.html.rootInfo = this.style.rootInfo = this.designer.rootInfo =   this.code.rootInfo =
            /*this.codeSrc.rootInfo =
            this.designerSrc.rootInfo =*/ this.rootInfo;
        // console.log(this.rootInfo.isAlreadyFullPath+"\n"+url);

        let fullPath = !this.rootInfo.isAlreadyFullPath ? (this.rootInfo.path + "" + url) : url;

        this.partInfo = pathInfo.getFileInfoPartly(fullPath);
        // console.log(_url);
        // console.log(this.partInfo);

        //    console.log(_url);

        //     console.log(this);

        this.fullPathWithoutExt = (this.partInfo.dirPath/*.toLowerCase()*/ + "" + this.partInfo.fileName);

        //console.log('xxxxxx : '+this.fullPathWithoutExt);

        let sortPath = this.rootInfo.alices + '/' + strOpt._trim(this.fullPathWithoutExt, this.rootInfo.path + "/");
        //console.log(s + "\n" + this.codeSrc.rootInfo.path);
        //console.log('sort L === >< ' + sortPath);

        this.partInfo.sortDirPath = strOpt._trim(this.fullPathWithoutExt, this.rootInfo.path + "/");
        this.rootInfo.isAlreadyFullPath = false;
        this.rootInfo.pathType = 'alice';
        this.html.parse(sortPath + this.htmlExt, false);
        this.style.parse(sortPath + this.styleExt, false);
        this.designer.parse(sortPath + this.deignerExt, false, 'designer');
        //this.designerSrc.parse(sortPath + this.deignerSrcExt, false, 'out');
        this.code.parse(sortPath + this.codeExt, false);
        //this.codeSrc.parse(sortPath + this.codeSrcExt, false, 'out');
        this.name = this.partInfo.fileName;
        this.mainFilePath = this.fullPathWithoutExt + this.extCode;

        this.mainFileRootPath = /*this.rootInfo.alices + '/' + */sortPath + this.extCode;
        // console.log(_url);
        // console.log(this);
        return true;
    }
    get mainFileRootPath_btoa() { return window.btoa(this.mainFileRootPath); }
}