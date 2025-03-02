import * as fs from "fs";
import * as path from "path";
import { CommonRow } from "ucbuilder/build/buildRow";
import { codeFileInfo, FileInfo } from "ucbuilder/build/codeFileInfo";
import { commonParser } from "ucbuilder/build/codefile/commonParser";
import { SourceCodeNode, SpecialExtEnum } from "ucbuilder/build/common";
import { fileWatcher } from "ucbuilder/build/fileWatcher";
import { CommonEvent } from "ucbuilder/global/commonEvent";

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
    Event = {
        onSelect_xName: new CommonEvent<(ele: HTMLElement,row:CommonRow) => void>()
    }
    init() {
        this.commonMng = new commonParser(this);
    }
    public fillReplacerPath() {
        builder.dirsToBuild.forEach((s: string) => this.recursive(s, (nfilePath) => {
            if (fileWatcher.isHTMLFile(nfilePath)) {
                let nfInfo = new codeFileInfo(codeFileInfo.getExtType(nfilePath));
                nfInfo.parseUrl(nfilePath);
                if (!fs.existsSync(nfInfo.html.fullPath)) return;
                let content = fs.readFileSync(nfInfo.html.fullPath, 'binary');
                let ofilePath = fileWatcher.getFilePathFromHTML(content);
                if (ofilePath != undefined) {
                    if (!nfInfo.mainFileRootPath.equalIgnoreCase(ofilePath)) {
                        let ofInfo = new codeFileInfo(codeFileInfo.getExtType(ofilePath));
                        ofInfo.parseUrl(ofilePath);
                        this.commonMng.pushReplacement({
                            findPath: ofInfo.mainFileRootPath,
                            replaceWith: nfInfo.mainFileRootPath
                        });
                    }
                }
            }
        }));
        this.update_paths_inside_file();
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
    update_paths_inside_file() {
        let pathReplacement = this.commonMng.pathReplacement;
        builder.dirsToBuild.forEach((s: string) => this.recursive(s, (filePath) => {
            let fInfo = new FileInfo();
            fInfo.parse(filePath, true);
            let partInfo = fInfo.partlyInfo;
            let ext = partInfo.extension;
            if (ext == undefined || partInfo.type == undefined ) return;
            if (fileWatcher.isValidFileForPathReplacer(filePath)) {
                let content = fs.readFileSync(filePath, 'binary');
                let needToGenerate = false;
                // TS FILE'S import PATH RESOLVE
                if (fileWatcher.isTSFile(filePath)) {
                    content = content.replace(/(import.*?from)\s*('|"|`)(.*?)\2/gm, (match, importfrom: string, quate: string, _path: string) => {
                        _path = _path.toFilePath();
                        let _rootpath = builder.pathLinear(path.dirname(fInfo.rootPath), _path);
                        let rtrn = `${importfrom} "${_rootpath}"`;
                        if (!needToGenerate) {
                            needToGenerate = !_path.equalIgnoreCase(_rootpath); // IF PATH CHANGED...
                        }
                        return rtrn;
                    });
                }
                // REPLACE OLD PATH TO NEW PATH
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

