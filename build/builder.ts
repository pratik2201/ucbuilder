import * as fs from 'fs';
import { commonParser } from 'ucbuilder/build/codefile/commonParser';
import { buildOptions, SpecialExtEnum, SpecialExtType, pathInfo, SourceCodeNode } from 'ucbuilder/build/common';
import { codeFileInfo } from 'ucbuilder/build/codeFileInfo';
import * as path from 'path';
import { ResourcesUC } from 'ucbuilder/ResourcesUC';
import { FileDataBank } from 'ucbuilder/global/fileDataBank';
import { fileWatcher } from './fileWatcher';


export class builder {
    static ignoreDirs: string[] = [];
    static dirsToBuild: string[] = [];

    static ignoreThisDirectories(...pathlist: string[]) {
        pathlist.forEach((s: string) => this.ignoreDirs.push(s));
    }

    static addThisDirectories(...pathlist: string[]) {
        pathlist.forEach((s: string) => this.dirsToBuild.push(s));
    }

    filewatcher: fileWatcher;
    commonMng: commonParser;
    constructor() {
        this.init();
        this.filewatcher = new fileWatcher(this);
    }

    init() {
        this.commonMng = new commonParser(this);
    }

    fillReplacerPath() {
        this.commonMng.reset();
        builder.dirsToBuild.forEach((s: string) => this.recursive(s, (filePath) => {
            if (filePath.endsWithI(codeFileInfo.___DESIGNER_EXT)) {
                let fInfo = new codeFileInfo(codeFileInfo.getExtType(filePath));
                fInfo.parseUrl(filePath);
                let content = fs.readFileSync(fInfo.designer.fullPath, 'binary');
                /*let _FILE_PATH = ResourcesUC.codefilelist.getObj(fInfo.designer.rootPath).obj.FILE_PATH;*/
                let key = fileWatcher.getFilePathFromDesigner(content);
                if (key != undefined) {
                    let _FILE_PATH = window.atob(key);
                    if (!fInfo.mainFileRootPath.equalIgnoreCase(_FILE_PATH)) {
                        let tmpfInfo = new codeFileInfo(codeFileInfo.getExtType(_FILE_PATH));
                        tmpfInfo.parseUrl(_FILE_PATH);
                        this.commonMng.pathReplacement.push({
                            findPath: tmpfInfo.mainFileRootPath,
                            replaceWith: fInfo.mainFileRootPath
                        });
                    }
                }
            }
        }));
        
        
        this.renameFiles();
    }
    renameFiles() {
    let pathReplacement = this.commonMng.pathReplacement;
    console.log(pathReplacement);
        builder.dirsToBuild.forEach((s: string) => this.recursive(s, (filePath) => {
        let partInfo = pathInfo.getFileInfoPartly(filePath);
        let ext = partInfo.extension;
        if (ext == undefined) return;
        if (ext.startsWith(SpecialExtEnum.uc) ||
            ext.startsWith(SpecialExtEnum.tpt) ||
            partInfo.type == '.ts') {
            let content = fs.readFileSync(filePath, 'binary');
            pathReplacement.forEach(s => {
                let res = content.replaceAllWithResult(s.findPath, s.replaceWith);
                if (res.hasReplaced) {
                    console.log(res);
                    fs.writeFileSync(filePath, res.result, 'binary');
                }
            });
        }
    }));
}
buildALL(_fillReplacerPath = true) {
    let _this = this;
    if (_fillReplacerPath)
        this.fillReplacerPath();

    builder.dirsToBuild.forEach((s: string) => this.recursive(s, (pth) => { 
     _this.checkFileState(pth); }));
    this.commonMng.gen.generateFiles(this.commonMng.rows);
}

/** @private */
recursive(parentDir: string, callback: (path: string) => void) {
    let _this = this;
    let DirectoryContents = fs.readdirSync(parentDir + '/');
    DirectoryContents.forEach((file: string) => {
        //let _path = pathInfo.cleanPath(parentDir + '/' + file);
        let _path = parentDir + '/' + file.toFilePath();
        if (fs.statSync(_path).isDirectory()) {
            if (!builder.ignoreDirs.includes(_path))
                this.recursive(_path, callback);
        } else {
            callback(_path);
        }
    });
}

/** @param {codeFileInfo} fInfo */
buildFile(fInfo: codeFileInfo) {
    if (fs.existsSync(fInfo.html.fullPath)) {
        this.fillReplacerPath();
        this.checkFileState(fInfo.html.rootPath);
        this.commonMng.gen.generateFiles(this.commonMng.rows);
    }
}

getOutputCode(fInfo: codeFileInfo, htmlContents: string): SourceCodeNode {
    this.fillReplacerPath();
    this.checkFileState(fInfo.html.rootPath, htmlContents);
    let row = this.commonMng.rows[0];
    return {
        designerCode: this.commonMng.gen.getDesignerCode(row),
        jsFileCode: this.commonMng.gen.getJsFileCode(row)
    };
}

checkFileState(filePath: string, htmlContents ?: string) {

    if (filePath.endsWith(SpecialExtEnum.uc + '.html')) { //  IF USER CONTROL
        this.commonMng.init(filePath, htmlContents);
    } else if (filePath.endsWith(SpecialExtEnum.tpt + '.html')) { //  IF TEMPLATE
        this.commonMng.init(filePath, htmlContents);
    }
}
}

