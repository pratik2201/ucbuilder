import { Usercontrol } from 'ucbuilder/Usercontrol';
import { intenseGenerator } from 'ucbuilder/intenseGenerator';
import { UcOptions } from 'ucbuilder/enumAndMore';
import { VariableList } from 'ucbuilder/global/stylerRegs';

/**
 *  code filename must same and case sensitive with classname 
 */
import { rightButtonManage } from './rightButtonManage.uc';


export class Designer extends Usercontrol {    
    /**  ucbuilder/sampleForm/buttons/rightButtonManage.uc
     *  AUTO RENAMING IS DEPEND ON `_FILE_PATH` SO KEEP YOUR SELF FAR FROM THIS :-)
     */
    private static _FILE_PATH = window.atob('dWNidWlsZGVyL3NhbXBsZUZvcm0vYnV0dG9ucy9yaWdodEJ1dHRvbk1hbmFnZS51Yw==');
    public static get FILE_PATH() {
        return Designer._FILE_PATH;
    }
    static get giveMeHug(): string {
        return Usercontrol.giveMeHug;
    }
    static setCSS_globalVar (varList:VariableList /*key: string, value: string*/): void  {
        intenseGenerator.setCSS_globalVar(varList,this.FILE_PATH);
    }
    static Create(pera: UcOptions, ...args: any[]): rightButtonManage { 
        /** ucbuilder/sampleForm/buttons/rightButtonManage.uc */
        return intenseGenerator.generateUC(this.FILE_PATH,pera,...args) as rightButtonManage;
    }
    
    public btn_list: HTMLElement;
    public cmd_home: HTMLButtonElement;
    public cmd_gallery: HTMLButtonElement;
    public cmd_about: HTMLButtonElement;
    public cmd_contact: HTMLButtonElement;
    public cmd_exit: HTMLButtonElement;

    
    constructor(){ super(); }
    initializecomponent(argsLst: IArguments, form: rightButtonManage) {
        let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as UcOptions;
        let ucExt = this.ucExtends;
        
        ucExt.initializecomponent(args);        
        let CONTROLS = ucExt.designer.getAllControls();
        this.btn_list = CONTROLS.btn_list as HTMLElement;
        this.cmd_home = CONTROLS.cmd_home as HTMLButtonElement;
        this.cmd_gallery = CONTROLS.cmd_gallery as HTMLButtonElement;
        this.cmd_about = CONTROLS.cmd_about as HTMLButtonElement;
        this.cmd_contact = CONTROLS.cmd_contact as HTMLButtonElement;
        this.cmd_exit = CONTROLS.cmd_exit as HTMLButtonElement;

        ucExt.finalizeInit(args);
        ucExt.session.prepareForAutoLoadIfExist();
        if (args.loadAt) args.loadAt.appendChild(ucExt.wrapperHT);
       
        Usercontrol.assignPropertiesFromDesigner(form);
    }
}