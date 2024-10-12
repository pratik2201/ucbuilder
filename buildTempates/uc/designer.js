import { Usercontrol } from '\ucbuilder/Usercontrol';
import { intenseGenerator } from '\ucbuilder/intenseGenerator';
import { UcOptions } from '\ucbuilder/enumAndMore';
/**
 *  code filename must same and case sensitive with classname 
 */
import { {=src.name} } from './{=src.name}.uc';


export class {=designer.className} extends Usercontrol {    
    static get giveMeHug(): string {
        return Usercontrol.giveMeHug;
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
        
        this.{=name} = intenseGenerator.generateTPT('{=src.code.rootPath}',{ 
                            parentUc : this, 
                            elementHT : CONTROLS.{=name} 
                       }) as any;       
        ` 
             [/case]` 
        `[case=.uc]
        `
       
        this.{=name} = intenseGenerator.generateUC('{=src.code.rootPath}',{ 
                            parentUc : this, 
                            mode:args.mode,
                            session:{
                                loadBySession:args.session.loadBySession,
                                uniqueIdentity:"{=name}" , 
                                addNodeToParentSession:true,
                            },                           
                            wrapperHT : CONTROLS.{=name} 
                        }) as any;
        ` 
             [/case]`    
        `{/switch}``{/loop}`

        ucExt.finalizeInit(args);
        Usercontrol.assignPropertiesFromDesigner(form);
    }
}