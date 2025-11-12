import { ucUtil } from "../global/ucUtil.js";
import { ISourceFileTypeMap, SourceType, SourceFileType, ISourceTypeMap, GiveSourceFileTypeFeedBack, GetProject, ProjectRowBase, correctpath, subtractPath } from "../ipc/enumAndMore.js";
import { ProjectManage } from "../ipc/ProjectManage.js";
export class PathBridge {
    static path: (typeof import("../nodeFn.js").nodeFn)['path'];
    static url: (typeof import("../nodeFn.js").nodeFn)['url'];
    static source: ProjectRowBase<any>[];
    static CheckAndSetDefault = () => {
        const _this = this;
        if (_this.GetFullPath == undefined && PathBridge.path != undefined) {
            _this.GetFullPath = (path: string, basePath: string) => {
                return _this.path.resolveFilePath(basePath, path);
            }
        }

        if (_this.Convert == undefined && PathBridge.path != undefined && PathBridge.url != undefined) {

            const rootDir = this.path.resolve();
            function givaAll(sourceType: SourceFileType, path: string, fromSrcType: SourceType = 'src', toSrcType: SourceType = 'src') {
                let rtrn: ISourceFileTypeMap = {} as any;
                let prj = GetProject(path, PathBridge.source as any, PathBridge.url as any);
                if (sourceType == undefined || prj == undefined) { console.log(path); return undefined; }

                let right = '';
                const Dirs = prj.directoryOfFileType;
                const SourceDir = prj.directoryOfType;
                const midToReduce = prj.directoryOfFileType[sourceType];
                let toType = SourceDir[toSrcType];
                let fromType = SourceDir[fromSrcType];
                right = subtractPath(correctpath(`${rootDir}/${fromType}/${midToReduce}`), path, _this.path as any);
                rtrn = {
                    ".designer.ts": PathBridge.changeExt(PathBridge.path.join(rootDir, SourceDir['src'], Dirs['.designer.ts'], right), sourceType, '.designer.ts'),
                    ".ts": PathBridge.changeExt(PathBridge.path.join(rootDir, SourceDir['src'], Dirs['.ts'], right), sourceType, '.ts'),
                    ".html": PathBridge.changeExt(PathBridge.path.join(rootDir, toType, Dirs['.html'], right), sourceType, '.html'),
                    ".scss": PathBridge.changeExt(PathBridge.path.join(rootDir, toType, Dirs['.scss'], right), sourceType, '.scss'),
                    ".designer.js": PathBridge.changeExt(PathBridge.path.join(rootDir, toType, Dirs['.designer.js'], right), sourceType, '.designer.js'),
                    ".js": PathBridge.changeExt(PathBridge.path.join(rootDir, toType, Dirs['.js'], right), sourceType, '.js'),
                }
                return rtrn;
            }
            _this.Convert = (path, pathType, givenType) => {
                return givaAll(givenType ?? GiveSourceFileTypeFeedBack(path), path, pathType, pathType);
            }
        }

    }
    static Convert: (path: string, pathtype?: SourceType, givenSourceType?: SourceFileType) => ISourceFileTypeMap;

    static changeExt = (path: string, from: SourceFileType, to: SourceFileType): string => {
        return ucUtil.changeExtension(path, from, to);
    }
    static GetFullPath: (path: string, basePath: string) => string;
    /*
    static GetFullPath = (path: string, basePath: string) => {
        throw new Error('`PathBridge.GetFullPath` NOT DEFINED')
        return path;
    }*/


}



/*
const Dirs: SourceFileTypeMap = {
    '.html': '',
    '.scss': '',
    '.ts': '',
    '.designer.ts': '_designer',
    '.js': '',
    '.designer.js': '_designer',
}
const SourceDir = {
    out: 'out',
    src: '',
}

const rootDir = nodeFn.path.resolve();
PathBridge.GetFullPath = (path: string, basePath: string) => {
    return nodeFn.path.resolveFilePath(basePath, path);
}
function givaAll(sourceType: SourceFileType, path: string, fromSrcType: SourceType = 'src', toSrcType: SourceType = 'src') {
    let rtrn: SourceFileTypeMap = {} as any;
    if (sourceType == undefined) return rtrn;
    let right = '';
    const midToReduce = Dirs[sourceType];
    let toType = SourceDir[toSrcType];
    let fromType = SourceDir[fromSrcType];
    right = nodeFn.path.subtractPath(`${rootDir}/${fromType}/${midToReduce}`["#toFilePath"](), path);
    rtrn = {
        ".designer.ts": PathBridge.changeExt(nodeFn.path.join(rootDir, SourceDir['src'], Dirs['.designer.ts'], right), sourceType, '.designer.ts'),
        ".ts": PathBridge.changeExt(nodeFn.path.join(rootDir, SourceDir['src'], Dirs['.ts'], right), sourceType, '.ts'),
        ".html": PathBridge.changeExt(nodeFn.path.join(rootDir, toType, Dirs['.html'], right), sourceType, '.html'),
        ".scss": PathBridge.changeExt(nodeFn.path.join(rootDir, toType, Dirs['.scss'], right), sourceType, '.scss'),
        ".designer.js": PathBridge.changeExt(nodeFn.path.join(rootDir, toType, Dirs['.designer.js'], right), sourceType, '.designer.js'),
        ".js": PathBridge.changeExt(nodeFn.path.join(rootDir, toType, Dirs['.js'], right), sourceType, '.js'),
    }
    return rtrn;
}
PathBridge.Convert = (path, pathType, givenType) => {
    return givaAll(givenType ?? PathBridge.GiveFeedBack(path), path, pathType, pathType);
}
*/