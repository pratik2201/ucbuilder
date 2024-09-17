"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stylerRegs = void 0;
const aliceManager_1 = require("ucbuilder/build/codefile/aliceManager");
const common_1 = require("ucbuilder/build/common");
const loadGlobal_1 = require("ucbuilder/global/loadGlobal");
const fileDataBank_1 = require("ucbuilder/global/fileDataBank");
const openCloser_1 = require("ucbuilder/global/openCloser");
const rootPathHandler_1 = require("ucbuilder/global/rootPathHandler");
const runtimeOpt_1 = require("ucbuilder/global/runtimeOpt");
const findAndReplace_1 = require("ucbuilder/global/findAndReplace");
const patternList = {
    globalFinderPathPattern: /path=(["'`])([\s\S]*?)\1/gim,
    globalFinderPattern: /(.|\n)<gload([\n\r\w\W.]*?)>/gim,
    styleTagSelector: /<style([\n\r\w\W.]*?)>([\n\r\w\W.]*?)<\/style>/gi,
    styleCommentRegs: /\/\*([\s\S]*?)\*\//gi,
    subUcFatcher: /\[inside=("|'|`)([\s\S]*?)\1\]([\S\s]*)/gim,
    themeCSSLoader: /\[(theme|css)=(["'`])*([\s\S]*?)\2\]/gim,
    stylesFilterPattern: /(animation-name|\$[lgi]-\w+)\s*:\s*(.*?)\s*;/gim,
    varValuePrinterPattern: /var\s*\(\s*(\$[lgi]-\w+)\s*\)/gim,
    scopeSelector: /\[SELF_]/gm,
    rootExcludePattern: /(.*?)(:root|:exclude)/gi,
};
const styleSeperatorOptions = {
    data: "",
    scopeSelectorText: "",
    callCounter: 0,
    isForRoot: false,
    _rootinfo: Object.assign({}, findAndReplace_1.rootPathRow),
    localNodeElement: undefined,
    cssVarStampKey: "",
};
class stylerRegs {
    constructor(rootInfo, generateStamp = false) {
        this.stamp = "";
        this.uniqStamp = "";
        this.aliceMng = new aliceManager_1.AliceManager();
        this.rootInfo = undefined;
        this.nodeName = "";
        this.parent = undefined;
        this.children = [];
        this.alices = "";
        this.path = "";
        this.cssVars = [];
        this.opnClsr = new openCloser_1.openCloser();
        this.rootInfo = rootInfo;
        stylerRegs.stampCallTimes++;
        stylerRegs.stampNo++;
        this.stamp = "" + stylerRegs.stampNo;
        this.uniqStamp = "" + stylerRegs.stampCallTimes;
        this.nodeName = "f" + common_1.uniqOpt.randomNo();
    }
    static pushPublicStyles() {
        Promise.resolve().then(() => __importStar(require("ucbuilder/ResourcesUC"))).then(({ ResourcesUC }) => {
            rootPathHandler_1.rootPathHandler.source.forEach((row) => {
                let _stylepath = row.tInfo.replaceWith + "/styles.scss"; //row.tInfo.replaceLowerCaseText + "/styles.scss";
                let node = row; //rootPathHandler.convertToRow(row, true);
                node.isAlreadyFullPath = true;
                let styler = new stylerRegs(node, true);
                ResourcesUC.styler.pushChild(node.alices, styler, node.alices);
                let _data = fileDataBank_1.FileDataBank.readFile(_stylepath, {
                    isFullPath: true,
                    replaceContentWithKeys: true,
                });
                if (_data != undefined) {
                    loadGlobal_1.LoadGlobal.pushRow({
                        url: _stylepath,
                        cssContents: styler.parseStyleSeperator_sub({ data: _data }),
                        stamp: styler.stamp,
                    });
                }
            });
        });
    }
    LoadGlobalPath(data) {
        let _this = this;
        data.replace(patternList.globalFinderPathPattern, (match, quationMark, paths) => {
            paths.split(";").forEach((s) => {
                loadGlobal_1.LoadGlobal.pushRow({
                    url: s.trim(),
                    stamp: _this.stamp,
                    reloadDesign: false,
                });
            });
            return "";
        });
    }
    parseStyle(data) {
        let _this = this;
        let rtrn = data.replace(patternList.globalFinderPattern, (match, escapeChar, contents, offset, input_string) => {
            if (escapeChar === `\\`)
                return match;
            _this.LoadGlobalPath(contents);
            return "";
        });
        rtrn = rtrn.replace(patternList.styleTagSelector, function (match, styleAttrs, styleContent, offset, input_string) {
            return `<style ${styleAttrs}> ${_this.parseStyleSeperator_sub({
                data: styleContent,
            })} </style>`;
        });
        return rtrn;
    }
    parseStyleSeperator_sub(_args) {
        let _this = this;
        if (_args.data == undefined)
            return "";
        let _params = Object.assign({}, styleSeperatorOptions);
        _params = Object.assign(_params, _args);
        _params.callCounter++;
        let externalStyles = [];
        let isChffd = false;
        let pstamp_key = runtimeOpt_1.ATTR_OF.UC.PARENT_STAMP;
        let pstamp_val = _this.stamp;
        if (_params.isForRoot) {
            pstamp_key = runtimeOpt_1.ATTR_OF.UC.ROOT_STAMP;
            pstamp_val = '' + (_params._rootinfo == undefined
                ? _this.rootInfo.id
                : _params._rootinfo.id);
        }
        let rtrn = _params.data.replace(patternList.styleCommentRegs, "");
        rtrn = rtrn.replace(patternList.themeCSSLoader, (match, code, quationMark, path, offset, input_string) => {
            isChffd = true;
            switch (code) {
                case "theme":
                    return fileDataBank_1.FileDataBank.readFile(path);
                case "css":
                    let isGoodToAdd = loadGlobal_1.LoadGlobal.isGoodToPush(path);
                    if (isGoodToAdd) {
                        let cssContents = _this.parseStyleSeperator_sub({
                            data: fileDataBank_1.FileDataBank.readFile(path),
                        });
                        loadGlobal_1.LoadGlobal.pushRow({
                            url: path,
                            stamp: this.stamp,
                            reloadDesign: false,
                            cssContents: cssContents,
                        });
                    }
                    return "";
            }
        });
        rtrn = rtrn.trim().replace(/(;|,|{|})[\n\r ]*/gi, "$1 ");
        rtrn = this.opnClsr.doTask("{", "}", rtrn, (selectorText, styleContent, count) => {
            if (count == 1) {
                return `${_this.parseScopeSeperator({
                    selectorText: selectorText,
                    scopeSelectorText: _params.scopeSelectorText,
                    parent_stamp: pstamp_key,
                    parent_stamp_value: pstamp_val,
                })}{${styleContent}} `;
            }
            else {
                let changed = false;
                selectorText.split(",").forEach((pselctor) => {
                    pselctor.trim().replace(patternList.rootExcludePattern, (match, rootAlices, nmode) => {
                        switch (nmode) {
                            case ":root":
                                changed = true;
                                if (rootAlices == undefined) {
                                    externalStyles.push(_this.parseStyleSeperator_sub({
                                        data: _params.scopeSelectorText + styleContent,
                                        callCounter: _params.callCounter,
                                        isForRoot: true,
                                    }));
                                }
                                else {
                                    externalStyles.push(_this.parseStyleSeperator_sub({
                                        data: _params.scopeSelectorText + styleContent,
                                        callCounter: _params.callCounter,
                                        isForRoot: true,
                                        _rootinfo: rootPathHandler_1.rootPathHandler.getInfoByAlices(`@${rootAlices}:`),
                                    }));
                                }
                                break;
                            case ":exclude":
                                externalStyles.push(styleContent);
                                changed = true;
                                return "";
                        }
                        return "";
                    });
                });
                if (!changed) {
                    changed = false;
                    let trimSelector = selectorText.trim();
                    if (trimSelector.startsWith("@keyframes")) {
                        return `${trimSelector}_${this.uniqStamp}{${styleContent}} `;
                    }
                    else {
                        selectorText.replace(patternList.subUcFatcher, (match, quationMark, filePath, UCselector) => {
                            filePath = filePath.toLowerCase();
                            UCselector = UCselector.trim();
                            let tree = this.children.find((s) => s.path == filePath || s.alices == filePath);
                            if (tree != undefined) {
                                let nscope = _params.callCounter == 1
                                    ? _this.parseScopeSeperator({
                                        selectorText: UCselector,
                                        parent_stamp: runtimeOpt_1.ATTR_OF.UC.UC_STAMP,
                                        parent_stamp_value: pstamp_val,
                                    })
                                    : _params.scopeSelectorText;
                                let css = tree.parseStyleSeperator_sub({
                                    data: styleContent,
                                    scopeSelectorText: nscope,
                                    callCounter: _params.callCounter,
                                });
                                externalStyles.push(css);
                                changed = true;
                                return "";
                            }
                            return "";
                        });
                    }
                    return !changed ? `${selectorText} ${styleContent}` : "";
                }
                else
                    return "";
            }
        });
        rtrn = rtrn.replace(patternList.varValuePrinterPattern, (match, varName) => {
            let ky = varName.toLowerCase();
            let scope = ky.charAt(1);
            let uniqId = stylerRegs.internalKey;
            switch (scope) {
                case "g":
                    uniqId = '' + this.rootInfo.id;
                    break;
                case "l":
                    uniqId = this.uniqStamp;
                    break;
            }
            return stylerRegs.__VAR.GETVALUE(ky.substring(3).trim(), uniqId, scope);
        });
        rtrn = rtrn.replace(patternList.stylesFilterPattern, (match, key, value) => {
            let ky = key.toLowerCase().trim();
            switch (ky) {
                case "animation-name":
                    return `${key}: ${value.trimEnd()}_${this.uniqStamp}; `;
                default:
                    let scope = ky.charAt(1);
                    switch (scope) {
                        case "g":
                            stylerRegs.__VAR.SETVALUE(ky.substring(3).trim(), '' + this.rootInfo.id, scope, value);
                            return "";
                        case "l":
                            stylerRegs.__VAR.SETVALUE(ky.substring(3).trim(), this.uniqStamp, scope, value, _params.localNodeElement);
                            return "";
                        case "i":
                            stylerRegs.__VAR.SETVALUE(ky.substring(3).trim(), stylerRegs.internalKey, scope, value, _params.localNodeElement);
                            return "";
                    }
                    return match;
            }
        });
        return rtrn + " " + externalStyles.join(" ");
    }
    parseScopeSeperator({ selectorText = "", scopeSelectorText = "", parent_stamp = "", parent_stamp_value = undefined, } = {}) {
        let _this = this;
        let rtrn = "";
        let changed = false;
        let trimedVal = "";
        let calltime = 0;
        let preText = "";
        let postText = "";
        let rVal = "";
        selectorText.split(",").forEach((s) => {
            changed = false;
            trimedVal = s.trim();
            calltime = 0;
            rVal = trimedVal.replace(patternList.scopeSelector, (match, offset, input_string) => {
                changed = true;
                calltime++;
                if (trimedVal == "[SELF_]") {
                    return `${scopeSelectorText} ${_this.nodeName}[${runtimeOpt_1.ATTR_OF.UC.UC_STAMP}="${_this.stamp}"]`;
                }
                else {
                    if (calltime == 1) {
                        if (trimedVal.startsWith("[SELF_]")) {
                            return `${scopeSelectorText} [${runtimeOpt_1.ATTR_OF.UC.UC_STAMP}="${_this.stamp}"]`;
                        }
                        else {
                            preText = scopeSelectorText + " ";
                            return `[${parent_stamp}="${parent_stamp_value}"]`;
                        }
                    }
                    else {
                        preText = scopeSelectorText;
                        return `[${parent_stamp}="${parent_stamp_value}"]`;
                    }
                }
                return match;
            });
            if (!changed) {
                if (parent_stamp_value != undefined) {
                    let dbl = trimedVal.split(/ *:: */);
                    let sngl = dbl[0].split(/ *: */);
                    sngl[0] += `[${parent_stamp}="${parent_stamp_value}"]`;
                    dbl[0] = sngl.join(":");
                    rVal = dbl.join("::");
                }
                else {
                    rVal = trimedVal;
                }
                preText = scopeSelectorText + " ";
            }
            rtrn += preText + "" + rVal + "" + postText + ",";
        });
        rtrn = rtrn.slice(0, -1);
        return rtrn;
    }
    pushChild(path, node, nodeName) {
        let key = path.toLowerCase();
        let sreg = this.children.find((s) => s.path == key);
        if (sreg == undefined) {
            node.alices = nodeName.toLowerCase();
            node.path = key;
            node.parent = this;
            this.children.push(node);
        }
    }
}
exports.stylerRegs = stylerRegs;
stylerRegs.stampNo = 0;
stylerRegs.stampCallTimes = 0;
stylerRegs.internalKey = 'int' + common_1.uniqOpt.randomNo();
/*initStampObj(): any {
  return {
    ucStampAttr: ATTR_OF.UC.UC_STAMP,
    parentStampAttr: ATTR_OF.UC.PARENT_STAMP,
    ucStampVal: _this.globalStampRow.stamp,
    parentStampVal: _this.globalStampRow.stamp,
  };
}*/
stylerRegs.__VAR = {
    getKeyName(key, uniqId, code) {
        return `--${key}${uniqId}${code}`;
    },
    SETVALUE(key, uniqId, code, value, tarEle = document.body) {
        tarEle.style.setProperty(this.getKeyName(key, uniqId, code), value);
        return;
    },
    GETVALUE(key, uniqId, code) {
        return ` var(${this.getKeyName(key, uniqId, code)}) `;
    },
};
