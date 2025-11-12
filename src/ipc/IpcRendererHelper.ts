import { BridgeAPI, getCloneableObject, GetRootPathByUrl_M, IPC_API_KEY, IPC_GET_KEY, IPC_ROOT_RENDERER_API_KEY_NODE, IpcRendererCallBack,  ProjectRowM,  WINDOW_API } from "./enumAndMore.js";
interface IRelativeRendere {
    sendSync: (key: string, args: any[]) => any;
    send: (key: string, args: any[]) => void;
    Invoke: (key: string, args: any[]) => Promise<any>;
    on: (chennel, callback: IpcRendererCallBack) => void;
    loaded?: (callback: () => void) => void;
    onLoadedCallBack: Array<() => void>;
    isReadyForUse: boolean;
}
export const IPC_ON: { [actionKey: string]: IpcRendererCallBack } = {};
export class IpcRendererHelper {
    private static loadRelativeChennels(importMetaUrl: string): Promise<any> {
        let ns = IpcRendererHelper.getRelativeURL(importMetaUrl);
        let s = GetRootPathByUrl_M(ns, this.ucConfigList);
        if (typeof window !== "undefined") {

            return IpcRendererHelper.Invoke('loadChennels', [importMetaUrl], undefined/*, s*/);
        }
        return undefined;
    } 
    static ucConfigList:  ProjectRowM[];
    static Group(urlPath: string) { // donedanadonerootpath
        if (typeof window === "undefined") return;
        let donedanadonerootpath = GetRootPathByUrl_M(IpcRendererHelper.getRelativeURL(urlPath), this.ucConfigList);
        let rtrn: IRelativeRendere = {
            sendSync(key, args) {
                return IpcRendererHelper.sendSync(key, args, donedanadonerootpath);
            }, send(key, args) {
                return IpcRendererHelper.send(key, args, donedanadonerootpath);
            }, Invoke(key, args) {
                return IpcRendererHelper.Invoke(key, args, donedanadonerootpath);
            }, on(key, callback: IpcRendererCallBack) {
                return IpcRendererHelper.On(key, callback, donedanadonerootpath);
            }, loaded(callback: () => void) {
                if (rtrn.isReadyForUse) callback();
                else rtrn.onLoadedCallBack.push(callback);
            },
            onLoadedCallBack: [],
            isReadyForUse: false
        };
        (async () => {
            let res = await IpcRendererHelper.loadRelativeChennels(urlPath);
            if (res == false) {
                rtrn.isReadyForUse = false;
            } else {
                rtrn.isReadyForUse = true;
                for (let i = 0, iObj = rtrn.onLoadedCallBack, ilen = iObj.length; i < ilen; i++) {
                    const callback = iObj[i];
                    callback();
                }
            }
        })();
        return rtrn;
    }
    static _Window: Window = undefined; 
    static init = (_win: Window) => {
        let cb = window[IPC_API_KEY] as BridgeAPI;
        this.ucConfigList = cb.sendSync(IPC_API_KEY, 'ucConfigList;');
        cb.on(IPC_API_KEY, this.onCallback);
        //console.log(cb.sendSync(IPC_API_KEY, 'ucConfigList;'));

        console.log('IpcRendererHelper inited..');
    }
    static onCallback = (event, ...args: any[]) => {
        let actionKey = args.shift();
        if (actionKey in IPC_ON) { 
            IPC_ON[actionKey](event, ...args); 
        } else {
            console.log(`no 'ON EVENT' found [${actionKey}]  in Renderer`);

        }
    }
    static sendSync(key: string, args: any[], importMetaUrl?: IPC_ROOT_RENDERER_API_KEY_NODE) {
        let win = this._Window ?? window;
        args = getCloneableObject(args);
            //args.forEach(s => s = getCloneableObject(s));
        return WINDOW_API.sendSync(key, args, importMetaUrl, win);
    }
    static send(key: string, args: any[], importMetaUrl?: IPC_ROOT_RENDERER_API_KEY_NODE) {
        let win = this._Window ?? window;
        args = getCloneableObject(args);
        //args.forEach(s => s = getCloneableObject(s));
        return WINDOW_API.send(key, args, importMetaUrl, win);

    }

    static On(actionKey: string, callback: IpcRendererCallBack, importMetaUrl?: IPC_ROOT_RENDERER_API_KEY_NODE) {
        actionKey = IPC_GET_KEY(actionKey, importMetaUrl);
        if (!(actionKey in IPC_ON)) {
            IPC_ON[actionKey] = callback;
        }
    }
    static Invoke(key: string, args: any[], importMetaUrl: IPC_ROOT_RENDERER_API_KEY_NODE) {
        let win = this._Window ?? window;
        let apk = win[IPC_API_KEY] as BridgeAPI;
        return apk.invoke(IPC_API_KEY, IPC_GET_KEY(key, importMetaUrl), ...args);
    }

    static get ucConfig(): ProjectRowM {
        return this.sendSync('ucConfig', [{}]);
    }
    static get importMap() {

        return this.sendSync('importMap', [{}]);
    }
    static ipcChannels = new Set();
    static get ipcChennelList() {
        return this.sendSync('ipcChennelList', [{}]);
    }
    static getRelativeURL(_path: string) {
        if (_path.match(/\.ipc\.js$/i) != null) return _path;
        return _path.replace(/\.js$/i, ".ipc.js");
    }
}