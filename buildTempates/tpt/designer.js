const { Template, TempleteNode } = require('\@ucbuilder:/Template.js');

`{loopcls=designer.templetes}` 
class {=name}_TEMPLATE extends TempleteNode{
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
        /** @type {Template.tptOptionsStc}  */     
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