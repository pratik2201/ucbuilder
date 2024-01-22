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
    {=scope} {=name}: import('{=src.code.rootPath}');
        ` 
        [/case]` 
   `[case=.uc]
   `
    {=scope} {=name}: import('{=src.code.rootPath}');
   ` 
   [/case]`    
    `{/switch}``{/loop}`

    
    constructor(){ super(); }
    initializecomponent(argsLst: IArguments, form: {=src.name}) {
         //let fargs = argsLst[0];
        //let args = fargs[fargs.length - 1];
        let args = argsLst[argsLst.length - 1] as UcOptions;
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
        /**
         * @type {import ('{=src.code.rootPath}')} \<{=nodeName}\> 
         **/
        this.{=name} = intenseGenerator.generateTPT('{=src.code.rootPath}',{ 
                            parentUc : this, 
                            elementHT : CONTROLS.{=name} 
                       });       
        ` 
             [/case]` 
        `[case=.uc]
        `
        /** 
         * @type {import ('{=src.code.rootPath}')} \<{=nodeName}\>
         **/
        this.{=name} = intenseGenerator.generateUC('{=src.code.rootPath}',{ 
                            parentUc : this, 
                            mode:args.mode,
                            session:{
                                loadBySession:args.session.loadBySession,
                                uniqueIdentity:"{=name}" , 
                                addNodeToParentSession:true,
                            },                           
                            wrapperHT : CONTROLS.{=name} 
                        });
        ` 
             [/case]`    
        `{/switch}``{/loop}`

        ucExt.finalizeInit(args);
    }
}