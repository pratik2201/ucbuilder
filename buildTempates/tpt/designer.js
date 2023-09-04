const { Template } = require('\@ucbuilder:/Template.js');

class designer extends Template {
    constructor(){    
        super();
        /** @type {Template.tptOptionsStc}  */     
        let fargs = arguments[0];
        this.extended.fileStamp = "{=htmlFile.stamp}"; 
        this.extended.initializecomponent(fargs[fargs.length-1]); 
        let tpts = this.extended.templeteList;              
    }
    /**
         * @{=scope}  
         * @param {HTMLElement} elementHT
         * @returns {{`{loopctr=designer.controls}`{=name} : {=proto},`{/loopctr}`}}
         */
     getAllControls(elementHT){
        return this.extended.getAllControls(undefined,elementHT);
     }
    
}



module.exports = { designer };