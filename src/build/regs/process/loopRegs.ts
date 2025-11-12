import { objectOpt } from "../../common.js";

 
type LoopEachItemCallback = (obj: {}, content: string, nameSpace: string, loopCode: string) => string;
const loopEachItemCallback: LoopEachItemCallback = (obj = {}, content, nameSpace, loopCode) => { return content; };

export class loopRegs {
    loopPattern = new RegExp(/`\s*{(loop\w*)=([\.\w]+?)}\s*`([^]*?)`\s*{\/\1}\s*`/g);

    constructor() {
       
    }

    parse(content: string, nodes: {}, eachItemcallback: LoopEachItemCallback = loopEachItemCallback): string {
        let _this = this;
        return content.replace(this.loopPattern, function (
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
        //if (Array.isArray(arlist)) {
            arlist.forEach(arVal => {
                result += eachItemcallback(arVal, subcontent, valtoFind, loopCode);
            });
       // } else if (Object.getPrototypeOf(arlist).constructor.name == "Object") {
            //console.log('OBJECT IS here');
            
      //  }
        return result;
    }
}