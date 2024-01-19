"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loopRegs = void 0;
const common_1 = require("ucbuilder/build/common");
const patternMatcher_1 = require("ucbuilder/build/regs/patternMatcher");
const loopEachItemCallback = (obj = {}, content, nameSpace, loopCode) => { return content; };
class loopRegs {
    constructor() {
        this.loopPattern = new patternMatcher_1.patternMatcher(/`[ \n\r]*{(loop\w*)=([\.\w]+?)}[ \n\r]*`/, /([^]*?)/, /`[ \n\r]*{\/\1}[ \n\r]*`/g);
    }
    parse(content, nodes, eachItemcallback = loopEachItemCallback) {
        let _this = this;
        return content.replace(this.loopPattern.pattern, function (match, loopCode, valtoFind, subcontent, offset, input_string) {
            let result = "";
            let arlist = common_1.objectOpt.getValByNameSpace(nodes, valtoFind);
            arlist.forEach(arVal => {
                result += eachItemcallback(arVal, subcontent, valtoFind, loopCode);
            });
            return result;
        });
    }
    parseDirect(node, loopCode, valtoFind, subcontent, eachItemcallback = loopEachItemCallback) {
        let result = "";
        let arlist = common_1.objectOpt.getValByNameSpace(node, valtoFind);
        arlist.forEach(arVal => {
            result += eachItemcallback(arVal, subcontent, valtoFind, loopCode);
        });
        return result;
    }
}
exports.loopRegs = loopRegs;
