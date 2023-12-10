const fs = require('fs');
const { commonParser } = require('@ucbuilder:/build/codefile/commonParser');
const { buildOptions, pathInfo } = require('@ucbuilder:/build/common');
const { codeFileInfo } = require('@ucbuilder:/build/codeFileInfo');
const path = require('path');
class builder {
    static ignoreDirs = [];
    static dirsToBuild = [];
    static ignoreThisDirectories(...pathlist) {
        pathlist.forEach(s => this.ignoreDirs.push(s));
    }
    static addThisDirectories(...pathlist) {
        pathlist.forEach(s => this.dirsToBuild.push(s));
    }
    constructor() {
        this.init();
    }
    init() {
        this.commonMng = new commonParser(this);
    }
    buildALL() {
        this.commonMng.rows = [];
        builder.dirsToBuild.forEach(s => this.recursive(s));
        this.commonMng.gen.generateFiles(this.commonMng.rows);
    }
    /** @private */
    recursive(parentDir) {
        let _this = this;
        let DirectoryContents = fs.readdirSync(parentDir + '/');
        DirectoryContents.forEach(file => {
            let _path = pathInfo.cleanPath(parentDir + '/' + file);
            if (fs.statSync(_path).isDirectory()) {
                if (!builder.ignoreDirs.includes(_path))
                    this.recursive(_path);
            } else {
                this.checkFileState(_path,undefined);
            }
        });
    }

    /** @param {codeFileInfo} fInfo */
    buildFile(fInfo) {
        if (fs.existsSync(fInfo.html.path)) {
            this.commonMng.rows = [];
            this.checkFileState(fInfo.html.rootPath);
            this.commonMng.gen.generateFiles(this.commonMng.rows);
        }
    }
    /** 
     * @param {codeFileInfo} fInfo 
     * @param {string} htmlContents
     **/
    getOutputCode(fInfo, htmlContents) {

        this.commonMng.rows = [];

        this.checkFileState(fInfo.html.rootPath, htmlContents);
        let row = this.commonMng.rows[0];
        return {
            designerCode: this.commonMng.gen.getDesignerCode(row),
            jsFileCode: this.commonMng.gen.getJsFileCode(row)
        };
    }

    /**
     * @param {string} filePath 
     * @param {string} htmlContents 
     */
    checkFileState(filePath, htmlContents = undefined) {
        if (filePath.endsWith(buildOptions.extType.Usercontrol + '.html')) { //  IF USER CONTROL
            this.commonMng.init(filePath, htmlContents);
        } else if (filePath.endsWith(buildOptions.extType.template + '.html')) { //  IF TEMPLATE
            this.commonMng.init(filePath, htmlContents);
        }
    }
    /**
     * @type {designerParser}
     */
    designerMng = undefined;


}
module.exports = { builder };