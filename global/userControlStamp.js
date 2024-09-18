"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControlStamp = exports.userControlStampRow = void 0;
const common_1 = require("ucbuilder/build/common");
const fileDataBank_1 = require("ucbuilder/global/fileDataBank");
const runtimeOpt_1 = require("ucbuilder/global/runtimeOpt");
const stylerRegs_1 = require("ucbuilder/global/stylerRegs");
class userControlStampRow {
    constructor() {
        this.content = "";
        this.fUniq = "";
        this.passElement = (ele, applySubTree = true) => {
            let stamplist = [];
            let stmpTxt = this.stamp;
            let stmpUnq = this.uniqStamp;
            if (this.cInfo.rootInfo == undefined)
                console.log(this.cInfo);
            let stmpRt = '' + this.cInfo.rootInfo.id;
            //let ar: NodeListOf<HTMLElement> = ele.querySelectorAll("*");
            let ar = common_1.controlOpt.getArray(ele);
            for (let index = 0; index < ar.length; index++) {
                let element = ar[index];
                element.setAttribute(runtimeOpt_1.ATTR_OF.UC.PARENT_STAMP, stmpTxt);
                element.setAttribute(runtimeOpt_1.ATTR_OF.UC.UNIQUE_STAMP, stmpUnq);
                element.setAttribute(runtimeOpt_1.ATTR_OF.UC.ROOT_STAMP, stmpRt);
                if (applySubTree) {
                    element.querySelectorAll("*")
                        .forEach((s) => {
                        s.setAttribute(runtimeOpt_1.ATTR_OF.UC.PARENT_STAMP, stmpTxt);
                        s.setAttribute(runtimeOpt_1.ATTR_OF.UC.UNIQUE_STAMP, stmpUnq);
                        s.setAttribute(runtimeOpt_1.ATTR_OF.UC.ROOT_STAMP, stmpRt);
                    });
                }
            }
            return stamplist;
        };
    }
    get stamp() { return this.styler.stamp; }
    get uniqStamp() { return this.styler.uniqStamp; }
    isOurElement(ele) {
        return ele.getAttribute(runtimeOpt_1.ATTR_OF.UC.UNIQUE_STAMP) == this.uniqStamp;
    }
}
exports.userControlStampRow = userControlStampRow;
class userControlStamp {
    /*static params:SourceOptions = {
        fInfo: undefined as codeFileInfo | undefined,
        reloadDesign: false,
        reloadKey: "",
        htmlContents: undefined as  | undefined,
        callmeBeforeContentAssign:StringExchangerCallback,
    }*/
    static getStamp(param0) {
        this.stampCallTimes++;
        let rtrn = undefined;
        let lwrName = param0.cfInfo.html.rootPath.toLowerCase();
        if (param0.templateName != "")
            lwrName += "@" + param0.templateName;
        let pathtofind = lwrName + "_" + param0.reloadKey;
        let sindex = this.source.findIndex(s => s.fUniq == pathtofind);
        if (sindex == -1) {
            this.stampNo++;
            rtrn = new userControlStampRow();
            rtrn.styler = new stylerRegs_1.stylerRegs(param0.cfInfo.rootInfo, true);
            rtrn.fUniq = pathtofind;
            rtrn.cInfo = param0.cfInfo;
            if (param0.htmlContents != undefined) {
                rtrn.content = param0.htmlContents;
                this.reload(rtrn, param0.beforeContentAssign, param0);
            }
            else {
                rtrn.content = fileDataBank_1.FileDataBank.readFile(param0.cfInfo.html.rootPath);
                this.reload(rtrn, param0.beforeContentAssign, param0);
            }
            this.source.push(rtrn);
        }
        else {
            if (param0.reloadDesign) {
                rtrn = this.source[sindex];
                rtrn.content = param0.htmlContents != undefined ? param0.htmlContents : common_1.pathInfo.readFile(rtrn.cInfo.html.fullPath);
                this.reload(rtrn, param0.beforeContentAssign, param0);
            }
            else {
                rtrn = this.source[sindex];
                if (param0.beforeContentAssign != undefined) {
                    rtrn.content = param0.beforeContentAssign(rtrn.content);
                    rtrn.dataHT = rtrn.content.$();
                }
            }
        }
        return rtrn;
    }
    static reload(rtrn, callback, param0) {
        rtrn.content = rtrn.content.replace(/^\s*<([\w\.:-]*?)([\S\s]*?)<\/\1>\s*$/g, (match, otag, contents, ctag) => {
            switch (param0.nodeNameAs) {
                case 'targetElement':
                    rtrn.styler.nodeName = param0.targetElementNodeName;
                    break;
                case 'wrapper':
                    rtrn.styler.nodeName = otag;
                    break;
            }
            let newNodeName = rtrn.styler.nodeName;
            return `<${newNodeName} ${runtimeOpt_1.ATTR_OF.UC.UC_STAMP}="${rtrn.stamp}" x-tabindex="-1" ${contents}</${newNodeName}>`;
        });
        rtrn.content = rtrn.styler.parseStyle(rtrn.content);
        if (callback != undefined)
            rtrn.content = callback(rtrn.content);
        rtrn.dataHT = rtrn.content.$();
        if (!rtrn.dataHT.hasAttribute('x-allowtabindex'))
            rtrn.dataHT.setAttribute('x-allowtabindex', '0');
    }
}
exports.userControlStamp = userControlStamp;
userControlStamp.stampNo = 0;
userControlStamp.source = [];
userControlStamp.stampCallTimes = 0;
