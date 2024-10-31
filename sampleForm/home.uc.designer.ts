import { Usercontrol } from 'ucbuilder/Usercontrol';
import { intenseGenerator } from 'ucbuilder/intenseGenerator';
import { UcOptions } from 'ucbuilder/enumAndMore';
import { VariableList } from 'ucbuilder/global/stylerRegs';
import { rightButtonManage } from 'ucbuilder/sampleForm/buttons/rightButtonManage.uc';

/**
 *  code filename must same and case sensitive with classname 
 */
import { home } from './home.uc';


export class Designer extends Usercontrol {    
    /**  ucbuilder/sampleForm/home.uc
     *  AUTO RENAMING IS DEPEND ON `_FILE_PATH` SO KEEP YOUR SELF FAR FROM THIS :-)
     */
    private static _FILE_PATH = window.atob('dWNidWlsZGVyL3NhbXBsZUZvcm0vaG9tZS51Yw==');
    public static get FILE_PATH() {
        return Designer._FILE_PATH;
    }
    static get giveMeHug(): string {
        return Usercontrol.giveMeHug;
    }
    static setCSS_globalVar (varList:VariableList /*key: string, value: string*/): void  {
        intenseGenerator.setCSS_globalVar(varList,this.FILE_PATH);
    }
    static Create(pera: UcOptions, ...args: any[]): home { 
        /** ucbuilder/sampleForm/home.uc */
        return intenseGenerator.generateUC(this.FILE_PATH,pera,...args) as home;
    }
    
    public topMenu1: HTMLElement;
    public contentView1: HTMLElement;
         
   
    public rightMenu1: import('ucbuilder/sampleForm/buttons/rightButtonManage.uc').rightButtonManage;
    public bottomMenu1: HTMLElement;

    
    constructor(){ super(); }
    initializecomponent(argsLst: IArguments, form: home) {
        let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as UcOptions;
        let ucExt = this.ucExtends;
        
        ucExt.initializecomponent(args);        
        let CONTROLS = ucExt.designer.getAllControls();
        this.topMenu1 = CONTROLS.topMenu1 as HTMLElement;
        this.contentView1 = CONTROLS.contentView1 as HTMLElement;
         
        
       
        this.rightMenu1 = rightButtonManage.Create({ 
                            parentUc : this, 
                            mode:args.mode,
                            session:{
                                loadBySession:args.session.loadBySession,
                                uniqueIdentity:"rightMenu1" , 
                                addNodeToParentSession:true,
                            },   
                            decisionForTargerElement:'replace',
                            targetElement : CONTROLS.rightMenu1 
                        });
        this.rightMenu1.ucExtends.show();
        this.bottomMenu1 = CONTROLS.bottomMenu1 as HTMLElement;

        ucExt.finalizeInit(args);
        ucExt.session.prepareForAutoLoadIfExist();
        if (args.loadAt) args.loadAt.appendChild(ucExt.wrapperHT);
       
        Usercontrol.assignPropertiesFromDesigner(form);
    }
}