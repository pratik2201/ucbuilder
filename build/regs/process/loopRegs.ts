import { objectOpt } from "ucbuilder/build/common";
import { patternMatcher } from "ucbuilder/build/regs/patternMatcher";

type LoopEachItemCallback = (obj: {}, content: string, nameSpace: string, loopCode: string) => string;
const loopEachItemCallback: LoopEachItemCallback = (obj = {}, content, nameSpace, loopCode) => { return content; };

class loopRegs {
    loopPattern: patternMatcher;

    constructor() {
        this.loopPattern = new patternMatcher(
            /`[ \n\r]*{(loop\w*)=([\.\w]+?)}[ \n\r]*`/,
            /([^]*?)/,
            
            // @ts-ignore
            /`[ \n\r]*{\/\1}[ \n\r]*`/g
        );
    }
    
    parse(content: string, nodes: {},eachItemcallback: LoopEachItemCallback = loopEachItemCallback): string {
        let _this = this;
        return content.replace(this.loopPattern.pattern, function (
            match: string,
            loopCode: string,
            valtoFind: string,
            subcontent: string,
            offset: number,
            input_string: string
        ) {
            let result = "";
            
            let arlist: [{}] = objectOpt.getValByNameSpace(nodes, valtoFind) as [{}];
            arlist.forEach(arVal => {
                result += eachItemcallback(arVal, subcontent, valtoFind, loopCode);
            });
            return result;
        });
    }

    parseDirect(
        node: {},
        loopCode: string,
        valtoFind: string,
        subcontent: string,
        eachItemcallback: LoopEachItemCallback = loopEachItemCallback
    ): string {
        let result = "";
        let arlist: [{}] = objectOpt.getValByNameSpace(node, valtoFind) as [{}];
        arlist.forEach(arVal => {
            result += eachItemcallback(arVal, subcontent, valtoFind, loopCode);
        });
        return result;
    }
}

export { loopRegs };