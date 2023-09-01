const prgram = require("@ucbuilder:/test/prgram");
const userControlCls  = require("@ucbuilder:/test/userControlCls");
class designer extends userControlCls {
    constructor() {
        super();        
    }
    initComponent() {
        
        super.printFromUserControl();
        //this.ucExtended.initComponent();
    }
    printDesigner() {
        console.log('printDesigner=>' + prgram._data);
    }
}
module.exports = { designer };