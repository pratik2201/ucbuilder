import { KeyboardKey, KeyboardKeyEnum } from "../lib/hardware.js";
import { fileURLToPath, pathToFileURL } from "./renderer/fileURLToPath.js";
import { posixPath } from "./renderer/posixPath.js";



export interface ProjectPrimaryAlias { alice?: string; aliceValue?: string; projectPath?: string; }
export class PreloadFullFill {
    url = {
        fileURLToPath: (url: string) => {
            return fileURLToPath(url);
        },
        pathToFileURL: (pth: string) => {
            return pathToFileURL(pth);
        },
    };
    path = {
        join: (...paths: string[]) => { return posixPath.join(...paths); },
        resolve: (...paths: string[]) => { return posixPath.resolve(...paths); },
    };
}

export function correctpath(str: string, trim = false): string {
    let ns = str.replace(/[\\\/]+/gi, "/");
    return trim ? _trim_(ns, "/") : ns;
}
export function cleanPath(path) {
    return path.replace(/^(\.?\.?\/)+/, "");
}
export function GetUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
export function GetRandomNo(min: number = 0, max: number = 1000000): number {
    let difference = max - min;
    let rand = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
}
export function getRemainingPath(longPath: string, pathRemoveFromPathAtStart: string) {
    longPath = longPath.replace(/\\/g, "/");
    pathRemoveFromPathAtStart = pathRemoveFromPathAtStart.replace(/\\/g, "/");

    const baseParts = longPath.split("/");
    const targetParts = pathRemoveFromPathAtStart.split("/");

    let commonLength = 0;
    for (let i = 0; i < Math.min(baseParts.length, targetParts.length); i++) {
        if (baseParts[i] === targetParts[i]) {
            commonLength = i + 1;
        } else {
            break;
        }
    }

    return baseParts.slice(commonLength).join("/");


}
export function _trim_(mstr: string, charlist: string) {
    if (charlist === undefined)
        charlist = "\s";
    return mstr.replace(new RegExp("^[" + charlist + "]+$", 'ig'), "");
}
export interface IPC_ROOT_RENDERER_API_KEY_NODE {
    sortpath: string;
    url: string;
    fileurl?: string;
    project?: ProjectRowM;
}
export function isSamePath(a: string, b: string, pathModule: typeof import('path')) {
    const absA = pathModule.resolve(a);
    const absB = pathModule.resolve(b);
    return (pathModule.normalize(absA) === pathModule.normalize(absB));
}
export function GetRootPathByUrl_M(urlPath: string, ucConfigList: ProjectRowM[]/*, pathModule: typeof import('path')*/) {
    let rtrn: IPC_ROOT_RENDERER_API_KEY_NODE = { sortpath: "", url: "", project: undefined };
    rtrn.project = ucConfigList.find(cfg => urlPath.startsWith(cfg.importMetaURL)) || null;
    if (rtrn.project == null) {
        console.log('not found');
        return undefined;
    }
    rtrn.sortpath = correctpath(rtrn.project.projectPrimaryAlice + '/' + urlPath.substring(rtrn.project.importMetaURL.length));
    rtrn.url = rtrn.project.importMetaURL;
    rtrn.fileurl = urlPath;
    //console.log(rtrn);
    return rtrn;
}
export function getCloneableObject(obj, seen = new WeakMap(), path = '') {
    if (obj === null || typeof obj !== 'object') return obj;
    if (seen.has(obj)) {
        return seen.get(obj);
    }
    let clone;
    if (Array.isArray(obj)) {
        clone = [];
        seen.set(obj, clone);
        for (let i = 0; i < obj.length; i++) {
            const val = getCloneableObject(obj[i], seen, `${path}[${i}]`);
            clone.push(val);
        }
    } else {
        clone = {};
        seen.set(obj, clone);
        for (const [key, value] of Object.entries(obj)) {
            const type = typeof value;

            if (
                value === null ||
                type === 'string' ||
                type === 'number' ||
                type === 'boolean'
            ) {
                clone[key] = value;
            } else if (type === 'object') {
                if (value instanceof Date) {
                    clone[key] = value.toISOString();
                } else if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
                    clone[key] = value['slice'] ? value['slice'](0) : value;
                } else if (value instanceof Error || value instanceof Node) {
                    // skip errors and DOM nodes
                } else {
                    clone[key] = getCloneableObject(value, seen, path + '.' + key);
                }
            }
            // skip functions, undefined, symbols, etc.
        }
    }

    return clone;
}

export type IpcRendererCallBack = (e: Electron.IpcRendererEvent, ...args: any[]) => void;
export interface BridgeAPI {
    fromMain?: (chennel: string, callback: IpcRendererCallBack) => void;
    sendSync?: (chennel: string, ...args: any[]) => any;
    send?: (chennel: string, ...args: any[]) => void;
    invoke?: (chennel: string, ...args: any[]) => Promise<any>;
    on?: (chennel, callback: IpcRendererCallBack) => void;
    INIT_IMPORT_MAP?: (_win: Window) => void;
}
export const IPC_API_KEY = `ucbuilderAPI`; //_${(Math.random()*98464562)}_`;
export function IPC_GET_KEY(actionKey: string, importMetaUrl: IPC_ROOT_RENDERER_API_KEY_NODE = { sortpath: "", url: "" }) {
    return actionKey + ";" + (importMetaUrl.fileurl ?? importMetaUrl.sortpath);
}
export function IPC_SPLIT_KEY(actionKey: string): { action: string, primaryAlicePath: string } {
    let rtrn = actionKey.split(';');
    return { action: rtrn[0], primaryAlicePath: rtrn[1] };
}
export const WINDOW_API = {
    sendSync: (key: string, args: any[], importMetaUrl: IPC_ROOT_RENDERER_API_KEY_NODE = { sortpath: "", url: "" }, win: Window) => {
        let apk = win[IPC_API_KEY] as BridgeAPI;
        return apk.sendSync(IPC_API_KEY, IPC_GET_KEY(key, importMetaUrl), ...args);
    },
    send: (key: string, args: any[], importMetaUrl: IPC_ROOT_RENDERER_API_KEY_NODE = { sortpath: "", url: "" }, win: Window) => {
        let apk = win[IPC_API_KEY] as BridgeAPI;
        apk.send(IPC_API_KEY, IPC_GET_KEY(key, importMetaUrl), ...args);
    }
}
export type SourceFileType = '.ts' | '.designer.ts' | '.js' | '.designer.js' | '.html' | '.scss';
export type SourceType = 'out' | 'src';
export type ISourceFileTypeMap = {
    [s in Partial<SourceFileType>]: string;
};
export type ISourceTypeMap = {
    [s in Partial<SourceType>]: string;
};
export const SourceFileTypeMap: ISourceFileTypeMap = {
    '.html': '',
    '.scss': '',
    '.ts': '',
    '.designer.ts': '',
    '.js': '',
    '.designer.js': '',
}
export const SourceTypeMap: ISourceTypeMap = {
    out: '',
    src: '',
}
export function GiveSourceFileTypeFeedBack(path: string): SourceFileType {
    if (path.endsWith('.html')) return '.html';
    else if (path.endsWith('.scss')) return '.scss';
    else if (path.endsWith('.ts')) return '.ts';
    else if (path.endsWith('.designer.ts')) return '.designer.ts';
    else if (path.endsWith('.js')) return '.js';
    else if (path.endsWith('.designer.js')) return '.designer.js';
    else undefined;
}
/*
export interface IBuildKeyBinding {
    keyCode?: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
}*/

export class UcBuildOptions {
    keyBind?: KeyboardKey[] = [];
    ignorePath?: string[];
    buildPath?: string;
}
export class IDeveloperOptions {
    build = new UcBuildOptions();
}
export interface IUCConfigPreference {

    designerDir?: string;
    jsDir?: string;
    tsDir?: string;
}
export interface IImportMap {
    imports?: { [alice: string]: string; };
    scopes?: {
        [scope: string]: {
            [alice: string]: string;
        };
    };
}

export function deepAssign(target, ...sources) {
    if (!target || typeof target !== "object") return target;
    for (const source of sources) {
        if (!source || typeof source !== "object") continue;
        for (const key of Object.keys(source)) {
            const sourceValue = source[key];
            if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
                if (sourceValue.constructor !== Object) {
                    // Preserve class instances
                    target[key] = sourceValue;
                } else {
                    // Ensure target has an object before deep merging
                    if (!target[key] || typeof target[key] !== "object") {
                        target[key] = {};
                    }
                    deepAssign(target[key], sourceValue);
                }
            } else {
                target[key] = sourceValue;
            }
        }
    }
    return target;
}

export class UserUCConfig {
    env: 'developer' | 'user' = 'developer';
    preloadMain: string[] = [];
    browser = {
        importmap: {} as { [alice: string]: string; },
        globalAlias: {} as { [alice: string]: string; }
    };
    preference?: IUCConfigPreference = {
        designerDir: "",
        tsDir: "",
        jsDir: "",
    }
    developer = new IDeveloperOptions();
    type?: "ts" | "js";
}
export class ProjectRowBase<K = any> {
    projectName?: string = "";
    importMetaURL: string = "";
    projectPath?: string = "";

    // pathToAlice?: { [projectPath: string]: string; } = {};
    aliceToPath?: { [alice: string]: string; } = {};
    projectPrimaryAlice?: string = "";

    directoryOfFileType: ISourceFileTypeMap = JSON.parse(JSON.stringify(SourceFileTypeMap));
    directoryOfType: ISourceTypeMap = JSON.parse(JSON.stringify(SourceTypeMap));

    children?: K[] = [];
    config? = new UserUCConfig();
}
export class ProjectRowR extends ProjectRowBase<ProjectRowR> {
    id: number;
    defaultLoadAt: HTMLElement = undefined;
    stampSRC: import("../lib/StampGenerator.js").SourceNode = undefined;
    type?: "ts" | "js" = "ts";
    children?: ProjectRowR[] = [];
}
export class ProjectRowM extends ProjectRowBase<ProjectRowM> {
    rootPath?: string = "";
    children?: ProjectRowM[] = [];
}
export function getMetaUrl<K>(fullPath: string, ar: ProjectRowBase<K>[]): string {
    fullPath = correctpath(fullPath);
    return ar.find((row: ProjectRowBase<K>) => fullPath.startsWith(row.projectPath))?.importMetaURL;
}
export function subtractPath(basePath: string, targetPath: string, pathModule: typeof import('path')) {
    const absBase = pathModule.resolve(basePath);
    const absTarget = pathModule.resolve(targetPath);

    // Get relative path from base to target
    const relative = pathModule.relative(absBase, absTarget);

    //  return relative;
    return relative;
}
export function GetUcConfig(projectdir: string,path: typeof import('path'),fs: typeof import('fs')): string | undefined {
    let config_file_path = path.join(projectdir, 'ucconfig.json');
    if (fs.existsSync(config_file_path)) {
        return JSON.parse(fs.readFileSync(config_file_path, 'binary'));
    }
    return undefined;
}
export function GetPackage(projectdir: string,path: typeof import('path'),fs: typeof import('fs')): string | undefined {
    let package_file_path = path.join(projectdir, 'package.json');
    if (fs.existsSync(package_file_path)) {
        return JSON.parse(fs.readFileSync(package_file_path, 'binary'));
    }
    return undefined;
}
export function GetProjectName(projectdir: string,path: typeof import('path'),fs: typeof import('fs')): string | undefined {
    let package_file_path = path.join(projectdir, 'package.json');
    if (fs.existsSync(package_file_path)) {
        let packageContent = JSON.parse(fs.readFileSync(package_file_path, 'binary'));
        if (packageContent != undefined)
            return packageContent.name;
    }
    return undefined;
}
export function GetProject<K>(_path: string, projectsArray: ProjectRowBase<K>[], url: typeof import('url')) {
    let callerFilePath = _path.startsWith('file:///') ? url.fileURLToPath(_path) : _path;
    callerFilePath = correctpath(callerFilePath);
    return projectsArray.find(proj => callerFilePath.startsWith(proj.projectPath));
}
export function resolvePathObject<K>(filePath: string, callerMetaUrl: string, projectsArray: ProjectRowBase<K>[], project: ProjectRowBase<K>, path: typeof import('path'), url: typeof import('url')): IResolvePathResult | undefined {
    let rtrn: IResolvePathResult<K> = {};
    if (callerMetaUrl == undefined) return {
        result: filePath,
        isFullPath: true
    }
    project = project ?? GetProject(callerMetaUrl, projectsArray, url);
    // if (project == undefined) {
    //     let callerFilePath = callerMetaUrl.startsWith('file:///') ? url.fileURLToPath(callerMetaUrl) : callerMetaUrl;
    //     callerFilePath = correctpath(callerFilePath);
    //     project = projectsArray.find(proj => callerFilePath.startsWith(proj.projectPath));
    // }
    if (!project) {
        throw Error("filePath is miss match (OUT OF syllabus)");
        return undefined;
    }
    rtrn.project = project as any;
    for (const [alias, relativeAliasPath] of Object.entries(project.config.browser.importmap)) {
        if (filePath.startsWith(alias)) {
            const relativeFilePath = filePath.replace(alias, `/${relativeAliasPath}/`);
            const absoluteFilePath = path.normalize(path.join(project.projectPath, relativeFilePath));
            rtrn.alias = alias;
            rtrn.aliasPath = relativeAliasPath;
            rtrn.result = absoluteFilePath;
            rtrn.isFullPath = false;
            return rtrn as any;
        }
    }
    //console.log(filePath);

    if (filePath.match(/^\.{1,2}[\/\\]/) != null) {

        rtrn.isFullPath = false;
        let pdir = project.projectPath;// callerMetaUrl.substring(0, callerMetaUrl.lastIndexOf('/')); // project.projectPath;
        rtrn.result = path.resolve(pdir, filePath);
        return rtrn as any;
    }
    rtrn.isFullPath = true;
    rtrn.result = filePath;
    return rtrn as any;
}
function isAbsolutePath(p: string): boolean {
    if (!p) return false;

    // Windows absolute path: C:\ or \\server\share
    if (/^[a-zA-Z]:[\\/]/.test(p)) return true;
    if (/^\\\\/.test(p)) return true; // UNC path
    if (/^\\\\\?\\/.test(p)) return true; // Extended path

    // POSIX absolute path: starts with /
    if (p.startsWith("/")) return true;

    return false;
}

export type IResolvePathResult<K = ProjectRowR> = {
    result?: string;
    project?: K;
    isFullPath?: boolean;

    alias?: string;
    aliasPath?: string;
};
