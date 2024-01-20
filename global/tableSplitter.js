const { newObjectOpt } = require("ucbuilder/global/objectOpt");
const tableParam = {
  /** @type {HTMLElement} */
  table: undefined,
  /** @type {string} */
  trTagName: undefined,
  /** @type {string} */
  tdTagName: undefined
};
class tableSplitter {
  constructor() {

  }
  node = {
    /** @type {HTMLTableElement} */
    table: undefined,
    /** @type {HTMLElement} */
    container: undefined,
    /** @type {string} */
    trNodeName: undefined,
    /** @type {string} */
    tdNodeName: undefined,
  }
  /** @param {tableParam} param0 */
  init(param0) {
    /*let options = newObjectOpt.copyProps(param0, tableParam);
    this.node.table = options.table;
    switch (this.table.nodeName) {
      case "TABLE":
        this.node.trNodeName = 'TR';
        this.node.tdNodeName = 'TD';
        break;
      default:
        this.node.trNodeName = options.trTagName;
        this.node.tdNodeName = options.tdTagName;
        break;
    }*/
  }

}
module.exports = { tableSplitter };
