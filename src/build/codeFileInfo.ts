import { SpecialExtType, ucUtil } from "../global/ucUtil.js";
import { ISourceFileTypeMap, SourceFileType, ProjectRowR, SourceType, getMetaUrl } from "../ipc/enumAndMore.js";
import { ProjectManage } from "../ipc/ProjectManage.js";
import { IResolvePathResult } from "ucbuilder/ipc/enumAndMore.js";
import { nodeFn } from "../nodeFn.js";
import { PathBridge } from "./pathBridge.js";

interface FileNode {
    rootPath?: string;
    fullPath?: string;
    out?: FileNode;
}
type PathOf =
    "none"
    | ".designer.ts"
    | ".ts"
    | ".html"
    | ".scss";
function giveFeedBack(path: string): PathOf {
    let mch = /\.(designer\.(ts|js)|ts|js|html|scss)$/i.exec(path);
    if (!mch) return 'none';
    return mch[0] as PathOf;
}
export class codeFileInfo {
    name = "";
    extCode: SpecialExtType;
    constructor(extCode: SpecialExtType) {
        this.extCode = extCode;
    }
    static getExtType(path: string): SpecialExtType {
       //console.log(path);
        
        let spl = path.split(/\/\\/gi);
        let fname = spl.pop();
        let far = fname.split('.');
        if (far.lastIndexOf('uc')>=0) return '.uc';
        else if (far.lastIndexOf('tpt')>=0) return '.tpt';
        else return 'none';
    }
    pathOf: ISourceFileTypeMap;
    resolvePathResult: IResolvePathResult;
    fullWithoutExt = (ftype: SourceFileType) => {
        return ucUtil.changeExtension(this.pathOf[ftype], `${this.extCode}${ftype}`, '');
    }
    pathWithExt = (ftype: SourceFileType) => {
        return ucUtil.changeExtension(this.pathOf[ftype], `${ftype}`, '');
    }
    static GetFileName(filePath: string) {
        const fileName = filePath.split(/[\\/]/).pop();
        return fileName.split('.')[0];
    }
    callerMetaUrl: string;
    actualProject: ProjectRowR;
    get projectInfo() { return this.resolvePathResult?.project; }
    parseUrl(_path: string, sourceType: SourceType, _basepath_metaurl: string): boolean {
        this.callerMetaUrl = _basepath_metaurl;
        let fullpath = PathBridge.GetFullPath(_path, _basepath_metaurl);
        _path = fullpath;
        let GIVEN_PATH_TYPE = giveFeedBack(_path);
        if (GIVEN_PATH_TYPE == 'none')
            throw new Error(`'${_path}' is not valid file type for codeFileInfo.parseUrl`);
        else {
            this.pathOf = PathBridge.Convert(_path, sourceType);
            // if (_path.includes('.tpt')) {
            //     console.log(this.extCode);                
            //     console.log(_path);
            //     console.log(this.pathOf);
            // }
            if (this.pathOf == undefined) {
                console.warn(`'${_path}' is not appropriate for codeFileInfo.parseUrl`);
                return false;
            }
        }

        let pathPera = _path["#toFilePath"]();
        if (!_basepath_metaurl.startsWith('file://')) _basepath_metaurl = nodeFn.url.pathToFileURL(_basepath_metaurl);
        _basepath_metaurl = _basepath_metaurl ?? getMetaUrl(_path, ProjectManage.projects);
        let _resolveRes = this.resolvePathResult = ProjectManage.getInfo(pathPera, _basepath_metaurl);
        this.actualProject = _resolveRes.project;
        if (_resolveRes.alias != undefined) {
            let pathProjectDir = this.actualProject.aliceToPath[_resolveRes.alias];
            if (!this.actualProject.projectPath["#equalIgnoreCase"](pathProjectDir)) {
                this.actualProject = ProjectManage.getInfoByProjectPath(pathProjectDir);
            }
        }
        if (this.actualProject == undefined) {
            console.log(`"${_path}" at codeFileInfo`);
            return false;
        }
        this.name = codeFileInfo.GetFileName(this.pathOf[".html"]);
        return true;
    }
    get mainFileRootPath_btoa() { return window.btoa(this.fullWithoutExt('.html')); }
}

