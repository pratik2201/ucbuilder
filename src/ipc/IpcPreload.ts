import { BridgeAPI, IPC_API_KEY, PreloadFullFill, WINDOW_API } from "./enumAndMore.js";

export class IpcPreload {
    static init(contextBridge: Electron.ContextBridge, ipcRenderer: Electron.IpcRenderer, process: NodeJS.Process, fullFill = new PreloadFullFill()) {
        //console.log('here');        
        contextBridge.exposeInMainWorld(IPC_API_KEY, {
            //fromMain: (chennel: string, callback: (e: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on(chennel, callback),
            sendSync: (chennel: string, ...args: any[]) => ipcRenderer.sendSync(chennel, ...args),
            send: (chennel: string, ...args: any[]) => ipcRenderer.send(chennel, ...args),
            invoke: (chennel: string, ...args: any[]): Promise<any> => ipcRenderer.invoke(chennel, ...args),
            on: (chennel, callback = (event: Electron.IpcRendererEvent, ...args: any[]) => { }) => {
                ipcRenderer.on(chennel, callback);
            },
            reload: () => {
                ipcRenderer.send(IPC_API_KEY + ';reload-browser-for-developement', {});
            },
            INIT_IMPORT_MAP: (_win: Window) => {
                //IpcRendererHelper._Window = _win;
                const scriptEle = document.createElement("script");
                scriptEle.type = "importMap";
                scriptEle.textContent = JSON.stringify(WINDOW_API.sendSync('importMap', [{}], undefined, _win));
                document.head.prepend(scriptEle);

                console.log('IMPORT MAP inited..');
            },
            fullFill: fullFill,
            Ready: () => {
                console.log('Ready..');

            }
        } as BridgeAPI);
        contextBridge.exposeInMainWorld("env", {
            NODE_ENV: process.env.NODE_ENV
        });
        // ipcRenderer.on(IPC_API_KEY, this.onCallback);
        console.log('IpcPreload inited..');
    }

}