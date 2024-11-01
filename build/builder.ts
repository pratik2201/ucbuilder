import * as fs from "fs";
import { commonParser } from "ucbuilder/build/codefile/commonParser";
import { buildOptions, SpecialExtEnum, SpecialExtType, pathInfo, SourceCodeNode } from "ucbuilder/build/common";
import { codeFileInfo, FileInfo, FileNameInfo } from "ucbuilder/build/codeFileInfo";
import * as path from "path";
import { ResourcesUC } from "ucbuilder/ResourcesUC";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { fileWatcher } from "ucbuilder/build/fileWatcher";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";


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

    private fillReplacerPath() {
        this.commonMng.reset();
        builder.dirsToBuild.forEach((s: string) => this.recursive(s, (filePath) => {
            if (filePath.endsWithI(codeFileInfo.___DESIGNER_EXT)) {
                let fInfo = new codeFileInfo(codeFileInfo.getExtType(filePath));
                fInfo.parseUrl(filePath);
                if (!fs.existsSync(fInfo.designer.fullPath)) return;
                let content = fs.readFileSync(fInfo.designer.fullPath, 'binary');
                let key = fileWatcher.getFilePathFromDesigner(content);
                if (key != undefined) {
                    let _FILE_PATH = key;//window.atob(key);
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
    
    private static pathLinear(currentDir: string, path: string) {
        let dirPathSpl = [...currentDir.split(/\\|\//im)];
        let filePathSpl = [...path.split(/\\|\//im)];
        let resultPath: string[] = [];
        switch (filePathSpl[0]) {
            case '.': resultPath.push(...dirPathSpl, ...filePathSpl); break;
            case '..': resultPath.push(...dirPathSpl, ...filePathSpl); break;
            default: resultPath.push(...filePathSpl); break;
        }
        resultPath = combinePath(resultPath);
        return resultPath.join("/");
        function  combinePath (pathpart: string[]): string[]{
            let rstr: string[] = [];
            for (let i = 0; i < pathpart.length; i++) {
                const part = pathpart[i];
                switch (part) {
                    case '.': break;
                    case '': break;
                    case '..': rstr.pop(); break;
                    default: rstr.push(part); break;
                }
            }
            return rstr;
        }
    }
    renameFiles() {
        let pathReplacement = this.commonMng.pathReplacement;
        builder.dirsToBuild.forEach((s: string) => this.recursive(s, (filePath) => {
            let fInfo = new FileInfo();
            fInfo.parse(filePath, true);
            let partInfo = fInfo.partlyInfo;
            let ext = partInfo.extension;
            if (ext == undefined || partInfo.type == undefined || partInfo.type == '.js') return;
            if (ext.startsWith(SpecialExtEnum.uc) || ext.startsWith(SpecialExtEnum.tpt) || partInfo.type == '.ts') {
                let content = fs.readFileSync(filePath, 'binary');
                let needToGenerate = false;
                content = content.replace(/(import.*?from)\s*('|"|`)(.*?)\2/gm, (match,importfrom:string, quate:string, _path:string) => {
                    _path = _path.toFilePath();
                    let _rootpath = builder.pathLinear(path.dirname(fInfo.rootPath),_path);
                    let rtrn = `${importfrom} "${_rootpath}"`;               
                    if (!needToGenerate) {
                        needToGenerate = !_path.equalIgnoreCase(_rootpath); // IF PATH CHANGED...
                    }                    
                    return rtrn;
                });

                pathReplacement.forEach(s => {
                    let res = content.replaceAllWithResult(s.findPath, s.replaceWith);
                    if (res.hasReplaced) {
                        if (!needToGenerate) needToGenerate = true;
                        content = res.result;
                    }
                });
                if (needToGenerate)
                    fs.writeFileSync(filePath, content, 'binary');
            }
        }));
    }
    buildALL(_fillReplacerPath = true) {
        let _this = this;
        if (_fillReplacerPath)
            this.fillReplacerPath();

        builder.dirsToBuild.forEach((s: string) => this.recursive(s, (pth) => {
            _this.checkFileState(pth);
        }));
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

    checkFileState(filePath: string, htmlContents?: string) {

        if (filePath.endsWith(SpecialExtEnum.uc + '.html')) { //  IF USER CONTROL
            this.commonMng.init(filePath, htmlContents);
        } else if (filePath.endsWith(SpecialExtEnum.tpt + '.html')) { //  IF TEMPLATE
            this.commonMng.init(filePath, htmlContents);
        }
    }
}

