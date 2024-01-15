import { loopRegs } from "@ucbuilder:/build/regs/process/loopRegs";
import { switchRegs } from "@ucbuilder:/build/regs/process/switchRegs";
import { objectOpt } from "@ucbuilder:/build/common";
import { patternMatcher } from "@ucbuilder:/build/regs/patternMatcher";
namespace ucbuilder.build.regs {
    export class regsManage {
        private switchRgx: switchRegs;
        private loopRgx: loopRegs;
        private proceeFindRegs: patternMatcher;
        private tableColCellPattern: patternMatcher;

        constructor() {
            this.switchRgx = new switchRegs();
            this.loopRgx = new loopRegs();
            this.proceeFindRegs = new patternMatcher(
                /`[ \n\r]*{(\w*)=([\.\w]+?)}[ \n\r]*`/,
                /([^]*?)/,
                /`[ \n\r]*{\/\1}[ \n\r]*`/g
            );
            this.tableColCellPattern = new patternMatcher(/{=/, /([\.\w]+?)/, /}/g);
        }

        /**
         * 
         * @param {{}} node 
         * @param {string} content 
         * @returns {string}
         */
        parse(node: {}, content: string): string {
            let res = "";
            let _this = this;
            res = content.replace(this.proceeFindRegs.pattern, function (
                match: string,
                _code: string,
                valtoFind: string,
                subcontent: string,
                offset: number,
                input_string: string
            ) {
                let prcRes = "";
                if (_code.startsWith("loop")) {
                    prcRes += _this.loopRgx.parseDirect(node, _code, valtoFind, subcontent,
                        (obj: {}, loop_content: string) => {
                            return _this.parse(obj, loop_content);
                        });
                } else if (_code.startsWith("switch")) {
                    let cnt = _this.switchRgx.parseDirect(node, valtoFind, subcontent);
                    prcRes += _this.parse(node, cnt);
                } else return subcontent;
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
        private _GET_CELL_VAL(node: {}, content: string): string {
            return content.replace(this.tableColCellPattern.pattern, function (
                match: string,
                cellName: string,
                offset: number,
                input_string: string
            ) {
                return (cellName == ".") ? node : objectOpt.getValByNameSpace(node, cellName);
            });
        }
    }
}