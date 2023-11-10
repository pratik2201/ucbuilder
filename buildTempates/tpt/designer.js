const { Template, TemplateNode } = require('\@ucbuilder:/Template.js');
/**  
 * @typedef {import ("@ucbuilder:/enumAndMore").tptOptions} tptOptions 
 * @typedef {import ("@ucbuilder:/enumAndMore").templatePathOptions} templatePathOptions
 * */

`{loopcls=designer.templetes}` 
class {=name}_TEMPLATE extends TemplateNode{
    /**
     * @param {Template} tpt 
     * @param {tptOptions} fargs 
     * @param {templatePathOptions} tptPathOpt 
     */
    constructor(tpt) { super();  this.extended.main = tpt; }
    /**
     * @{=scope}  
     * @param {HTMLElement} elementHT
     * @returns {{`{loopctr=controls}`{=name} : {=proto},`{/loopctr}`}}
     */
    getAllControls(elementHT){
        return this.extended.getAllControls(undefined,elementHT);
    }
}
`{/loopcls}`

class designer extends Template {
    constructor(){    
        super();    
        /** @type {tptOptions}  */ 
        let fargs = arguments[0];
        fargs = fargs[fargs.length-1];
        //this.extended.fileStamp = "{=htmlFile.stamp}"; 
        let ext = this.extended;
        //this.extended.initializecomponent(fargs); 
        let tpts = Template.getTemplates.byHTMLFilePath(fargs.source.cfInfo.html.fullPath,false);
        `{looptpt=designer.templetes} 
        `
        
        ext._templeteNode = new {=name}_TEMPLATE(this);
        this.{=name} = ext._templeteNode;
        this.{=name}.extended.initializecomponent(fargs,tpts.{=name},"{=name}"); 
       `{/looptpt}`

      
        fargs.elementHT.remove();
    }
    
}

module.exports = { designer };