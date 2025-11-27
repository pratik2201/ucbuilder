const { join, resolve, dirname, relative, basename } = require("path");
const { fileURLToPath, pathToFileURL } = require("url");
const { contextBridge, ipcRenderer } = require("electron");
(async () => {
    const { IpcPreload } = await import("./node_modules/ucbuilder/out/ipc/IpcPreload.js");
    IpcPreload.init(contextBridge, ipcRenderer, process, {
        url: {
            fileURLToPath: (u) => fileURLToPath(u),
            pathToFileURL: (p) => pathToFileURL(p)
        },
        path: {
            basename:(path,suffix)=>basename(path,suffix),
            dirname:(path)=>dirname(path),
            relative:(from, to)=>relative(from,to),
            join: (...paths) => join(...paths),
            resolve: (...paths) => resolve(...paths)
        }
    });
})(); 