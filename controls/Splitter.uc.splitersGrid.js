const { objectOpt } = require("@ucbuilder:/build/common");
const Splitter = require("@ucbuilder:/controls/Splitter.uc");
const { boxHandler } = require("@ucbuilder:/controls/Splitter.uc.boxHandler");
const { splitterRow, spliterType } = require("@ucbuilder:/controls/Splitter.uc.enumAndMore");
const { resizeHandler } = require("@ucbuilder:/controls/Splitter.uc.resizeHandler");

class splitersGrid {
    constructor() { }
    /** @type {HTMLElement}  */
    grid = undefined;
    /** @type {Splitter}  */
    main = undefined;
    /** @type {{}}  */
    data = undefined;

    /** @type {resizeHandler}  */
    resizer = undefined;

    /** @type {HTMLElement[]}  */
    allElementHT = undefined;
    /** @type {splitterRow}  */
    get info() { return this.main.SESSION_DATA; }
    set type(val) {
        this.resizer.type =
        this.info.type =  val;
   
        
    }
   
    get measurement() { return this.info.measurement; }
    get lastIndex() { return this.info.measurement.length - 1; }
    get length() { return this.info.measurement.length; }
    resizer = new resizeHandler();
    /** 
     * @param {HTMLElement} grid 
     * @param {Splitter} main 
     */
    init(grid, main) {
        
        this.grid = grid;
        
        this.allElementHT = this.grid.childNodes;
        //this.data = this.main.SESSION_DATA.record;
        this.main = main;
        this.info.attribList = this.main.myPropertiesText;
        this.resizer.init(this);
        /*if (this.info == undefined)
            this.data.splInfo = objectOpt.clone(splitterRow);*/
        
       
 
    }

    /**
     * @param {boxHandler} box
     * @param {index} afterIndex
     */
    pushBox(box, afterIndex = -1) {
        
        if (afterIndex == -1)
            this.grid.prepend(box.node);
        else {
            let node = this.allElementHT[afterIndex];
            node.after(box.node);
        }
    }
    refresh() {
        this.resizer.refresh();
    }
}
module.exports = { splitersGrid };