const { Usercontrol } = require('\@ucbuilder:/Usercontrol.js');
const { intenseGenerator } = require('\@ucbuilder:/intenseGenerator');


class designer extends Usercontrol {    
    static get giveMeHug(){ return Usercontrol.giveMeHug; }
    constructor(){    
        super();    
        let fargs = arguments[0];
        /** @type {Usercontrol.ucOptionsStc}   */ 
        let args = fargs[fargs.length-1];
        let ucExt = this.ucExtends;
        ucExt.fileStamp = "{=htmlFile.stamp}";        
        ucExt.initializecomponent(args);        
        let CONTROLS = ucExt.designer.getAllControls();`
        {loop=designer.controls}``
        {switch=type}`
            `[case=none]
        `
        
        /** 
         * @{=scope}  
         * @type {{=proto}} ({=nodeName}) 
         **/
        this.{=name} = CONTROLS.{=name};`
        [/case]`
        `[case=.tpt]`

        /**
         * @{=scope}  
         * @type {import ('{=src.code.rootPath}')} ({=nodeName}) 
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
         * @{=scope}  
         * @type {import ('{=src.code.rootPath}')} ({=nodeName})
         **/
        this.{=name} = intenseGenerator.generateUC('{=src.code.rootPath}',{ 
                            parentUc : this, 
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
module.exports = { designer };