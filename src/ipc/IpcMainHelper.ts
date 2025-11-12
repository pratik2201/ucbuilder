import path from "path";
import url from "url";
import { PathBridge } from "../build/pathBridge.js";
import { configManage } from "./configManage.js";
import { getCloneableObject, GetRootPathByUrl_M, IPC_API_KEY, IPC_GET_KEY, IPC_ROOT_RENDERER_API_KEY_NODE } from "./enumAndMore.js";
//PathHelper.pathModule = path;
PathBridge.path = path as any;
PathBridge.url = url as any;

type IpcMainCallBack = (e: import("electron").IpcMainEvent, ...args: any[]) => void;
type IpcMainInvokeCallBack = (e: import("electron").IpcMainInvokeEvent, ...args: any[]) => Promise<any>;

interface IGroupMain {
    On: (actionKey: string, callback: IpcMainCallBack) => void,
    Handle: (actionKey: string, callback: IpcMainInvokeCallBack) => void,
    Send: (actionKey: string, evt: Electron.IpcMainEvent, ...args: any[]) => void,
    Reply: (actionKey: string, evt: Electron.IpcMainEvent, ...args: any[]) => void,
}

export function IpcMainGroup(urlpath: string): IGroupMain {
    if (typeof window !== "undefined") return;
    //
    let urlObj = GetRootPathByUrl_M(urlpath, configManage.filler.ucConfigList);
    let rtrn: IGroupMain = {
        On: (key, callback) => {
            return IpcMainHelper.On(key, callback, urlObj);
        },
        Handle: (key, callback) => {
            return IpcMainHelper.Handle(key, callback, urlObj);
        },
        Send: (key, evt: Electron.IpcMainEvent, ...args: any[]) => {
            IpcMainHelper.Send(key, evt, args, urlObj);
            //evt.sender.send(key, callback, urlPath);
        },
        Reply: (key, evt: Electron.IpcMainEvent, ...args: any[]) => {


            IpcMainHelper.Reply(key, evt, args/*[...args]*/, urlObj);
            //evt.sender.send(key, callback, urlPath);
        }
    };
    return rtrn;
}
export class IpcMainHelper {
    static Send(actionKey: string, evt: Electron.IpcMainEvent, args: any[], importMetaUrl: IPC_ROOT_RENDERER_API_KEY_NODE = { url: "", sortpath: "" }) {
        args = getCloneableObject(args);
        //args.forEach(s => s = getCloneableObject(s));
        evt.sender.send(IPC_API_KEY, IPC_GET_KEY(actionKey, importMetaUrl), ...args);
    }
    static Reply(actionKey: string, evt: Electron.IpcMainEvent, args: any[], importMetaUrl: IPC_ROOT_RENDERER_API_KEY_NODE = { url: "", sortpath: "" }) {
        //console.log(...args);
        
        args = getCloneableObject(args);
        //args.forEach(s => s = getCloneableObject(s));
        evt.reply(IPC_API_KEY, IPC_GET_KEY(actionKey, importMetaUrl), ...args);
    }
    static IPC_ON: { [actionKey: string]: IpcMainCallBack } = {};
    static IPC_HANDLE: { [actionKey: string]: IpcMainInvokeCallBack } = {};
    static On(actionKey: string, callback: IpcMainCallBack, importMetaUrl: IPC_ROOT_RENDERER_API_KEY_NODE = { url: "", sortpath: "" }) {
        actionKey = IPC_GET_KEY(actionKey, importMetaUrl);
        //console.log('On... ' + actionKey);

        if (!(actionKey in this.IPC_ON)) {
            this.IPC_ON[actionKey] = callback;

        }
    }
    static Handle(actionKey: string, callback: IpcMainInvokeCallBack, importMetaUrl: IPC_ROOT_RENDERER_API_KEY_NODE = { url: "", sortpath: "" }) {
        actionKey = IPC_GET_KEY(actionKey, importMetaUrl);
        //console.log('Handle... ' + actionKey);
        if (!(actionKey in this.IPC_HANDLE)) {
            this.IPC_HANDLE[actionKey] = callback;
        }
    }

    static init(_ipcMain: import("electron").IpcMain,  win: import("electron").BrowserWindow, initailModule: string,initialPreload:string) {

        _ipcMain.on(IPC_API_KEY + ';reload-browser-for-developement', (event, args) => {
            console.log('reload..callback..');

            win.webContents.reloadIgnoringCache();
            win.webContents.executeJavaScript(IpcMainHelper.INITIAL_SCRIPT);
            event.returnValue = true;
        });
        _ipcMain.on(IPC_API_KEY, (event, ...args: any[]) => {
            let actionKey = args.shift();
            if (actionKey in this.IPC_ON) {
                this.IPC_ON[actionKey](event, ...args);
            } else {
                configManage.filler.savePreLoadFilePath(actionKey);
                console.log(`no 'ON EVENT' found [${actionKey}]`);
                //console.log(args);
            }
        });
        _ipcMain.handle(IPC_API_KEY, async (event, ...args: any[]) => {
            let actionKey = args.shift();
            if (actionKey in this.IPC_HANDLE) {
                return this.IPC_HANDLE[actionKey](event, ...args);
            } else {
                console.log(`no 'HANDLE EVENT' found [${actionKey}]`); +
                    console.log(this.IPC_HANDLE);
                console.log(args);
                return undefined;
            }
        });
        
        configManage.init(  win, initailModule,initialPreload);

    }
    static INITIAL_SCRIPT = "";


}