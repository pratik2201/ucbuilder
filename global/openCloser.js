"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openCloser = void 0;
class openCloser {
    constructor() {
        this.ignoreList = [];
    }
    doTask(openTxt, closeTxt, contents, callback = (outText, inText, txtCount) => { }) {
        let opened = 0, closed = 0;
        let rtrn = "";
        let lastoutIndex = 0, lastinIndex = 0;
        let iList = this.ignoreList;
        if (iList.length == 0) {
            for (let index = 0, len = contents.length; index < len; index++) {
                let cnt = contents.charAt(index);
                if (opened == closed && index > 0 && opened > 0) {
                    let selector = contents.substring(lastoutIndex, lastinIndex);
                    let cssStyle = contents.substring(lastinIndex + 1, index - 1);
                    rtrn += callback(selector, cssStyle, opened);
                    lastoutIndex = index;
                    opened = closed = 0;
                }
                switch (cnt) {
                    case openTxt:
                        if (opened == 0)
                            lastinIndex = index;
                        opened++;
                        break;
                    case closeTxt:
                        closed++;
                        break;
                }
            }
        }
        else {
            let charNode;
            let state = "resume";
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
                                if (opened == 0)
                                    lastinIndex = index;
                                opened++;
                                break;
                            case closeTxt:
                                closed++;
                                break;
                            default:
                                charNode = iList.find((s) => s.openingChar === cnt);
                                if (charNode != undefined)
                                    state = "pause";
                                break;
                        }
                        break;
                    case "pause":
                        if (cnt === charNode.closingChar)
                            state = "resume";
                        break;
                }
            }
        }
        return rtrn;
    }
}
exports.openCloser = openCloser;
