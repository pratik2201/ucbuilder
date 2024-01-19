import { objectOpt } from "ucbuilder/build/common";
import { patternMatcher } from "ucbuilder/build/regs/patternMatcher";

class switchRegs {
    switchPattern: patternMatcher;
    casePattern: patternMatcher;

    constructor() {
        this.switchPattern = new patternMatcher(
            /`[ \n\r]*{(switch\w*)=([\.\w]+?)}[ \n\r]*`/,
            /([^]*?)/,
            /`[ \n\r]*{\/\1}[ \n\r]*`/g
        );
        this.casePattern = new patternMatcher(
            /`[ \n\r]*\[(case\w*)=([\.\|\w]+?)\][ \n\r]*`/,
            /([^]*?)/,
            /`[ \n\r]*\[\/\1\][ \n\r]*`/g
        );
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
        return content.replace(this.switchPattern.pattern, function (
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
        return content.replace(this.casePattern.pattern, function (
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

export { switchRegs };