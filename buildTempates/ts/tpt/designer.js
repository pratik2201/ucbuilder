`{loop=designer.importClasses}`import { {=importText } } from '{=url}';
`{/loop}`
 /**
 *  code filename must same and case sensitive with classname 
 */
import { {=src.name} } from '{=src.mainFileRootPath}';

    
`{loopcls=designer.templetes}` 

type {=name}_ELEMENT_MAP = {`{loopctr=controls}`{=name} : {=proto}{=generic},`{/loopctr}`}
class {=name}_TEMPLATE extends TemplateNode{
    constructor(tpt:Template) { super(tpt);   }
   
    getAllControls(elementHT?: HTMLElement): {=name}_ELEMENT_MAP {
        return this.extended.getAllControls(undefined,elementHT) as {=name}_ELEMENT_MAP;
    }
}
`{/loopcls}`



export const cMap_{=src.name}: {`
    {loopcls=designer.templetes}`
    {=name}?: {=name}_ELEMENT_MAP;`
    {/loopcls}`
} = {};

export class {=designer.className } extends Template {
    /** {=src.mainFileRootPath}
     *  AUTO RENAMING IS DEPEND ON `_FILE_PATH` SO KEEP YOUR SELF FAR FROM THIS :-)
     */
    private static _FILE_PATH =  '{=src.mainFileRootPath}'; //window.atob('{=src.mainFileRootPath_btoa}');
    public static get FILE_PATH() {
        return Designer._FILE_PATH;
    }
    
    static setCSS_globalVar (varList:VariableList): void  {
        intenseGenerator.setCSS_globalVar(varList,this.FILE_PATH);
    }
    static Create(pera: TptOptions): {=src.name} { 
        return intenseGenerator.generateTPT(this.FILE_PATH,pera) as {=src.name};
    }

    
    `{looptpt=designer.templetes} 
    `    
    public {=name}:{=name}_TEMPLATE; 
   `{/looptpt}`

    constructor(args:IArguments){    
        super();    
        let aargs = Template.extractArgs(arguments);
        let fargs = aargs[aargs.length - 1] as TptOptions;
        this.extended.parentUc = fargs.parentUc;
        //let fargs = Template.extractArgs(arguments) as TptOptions;
        
        //fargs = fargs[fargs.length-1] as TptOptions;
        let ext = this.extended;
        let tpts = Template.getTemplates.byDirectory(fargs.source.cfInfo.code.fullPath,false);
        `{looptpt=designer.templetes} 
        `
        
        ext._templeteNode = new {=name}_TEMPLATE(this);
        this.{=name} = ext._templeteNode as {=name}_TEMPLATE;
        this.{=name}.extended.initializecomponent(fargs,tpts['{=name}'],"{=name}"); 
       `{/looptpt}`

        fargs.elementHT.remove();
    }
}