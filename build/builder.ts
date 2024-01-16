import * as fs from 'fs';
import { commonParser } from '@ucbuilder:/build/codefile/commonParser';
import { buildOptions, pathInfo, SourceCodeNode } from '@ucbuilder:/build/common';
import { codeFileInfo } from '@ucbuilder:/build/codeFileInfo';
import * as path from 'path';


export class builder {
    static ignoreDirs: string[] = [];
    static dirsToBuild: string[] = [];

    static ignoreThisDirectories(...pathlist: string[]) {
        pathlist.forEach((s: string) => this.ignoreDirs.push(s));
    }

    static addThisDirectories(...pathlist: string[]) {
        pathlist.forEach((s: string) => this.dirsToBuild.push(s));
    }

    commonMng: commonParser;

    constructor() {
        this.init();
    }

    init() {
        this.commonMng = new commonParser(this);
    }

    buildALL() {
        this.commonMng.rows = [];
        builder.dirsToBuild.forEach((s: string) => this.recursive(s));
        this.commonMng.gen.generateFiles(this.commonMng.rows);
    }

    /** @private */
    recursive(parentDir: string) {
        let _this = this;
        let DirectoryContents = fs.readdirSync(parentDir + '/');
        DirectoryContents.forEach((file: string) => {
            let _path = pathInfo.cleanPath(parentDir + '/' + file);
            if (fs.statSync(_path).isDirectory()) {
                if (!builder.ignoreDirs.includes(_path))
                    this.recursive(_path);
            } else {
                this.checkFileState(_path, undefined);
            }
        });
    }

    /** @param {codeFileInfo} fInfo */
    buildFile(fInfo: codeFileInfo) {
        if (fs.existsSync(fInfo.html.path)) {
            this.commonMng.rows = [];
            this.checkFileState(fInfo.html.rootPath);
            this.commonMng.gen.generateFiles(this.commonMng.rows);
        }
    }

    getOutputCode(fInfo: codeFileInfo, htmlContents: string):SourceCodeNode {
        this.commonMng.rows = [];
        this.checkFileState(fInfo.html.rootPath, htmlContents);
        let row = this.commonMng.rows[0];
        return {
            designerCode: this.commonMng.gen.getDesignerCode(row),
            jsFileCode: this.commonMng.gen.getJsFileCode(row)
        };
    }

    checkFileState(filePath: string, htmlContents: string = undefined) {
        if (filePath.endsWith(buildOptions.extType.Usercontrol + '.html')) { //  IF USER CONTROL
            this.commonMng.init(filePath, htmlContents);
        } else if (filePath.endsWith(buildOptions.extType.template + '.html')) { //  IF TEMPLATE
            this.commonMng.init(filePath, htmlContents);
        }
    }    
}

