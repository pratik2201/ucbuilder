"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchRegs = void 0;
const common_1 = require("ucbuilder/build/common");
const patternMatcher_1 = require("ucbuilder/build/regs/patternMatcher");
class switchRegs {
    constructor() {
        this.switchPattern = new patternMatcher_1.patternMatcher(/`[ \n\r]*{(switch\w*)=([\.\w]+?)}[ \n\r]*`/, /([^]*?)/, /`[ \n\r]*{\/\1}[ \n\r]*`/g);
        this.casePattern = new patternMatcher_1.patternMatcher(/`[ \n\r]*\[(case\w*)=([\.\|\w]+?)\][ \n\r]*`/, /([^]*?)/, /`[ \n\r]*\[\/\1\][ \n\r]*`/g);
    }
    /**
     *
     * @param {string} content
     * @param {{}} node
     * @param {Function} caseText
     * @returns
     */
    parse(content, node, caseText = (val) => { return val; }) {
        let _this = this;
        return content.replace(this.switchPattern.pattern, function (match, switchCode, valtoFind, subcontent, offset, input_string) {
            let casetofind = caseText(common_1.objectOpt.getValByNameSpace(node, valtoFind));
            return _this.parseCase(subcontent.trim(), casetofind);
        });
    }
    parseDirect(node, valtoFind, subcontent, caseText = (val) => { return val; }) {
        let casetofind = caseText(common_1.objectOpt.getValByNameSpace(node, valtoFind));
        return this.parseCase(subcontent.trim(), casetofind);
    }
    /**
     *
     * @param {string} content
     * @param {string} valtoMatch
     * @returns
     */
    parseCase(content, valtoMatch) {
        return content.replace(this.casePattern.pattern, function (match, caseCode, valInCase, subcontent, offset, input_string) {
            /**
             * @type {[]}
             */
            let ar = valInCase.split("|");
            valtoMatch = "" + valtoMatch;
            return (ar.includes(valtoMatch)) ? subcontent : "";
        }).trimEnd();
    }
}
exports.switchRegs = switchRegs;
