`{loop=designer.importClasses}`const { {=importText } } require('{=url}');
`{/loop}`
 /**
 *  code filename must same and case sensitive with classname 
 */
const { {=src.name} } = require('{=src.mainFileRootPath}');

    
`{loopcls=designer.templetes}` 

/**
 * @typedef {=name}_ELEMENT_MAP
`{loopctr=controls}`
 * @prop {{=proto}} {=name} The street
`{/loopctr}`
 */
class {=name}_TEMPLATE extends TemplateNode{
    constructor(tpt:Template) { super(tpt);   }
    /**
     * @param {HTMLElement} elementHT 
     * @returns {{=name}_ELEMENT_MAP}  
     */
    getAllControls(elementHT) {
        return this.extended.getAllControls(undefined,elementHT);
    }
}
`{/loopcls}`

export class {=designer.className } extends Template {
    /** {=src.mainFileRootPath}
     *  AUTO RENAMING IS DEPEND ON `_FILE_PATH` SO KEEP YOUR SELF FAR FROM THIS :-)
     */
    private static _FILE_PATH =  '{=src.mainFileRootPath}'; //window.atob('{=src.mainFileRootPath_btoa}');
    public static get FILE_PATH() {
        return Designer._FILE_PATH;
    }
     /**
     * @param {import ('ucbuilder/global/stylers/StylerRegs.js').VariableList} varList 
     * @returns {void}  
     */
    static setCSS_globalVar (varList)  {
        intenseGenerator.setCSS_globalVar(varList,this.FILE_PATH);
    }
     /**
     * @param {import ('ucbuilder/enumAndMore.js').TptOptions} pera 
     * @returns {{=src.name}}  
     */
    static Create(pera: TptOptions) { 
        return intenseGenerator.generateTPT(this.FILE_PATH,pera);
    }

    `{looptpt=designer.templetes} 
    `    
    /** @type {{=name}_TEMPLATE}  */ 
    public {=name} = undefined; 
   `{/looptpt}`

    constructor(args:IArguments){    
        super();    
        let aargs = Template.extractArgs(arguments);
        /**  @type {import ('ucbuilder/enumAndMore.js').TptOptions} */
        let fargs = aargs[aargs.length - 1];
        this.extended.parentUc = fargs.parentUc;
        //let fargs = Template.extractArgs(arguments) as TptOptions;
        
        //fargs = fargs[fargs.length-1] as TptOptions;
        let ext = this.extended;
        let tpts = Template.getTemplates.byDirectory(fargs.source.cfInfo.code.fullPath,false);
        `{looptpt=designer.templetes} 
        `
        
        ext._templeteNode = new {=name}_TEMPLATE(this);
        this.{=name} = ext._templeteNode;
        this.{=name}.extended.initializecomponent(fargs,tpts['{=name}'],"{=name}"); 
       `{/looptpt}`

        fargs.elementHT.remove();
    }
}