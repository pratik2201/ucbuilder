import fs from "fs";
import path from "path";
import url from "url";
import { PathBridge } from "../build/pathBridge.js";
import { TemplateMaker } from "../build/regs/TemplateMaker.js";
import { ConfigFiller } from "./ConfigFiller.js";
import { correctpath, IPC_API_KEY } from "./enumAndMore.js";
import { IpcMainHelper } from "./IpcMainHelper.js";
import { IpcRendererHelper } from "./IpcRendererHelper.js";
PathBridge.path = path as any;
PathBridge.url = url as any;
export class configManage {
    static filler = new ConfigFiller();
    static init(win: import("electron").BrowserWindow, initailModule: string, initialPreload: string) {
        this.filler.fill(correctpath(path.resolve()));
        IpcMainHelper.On('ucConfig', (event, args: {}) => {
            event.returnValue = this.filler.ucConfig;
        });
        IpcMainHelper.On('ucConfigList', (event, args: {}) => {
            event.returnValue = this.filler.ucConfigList;
        });
        IpcMainHelper.Handle('loadChennels', async (event, _path) => {
            try {
                await import(`${_path}`);
                //console.log(`${_path} \nloaded..`);
                return true;
            } catch (ex) {
                console.log(ex);
                return false;
            }
        });
        IpcMainHelper.On('importMap', (event, args: {}) => {
            event.returnValue = this.filler.importmap;
        });
        IpcMainHelper.On('ipcChennelList', (event, args: {}) => {
            event.returnValue = IpcRendererHelper.ipcChannels;
        });
        IpcMainHelper.On('preloadMain', (event, ...paths: string[]) => {
            event.returnValue = this.filler.importmap;
        });
        let _preloadImport = '';
        for (let i = 0, iObj = this.filler.PREELOAD_IMPORT, ilen = iObj.length; i < ilen; i++) {
            const iItem = url.pathToFileURL(iObj[i]);
            _preloadImport += `
            await _api.invoke("${IPC_API_KEY}","loadChennels;","${iItem}");`;
        }

        let ShubhCode = "";
        let ucfg = this.filler.GetByAlias('ucbuilder');
        if (ucfg != undefined) {
            //  path.resolve(ucUtil.devEsc('{:../../assets/initial/Labh.js}')); 
            let Labh = path.join(ucfg.projectPath, 'assets/initial/Labh.js');
            let LabhCode = new TemplateMaker(import.meta.url).compileTemplate(fs.readFileSync(Labh, 'binary'))({
                _preloadImport: _preloadImport,
                IPC_API_KEY: IPC_API_KEY,
                keyBinding: this.filler.MAIN_CONFIG.config.developer.build.keyBind,
                initailModule: initailModule,
                initialPreload: initialPreload,
            });
            let Shubh = path.join(ucfg.projectPath, 'assets/initial/Shubh.js');
            ShubhCode = new TemplateMaker(import.meta.url).compileTemplate(fs.readFileSync(Shubh, 'binary'))({
                IPC_API_KEY: IPC_API_KEY,
                Labh: LabhCode,
            });
        }
        IpcMainHelper.INITIAL_SCRIPT = ShubhCode;
        PathBridge.source = configManage.filler.ucConfigList;
        PathBridge.CheckAndSetDefault();
        win.webContents.executeJavaScript(IpcMainHelper.INITIAL_SCRIPT);
        console.log('configManage inited.');
    }


}
