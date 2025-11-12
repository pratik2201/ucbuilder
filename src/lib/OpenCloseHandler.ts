interface OpenCloseCharNode {
    o: string,
    c: string,
}
export interface OCIterator {
    frontContent: string;
    betweenContent: string;
    level: number;
    child: OCIterator[];
}

export class OpenCloseHandler {
    ignoreList: OpenCloseCharNode[] = [];    
    parse(oc:OpenCloseCharNode,str: string):OCIterator[] {
       // console.log(str);
        let result: OCIterator[] = [];
        let stack: { node: OCIterator; startIndex: number }[] = [];
        let buffer = "";
        let level = 0;
        let i = 0;

        while (i < str.length) {
            let ignored = this.ignoreList.find(il => str.startsWith(il.o, i));
            
            // If inside an ignored block, find closing delimiter
            if (ignored) {
                let endIdx = str.indexOf(ignored.c, i + ignored.o.length);
                if (endIdx !== -1) {
                    // Skip ignored content entirely
                    buffer += str.substring(i, endIdx + ignored.c.length);
                    i = endIdx + ignored.c.length - 1;
                } else {
                    buffer += str.substring(i);
                    break;
                }
            }
            // Handle Opening `{`
            else if (str.startsWith(oc.o, i)) {
                let frontContent = buffer.trim();
                buffer = "";
                let node: OCIterator = { frontContent, betweenContent: "", level, child: [] };
                stack.push({ node, startIndex: i + oc.o.length }); // Track block start index
                level++;
                i += oc.o.length - 1;
            }
            // Handle Closing `}`
            else if (str.startsWith(oc.c, i)) {
                let betweenContent = buffer.trim();
                buffer = "";

                if (stack.length > 0) {
                    let { node, startIndex } = stack.pop()!;
                    node.betweenContent = str.substring(startIndex, i).trim(); // Full content inside `{}`

                    level--;

                    if (stack.length > 0) {
                        stack[stack.length - 1].node.child.push(node);
                    } else {
                        result.push(node);
                    }
                }
                i += oc.c.length - 1;
            }
            // Normal character
            else {
                buffer += str[i];
            }

            i++;
        }

        //console.log(result);
        
        return result;
    }
    doTask(
        openTxt: string,
        closeTxt: string,
        contents: string,
        callback: (
            outText: string,
            inText: string,
            txtCount: number
        ) => void = (outText, inText, txtCount) => { }
    ): string {
        let opened = 0,
            closed = 0;
        let rtrn = "";
        let lastoutIndex = 0,
            lastinIndex = 0;
        let iList = this.ignoreList;
        if (iList.length == 0) {
            let fcntnt = '';
            let oLEN = openTxt.length;
            let cLEN = closeTxt.length;
            for (let index = 0, len = contents.length; index <= len; index++) {
                
                if (opened == closed && index > 0 && opened > 0) {
                    let selector = contents.substring(lastoutIndex, lastinIndex-oLEN+1);
                    let cssStyle = contents.substring(lastinIndex + 1, index - cLEN);
                    rtrn += callback(selector, cssStyle, opened);
                    lastoutIndex = index;
                    opened = closed = 0;
                }
                let cnt = contents.charAt(index);
                if (index == len) {
                    //console.log([cnt,contents.substring(lastoutIndex)]);
                 
                    rtrn += contents.substring(lastoutIndex);
                }
                fcntnt += cnt;
                //console.log();
                if (fcntnt.slice(-oLEN) == openTxt) {
                    if (opened == 0) lastinIndex = index;
                    opened++;
                } else if (fcntnt.slice(-cLEN) == closeTxt){
                    closed++;
                }
                /*switch (cnt) {
                    case openTxt:
                        if (opened == 0) lastinIndex = index;
                        opened++;
                        break;
                    case closeTxt:
                        closed++;
                        break;
                }*/
            }
        } else {
            let charNode: OpenCloseCharNode;
            let state: "pause" | "resume" = "resume";
            for (let index = 0, len = contents.length; index < len; index++) {
                let cnt = contents.charAt(index);
                switch (state) {
                    case "resume":
                        if (opened == closed && index > 0 && opened > 0) {
                            let selector = contents.substring(lastoutIndex, lastinIndex);
                            let cssStyle = contents.substring(lastinIndex + 1, index - 1);
                            rtrn += callback(selector, cssStyle, opened);
                            lastoutIndex = index;
                            opened = closed = 0;
                        }
                        switch (cnt) {
                            case openTxt:
                                if (opened == 0) lastinIndex = index;
                                opened++;
                                break;
                            case closeTxt:
                                closed++;
                                break;
                            default:
                                charNode = iList.find((s) => s.o === cnt);
                                if (charNode != undefined) state = "pause";
                                break;
                        }
                        break;
                    case "pause":
                        if (cnt === charNode.c) state = "resume";
                        break;
                }
            }
        }
        return rtrn;
    }
}
