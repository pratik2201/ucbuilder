import { Usercontrol } from "ucbuilder/out/Usercontrol.js";
import { intenseGenerator } from "ucbuilder/out/intenseGenerator.js";
import { IUcOptions } from "ucbuilder/out/enumAndMore.js";
import { VariableList } from "ucbuilder/out/StylerRegs.js";
import { topMenu } from "../../../src/MainDashboard/topMenu.uc.js";
import { leftMenu } from "../../../src/MainDashboard/leftMenu.uc.js";
import { footerMenu } from "../../../src/MainDashboard/footerMenu.uc.js";
import { MainDashboard } from "../../../src/MainDashboard.uc.js";



export class MainDashboard$Designer extends Usercontrol {    
    private static _FILE_PATH = '../../../src/MainDashboard.uc.html'; 
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
    static Create(pera: IUcOptions, ...args: any[]): MainDashboard { 
        /**  */
        return intenseGenerator.generateUC(this.FILE_PATH,MainDashboard,import.meta.url,pera,...args) as MainDashboard;
    }
    static async CreateAsync(pera: IUcOptions, ...args: any[]): Promise<MainDashboard> {
        return (await intenseGenerator.generateUCAsync( this.FILE_PATH, MainDashboard, import.meta.url, pera, ...args)) as MainDashboard;
    }
    get(id:"") {
        return this.ucExtends.find(`[id="${id}"]`)[0];
    }

    public topmenu1: import('../../../src/MainDashboard/topMenu.uc.js').topMenu;
    public leftmenu1: import('../../../src/MainDashboard/leftMenu.uc.js').leftMenu;
    public maincontent1: HTMLElement;
    public footerMenu1: import('../../../src/MainDashboard/footerMenu.uc.js').footerMenu;
    
    
    constructor(){ super(); }

    async initializecomponentAsync(args: IUcOptions, form: MainDashboard) {
        /*let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as IUcOptions; */
        let ucExt = this.ucExtends;
        ucExt.initializecomponent(args);        
        //let CONTROLS = ucExt.designer.getAllControls();
        let CONTROLS = ucExt.controls;
        
        await Usercontrol.GenerateControls(this,args,args.cfInfo.pathOf[".js"]/*Usercontrol.Resolver(args.source.htmlImportMetaUrl ?? import.meta.url,MainDashboard$Designer.FILE_PATH)*/);
        /*
        
        this.topmenu1 = await topMenu.CreateAsync({ 
                parentUc : this, 
                mode:args.mode,
                accessName:"topmenu1" , 
                session:{
                    loadBySession:args.session.loadBySession,
                    uniqueIdentity:"topmenu1" , 
                    addNodeToParentSession:true,
                },   
                decisionForTargerElement:'replace',
                targetElement : CONTROLS.topmenu1 as any
            });
        this.topmenu1.ucExtends.show();
        this.leftmenu1 = await leftMenu.CreateAsync({ 
                parentUc : this, 
                mode:args.mode,
                accessName:"leftmenu1" , 
                session:{
                    loadBySession:args.session.loadBySession,
                    uniqueIdentity:"leftmenu1" , 
                    addNodeToParentSession:true,
                },   
                decisionForTargerElement:'replace',
                targetElement : CONTROLS.leftmenu1 as any
            });
        this.leftmenu1.ucExtends.show();
        this.maincontent1 = CONTROLS.maincontent1  as unknown as HTMLElement;
        this.footerMenu1 = await footerMenu.CreateAsync({ 
                parentUc : this, 
                mode:args.mode,
                accessName:"footerMenu1" , 
                session:{
                    loadBySession:args.session.loadBySession,
                    uniqueIdentity:"footerMenu1" , 
                    addNodeToParentSession:true,
                },   
                decisionForTargerElement:'replace',
                targetElement : CONTROLS.footerMenu1 as any
            });
        this.footerMenu1.ucExtends.show();
        */ 
        
        ucExt.finalizeInit(args);
        if(ucExt.session != undefined) ucExt.session.prepareForAutoLoadIfExist();
        Usercontrol.assignPropertiesFromDesigner(form);
        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;
    }

    initializecomponent(argsLst: IArguments, form: MainDashboard) {
        //return;
        let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as IUcOptions;
        let ucExt = this.ucExtends;
        
        ucExt.initializecomponent(args);        
        //let CONTROLS = ucExt.designer.getAllControls();
        let CONTROLS = ucExt.controls;
        
        this.topmenu1 = topMenu.Create({ 
                parentUc : this, 
                mode:args.mode,
                accessName:"topmenu1" , 
                session:{
                    loadBySession:args.session.loadBySession,
                    uniqueIdentity:"topmenu1" , 
                    addNodeToParentSession:true,
                },   
                decisionForTargerElement:'replace',
                targetElement : CONTROLS.topmenu1 as any
            });
        this.topmenu1.ucExtends.show();
        this.leftmenu1 = leftMenu.Create({ 
                parentUc : this, 
                mode:args.mode,
                accessName:"leftmenu1" , 
                session:{
                    loadBySession:args.session.loadBySession,
                    uniqueIdentity:"leftmenu1" , 
                    addNodeToParentSession:true,
                },   
                decisionForTargerElement:'replace',
                targetElement : CONTROLS.leftmenu1 as any
            });
        this.leftmenu1.ucExtends.show();
        this.maincontent1 = CONTROLS.maincontent1  as unknown as HTMLElement;
        this.footerMenu1 = footerMenu.Create({ 
                parentUc : this, 
                mode:args.mode,
                accessName:"footerMenu1" , 
                session:{
                    loadBySession:args.session.loadBySession,
                    uniqueIdentity:"footerMenu1" , 
                    addNodeToParentSession:true,
                },   
                decisionForTargerElement:'replace',
                targetElement : CONTROLS.footerMenu1 as any
            });
        this.footerMenu1.ucExtends.show();
        
        ucExt.finalizeInit(args);
        if(ucExt.session != undefined) ucExt.session.prepareForAutoLoadIfExist();
        Usercontrol.assignPropertiesFromDesigner(form);
        delete this.initializecomponent; // = undefined;
        delete this.initializecomponentAsync; // = undefined;

    }
}