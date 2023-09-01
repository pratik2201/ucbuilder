const { uniqOpt } = require('@ucbuilder:/build/common.js');
const { commonEvent } = require('@ucbuilder:/global/commonEvent.js');
const { TempleteNode } = require('@ucbuilder:/Template.js');
const { binderNode } = require('@ucbuilder:/controls/LinearList.uc.binderNode.js');
const { designer } = require('./LinearList.uc.designer.js');
class LinearList extends designer {
    constructor() {
        eval(designer.giveMeHug);


    }
    /** @type {TempleteNode}  */
    set template(val) { this.lv_items.template = val; }
    get source() { return this.lv_items.source; }
    static ATTR = {
        SOURCE: "sdta" + uniqOpt.randomNo()
    }

    /** @returns {binderNode}  */
    bindNew() {
        let binder = new binderNode();
        binder.init(this);
        return binder;
    }


}
module.exports = LinearList;