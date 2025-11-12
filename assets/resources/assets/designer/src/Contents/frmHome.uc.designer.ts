import { Usercontrol } from "ucbuilder/out/Usercontrol.js";
import { intenseGenerator } from "ucbuilder/out/intenseGenerator.js";
import { IUcOptions } from "ucbuilder/out/enumAndMore.js";
import { VariableList } from "ucbuilder/out/StylerRegs.js";
import { frmHome } from "../../../../src/Contents/frmHome.uc.js";



export class frmHome$Designer extends Usercontrol {    
    private static _FILE_PATH = '../../../../src/Contents/frmHome.uc.html'; 
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
    static Create(pera: IUcOptions, ...args: any[]): frmHome { 
        /**  */
        return intenseGenerator.generateUC(this.FILE_PATH,frmHome,import.meta.url,pera,...args) as frmHome;
    }
    static async CreateAsync(pera: IUcOptions, ...args: any[]): Promise<frmHome> {
        return (await intenseGenerator.generateUCAsync( this.FILE_PATH, frmHome, import.meta.url, pera, ...args)) as frmHome;
    }
    get(id:"") {
        return this.ucExtends.find(`[id="${id}"]`)[0];
    }

    
    
    constructor(){ super(); }

    async initializecomponentAsync(args: IUcOptions, form: frmHome) {
        /*let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as IUcOptions; */
        let ucExt = this.ucExtends;
        ucExt.initializecomponent(args);        
        //let CONTROLS = ucExt.designer.getAllControls();
        let CONTROLS = ucExt.controls;
        
        await Usercontrol.GenerateControls(this,args,args.cfInfo.pathOf[".js"]/*Usercontrol.Resolver(args.source.htmlImportMetaUrl ?? import.meta.url,frmHome$Designer.FILE_PATH)*/);
        /*
        
        */ 
        
        ucExt.finalizeInit(args);
        if(ucExt.session != undefined) ucExt.session.prepareForAutoLoadIfExist();
        Usercontrol.assignPropertiesFromDesigner(form);
        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;
    }

    initializecomponent(argsLst: IArguments, form: frmHome) {
        //return;
        let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as IUcOptions;
        let ucExt = this.ucExtends;
        
        ucExt.initializecomponent(args);        
        //let CONTROLS = ucExt.designer.getAllControls();
        let CONTROLS = ucExt.controls;
        
        
        ucExt.finalizeInit(args);
        if(ucExt.session != undefined) ucExt.session.prepareForAutoLoadIfExist();
        Usercontrol.assignPropertiesFromDesigner(form);
        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;

    }
}