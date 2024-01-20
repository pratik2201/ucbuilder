const { newObjectOpt } = require("ucbuilder/global/objectOpt");
const { commonEvent } = require("ucbuilder/global/commonEvent");

class dataAdapter extends Array{
    constructor(){
        super(arguments);
        let kys = newObjectOpt.analysisObject(this)
                    .filter(d=>d.type="Function")
                    .map(d=>d.key)
                    .join(`"|"`);
        
     //   console.log(kys);
    //this.values()
    //|"join"|"keys"|"entries"|"values"|"forEach"|"filter"|"flat"|"flatMap"|"map"|"every"|"some"|"reduce"|"reduceRight"|"toLocaleString"|"toString"|"toReversed"|"toSorted"|"toSpliced"|"with"|"on"
    }
    /** @type {"concat"| "copyWithin"|"fill"|"pop"|"push"|"reverse"|"shift"|"unshift"|"slice"|"sort" |"splice"}  */ 
    allowedList = 'pop';
    Events = {
        /**
         * @type {{on:(callback = (
         *          paramName2:param2 Datatype,
         *          paramName3:param3 Datatype,
         *          paramName4:param4 Datatype,
         *          paramName5:param5 Datatype,
         *          paramName6:param6 Datatype,
         *          paramName7:param7 Datatype,
         * ) =>{})} & commonEvent}
         */
        onUpdateArray:new commonEvent(),
        
    }
}
module.exports = {dataAdapter};