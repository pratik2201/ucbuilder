const { Template, TemplateNode } = require('\@ucbuilder:/Template.js');
/**  @typedef {import ("@ucbuilder:/enumAndMore").tptOptions} tptOptions */

`{loopcls=designer.templetes}` 
class {=name}_TEMPLATE extends TemplateNode{
    /**
     * @param {Template} tpt 
     * @param {string} content 
     */
    constructor(tpt,content) { super(tpt,content); }
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
        this.extended.fileStamp = "{=htmlFile.stamp}"; 
        this.extended.initializecomponent(fargs[fargs.length-1]); 
        let tpts = this.extended.templeteList;      
       
        `{looptpt=designer.templetes} 
        `this.{=name} = new {=name}_TEMPLATE(this,tpts.{=name});
        `{/looptpt}`
    }
    
}

module.exports = { designer };