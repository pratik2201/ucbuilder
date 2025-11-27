import fs from 'fs';
import { IpcRendererHelper } from './ipc/IpcRendererHelper.js';
import crypto from "crypto";
import { ProjectManage } from './ipc/ProjectManage.js';
import { ucUtil } from './global/ucUtil.js';
import { IPC_API_KEY, PreloadFullFill } from './ipc/enumAndMore.js';
export interface I_WriteFileSyncPerameters { path: string, data: string, encode: fs.WriteFileOptions }
export interface I_ReadFileSyncPerameters { path: string, doCache?: boolean, encode: fs.WriteFileOptions }
export interface I_ExistsSyncPerameters { path: string, }
export interface I_PathBaseName { path: string, suffix: string }
export interface I_PathRelative { from: string, to: string }
export interface I_ModuleAlice { alice: string, path: string }
const renderer = IpcRendererHelper.Group(import.meta.url);


export class nodeFn {
    //static ipcMain = renderer;
    static fullfill: PreloadFullFill = undefined;
    static onReady(callback: () => void) {
        renderer.loaded(callback);
    }

    static crypto = {
        toString: (size: number, encoding?: BufferEncoding): string => {
            return renderer.sendSync('crypto.toString', [size, encoding]);
        },
        randomBytes: (size: number): Buffer => {
            return renderer.sendSync('crypto.randomBytes', [size]);
        },
        convert: (data: any, from: crypto.Encoding = "utf-8", to: crypto.Encoding = "hex"): string => {
            return renderer.sendSync('crypto.convert', [data, from, to]);
        },
        encrypt: (data: any): string => {
            return this.crypto.convert(data, 'utf8', 'hex');
        },
        decrypt: (data: any): string => {
            return this.crypto.convert(data, 'hex', 'utf8');
        }
    }
    static url = {
        fileURLToPath: (path: string): string => {
            return nodeFn.fullfill.url.fileURLToPath(path);
            //return renderer.sendSync('url.fileURLToPath', [path]) as string;

        }, pathToFileURL: (path: string): string => {
            return nodeFn.fullfill.url.pathToFileURL(path).href;
            //return renderer.sendSync('url.pathToFileURL', [path]) as string;
        },
    }
    static resolver = {
        resolve: (importPath: string, importer?: string): string => {
            return renderer.sendSync('resolver.resolve', [importPath, importer]);
        },
        resolveOut: (importPath: string, importer?: string): string => {
            return renderer.sendSync('resolver.resolveOut', [importPath, importer]);
        }
    }
    static path = {
        dirname: (path: string): string => {
            return this.fullfill.path.dirname(path);
            //return renderer.sendSync('path.dirname', [path]);
        },
        basename: (path: string, suffix?: string): string => {
            return nodeFn.fullfill.path.basename(path, suffix);
            //return renderer.sendSync('path.basename', [{ path: path, suffix: suffix } as I_PathBaseName]);
        },
        relative: (from: string, to: string): string => {
            return this.fullfill.path.relative(from, to);
            //return renderer.sendSync('path.relative', [{ from: from, to: to } as I_PathRelative]);
        },
        resolve: (...paths: string[]): string => {
            return nodeFn.fullfill.path.resolve(...paths);
            //return renderer.sendSync('path.resolve', [paths]);
        },
        resolveFilePath: (fromFilePath: string, toFilePath: string): string => {
            let ius = this.fullfill.path.dirname(fromFilePath.startsWith('file:') ? this.fullfill.url.fileURLToPath(fromFilePath) : fromFilePath);
            let fspath = ucUtil.toFilePath(this.fullfill.path.resolve(ius, toFilePath));
            return fspath;
            //return renderer.sendSync('path.resolveFilePath', [basePath, path]);
        },
        relativeFilePath: (fromFilePath: string, path: string): string => {
            path = ucUtil.devEsc(path);
            let ius = this.fullfill.path.dirname(fromFilePath.startsWith('file:') ? this.fullfill.url.fileURLToPath(fromFilePath) : fromFilePath);
            let fspath = ucUtil.toFilePath(this.fullfill.path.relative(ius, path));
            return fspath;
            //return renderer.sendSync('path.relativeFilePath', [fromFilePath, path]);
        },

        subtractPath: (basePath: string, targetPath: string): string => {
            const absBase = this.fullfill.path.resolve(basePath);
            const absTarget = this.fullfill.path.resolve(targetPath);

            // Get relative path from base to target
            const relative = this.fullfill.path.relative(absBase, absTarget);
            return relative;

            //return renderer.sendSync('path.subtractPath', [basePath, targetPath]);
        },
        isSamePath: (path1: string, path2: string): string => {
            return renderer.sendSync('path.isSamePath', [path1, path2]);
        },

        join: (...paths: string[]): string => {
            return nodeFn.fullfill.path.join(...paths);
            //return renderer.sendSync('path.join', [paths]);

        },
        normalize: (path: string): string => {
            return renderer.sendSync('path.normalize', [path]);
        },
        isAbsolute: (path: string): boolean => {
            return renderer.sendSync('path.isAbsolute', [path]);
        },
        intersectPath: (path1: string, path2: string): boolean => {
            return renderer.sendSync('path.intersectPath', [path1, path2]);
        },
        intersectAndReplacePath: (basePath: string, targetPath: string): boolean => {
            return renderer.sendSync('path.intersectAndReplacePath', [basePath, targetPath]);
        },
        ProjectResolve: (path: string, importMetaUrl: string) => {
            return ProjectManage.resolve(path as any, importMetaUrl);
        }
    }
    private static readFileSyncStorage = new Map<string, string>();
    private static readFileSyncStorageCounter = 0;
    static fs = {
        openSync: (path: fs.PathLike, flags: fs.OpenMode, mode?: fs.Mode | null, importMetaUrl?: string) => {
            return renderer.sendSync('fs.openSync', [ProjectManage.resolve(path as any, importMetaUrl), flags, mode]);
        },
        existsSync: (path: string, importMetaUrl?: string): boolean => {
            let _path = ProjectManage.resolve(path, importMetaUrl);
            return renderer.sendSync('fs.existsSync', [_path]);
        },
        rename: (from: string, to: string, importMetaUrl?: string) => {
            return renderer.sendSync('fs.rename', [from, to]);
        },


        rmSync: (path: fs.PathLike, options?: fs.RmOptions, importMetaUrl?: string) => {
            return renderer.sendSync('fs.rmSync', [ProjectManage.resolve(path as any, importMetaUrl), options]);
        },
        isDirectory: (path: fs.PathLike, options?: fs.StatSyncOptions, importMetaUrl?: string): boolean => {
            return renderer.sendSync('fs.statSync.isDirectory', [ProjectManage.resolve(path as any, importMetaUrl), options]);
        },

        mkdirSync: (path: string, options: fs.MakeDirectoryOptions, importMetaUrl?: string): string => {
            return renderer.sendSync('fs.mkdirSync', [ProjectManage.resolve(path, importMetaUrl), options]);
        },
        readFile: (path: string, encode: import('fs').WriteFileOptions = 'binary',
            importMetaUrl?: string) => {
            return renderer.Invoke('fs.readFile', [{
                path: ProjectManage.resolve(path, importMetaUrl)['#toFilePath'](),
                encode: encode,
                doCache: false,
            } as I_ReadFileSyncPerameters]);
        },
        readFileSync: (path: string, encode: import('fs').WriteFileOptions = 'binary',
            importMetaUrl?: string, doCache = false): string | null => {
            //if (path.includes('editorCommon.scss')) { return 'editorCommon.scss called...'; }
            let _finalpath = ProjectManage.resolve(path, importMetaUrl)['#toFilePath']();
            if (doCache) {

                let rtrn = this.readFileSyncStorage.get(_finalpath);
                if (rtrn != undefined) return rtrn;
                else {
                    //console.log('cache..'+(this.readFileSyncStorageCounter++));

                    rtrn = renderer.sendSync('fs.readFileSync', [{
                        path: _finalpath,
                        encode: encode,
                        doCache: doCache,
                    } as I_ReadFileSyncPerameters]);
                    this.readFileSyncStorage.set(_finalpath, rtrn);
                    return rtrn;
                }
            } else {
                //console.log('no cache..'+(this.readFileSyncStorageCounter++));
                return renderer.sendSync('fs.readFileSync', [{
                    path: _finalpath,
                    encode: encode,
                    doCache: doCache,
                } as I_ReadFileSyncPerameters]);
            }

        },
        // readFileSyncDetail: (path: string,
        //     encode: import('fs').WriteFileOptions = 'binary',
        //     importMetaUrl?: string,
        //     doCache = false) => {
        //     // if (path.includes('editorCommon.scss')) {    return 'editorCommon.scss called...'; }
        //     importMetaUrl = importMetaUrl ?? ProjectManage.getMetaUrl(path);
        //     let rtrn = {
        //         info: ProjectManage.resolve4PathObject(path, importMetaUrl),
        //         result: '',
        //     }
        //     rtrn.result = renderer.sendSync('fs.readFileSync', [{ path: rtrn.info.result, encode: encode, doCache: doCache } as I_ReadFileSyncPerameters]);
        //     return rtrn;
        // },
        readdirSync: (path: string, encode: import('fs').WriteFileOptions = 'binary', importMetaUrl?: string): string[] => {
            return renderer.sendSync('fs.readdirSync', [ProjectManage.resolve(path, importMetaUrl), encode]);
        },
        readdirSyncDirent: (path: string, recursive?: boolean, importMetaUrl?: string)
            : { name: string, isDir: boolean, isFile: boolean }[] => {
            return renderer.sendSync('fs.readdirSyncDirent', [ProjectManage.resolve(path, importMetaUrl), recursive]);
        },
        writeFileSync: (path: string, data: string, importMetaUrl?: string, encode: import('fs').WriteFileOptions = 'binary') => {
            return renderer.sendSync('fs.writeFileSync', [{ path: ProjectManage.resolve(path, importMetaUrl), data: data, encode: encode } as I_WriteFileSyncPerameters]);
        }
    }

}