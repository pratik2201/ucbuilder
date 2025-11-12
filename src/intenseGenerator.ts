import { codeFileInfo } from "./build/codeFileInfo.js";
import { IUcOptions, UcOptions, ITptOptions, TptOptions } from "./enumAndMore.js";
import { newObjectOpt } from "./global/objectOpt.js";
import { getMetaUrl } from "./ipc/enumAndMore.js";
import { ProjectManage } from "./ipc/ProjectManage.js";
import { VariableList, CssVariableHandler } from "./StylerRegs.js";
import { Template } from "./Template.js";
import { Usercontrol } from "./Usercontrol.js";

 

class intenseGenerator {
    static setCSS_globalVar(varList: VariableList, _path: string): void {
        let rt = ProjectManage.getInfo(_path, getMetaUrl(_path,ProjectManage.projects));
        CssVariableHandler.SetCSSVarValue(varList, '' + rt.project.id, 'g');
    }
    static generateUC<T = string>(path: T, classObj: any, importMetaURL: string, pera: IUcOptions, ...args: any[]): Usercontrol {
        let param0: IUcOptions = newObjectOpt.copyProps(pera, UcOptions);
        param0.cfInfo = new codeFileInfo(codeFileInfo.getExtType(path as string));
         param0.cfInfo.parseUrl(path as string,'out', importMetaURL);
        let toSend = [];
        toSend.push(...args, param0);
        
        let actEle = document.activeElement;
        let uc: Usercontrol = (new (classObj)(...toSend));
        if(pera.parentUc!=undefined)
            pera.parentUc.ucExtends.lastFocuedElement = actEle as HTMLElement;
       // uc['initializecomponent'](param0);
        if (uc['$']) uc['$'](...args);
        return uc;
    }
    static async generateUCAsync<T = string>(path: T, classObj: any, importMetaURL: string, pera: IUcOptions, ...args: any[]): Promise<Usercontrol> {
        let param0: IUcOptions = newObjectOpt.copyProps(pera, UcOptions);
        if (param0.cfInfo == undefined) {
            param0.cfInfo = new codeFileInfo(codeFileInfo.getExtType(path as string));
            param0.cfInfo.parseUrl(path as string, 'out', importMetaURL);
        }
        let toSend = [];
        toSend.push(...args, param0);
        let uc: Usercontrol = (new (classObj)(...toSend));
        await uc['initializecomponentAsync'](param0,uc);
        if (uc['$']) await uc['$'](...args);
        return uc;
    }
    static generateTPT(path: string, classObj: any, callerMetaUrl: string, pera: ITptOptions, ...args: any[]): Template {
        let param0: ITptOptions = Object.assign(pera, TptOptions);
        param0.cfInfo = new codeFileInfo(codeFileInfo.getExtType(path));
        param0.cfInfo.parseUrl(path,'out', callerMetaUrl);
        args.push(param0);
        let uc: Template = (new (classObj)(...args));
        uc['initializecomponentAsync']();
        if (uc['$']) uc['$'](...args);
        return uc;
    }
    static async generateTPTAsync(path: string, classObj: any, callerMetaUrl: string, pera: ITptOptions, ...args: any[]): Promise<any> {
        let param0: ITptOptions = Object.assign(pera, TptOptions);
        param0.cfInfo = new codeFileInfo(codeFileInfo.getExtType(path));
        param0.cfInfo.parseUrl(path,'out', callerMetaUrl);
        args.push(param0);
        let uc: Template = (new (classObj)(...args));
        await uc['initializecomponentAsync']();
        if (uc['$']) await uc['$'](...args);
        return uc;
    } 
}

export { intenseGenerator };

