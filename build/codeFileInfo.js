"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeFileInfo = exports.FileNameInfo = exports.FileInfo = void 0;
const common_1 = require("ucbuilder/build/common");
const rootPathHandler_1 = require("ucbuilder/global/rootPathHandler");
class FileInfo {
    constructor() {
        this._path = "";
        this.rootPath = "";
        this.fullPath = "";
        this.sortPath = "";
    }
    parse(val, parseRoot = true) {
        this._path = val;
        if (parseRoot)
            this.rootInfo = rootPathHandler_1.rootPathHandler.getInfo(this._path);
        if (this.rootInfo != undefined) {
            if (!this.rootInfo.isAlreadyFullPath) {
                this.sortPath = common_1.strOpt._trim(this._path, `${this.rootInfo.alices}/`);
                this.fullPath = `${this.rootInfo.path}/${this.sortPath}`;
                this.rootPath = `${this.rootInfo.alices}/${this.sortPath}`;
            }
            else {
                this.fullPath = this._path;
                this.sortPath = common_1.strOpt._trim(this.fullPath, `${this.rootInfo.path}/`);
                this.rootPath = `${this.rootInfo.alices}/${this.sortPath}`;
            }
        }
        else {
            console.log(`"${this._path}" not good path `);
            this.fullPath = this._path;
        }
    }
    get path() {
        return this._path;
    }
    get exist() {
        return common_1.pathInfo.existFile(this.fullPath);
    }
    get fileName() {
        return common_1.pathInfo.getFileNameFromPath(this.path);
    }
    get partlyInfo() {
        return common_1.pathInfo.getFileInfoPartly(this.path);
    }
    get pathWithoutFileExt() {
        return common_1.pathInfo.getFileNameWithoutExtFromPath(this.path);
    }
    get rootWithoutFileExt() {
        return common_1.pathInfo.getFileNameWithoutExtFromPath(this.rootPath);
    }
}
exports.FileInfo = FileInfo;
class htmlFileNode {
    constructor() {
        this.html = new FileInfo();
        this.style = new FileInfo();
        this.name = '';
        this.extCode = '';
    }
    get existHtmlFile() {
        return common_1.pathInfo.existFile(this.html.fullPath);
    }
    get existStyleFile() {
        return common_1.pathInfo.existFile(this.style.fullPath);
    }
    get htmlFileName() {
        return this.name + this.extCode + htmlFileNode.___HTML_EXT;
    }
    get styleFileName() {
        return this.name + this.extCode + htmlFileNode.___STYLE_EXT;
    }
    get htmlExtLen() {
        return htmlFileNode.___HTML_EXT.length;
    }
    get styleExtLen() {
        return htmlFileNode.___STYLE_EXT.length;
    }
    parseURL() {
        let sortPath = this.html.sortPath;
        //this.html.parse(sortPath + this.htmlExt, false);
        //this.style.parse(sortPath + this.styleExt, false);
    }
}
htmlFileNode.___HTML_EXT = ".html";
htmlFileNode.___STYLE_EXT = ".scss";
class FileNameInfo {
    constructor() {
        this.extensionType = 'none';
        this.name = '';
        this.length = 4;
    }
    init(name = '', extensionType = 'none', filetype) {
        this.name = name;
        this.extensionType = extensionType;
        this.filetype = filetype;
    }
    get ext() { return this.extensionType + '' + this.filetype; }
    get filename() { return this.name + '' + this.ext; }
}
exports.FileNameInfo = FileNameInfo;
class codeFileInfo {
    constructor(extCode) {
        this.html = new FileInfo();
        this.style = new FileInfo();
        this.perameters = new FileInfo();
        this.designer = new FileInfo();
        this.designerSrc = new FileInfo();
        this.code = new FileInfo();
        this.codeSrc = new FileInfo();
        this.name = "";
        this.fullPathWithoutExt = "";
        this.mainFilePath = "";
        this.mainFileRootPath = "";
        this.partInfo = { dirPath: "", sortDirPath: "", fileName: "", extension: 'none', type: "" };
        this.extCode = extCode;
    }
    get existHtmlFile() { return common_1.pathInfo.existFile(this.html.fullPath); }
    get existStyleFile() { return common_1.pathInfo.existFile(this.style.fullPath); }
    get existDeignerFile() { return common_1.pathInfo.existFile(this.designer.fullPath); }
    get existDeignerSrcFile() { return common_1.pathInfo.existFile(this.designerSrc.fullPath); }
    get existPerametersFile() { return common_1.pathInfo.existFile(this.perameters.fullPath); }
    get existCodeFile() { return common_1.pathInfo.existFile(this.code.fullPath); }
    get existCodeSrcFile() { return common_1.pathInfo.existFile(this.codeSrc.fullPath); }
    get htmlExt() { return this.extCode + htmlFileNode.___HTML_EXT; }
    get styleExt() { return this.extCode + htmlFileNode.___STYLE_EXT; }
    get deignerExt() { return this.extCode + codeFileInfo.___DESIGNER_EXT; }
    get deignerSrcExt() { return this.extCode + codeFileInfo.___DESIGNER_SRC_EXT; }
    get perametersExt() { return this.extCode + codeFileInfo.___PERAMETERS_EXT; }
    get codeExt() { return this.extCode + codeFileInfo.___CODE_EXT; }
    get codeSrcExt() { return this.extCode + codeFileInfo.___CODE_SRC_EXT; }
    get htmlFileName() { return this.name + this.extCode + htmlFileNode.___HTML_EXT; }
    get styleFileName() { return this.name + this.extCode + htmlFileNode.___STYLE_EXT; }
    get deignerFileName() { return this.name + this.extCode + codeFileInfo.___DESIGNER_EXT; }
    get deignerSrcFileName() { return this.name + this.extCode + codeFileInfo.___DESIGNER_SRC_EXT; }
    get perametersFileName() { return this.name + this.extCode + codeFileInfo.___PERAMETERS_EXT; }
    get codeFileName() { return this.name + this.extCode + codeFileInfo.___CODE_EXT; }
    get codeFileSrcName() { return this.name + this.extCode + codeFileInfo.___CODE_SRC_EXT; }
    get htmlExtLen() { return this.htmlExt.length; }
    get styleExtLen() { return this.styleExt.length; }
    get deignerExtLen() { return this.deignerExt.length; }
    get deignerSrcExtLen() { return this.deignerSrcExt.length; }
    get perametersExtLen() { return this.perametersExt.length; }
    get codeExtLen() { return this.codeExt.length; }
    get codeExtSrcLen() { return this.codeSrcExt.length; }
    static getExtType(path) {
        let partly = common_1.pathInfo.getFileInfoPartly(path);
        if (partly.extension.includes('.tpt'))
            return '.tpt';
        if (partly.extension.includes('.uc'))
            return '.uc';
        return 'none';
    }
    parseUrl(_url) {
        let url = common_1.pathInfo.cleanPath(_url);
        this.rootInfo = rootPathHandler_1.rootPathHandler.getInfo(url);
        if (this.rootInfo == undefined) {
            //debugger;
            console.log(`"${_url}" at codeFileInfo`);
            return false;
        }
        if (!this.rootInfo.isAlreadyFullPath)
            url = common_1.strOpt._trim(url, this.rootInfo.alices);
        this.html.rootInfo = this.style.rootInfo = this.designer.rootInfo = this.perameters.rootInfo = this.code.rootInfo =
            this.codeSrc.rootInfo =
                this.designerSrc.rootInfo = this.rootInfo;
        let fullPath = !this.rootInfo.isAlreadyFullPath ? (this.rootInfo.path + "" + url) : url;
        this.partInfo = common_1.pathInfo.getFileInfoPartly(fullPath);
        //    console.log(_url);
        //     console.log(this);
        let s = (this.partInfo.dirPath.toLowerCase() + "" + this.partInfo.fileName);
        this.fullPathWithoutExt = s;
        let sortPath = common_1.strOpt._trim(s, this.rootInfo.path + "/");
        this.partInfo.sortDirPath = common_1.strOpt._trim(s, this.html.rootInfo.path + "/");
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
        this.mainFileRootPath = this.rootInfo.alices + '/' + sortPath + this.extCode;
        return true;
    }
}
exports.codeFileInfo = codeFileInfo;
codeFileInfo.___PERAMETERS_EXT = ".rowperameters.json";
codeFileInfo.___DESIGNER_EXT = ".designer.ts";
codeFileInfo.___DESIGNER_SRC_EXT = ".designer.js";
codeFileInfo.___CODE_EXT = ".ts";
codeFileInfo.___CODE_SRC_EXT = ".js";
