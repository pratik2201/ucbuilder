`{loop=designer.importClasses}`import { {=importText } } from '{=url}';
`{/loop}`
/**
 *  code filename must same and case sensitive with classname 
 */
import { {=src.name} } from '{=src.mainFileRootPath}';


export class {=designer.className } extends Usercontrol {    
    /**  {=src.mainFileRootPath}
     *  AUTO RENAMING IS DEPEND ON `_FILE_PATH` SO KEEP YOUR SELF FAR FROM THIS :-)
     */
    private static _FILE_PATH = '{=src.mainFileRootPath}';//window.atob('{=src.mainFileRootPath_btoa}');
    public static get FILE_PATH() {
        return Designer._FILE_PATH;
    }
    static get giveMeHug(): string {
        return Usercontrol.giveMeHug;
    }
    static setCSS_globalVar (varList:VariableList /*key: string, value: string*/): void  {
        intenseGenerator.setCSS_globalVar(varList,this.FILE_PATH);
    }
    static Create(pera: UcOptions, ...args: any[]): {=src.name } { 
        /** {=src.mainFileRootPath} */
        return intenseGenerator.generateUC(this.FILE_PATH,pera,...args) as {=src.name};
    }
    `{loop=designer.controls}``
        {switch=type}`
            `[case=none]
        `
    {=scope} {=name}: {=proto};
        `
        [/case]`
        `[case=.tpt]`
    {=scope} {=name}: import('{=src.mainFileRootPath}').{=src.name};
        ` 
        [/case]` 
   `[case=.uc]
   `
    {=scope} {=name}: import('{=src.mainFileRootPath}').{=src.name};
   ` 
   [/case]`    
    `{/switch}``{/loop}`

    
    constructor(){ super(); }
    initializecomponent(argsLst: IArguments, form: {=src.name}) {
        let fargs = Usercontrol.extractArgs(arguments);
        let args = fargs[fargs.length-1] as UcOptions;
        let ucExt = this.ucExtends;
        
        ucExt.initializecomponent(args);        
        let CONTROLS = ucExt.designer.getAllControls();`
        {loop=designer.controls}``
        {switch=type}`
            `[case=none]
        `
        this.{=name} = CONTROLS.{=name} as {=proto};`
        [/case]`
        `[case=.tpt]`
        
    this.{=name } = {=importedClass.objText}.Create({ 
                        parentUc: this, 
                        accessName:"{=name}" , 
                        elementHT :CONTROLS.{=name} 
                    });
          
        ` 
             [/case]` 
        `[case=.uc]
        `
       
        this.{=name} = {=importedClass.objText}.Create({ 
                            parentUc : this, 
                            mode:args.mode,
                            accessName:"{=name}" , 
                            session:{
                                loadBySession:args.session.loadBySession,
                                uniqueIdentity:"{=name}" , 
                                addNodeToParentSession:true,
                            },   
                            decisionForTargerElement:'replace',
                            targetElement : CONTROLS.{=name} 
                        });
            this.{=name }.ucExtends.show();
            this.{=name }.ucExtends.visibility = 'inherit';
        ` 
             [/case]`    
        `{/switch}``{/loop}`

        ucExt.finalizeInit(args);
        ucExt.session.prepareForAutoLoadIfExist();
        if (args.loadAt) args.loadAt.appendChild(ucExt.wrapperHT);
       
        Usercontrol.assignPropertiesFromDesigner(form);
    }
}