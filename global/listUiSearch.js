const { objectOpt } = require("ucbuilder/build/common");
const { listUiHandler } = require("ucbuilder/global/listUI/extended/listUiHandler");
const { newObjectOpt } = require("ucbuilder/global/objectOpt");

/**
 * @typedef {import ("ucbuilder/Template").Template} Template
 */
class listUiSearch {
    /** @param {listUiHandler} main */
    constructor(main) {
        this.main = main;
    }
    get rows(){ return this.main.source.rows; }
    /** @type {{}}  */ 
    sampleRow = undefined
    /** @param {boolean} force */
    takeBlueprint(force = false) {
        let hasTakenSample = this.sampleRow!=undefined;
        if(!force && hasTakenSample)return;
        if(this.rows.length==0)return;
        this.sampleRow = this.rows[0];
        this.experiment();
    }
    experiment(){
        //console.log(this.sampleRow);        
        //console.log(newObjectOpt.analysisObject(this.sampleRow));
    }

}
module.exports = { listUiSearch }