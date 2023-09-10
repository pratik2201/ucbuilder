const { codeFileInfo } = require("@ucbuilder:/build/codeFileInfo");
const { pathInfo, controlOpt } = require("@ucbuilder:/build/common");
const { sourceOptions } = require("@ucbuilder:/enumAndMore");
const { fileDataBank } = require("@ucbuilder:/global/fileDataBank");
const { ATTR_OF } = require("@ucbuilder:/global/runtimeOpt");

class userControlStampRow {
    /** @type {codeFileInfo}  */
    cInfo = undefined;
    ///** @type {string}  */
    get stamp() { return this.styler.stamp; }

    get uniqStamp() { return this.styler.uniqStamp; }

    /** @type {import ("@ucbuilder:/global/stylerRegs").stylerRegs}  */
    styler = undefined;

    /** @type {string}  */
    content = "";

    /** @type {HTMLElement}  */
    dataHT = undefined;

    fUniq = "";
    /**
     * @param {HTMLElement} ele
     * @returns {boolean} 
     */
    isOurElement(ele) {

        return ele.getAttribute(ATTR_OF.UC.UNIQUE_STAMP) == this.uniqStamp;
    }
    /**
     * @param {boolean} applySubTree 
     * @returns {string[]} stamp list
     */
    passElement = (ele, applySubTree = true) => {
        let stamplist = [];
        let stmpTxt = this.stamp;
        let stmpUnq = this.uniqStamp;

        let stmpRt = this.cInfo.rootInfo.id;
        let ar = controlOpt.getArray(ele);
        for (let index = 0; index < ar.length; index++) {
            let element = ar[index];
            element.setAttribute(ATTR_OF.UC.PARENT_STAMP, stmpTxt);
            element.setAttribute(ATTR_OF.UC.UNIQUE_STAMP, stmpUnq);
            element.setAttribute(ATTR_OF.UC.ROOT_STAMP, stmpRt);
            stamplist.push(element.stamp());
            if (applySubTree) {
                element.querySelectorAll("*")
                    .forEach((s) => {
                        s.setAttribute(ATTR_OF.UC.PARENT_STAMP, stmpTxt);
                        s.setAttribute(ATTR_OF.UC.UNIQUE_STAMP, stmpUnq);
                        s.setAttribute(ATTR_OF.UC.ROOT_STAMP, stmpRt);
                        stamplist.push(s.stamp());
                    });
            }
        }
        return stamplist;
    }
}

class userControlStamp {

    constructor() { }
    /** @type {number}  */
    static stampNo = 0;
    /** @type {userControlStampRow[]}  */
    static source = [];
    static stampCallTimes = 0;
    static params = {
        /** @type {codeFileInfo}  */
        fInfo: undefined,
        reloadDesign: false,
        reloadKey: "",
        /** @type {string}  */
        htmlContents: undefined,
        /** @type {Function}  */
        callmeBeforeContentAssign: undefined,
    }
    /**
     * @param {sourceOptions} param0 
     * @returns {userControlStampRow}
     */
    static getStamp(param0) {
        this.stampCallTimes++;
        //console.log(param0);
        /** @type {userControlStampRow}  */
        let rtrn = undefined;
        let pathtofind = param0.fInfo.html.path.toLowerCase();

        if (param0.reloadDesign) pathtofind += "_" + param0.reloadKey;
        let sindex = this.source.findIndex(s => s.fUniq == pathtofind);
        if (sindex == -1) {
            this.stampNo++;
            rtrn = new userControlStampRow();
            let { stylerRegs } = require("@ucbuilder:/global/stylerRegs");
            rtrn.styler = new stylerRegs(param0.fInfo.rootInfo, true);
            rtrn.fUniq = pathtofind;
            rtrn.cInfo = param0.fInfo;
            if (param0.htmlContents != undefined) {
                rtrn.content = param0.htmlContents;
                this.reload(rtrn, param0.beforeContentAssign, param0);
            } else {
                rtrn.content = fileDataBank.readFile(param0.fInfo.html.rootPath);
                this.reload(rtrn, param0.beforeContentAssign, param0);
            }
            this.source.push(rtrn);
        } else { ///  IF MORE THAN ONE TIME CALLED I.E as in 'OUTPUT.UC'
            if (param0.reloadDesign) {  //  IF EXIST AND  RELOAD
                rtrn = this.source[sindex];
                /** @type {string}  */
                rtrn.content = param0.htmlContents != undefined ? param0.htmlContents : pathInfo.readFile(rtrn.cInfo.html.path);
                this.reload(rtrn, param0.beforeContentAssign, param0);
            } else {  //  IF EXIST AND NOT RELOAD
                rtrn = this.source[sindex];

                if (param0.beforeContentAssign != undefined) {
                    rtrn.content = param0.beforeContentAssign(rtrn.content);
                    rtrn.dataHT = rtrn.content.$();
                }
            }
        }
        //rtrn.styler = styler;
        //rtrn.styler.globalStampRow = rtrn;
        return rtrn;
    }
    /**
     * @param {userControlStampRow} rtrn 
     * @param {Function} callback
     * @param {sourceOptions} param0 
     */
    static reload(rtrn, callback, param0) {

        rtrn.content = rtrn.content.replace(/^<([\w:-]*?)([\S\s]*?)<\/\1>$/gm,
            (match, otag, contents, ctag) => {
                switch (param0.nodeNameAs) {
                    case 'targetElement': rtrn.styler.nodeName = param0.targetElementNodeName; break;
                    case 'wrapper': rtrn.styler.nodeName = otag; break;
                }
                let newNodeName = rtrn.styler.nodeName;
                return `<${newNodeName} ${ATTR_OF.UC.UC_STAMP}="${rtrn.stamp}" x-tabindex="-1" ${contents}</${newNodeName}>`;
            });

        rtrn.content = rtrn.styler.parseStyle(rtrn.content);
        if (callback != undefined) rtrn.content = callback(rtrn.content);
        //console.log(rtrn.content);
        rtrn.dataHT = rtrn.content.$();

        if (!rtrn.dataHT.hasAttribute('x-allowtabindex'))
            rtrn.dataHT.setAttribute('x-allowtabindex', '0');
    }
}
module.exports = { userControlStamp, userControlStampRow };