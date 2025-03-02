import { objectOpt } from "ucbuilder/build/common";
import { patternMatcher } from "ucbuilder/build/regs/patternMatcher";

export class switchRegs {
    switchPattern= new RegExp(/`\s*{(switch\w*)=([\.\w]+?)}\s*`([^]*?)`\s*{\/\1}\s*`/g);
    casePattern= new RegExp(/`\s*\[(case\w*)=([\.\|\w]+?)\]\s*`([^]*?)`\s*\[\/\1\]\s*`/g);
    
    constructor() {
      
    }

    /**
     * 
     * @param {string} content 
     * @param {{}} node 
     * @param {Function} caseText 
     * @returns 
     */
    parse(content: string, node: {}, caseText: Function = (val: any) => { return val; }): string {
        let _this = this;
        return content.replace(this.switchPattern, function (
            match: string,
            switchCode: string,
            valtoFind: string,
            subcontent: string, offset: number, input_string: string
        ) {
            let casetofind = caseText(objectOpt.getValByNameSpace(node, valtoFind));
            return _this.parseCase(subcontent.trim(), casetofind);
        });
    }

    parseDirect(node: {}, valtoFind: string, subcontent: string, caseText: Function = (val: any) => { return val; }): string {
        let casetofind = caseText(objectOpt.getValByNameSpace(node, valtoFind));
        return this.parseCase(subcontent.trim(), casetofind);
    }

    /**
     *
     * @param {string} content 
     * @param {string} valtoMatch 
     * @returns 
     */
    parseCase(content: string, valtoMatch: string): string {
        return content.replace(this.casePattern, function (
            match: string,
            caseCode: string,
            valInCase: string,
            subcontent: string, offset: number, input_string: string
        ) {
            /**
             * @type {[]}
             */
            let ar: string[] = valInCase.split("|");
            valtoMatch = "" + valtoMatch;
            return (ar.includes(valtoMatch)) ? subcontent : "";
        }).trimEnd();
    }
}