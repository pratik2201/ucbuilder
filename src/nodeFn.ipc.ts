import fs, { Mode, OpenMode, PathLike } from "fs";
import path from "path";
import { ProjectManage } from "./ipc/ProjectManage.js";
import { IpcMainGroup, IpcMainHelper } from "./ipc/IpcMainHelper.js";
import { fileURLToPath, pathToFileURL } from "url";
import { I_ExistsSyncPerameters, I_PathBaseName, I_PathRelative, I_ReadFileSyncPerameters, I_WriteFileSyncPerameters } from "./nodeFn.js";
import crypto from "crypto";
import { ucUtil } from "./global/ucUtil.js";
import { TSPathResolver } from "./global/TSPathResolver.js";
const cryptInfo = {
    algorithm: "aes-256-gcm" as crypto.CipherGCMTypes,
    key: 'prat' as string, //crypto.randomBytes(32);
    iv: crypto.randomBytes(16) as Buffer
}
const main = IpcMainGroup(import.meta.url);
const resolver = TSPathResolver.getInstance();
main.On("resolver.resolve", (event, importPath: string, importer?: string) => {
    debugger;
    event.returnValue = resolver.resolve(importPath, importer);
});
main.On("resolver.resolveOut", (event, importPath: string, importer?: string) => {
    event.returnValue = resolver.resolveOut(importPath, importer);
});

main.On("crypto.toString", (event, size: number, encoding?: BufferEncoding) => {
    event.returnValue = crypto.randomBytes(size).toString(encoding);
});
main.On("crypto.randomBytes", (event, size: number) => {
    event.returnValue = crypto.randomBytes(size);
});
main.On("crypto.convert", (event, data: any, from: crypto.Encoding = "utf-8", to: crypto.Encoding = "hex") => {
    let cipher = crypto.createCipher(cryptInfo.algorithm, cryptInfo.key);
    let encrypted = cipher.update(data, from, to);
    encrypted += cipher.final(to);
    event.returnValue = encrypted;
});

main.On("url.pathToFileURL", (event, args) => {
    event.returnValue = pathToFileURL(args).href;
});
main.On("url.fileURLToPath", (event, args) => {
    try {
        event.returnValue = fileURLToPath(args);
    } catch (error) {
        console.log(args);

        console.log(error);

    }
});
main.On('fs.openSync', (event, path: PathLike, flags: OpenMode, mode?: Mode | null) => {
    event.returnValue = fs.openSync(path, flags, mode);
});
main.On('fs.existsSync', (event, path: string) => {
    event.returnValue = fs.existsSync(path);
});
main.On('fs.rmSync', (event, path: fs.PathLike, options?: fs.RmOptions, importMetaUrl?: string) => {
    event.returnValue = fs.rmSync(path, options);
});
main.On('fs.statSync.isDirectory', (event, path: fs.PathLike, options?: fs.StatSyncOptions, importMetaUrl?: string) => {
    try {
        event.returnValue = fs.lstatSync(path, options).isDirectory();
    } catch {
        event.returnValue = false;
    }

});
 
function ensureDirectoryExistence(filePath: string) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}
main.On('fs.rename', (event, from: string, to: string) => {
    ensureDirectoryExistence(to);
    event.returnValue = fs.renameSync(from, to);
});
main.On('fs.mkdirSync', (event, path: string, options: fs.MakeDirectoryOptions) => {
    event.returnValue = fs.mkdirSync(path, options);
});
main.Handle('fs.readFile', async (e, args: I_ReadFileSyncPerameters) => {
    return await fs.readFile(args.path, args.encode as any);
})
const _readFileCache = new Map<string, string>();
main.On('fs.readFileSync', (event, args: I_ReadFileSyncPerameters) => {
    let fileContent: string;
    /*if (args.doCache) {
        if (_readFileCache.has(args.path)) fileContent = _readFileCache.get(args.path);
        else {
            fileContent = fs.readFileSync(args.path, args.encode) as any;
            _readFileCache.set(args.path, fileContent);
        }
    } else */fileContent = fs.readFileSync(args.path, args.encode) as any;

    event.returnValue = fileContent;
});
main.On('fs.readdirSync', (event, path: string, encode: BufferEncoding) => {
    event.returnValue = fs.readdirSync(path, encode);
});
main.On('fs.readdirSyncDirent', (event, path: string, recursive?: boolean) => {
    event.returnValue = fastReadDirWithType(path);
});
function fastReadDirWithType(dirPath) {
    return fs.readdirSync(dirPath, { withFileTypes: true }).map(dirent => ({
        name: dirent.name,
        isDir: dirent.isDirectory(),
        isFile: dirent.isFile()
    }));
}
main.On('fs.writeFileSync', (event, args: I_WriteFileSyncPerameters) => {
    event.returnValue = fs.writeFileSync(args.path, args.data, args.encode);
});
main.On('path.dirname', (event, args) => {
    if (args === undefined) { event.returnValue = undefined; return; }
    event.returnValue = path.dirname(args);
});
main.On('path.resolve', (event, args) => {
    event.returnValue = path.resolve(...args);
});
// function filetopath(pth: string) {
//     path.dirname(pth.startsWith('file:') ? fileURLToPath(pth) : fromFilePath);
// }
main.On('path.resolveFilePath', (event, basePath: string, paths: string) => {
    let ius = path.dirname(basePath.startsWith('file://') ? fileURLToPath(basePath) : basePath);
    let fspath = ucUtil.toFilePath(path.resolve(ius, paths));
    event.returnValue = fspath;
});
main.On('path.relativeFilePath', (event, fromFilePath: string, toFilePath: string) => {
    let ius = path.dirname(fromFilePath.startsWith('file:') ? fileURLToPath(fromFilePath) : fromFilePath);
    let fspath = ucUtil.toFilePath(path.relative(ius, toFilePath));
    event.returnValue = fspath;
});
main.On('path.subtractPath', (event, basePath: string, targetPath: string) => {
    // Resolve both paths to absolute paths
    const absBase = path.resolve(basePath);
    const absTarget = path.resolve(targetPath);

    // Get relative path from base to target
    const relative = path.relative(absBase, absTarget);

    //  return relative;
    event.returnValue = relative;
});
main.On('path.isSamePath', (event, a: string, b: string) => {
    const absA = path.resolve(a);
    const absB = path.resolve(b);
    event.returnValue = (path.normalize(absA) === path.normalize(absB));
});
main.On('path.join', (event, args) => {
    event.returnValue = path.join(...args);
});
main.On('path.normalize', (event, args) => {
    event.returnValue = path.normalize(args);
});
main.On('path.isAbsolute', (event, args) => {
    event.returnValue = path.isAbsolute(args);
});
main.On('path.relative', (event, args: I_PathRelative) => {
    event.returnValue = path.relative(args.from, args.to);
});
main.On('path.basename', (event, args: I_PathBaseName) => {
    event.returnValue = path.basename(args.path, args.suffix);
});
main.On('path.intersectPath', (event, path1, path2) => {
    const parts1 = path.resolve(path1).split(path.sep);
    const parts2 = path.resolve(path2).split(path.sep);
    let i = 0;
    while (i < parts1.length && i < parts2.length && parts1[i] === parts2[i]) {
        i++;
    }
    event.returnValue = i > 0 ? parts1.slice(0, i).join(path.sep) : null;
});
main.On('path.intersectAndReplacePath', (event, basePath, targetPath) => {
    const absoluteBase = path.resolve(basePath);
    const absoluteTarget = path.resolve(targetPath);

    const baseParts = absoluteBase.split(path.sep);
    const targetParts = absoluteTarget.split(path.sep);

    // Find the common base directory
    let commonIndex = baseParts.findIndex(part => part === "src");
    if (commonIndex === -1) {
        event.returnValue = null; // No "src" found, return null
    }

    // Extract the relative path after "src"
    const relativePath = baseParts.slice(commonIndex + 1).join(path.sep);

    // Join with targetPath
    event.returnValue = path.join(targetPath, relativePath);
});

/*IpcMainHelper.On('url.fileURLToPath', (event, args) => {
    event.returnValue = fileURLToPath(args);
});*/
