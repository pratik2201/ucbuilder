const designer = require("@ucbuilder:/test/designer");
const prgram = require("@ucbuilder:/test/prgram");
class userFrm extends designer {
    constructor() {
        super();
        this.initComponent();        
    }
    printCtr() {
        console.log('printCtr=>' + prgram._data);
    }
}
module.exports = userFrm;