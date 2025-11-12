import { Usercontrol } from "ucbuilder/out/Usercontrol.js";
import { intenseGenerator } from "ucbuilder/out/intenseGenerator.js";
import { IUcOptions } from "ucbuilder/out/enumAndMore.js";
import { VariableList } from "ucbuilder/out/StylerRegs.js";
import { topMenu } from "../../../../src/MainDashboard/topMenu.uc.js";



export class topMenu$Designer extends Usercontrol {    
    private static _FILE_PATH = '../../../../src/MainDashboard/topMenu.uc.html'; 
    public static get FILE_PATH() {
        return this._FILE_PATH;
    }
    public static get AbsolutePath() {
        return Usercontrol.Resolver(import.meta.url, this.FILE_PATH);
    }
    static get designerToCode(): string {
        return Usercontrol.designerToCode;
    }
    static setCSS_globalVar (varList:VariableList): void  {
        intenseGenerator.setCSS_globalVar(varList,this.FILE_PATH);
    }   
    static Create(pera: IUcOptions, ...args: any[]): topMenu { 
        /**  */
        return intenseGenerator.generateUC(this.FILE_PATH,topMenu,import.meta.url,pera,...args) as topMenu;
    }
    static async CreateAsync(pera: IUcOptions, ...args: any[]): Promise<topMenu> {
        return (await intenseGenerator.generateUCAsync( this.FILE_PATH, topMenu, import.meta.url, pera, ...args)) as topMenu;
    }
    get(id:"") {
        return this.ucExtends.find(`[id="${id}"]`)[0];
    }

    public lnkHome: HTMLAnchorElement;
    public lnkFeature: HTMLAnchorElement;
    public lnkPricing: HTMLAnchorElement;
    public lnkAbout: HTMLAnchorElement;
    public lnkContact: HTMLAnchorElement;
    public cmdLogin: HTMLButtonElement;
    
    
    constructor(){ super(); }

    async initializecomponentAsync(args: IUcOptions, form: topMenu) {
        /*let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as IUcOptions; */
        let ucExt = this.ucExtends;
        ucExt.initializecomponent(args);        
        //let CONTROLS = ucExt.designer.getAllControls();
        let CONTROLS = ucExt.controls;
        
        await Usercontrol.GenerateControls(this,args,args.cfInfo.pathOf[".js"]/*Usercontrol.Resolver(args.source.htmlImportMetaUrl ?? import.meta.url,topMenu$Designer.FILE_PATH)*/);
        /*
        
        this.lnkHome = CONTROLS.lnkHome  as unknown as HTMLAnchorElement;
        this.lnkFeature = CONTROLS.lnkFeature  as unknown as HTMLAnchorElement;
        this.lnkPricing = CONTROLS.lnkPricing  as unknown as HTMLAnchorElement;
        this.lnkAbout = CONTROLS.lnkAbout  as unknown as HTMLAnchorElement;
        this.lnkContact = CONTROLS.lnkContact  as unknown as HTMLAnchorElement;
        this.cmdLogin = CONTROLS.cmdLogin  as unknown as HTMLButtonElement;
        */ 
        
        ucExt.finalizeInit(args);
        if(ucExt.session != undefined) ucExt.session.prepareForAutoLoadIfExist();
        Usercontrol.assignPropertiesFromDesigner(form);
        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;
    }

    initializecomponent(argsLst: IArguments, form: topMenu) {
        //return;
        let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as IUcOptions;
        let ucExt = this.ucExtends;
        
        ucExt.initializecomponent(args);        
        //let CONTROLS = ucExt.designer.getAllControls();
        let CONTROLS = ucExt.controls;
        
        this.lnkHome = CONTROLS.lnkHome  as unknown as HTMLAnchorElement;
        this.lnkFeature = CONTROLS.lnkFeature  as unknown as HTMLAnchorElement;
        this.lnkPricing = CONTROLS.lnkPricing  as unknown as HTMLAnchorElement;
        this.lnkAbout = CONTROLS.lnkAbout  as unknown as HTMLAnchorElement;
        this.lnkContact = CONTROLS.lnkContact  as unknown as HTMLAnchorElement;
        this.cmdLogin = CONTROLS.cmdLogin  as unknown as HTMLButtonElement;
        
        ucExt.finalizeInit(args);
        if(ucExt.session != undefined) ucExt.session.prepareForAutoLoadIfExist();
        Usercontrol.assignPropertiesFromDesigner(form);
        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;

    }
}