const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");
const tableParam = {
    /** @type {HTMLElement} */
    table : undefined, 
    /** @type {string} */
    trTagName : undefined,  
    /** @type {string} */
    tdTagName : undefined
};
class tableSplitter{
  constructor(){
    
  }
  /** @type {HTMLElement} */
  table = undefined;
  /** @param {tableParam} param0 */
  init(param0){
    let options = newObjectOpt.clone(tableParam);
    newObjectOpt.copyProps(param0, options);
    
    this.table = options.table;
    switch(this.table.nodeName){
        case "TABLE"
    }
    this.tr = this.table.children[0];
      
  }
}
module.exports = { tableSplitter };
