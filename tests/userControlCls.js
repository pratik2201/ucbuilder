const prgram = require("ucbuilder/test/prgram");
const userControlCls_extended  = require("ucbuilder/test/userControlCls_extended");

class userControlCls extends userControlCls_extended {
    constructor() {
        super();
    }
    printFromUserControl() {
        console.log(prgram);
        //super.initComponent();
        ///console.log("userControlCls:" + prgram._data);
    }
}
module.exports = userControlCls;