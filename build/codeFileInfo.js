const { pathInfo, strOpt, buildOptions } = require("@ucbuilder:/build/common");
const { rootPathHandler,rootPathRow } = require("@ucbuilder:/global/rootPathHandler");
class row {
    /** @type {codeFileInfo}  */
    codefileObj = undefined
    /* codefile object */
    obj = undefined;
}
class codefileHandler {
    constructor() { }
    /** @type {row[]}  */
    nodes = [];
    usageCount = 0;
    /**
     * @param {string} path 
     * @returns {row}
     */
    getObj(path) {
       
        let codefileObj = new codeFileInfo(codeFileInfo.getExtType(path));

       
        codefileObj.parseUrl(path);
        let index = this.exist(codefileObj);
        
        this.usageCount++;
        if (index == -1) {
            let node = new row();
            node.codefileObj = codefileObj;
            //console.log(codefileObj.code.rootPath);
            //if(codefileObj.code.rootPath.endsWith("itemNode_ComboboxSelected.tpt.js"))
            //    debugger;
            node.obj = require(codefileObj.code.fullPath);
            this.nodes.push(node);
            return node;
        } else return this.nodes[index];
    }
    /**
     * @param {codeFileInfo} codefileObj 
     * @returns {number} index of array element -1 if not exist
     */
    exist(codefileObj) {
        return this.nodes.findIndex(s => s.codefileObj.code.path == codefileObj.code.path);
    }
}
class fileInfo {
    /** @type {string}  @private */
    _path = "";
    rootPath = "";


    constructor(/*root = rootPathHandler.path, shortAlices = "@ucbuilder:"*/) { /*this.root = root; this.shortAlices = shortAlices;*/ }
    
    parse(val, parseRoot = true) {
        this._path = val;
        if (parseRoot) this.rootInfo = rootPathHandler.getInfo(this._path);
        //console.log(this._path);
        //console.log(this.rootInfo);
        //this.sortPath = strOpt._trim(this._path, `${this.root}/|${this.shortAlices}/`);
       // console.log(val + ' ==> ' + this.rootInfo.isAlreadyFullPath);
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
    sortPath = ""
    get path() { return this._path; }
    get exist() { return pathInfo.existFile(this.fullPath); }
    get fileName() {
        return pathInfo.getFileNameFromPath(this.path);
    }

    get partlyInfo() {
        return pathInfo.getFileInfoPartly(this.path);
    }
    get pathWithoutFileExt() {
        return pathInfo.getFileNameWithoutExtFromPath(this.path);
    }
    get rootWithoutFileExt() {
        return pathInfo.getFileNameWithoutExtFromPath(this.rootPath);
    }
}
class codeFileInfo {

    html = new fileInfo();
    style = new fileInfo();
    perameters = new fileInfo();
    designer = new fileInfo();
    code = new fileInfo();

    get existHtmlFile() { return pathInfo.existFile(this.html.fullPath); }
    get existDeignerFile() { return pathInfo.existFile(this.designer.fullPath); }
    get existPerametersFile() { return pathInfo.existFile(this.perameters.fullPath); }
    get existCodeFile() { return pathInfo.existFile(this.code.fullPath); }
    get existStyleFile() { return pathInfo.existFile(this.style.fullPath); }

    name = "";
    /** @param {string} filepath */
    isValidFile(filepath) {
        filepath = filepath.toLowerCase();
        if (filepath.endsWith(this.codeExt)) return true;
        if (filepath.endsWith(this.styleExt)) return true;
        if (filepath.endsWith(this.deignerExt)) return true;
        if (filepath.endsWith(this.perametersExt)) return true;
        if (filepath.endsWith(this.htmlExt)) return true;
        return false;
    }
    /** @type {".uc",".tpt"}  */ 
    extCode = ".uc";
    constructor(extCode = this.extCode) {
        this.extCode = extCode;
        
    }
    ___HTML_EXT = ".html";
    ___STYLE_EXT = ".scss";
    ___PERAMETERS_EXT = ".rowperameters.json";
    ___DESIGNER_EXT = ".designer.js";
    ___CODE_EXT = ".js";
    get htmlExt() { return this.extCode + this.___HTML_EXT; }
    get deignerExt() { return this.extCode + this.___DESIGNER_EXT; }
    get styleExt() { return this.extCode + this.___STYLE_EXT; }
    get perametersExt() { return this.extCode + this.___PERAMETERS_EXT; }
    get codeExt() { return this.extCode + this.___CODE_EXT; }

    get htmlFileName() { return this.name + this.extCode + this.___HTML_EXT; }
    get deignerFileName() { return this.name + this.extCode + this.___DESIGNER_EXT; }
    get styleFileName() { return this.name + this.extCode + this.___STYLE_EXT; }
    get perametersFileName() { return this.name + this.extCode + this.___PERAMETERS_EXT; }
    get codeFileName() { return this.name + this.extCode + this.___CODE_EXT; }


    get htmlExtLen() { return this.htmlExt.length; }
    get deignerExtLen() { return this.deignerExt.length; }
    get styleExtLen() { return this.styleExt.length; }
    get perametersExtLen() { return this.perametersExt.length; }
    get codeExtLen() { return this.codeExt.length; }

    static getExtType(path) {

        let partly = pathInfo.getFileInfoPartly(path);
        if (partly.extension.includes(buildOptions.extType.Usercontrol)) return buildOptions.extType.Usercontrol;
        if (partly.extension.includes(buildOptions.extType.template)) return buildOptions.extType.template;
        return undefined;
    }

    partInfo = { dirPath: "", sortDirPath: "", fileName: "", extension: "", type: "" };

    /** @type {rootPathRow}  */ 
    rootInfo = undefined;
    /**
     * @param {string} url 
     */
    parseUrl(url) {

        url = pathInfo.cleanPath(url);//.toLowerCase();
       
        this.rootInfo = rootPathHandler.getInfo(url);
        
        //console.log(this.rootInfo);
        /*if (url.startsWith('@ucbuilder:/')) {
            isFullPath = false;
            url = strOpt._trim(url, '@ucbuilder:/');
        } else isFullPath = true;*/
        if (this.rootInfo == undefined) {
            //this.rootInfo.alices;
            console.log(`"${url}" at codeFileInfo`);
            return;
        }
        if (!this.rootInfo.isAlreadyFullPath)
            url = strOpt._trim(url, this.rootInfo.alices);

           
        this.html.rootInfo =
            this.style.rootInfo =
            this.designer.rootInfo =
            this.perameters.rootInfo =
            this.code.rootInfo = this.rootInfo;
            
        /** @type string */
        let fullPath = !this.rootInfo.isAlreadyFullPath ?
            (this.rootInfo.path + "" + url).toLowerCase()
            : url;
            
        this.partInfo = pathInfo.getFileInfoPartly(fullPath);
        let s = this.partInfo.dirPath + "" + this.partInfo.fileName;        
        this.fullPathWithoutExt = s;
        let sortPath = strOpt._trim(s,this.rootInfo.path+"/");
        this.partInfo.sortDirPath = strOpt._trim(s, this.html.rootInfo.path + "/");
        
        
        //let tp = this.partInfo.sortDirPath
        //console.log(this.partInfo.sortDirPath);

        
        this.rootInfo.isAlreadyFullPath = false;
        this.html.parse(sortPath + this.htmlExt, false);
        this.style.parse(sortPath + this.styleExt, false);
        this.perameters.parse(sortPath + this.perametersExt, false);
        this.designer.parse(sortPath + this.deignerExt, false);
        this.code.parse(sortPath + this.codeExt, false);
        //console.log(this.html.rootPath);
        this.name = this.partInfo.fileName;  //pathInfo.getFileNameFromPath(this.html.path).slice(0, -this.htmlExtLen);
        this.mainFilePath = s + this.extCode;
    }
}
module.exports = { codeFileInfo, fileInfo, codefileHandler };