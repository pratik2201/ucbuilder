const { aliceManager } = require("@ucbuilder:/build/codefile/aliceManager");
const { uniqOpt, propOpt } = require("@ucbuilder:/build/common");
const { fileDataBank } = require("@ucbuilder:/global/fileDataBank");
const { loadGlobal } = require("@ucbuilder:/global/loadGlobal");
const { rootPathHandler, rootPathRow } = require("@ucbuilder:/global/rootPathHandler");
const { ATTR_OF } = require("@ucbuilder:/global/runtimeOpt");
const patternList = {
    globalFinderPathPattern: /path=(["'`])([\s\S]*?)\1/gim,
    globalFinderPattern: /(.|\n)<gload([\n\r\w\W.]*?)>/gim,
    styleTagSelector: /<style([\n\r\w\W.]*?)>([\n\r\w\W.]*?)<\/style>/gi,
    styleCommentRegs: /\/\*([\s\S]*?)\*\//gi,
    //subUcAndExcludeSelector: /\[(uc|root|exclude)(\w*)=(["'`])*([\s\S]*?)\3\]([\s\S]*?)[\n ]([\s\S]*?)\[\1\2\]/gim,
    subUcFatcher: /\[inside=("|'|`)([\s\S]*?)\1\]([\S\s]*)/gmi,
    themeCSSLoader: /\[(theme|css)=(["'`])*([\s\S]*?)\2\]/gim,
    stylesFilterPattern: /(animation-name): (.*?);/gmi,
    scopeSelector: /\[SELF_]/gm,
    rootExcludePattern: /(.*?)(:root|:exclude)/gi,
};
class stylerRegs {
    static pushPublicStyles() {
        let { ResourcesUC } = require("@ucbuilder:/ResourcesUC");
        rootPathHandler.source.forEach(row => {
            let _stylepath = row.replaceLowerCaseText + "/styles.scss";
            let node = rootPathHandler.convertToRow(row, true);
            let styler = new stylerRegs(node, true);
            ResourcesUC.styler.pushChild(node.alices, styler, node.alices);
            let _data = fileDataBank.readFile(_stylepath, {
                isFullPath: true,
                replaceContentWithKeys: true
            });
            //console.log(styler.stamp);
            if (_data != undefined) {
                loadGlobal.pushRow({
                    url: _stylepath,
                    cssContents: styler.parseStyleSeperator(_data),
                    stamp: styler.stamp,
                });
            }
            ///console.log();
        });
    }

    /** @type {string}  */
    stamp = "";

    uniqStamp = "";
    /** @type {number}  */
    static stampNo = 0;
    static stampCallTimes = 0;
    aliceMng = new aliceManager();
    /**
     * @param {rootPathRow} rootInfo 
     * @param {boolean} generateStamp 
     */
    constructor(rootInfo, generateStamp = false) {
        this.rootInfo = rootInfo;

        stylerRegs.stampCallTimes++;
        // if (generateStamp)
        stylerRegs.stampNo++;

        this.stamp = "" + stylerRegs.stampNo;
        this.uniqStamp = "" + stylerRegs.stampCallTimes;
        this.nodeName = "f" + uniqOpt.randomNo();


    }
    /** @type {rootPathRow}  */
    rootInfo = undefined;
    /** @private 
    _nodeName = ""; */
    nodeName = "";
    //get nodeName() { return this._nodeName; }
    /** @type {stylerRegs}  */
    parent = undefined;
    /** @type {stylerRegs[]}  */
    children = [];
    alices = "";
    path = "";
    /** 
     * @param {string} path file path 
     * @param {stylerRegs} node releted ucTree ref
     * @param {string} nodeName htmlnode name
     */
    pushChild(path, node, nodeName) {
        let key = path.toLowerCase();
        let sreg = this.children.find(s => s.path == key);
        if (sreg == undefined) {
            node.alices = nodeName.toLowerCase();
            node.path = key;
            node.parent = this;
            this.children.push(node);
        }
        //console.log(nodeName);
        /*if (!(key in this.children)) {
            node.parent = this;
            this.children[key] = node;
        }*/
        //console.log(this.children);
    }


    /** @private */
    loadGlobalPath(data) {
        let _this = this;
        data.replace(patternList.globalFinderPathPattern,
            /**
            * @param {string} match 
            * @param {string} quationMark 
            * @param {string} paths  
            * @returns 
            */
            (match, quationMark, paths) => {
                paths.split(';').forEach(s => {
                    loadGlobal.pushRow({
                        url: s.trim(),
                        stamp: _this.stamp,
                        reloadDesign: false
                    });
                });
                return "";
            });
    }

    /**
     * @param {string} data 
     * @returns 
     */
    parseStyle(data) {
        let _this = this;

        let rtrn = data.replace(patternList.globalFinderPattern,
            /**
            * @param {string} match 
            * @param {string} escapeChar  
            * @param {string} contents  
            * @param {*} offset 
            * @param {string} input_string 
            * @returns 
            */
            (match, escapeChar, contents, offset, input_string) => {
                if (escapeChar === `\\`) return match;
                _this.loadGlobalPath(contents)
                return "";
            });


        rtrn = rtrn.replace(patternList.styleTagSelector,
            /**
             * @param {string} match 
             * @param {string} styleAttrs     
             * @param {string} styleContent
             * @param {*} offset 
             * @param {string} input_string 
             * @returns 
             */
            function (
                match,
                styleAttrs,
                styleContent,
                offset, input_string) {

                //console.log(`<style ${styleAttrs}> ${_this.parseStyleSeperator(styleContent, rData)} </style>`);
                return `<style ${styleAttrs}> ${_this.parseStyleSeperator(styleContent)} </style>`;
            });

        return rtrn;
    }
    //styleSeperateSelector = /[\n\r ]*([\w\W.]*?)[\n\r ]*{([\n\r\w\W]*?)}/gi;


    /**
     * @param {string} data 
     * @param {string} scopeSelectorText 
     * @param {number} callCounter 
     * @param {boolean} isForRoot 
     * @param {rootPathRow} _rootinfo
     * @returns 
     */
    parseStyleSeperator(data, scopeSelectorText = "", callCounter = 0, isForRoot = false, _rootinfo) {
        let _this = this;
        callCounter++;
        let externalStyles = [];
        let isChffd = false;
        let pstamp_key = ATTR_OF.UC.PARENT_STAMP;
        let pstamp_val = _this.stamp;
        if (isForRoot) {
            pstamp_key = ATTR_OF.UC.ROOT_STAMP;
            pstamp_val = (_rootinfo == undefined) ? _this.rootInfo.id : _rootinfo.id;
            //console.log(pstamp_key+' < === > '+pstamp_val);
        }
        let rtrn = data.replace(patternList.styleCommentRegs, "");
        rtrn = rtrn.replace(patternList.themeCSSLoader,
            /**
            * @param {string} match 
            * @param {string} code  
            * @param {string} quationMark  
            * @param {string} path  
            * @param {*} offset 
            * @param {string} input_string 
            * @returns 
            */
            (match, code, quationMark, path, offset, input_string) => {
                isChffd = true;

                switch (code) {
                    case "theme":
                        return fileDataBank.readFile(path);
                    case "css":
                        let isGoodToAdd = loadGlobal.isGoodToPush(path);
                        if (isGoodToAdd) {
                            let cssContents = _this.parseStyleSeperator(fileDataBank.readFile(path));
                            loadGlobal.pushRow({
                                url: path,
                                stamp: this.stamp,
                                reloadDesign: false,
                                cssContents: cssContents
                            });
                        }
                        return "";
                }
            });

        rtrn = rtrn.trim().replace(/(;|,|{|})[\n\r ]*/gi, "$1 ");

        //console.log(externalStyles);

        rtrn = stylerRegs.openClose("{", "}", rtrn,
            /**
             * @param {string} selectorText 
             * @param {string} styleContent 
             * @param {number} count 
             * @returns {string}
             */
            (selectorText, styleContent, count) => {
                if (count == 1) {
                    return `${_this.parseScopeSeperator({
                        selectorText: selectorText,
                        scopeSelectorText: scopeSelectorText,
                        parent_stamp: pstamp_key,
                        parent_stamp_value: pstamp_val
                    })}{${styleContent}} `;
                } else {
                   
                    let changed = false;
                    (selectorText.split(",")).forEach(pselctor => {
                        (pselctor.trim()).replace(patternList.rootExcludePattern,
                            /**
                             * @param {string} match 
                             * @param {string} nmode 
                             * @param {string} rootAlices 
                             * @returns 
                             */
                            (match, rootAlices, nmode) => { // console.log(' <=='+mode);
                                switch (nmode) {
                                    case ":root": changed = true;
                                        if (rootAlices == undefined) {
                                            externalStyles.push(
                                                _this.parseStyleSeperator(
                                                    scopeSelectorText + styleContent, "",
                                                    callCounter, true)
                                            );
                                        } else {
                                            externalStyles.push(
                                                _this.parseStyleSeperator(
                                                    scopeSelectorText + styleContent, "",
                                                    callCounter, true,
                                                    rootPathHandler.getInfoByAlices(`@${rootAlices}:`))
                                            );
                                        }
                                        break;
                                    case ":exclude": externalStyles.push(styleContent); changed = true; return "";
                                } return "";
                            });
                    });
                    if (!changed) {
                        changed = false;
                        let trimSelector = selectorText.trim();
                        if (trimSelector.startsWith("@keyframes")) {
                            return `${trimSelector}_${this.uniqStamp}{${styleContent}} ` // selectorText.trimEnd() inplace of `trimSelector`
                        } else {
                            selectorText.replace(patternList.subUcFatcher,
                                /**
                                 * 
                                 * @param {string} match 
                                 * @param {string} quationMark 
                                 * @param {string} filePath 
                                 * @param {string} UCselector 
                                 */
                                (match, quationMark, filePath, UCselector) => {
                                    filePath = filePath.toLowerCase();
                                    UCselector = UCselector.trim();
                                    //console.log(this.children);
                                    /** @type {stylerRegs}  */
                                    let tree = this.children.find(s => s.path == filePath ||
                                        s.alices == filePath);
                                    if (tree != undefined) {
                                        /*
                                         tree.parseScopeSeperator({
                                                selectorText: UCselector,
                                                parent_stamp: pstamp_key,
                                                parent_stamp_value: pstamp_val
                                            })
                                         */
                                        
                                        let nscope = callCounter == 1 ? _this.parseScopeSeperator({
                                            selectorText: UCselector,
                                            parent_stamp: pstamp_key,
                                            parent_stamp_value: pstamp_val
                                        }) : scopeSelectorText;
                                        //console.log(nscope);
                                        
                                        
                                        //nscope = nscope.trim();    //  <---- REMOVE THIS COMMENT IF ANY MAJOR BUG FORM THIS AREA

                                        
                                        let css = tree.parseStyleSeperator(
                                            styleContent,
                                            nscope,
                                            callCounter);
                                        /*if(filePath.includes("attributetemplate")){
                                            console.log(scopeSelectorText);
                                            console.log(callCounter+"=>"+css);
                                        }*/
                                        externalStyles.push(css);
                                        changed = true;
                                        return '';
                                    }
                                    return '';
                                });
                        }
                        return !changed ? `${selectorText} ${styleContent}` : "";
                    } else return "";

                }
            });

        rtrn = rtrn.replace(patternList.stylesFilterPattern,
            /**
             * @param {string} match 
             * @param {string} key 
             * @param {string} value 
             */
            (match, key, value) => {
                switch (key.toLowerCase()) {
                    case "animation-name":
                        return `${key}: ${value.trimEnd()}_${this.uniqStamp}; `
                    default: return match;
                }
            });

        //if(isChffd)console.log(rtrn +" "+ externalStyles.join(" "));
        return rtrn + " " + externalStyles.join(" ");
    }

    initStampObj() {
        return {
            ucStampAttr: ATTR_OF.UC.UC_STAMP,
            parentStampAttr: ATTR_OF.UC.PARENT_STAMP,

            ucStampVal: _this.globalStampRow.stamp,
            parentStampVal: _this.globalStampRow.stamp,
        }
    }

    /**
     * @param {{selectorText :string,
     *         scopeSelectorText:string,
     *         parent_stamp :string,
     *         parent_stamp_value :string}}
     * @returns 
     */
    parseScopeSeperator({
        selectorText = "", scopeSelectorText = "",
        parent_stamp = "", parent_stamp_value = undefined
    } = {}) {
        let _this = this;
        /*if (selectorText.trim().includes("--")) {
            console.log(selectorText.split("--"));
    
        }*/
        //console.log(scopeSelectorText);
        let rtrn = "";
        let changed = false;
        let trimedVal = "";
        let calltime = 0;
        let preText = '';
        let postText = '';
        let rVal = "";
        selectorText.split(",").forEach(s => {
            changed = false;
            trimedVal = s.trim();
            //console.log(trimedVal);
            calltime = 0;

            rVal = trimedVal.replace(patternList.scopeSelector,
                /**
                 * @param {string} match   
                 * @param {string} code
                 * @param {*} offset 
                 * @param {string} input_string 
                 * @returns 
                 */
                function (
                    match,
                    offset, input_string) {
                    changed = true;
                    calltime++;
                    if (trimedVal == '[SELF_]') {
                        return `${scopeSelectorText} ${_this.nodeName}[${ATTR_OF.UC.UC_STAMP}="${_this.stamp}"]`
                    } else {
                        if (calltime == 1) { // if first time call
                            if (trimedVal.startsWith('[SELF_]')) {
                                return `${scopeSelectorText} [${ATTR_OF.UC.UC_STAMP}="${_this.stamp}"]`;
                            } else {
                                preText = scopeSelectorText + " ";
                                return `[${parent_stamp}="${parent_stamp_value}"]`;
                            }
                        } else {
                            preText = scopeSelectorText;
                            return `[${parent_stamp}="${parent_stamp_value}"]`
                        }
                    }
                    /*return trimedVal == '[SELF_]' ?
                        `${_this.nodeName}[${ATTR_OF.UC.UC_STAMP}="${_this.stamp}"]`  // [${propOpt.ATTR.UC_STAMP}="${_this.tree.stamp}"] 
                        :
                        calltime == 1 ? // if first time 
                            trimedVal.startsWith('[SELF_]') ?
                                `[${ATTR_OF.UC.UC_STAMP}="${_this.stamp}"]`
                                :
                                `[${parent_stamp}="${parent_stamp_value}"]`
                            :
                            `[${parent_stamp}="${parent_stamp_value}"]`;*/
                    return match;
                });
            if (!changed) {
                if (parent_stamp_value != undefined) {
                    let dbl = trimedVal.split(/ *:: */);
                    let sngl = dbl[0].split(/ *: */);
                    sngl[0] += `[${parent_stamp}="${parent_stamp_value}"]`;
                    dbl[0] = sngl.join(":");
                    rVal = dbl.join("::");

                } else {
                    //console.log('--------------------- else part');
                    rVal = trimedVal;
                }
                preText = scopeSelectorText + ' ';
                //console.log(trimedVal + "\n" + rVal);
                //rVal = scopeSelectorText + ' ' + rVal;
            }
            ///console.log(scopeSelectorText + " " + rVal + ",");
            rtrn += preText + '' + rVal + '' + postText + ",";
        });
        rtrn = rtrn.slice(0, -1);
        return rtrn;
    }


    /**
  * @param {string} openTxt 
  * @param {string} closeTxt 
  * @param {string} contents 
  * @param {Function} callback 
  */
    static openClose(openTxt, closeTxt, contents, callback =
        /**
         * @param {string} outText outer string 
         * @param {string} inText inner string 
         * @param {number} txtCount number of `openTxt` found in contents
         */
        (outText, inText, txtCount) => { }) {
        let sIndex = 0;
        let len = contents.length;
        // console.log(contents);
        let opened = 0, closed = 0;
        let rtrn = "";
        let lastoutIndex = 0, lastinIndex = 0;
        for (let index = 0, len = contents.length; index < len; index++) {
            let cnt = contents.charAt(index);
            if (opened == closed && index > 0 && opened > 0) {
                // 
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
        return rtrn;
    }

}
module.exports = { stylerRegs };