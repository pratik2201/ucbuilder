import { Template, TemplateNode } from '\ucbuilder/Template.js';
import { TptOptions, templatePathOptions } from '\ucbuilder/enumAndMore';
`{loopcls=designer.templetes}` 

type {=name}_ELEMENT_MAP = {`{loopctr=controls}`{=name} : {=proto},`{/loopctr}`}
class {=name}_TEMPLATE extends TemplateNode{
    constructor(tpt:Template) { super(tpt);   }
   
    getAllControls(elementHT: HTMLElement): {=name}_ELEMENT_MAP {
        return this.extended.getAllControls(undefined,elementHT) as {=name}_ELEMENT_MAP;
    }
}
`{/loopcls}`

export class {=designer.className} extends Template {
    `{looptpt=designer.templetes} 
    `    
    public {=name}:{=name}_TEMPLATE; 
   `{/looptpt}`

    constructor(args:IArguments){    
        super();    
        let aargs = Template.extractArgs(arguments);
        let fargs = aargs[aargs.length - 1] as TptOptions;
        
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