"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = void 0;
const fs = __importStar(require("fs"));
const commonParser_1 = require("ucbuilder/build/codefile/commonParser");
const common_1 = require("ucbuilder/build/common");
class builder {
    constructor() {
        this.init();
    }
    static ignoreThisDirectories(...pathlist) {
        pathlist.forEach((s) => this.ignoreDirs.push(s));
    }
    static addThisDirectories(...pathlist) {
        pathlist.forEach((s) => this.dirsToBuild.push(s));
    }
    init() {
        this.commonMng = new commonParser_1.commonParser(this);
    }
    buildALL() {
        this.commonMng.rows = [];
        builder.dirsToBuild.forEach((s) => this.recursive(s));
        this.commonMng.gen.generateFiles(this.commonMng.rows);
    }
    /** @private */
    recursive(parentDir) {
        let _this = this;
        let DirectoryContents = fs.readdirSync(parentDir + '/');
        DirectoryContents.forEach((file) => {
            let _path = common_1.pathInfo.cleanPath(parentDir + '/' + file);
            if (fs.statSync(_path).isDirectory()) {
                if (!builder.ignoreDirs.includes(_path))
                    this.recursive(_path);
            }
            else {
                this.checkFileState(_path, undefined);
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
    getOutputCode(fInfo, htmlContents) {
        this.commonMng.rows = [];
        this.checkFileState(fInfo.html.rootPath, htmlContents);
        let row = this.commonMng.rows[0];
        return {
            designerCode: this.commonMng.gen.getDesignerCode(row),
            jsFileCode: this.commonMng.gen.getJsFileCode(row)
        };
    }
    checkFileState(filePath, htmlContents = undefined) {
        if (filePath.endsWith(common_1.buildOptions.extType.Usercontrol + '.html')) { //  IF USER CONTROL
            this.commonMng.init(filePath, htmlContents);
        }
        else if (filePath.endsWith(common_1.buildOptions.extType.template + '.html')) { //  IF TEMPLATE
            this.commonMng.init(filePath, htmlContents);
        }
    }
}
exports.builder = builder;
builder.ignoreDirs = [];
builder.dirsToBuild = [];
