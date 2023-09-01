const { objectOpt } = require("@ucbuilder:/build/common");
const { patternMatcher } = require("@ucbuilder:/build/regs/patternMatcher");
class loopRegs {
    constructor() {
    }
    /**
     * 
     * @param {string} content 
     * @param {{}} nodes
     * @param {Function} caseText 
     * @returns 
     */
    parse(content, nodes, loopEachItemCallback = (obj = {}, content, nameSpace, loopCode) => { return content; }) {
        let _this = this;
        return content.replace(this.loopPattern.pattern, function (
            match,
            loopCode,
            valtoFind,
            subcontent, offset, input_string) {
            let result = "";
            /**
             * @type {[{}]}
             */
            let arlist = objectOpt.getValByNameSpace(nodes, valtoFind);
            arlist.forEach(arVal => {
                result += loopEachItemCallback(arVal, subcontent, valtoFind, loopCode);
            });
            return result;
        });
    }
    /**
     * 
     * @param {{}} node 
     * @param {string} loopCode 
     * @param {string} valtoFind 
     * @param {string} subcontent 
     * @returns 
     */
    parseDirect(node,
        loopCode,
        valtoFind,
        subcontent, loopEachItemCallback = (obj = {}, content, nameSpace, loopCode) => { return content; }) {
        let result = "";
        /**
         * @type {[{}]}
         */
        let arlist = objectOpt.getValByNameSpace(node, valtoFind);
        //console.log(arlist);
        arlist.forEach(arVal => {
            result += loopEachItemCallback(arVal, subcontent, valtoFind, loopCode);
        });
        //console.log(result);
        return result;
    }
    loopPattern = new patternMatcher(
        /`[ \n\r]*{(loop\w*)=([\.\w]+?)}[ \n\r]*`/,
        /([^]*?)/,
        /`[ \n\r]*{\/\1}[ \n\r]*`/g);

}
module.exports = { loopRegs };