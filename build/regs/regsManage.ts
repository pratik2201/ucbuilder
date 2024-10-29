
import { loopRegs } from "ucbuilder/build/regs/process/loopRegs";
import { switchRegs } from "ucbuilder/build/regs/process/switchRegs";
import { objectOpt } from "ucbuilder/build/common";
import { patternMatcher } from "ucbuilder/build/regs/patternMatcher";
import { SourceManage } from "ucbuilder/global/datasources/SourceManage";

class regsManage {
    private switchRgx: switchRegs;
    private loopRgx: loopRegs;
    private proceeFindRegs = new RegExp(/`\s*{(\w*)=(.+?)}\s*`([^]*?)`\s*{\/\1}\s*`/g);
    private tableColCellPattern = new RegExp(/{=([\.\w]+?) *}/g);
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
    parse(node: {}, content: string): string {
        let res = "";
        let _this = this;
        res = content.replace(this.proceeFindRegs, function (
            match: string,
            _code: string,
            valtoFind: string,
            subcontent: string,
            offset: number,
            input_string: string
        ) {
            let prcRes = "";
           
            if (_code.startsWith("loop")) {  
                if (subcontent.includes("loopCELL")) {
                  //  console.log(subcontent);
                 }
                prcRes += _this.loopRgx.parseDirect(node, _code, valtoFind, subcontent,
                    (obj: {}, loop_content: string) => {
                        
                        return _this.parse(obj, loop_content);
                    });
            } else if (_code.startsWith("switch")) {
                let cnt = _this.switchRgx.parseDirect(node, valtoFind, subcontent);
                prcRes += _this.parse(node, cnt);
            } else return subcontent;
          //  console.log(prcRes);
            
            return prcRes;
        });
        return this._GET_CELL_VAL(node, res);
    }
    tText = undefined;
    /**
     * 
     * @param {string} content 
     * @param {{}} node 
     * @returns {string}
     */
    private _GET_CELL_VAL(node, content: string): string {        
        return content.replace(this.tableColCellPattern,  (
            match: string,
            cellName: string,
            offset: number,
            input_string: string
        ): string => {
            if (cellName.startsWith(".")) {
                if (cellName == ".") return node;
                else return ''+objectOpt.getValByNameSpace(node[SourceManage.ACCESS_KEY], cellName.substring(1));   
            } else return ''+objectOpt.getValByNameSpace(node, cellName);            
        });
    }

}

export { regsManage };
