const { loopRegs } = require("@ucbuilder:/build/regs/process/loopRegs");
const { switchRegs } = require("@ucbuilder:/build/regs/process/switchRegs");
const { objectOpt } = require("@ucbuilder:/build/common");
const { patternMatcher } = require("@ucbuilder:/build/regs/patternMatcher");

class regsManage {
    constructor() {
        this.switchRgx = new switchRegs();
        this.loopRgx = new loopRegs();
    }
    /**
     * 
     * @param {{}} node 
     * @param {string} content 
     * @returns {string}
     */
    parse(node, content) {
        //if(typeof(node)=="string")return node;
        let res = "";
        let _this = this;
        // let isChanged = false;
        res = content.replace(this.proceeFindRegs.pattern, function (
            match,
            _code,
            valtoFind,
            subcontent, offset, input_string) {
            let prcRes = "";
            if (_code.startsWith("loop")) {
                // isChanged = true;
                prcRes += _this.loopRgx.parseDirect(node, _code, valtoFind, subcontent,
                    (obj, loop_content/*, val_namespace, loop_code*/) => {
                        return _this.parse(obj, loop_content)
                    });
            } else if (_code.startsWith("switch")) {
                // isChanged = true;
                let cnt = _this.switchRgx.parseDirect(node, valtoFind, subcontent);
                prcRes += _this.parse(node, cnt);
            } else return subcontent;
            return prcRes;
        });
        //if (isChanged)
        //    return this.parse(node,this._GET_CELL_VAL(node, res));
        //else
        return this._GET_CELL_VAL(node, res);
    }
    proceeFindRegs = new patternMatcher(
        /`[ \n\r]*{(\w*)=([\.\w]+?)}[ \n\r]*`/,
        /([^]*?)/,
        /`[ \n\r]*{\/\1}[ \n\r]*`/g);

    /**
     * 
     * @param {string} content 
     * @param {{}} node 
     * @returns {string}
     */
    _GET_CELL_VAL(node, content) {
        return content.replace(this.tableColCellPattern.pattern, function (
            match,
            cellName, offset, input_string) {
            return (cellName == ".") ? node : objectOpt.getValByNameSpace(node, cellName);
        });
        //}

    }
    tableColCellPattern = new patternMatcher(/{=/, /([\.\w]+?)/, /}/g);
}
module.exports = { regsManage };