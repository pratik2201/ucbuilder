const { join, resolve } = require("path");
const { fileURLToPath, pathToFileURL } = require("url");
const { contextBridge, ipcRenderer } = require("electron");
(async () => {
    const { IpcPreload } = await import("ucbuilder/out/ipc/IpcPreload.js");
    IpcPreload.init(contextBridge, ipcRenderer, process, {
        url: {
            fileURLToPath: (u) => fileURLToPath(u),
            pathToFileURL: (p) => pathToFileURL(p)
        },
        path: {
            join: (...paths) => join(...paths),
            resolve: (...paths) => resolve(...paths)
        }
    });
})(); 