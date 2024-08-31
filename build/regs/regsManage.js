"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regsManage = void 0;
const loopRegs_1 = require("ucbuilder/build/regs/process/loopRegs");
const switchRegs_1 = require("ucbuilder/build/regs/process/switchRegs");
const common_1 = require("ucbuilder/build/common");
const patternMatcher_1 = require("ucbuilder/build/regs/patternMatcher");
class regsManage {
    constructor() {
        this.switchRgx = new switchRegs_1.switchRegs();
        this.loopRgx = new loopRegs_1.loopRegs();
        this.proceeFindRegs = new patternMatcher_1.patternMatcher(/`[ \n\r]*{(\w*)=([\.\w]+?)}[ \n\r]*`/, /([^]*?)/, 
        // @ts-ignore
        /`[ \n\r]*{\/\1}[ \n\r]*`/g);
        this.tableColCellPattern = new patternMatcher_1.patternMatcher(/{=/, /([\.\w]+?)/, /}/g);
    }
    /**
     *
     * @param {{}} node
     * @param {string} content
     * @returns {string}
     */
    parse(node, content) {
        let res = "";
        let _this = this;
        res = content.replace(this.proceeFindRegs.pattern, function (match, _code, valtoFind, subcontent, offset, input_string) {
            let prcRes = "";
            if (_code.startsWith("loop")) {
                prcRes += _this.loopRgx.parseDirect(node, _code, valtoFind, subcontent, (obj, loop_content) => {
                    return _this.parse(obj, loop_content);
                });
            }
            else if (_code.startsWith("switch")) {
                let cnt = _this.switchRgx.parseDirect(node, valtoFind, subcontent);
                prcRes += _this.parse(node, cnt);
            }
            else
                return subcontent;
            return prcRes;
        });
        return this._GET_CELL_VAL(node, res);
    }
    /**
     *
     * @param {string} content
     * @param {{}} node
     * @returns {string}
     */
    _GET_CELL_VAL(node, content) {
        return content.replace(this.tableColCellPattern.pattern, (match, cellName, offset, input_string) => {
            return (cellName == ".") ? '' + node : '' + common_1.objectOpt.getValByNameSpace(node, cellName);
        });
    }
}
exports.regsManage = regsManage;
