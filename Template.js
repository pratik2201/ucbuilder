"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateNode = exports.Template = void 0;
const common_1 = require("ucbuilder/build/common");
const regsManage_1 = require("ucbuilder/build/regs/regsManage");
const fileDataBank_1 = require("ucbuilder/global/fileDataBank");
const filterContent_1 = require("ucbuilder/global/filterContent");
const loadGlobal_1 = require("ucbuilder/global/loadGlobal");
const runtimeOpt_1 = require("ucbuilder/global/runtimeOpt");
const stylerRegs_1 = require("ucbuilder/global/stylerRegs");
const userControlStamp_1 = require("ucbuilder/global/userControlStamp");
const Usercontrol_1 = require("ucbuilder/Usercontrol");
const enumAndMore_1 = require("ucbuilder/enumAndMore");
const codeFileInfo_1 = require("ucbuilder/build/codeFileInfo");
const objectOpt_1 = require("ucbuilder/global/objectOpt");
const shapes_1 = require("ucbuilder/global/drawing/shapes");
class Template {
    constructor() {
        this.extended = {
            wholeCSS: "",
            fileStamp: "",
            _templeteNode: undefined,
            stampRow: undefined,
            parentUc: undefined,
            regsMng: new regsManage_1.regsManage(),
            cssVarStampKey: "0",
            setCSS_globalVar(key, value) {
                this._templeteNode.extended.setCSS_globalVar(key, value);
            },
            setCSS_localVar(key, value) {
                this._templeteNode.extended.setCSS_localVar(key, value);
            },
            setCSS_internalVar(key, value) {
                this._templeteNode.extended.setCSS_internalVar(key, value);
            },
        };
        Template._CSS_VAR_STAMP++;
        this.extended.cssVarStampKey = "t" + Usercontrol_1.Usercontrol._CSS_VAR_STAMP;
    }
}
exports.Template = Template;
Template.extractArgs = (args) => objectOpt_1.newObjectOpt.extractArguments(args);
Template.getTemplates = {
    /**
     * @param  htmlContents content
     * @param   mainFilePath main html file path
     * @param {(node:TemplatePathOptions)=>{}} callback call each templateNode
     */
    loopThrough(htmlContents, mainFilePath, callback) {
        let mainTag = document.createElement("pre");
        mainTag.innerHTML = htmlContents;
        let tList = mainTag.querySelectorAll(":scope > [x-from]");
        if (tList.length == 0) {
            callback({
                name: common_1.propOpt.ATTR.TEMPLETE_DEFAULT,
                mainFilePath: mainFilePath,
                htmlContents: htmlContents,
                cssContents: fileDataBank_1.FileDataBank.readFile(mainFilePath + ".scss"),
            });
        }
        else {
            tList.forEach((element) => {
                let fInfo = new codeFileInfo_1.FileInfo();
                fInfo.parse(element.getAttribute("x-from"));
                mainFilePath = fInfo.fullPath;
                callback({
                    name: element.getAttribute(common_1.propOpt.ATTR.ACCESS_KEY),
                    mainFilePath: mainFilePath,
                    htmlContents: fileDataBank_1.FileDataBank.readFile(mainFilePath + ".html"),
                    cssContents: fileDataBank_1.FileDataBank.readFile(mainFilePath + ".scss"),
                });
            });
        }
    },
    /**
     * @param {string} htmlContents content
     * @param {string} mainFilePath main html file path
     * @returns {TemplatePathOptions[] & {}}
     */
    byContents(htmlContents, mainFilePath, returnArray = true) {
        if (returnArray === true) {
            let rtrnAr = [];
            this.loopThrough(htmlContents, mainFilePath, (node) => {
                rtrnAr.push(node);
            });
            return rtrnAr;
        }
        else {
            let rtrnObj = {};
            this.loopThrough(htmlContents, mainFilePath, (node) => {
                rtrnObj[node.name] = node;
            });
            return rtrnObj;
        }
    },
    /**
     * @param {string} htmlFilePath
     * @returns {TemplatePathOptions[] & {}}
     */
    byHTMLFilePath(htmlFilePath, returnArray = true) {
        let mainFilePath = common_1.strOpt.trim_(htmlFilePath, ".html");
        let htmlContents = fileDataBank_1.FileDataBank.readFile(mainFilePath + ".html");
        return this.byContents(htmlContents, mainFilePath, returnArray);
    },
    /**
     * @param {string} htmlFilePath
     * @returns {TemplatePathOptions[] & {}}
     */
    byDirectory(jsFilepath, returnArray = true) {
        if (returnArray) {
            let rtrnAr = [];
            this.loopDirectory(jsFilepath, (row) => {
                rtrnAr.push(row);
            });
            return rtrnAr;
        }
        else {
            let rtrnObj = {};
            this.loopDirectory(jsFilepath, (node) => {
                rtrnObj[node.name] = node;
            });
            return rtrnObj;
        }
    },
    /**
     * @param {string} filepath
     * @returns {TemplatePathOptions[] & {}}
     */
    loopDirectory(filepath, callback = (row) => { }) {
        let fs = require("fs");
        filepath = filepath.toLowerCase();
        let fpart = common_1.pathInfo.getFileInfoPartly(filepath);
        let DirectoryContents = fs.readdirSync(fpart.dirPath + "/");
        DirectoryContents.forEach((filename) => {
            filename = filename.toLowerCase();
            if (filename.endsWith(".html") &&
                filename.startsWith(fpart.fileName + ".tpt")) {
                let fnm = fpart.fileName + ".tpt";
                let extLessFileName = common_1.strOpt.trim_(filename, ".html");
                let tp = common_1.strOpt._trim(extLessFileName, fnm);
                tp = tp.trim();
                let row = Object.assign({}, enumAndMore_1.templatePathOptions);
                row.name = tp != "" ? tp._trim(".") : common_1.propOpt.ATTR.TEMPLETE_DEFAULT;
                row.mainFilePath = common_1.pathInfo.cleanPath(fpart.dirPath + extLessFileName);
                row.htmlContents = fileDataBank_1.FileDataBank.readFile(row.mainFilePath + ".html");
                row.cssContents = fileDataBank_1.FileDataBank.readFile(row.mainFilePath + ".scss");
                callback(row);
            }
        });
    },
};
Template._CSS_VAR_STAMP = 0;
class TemplateNode {
    constructor(main) {
        this.extended = {
            fileStamp: "",
            main: undefined,
            stampRow: undefined,
            parentUc: undefined,
            wrapper: undefined,
            size: new shapes_1.Size(),
            regsMng: new regsManage_1.regsManage(),
            setCSS_globalVar(key, value) {
                stylerRegs_1.stylerRegs.__VAR.SETVALUE(key, '' + this.stampRow.styler.rootInfo.id, "g", value);
            },
            setCSS_localVar(key, value) {
                let _ext = this.main.extended;
                stylerRegs_1.stylerRegs.__VAR.SETVALUE(key, _ext.cssVarStampKey, "l", value, this.parentUc.ucExtends.self);
            },
            setCSS_internalVar(key, value) {
                let _ext = this.main.extended;
                stylerRegs_1.stylerRegs.__VAR.SETVALUE(key, stylerRegs_1.stylerRegs.internalKey, "i", value, this.parentUc.ucExtends.self);
            },
            getCSS_globalVar(key) {
                return document.body.style.getPropertyValue(stylerRegs_1.stylerRegs.__VAR.getKeyName(key, '' + this.stampRow.styler.rootInfo.id, "g"));
            },
            getCSS_localVar(key) {
                return this.parentUc.ucExtends.self.style.getPropertyValue(stylerRegs_1.stylerRegs.__VAR.getKeyName(key, this.main.extended.cssVarStampKey, "l"));
            },
            getCSS_internalVar(key) {
                return this.parentUc.ucExtends.self.style.getPropertyValue(stylerRegs_1.stylerRegs.__VAR.getKeyName(key, stylerRegs_1.stylerRegs.internalKey, "i"));
            },
            generateContent(jsonRow) {
                let dta = this.stampRow.content;
                dta = this.Events.beforeGenerateContent(dta, jsonRow);
                dta = this.regsMng.parse(jsonRow, dta);
                dta = this.Events.onGenerateContent(dta, jsonRow);
                return dta;
            },
            generateNode(jsonRow) {
                let dta = this.generateContent(jsonRow);
                let element = dta.$();
                this.stampRow.passElement(element);
                this.Events.onGenerateNode(element, jsonRow);
                return element;
            },
            initializecomponent: (_args, tptPathOpt, tptname) => {
                let tptExt = this.extended;
                _args.source.cfInfo = new codeFileInfo_1.codeFileInfo(".tpt");
                let toj = Object.assign({}, enumAndMore_1.tptOptions);
                let param0 = Object.assign(toj, _args);
                // let param0 = newObjectOpt.copyProps(_args, tptOptions);
                _args.source.cfInfo.parseUrl(tptPathOpt.mainFilePath);
                if (tptname !== common_1.propOpt.ATTR.TEMPLETE_DEFAULT) {
                    let fpath = param0.source.cfInfo.html.rootPath;
                    fpath = common_1.strOpt.trim_(fpath, ".html", ".scss");
                    fpath += "." + tptname;
                    param0.source.cfInfo.html.parse(fpath + ".html", false);
                    param0.source.cfInfo.style.parse(fpath + ".scss", false);
                }
                param0.source.templateName = tptPathOpt.name;
                tptExt.stampRow = userControlStamp_1.userControlStamp.getStamp(param0.source);
                let htEle = tptExt.stampRow.dataHT;
                Array.from(tptExt.stampRow.dataHT.attributes)
                    .filter((s) => s.nodeName.toLowerCase().startsWith("x.temp-"))
                    .forEach((s) => htEle.removeAttribute(s.nodeName));
                let eleHT = param0.elementHT;
                tptExt.parentUc = param0.parentUc;
                if (tptExt.parentUc != undefined)
                    tptExt.parentUc.ucExtends.stampRow.styler.pushChild(param0.source.cfInfo.mainFilePath +
                        "" +
                        (param0.source.templateName == ""
                            ? ""
                            : "@" + param0.source.templateName), tptExt.stampRow.styler, eleHT.nodeName);
                tptPathOpt.cssContents = tptExt.stampRow.styler.parseStyleSeperator_sub({
                    data: tptPathOpt.cssContents == undefined
                        ? fileDataBank_1.FileDataBank.readFile(param0.source.cfInfo.style.rootPath)
                        : tptPathOpt.cssContents,
                    localNodeElement: tptExt.parentUc.ucExtends.self,
                    cssVarStampKey: tptExt.main.extended.cssVarStampKey,
                });
                loadGlobal_1.LoadGlobal.pushRow({
                    url: param0.source.cfInfo.style.rootPath,
                    stamp: tptExt.stampRow.stamp,
                    reloadDesign: param0.source.reloadDesign,
                    reloadKey: param0.source.reloadKey,
                    cssContents: tptPathOpt.cssContents,
                });
                tptExt.main.extended.wholeCSS += tptPathOpt.cssContents;
                tptExt.Events.onDataExport = (data) => param0.parentUc.ucExtends.Events.onDataExport(data);
                document.body.appendChild(htEle);
                this.extended.size.setBy.HTMLEle(htEle);
                htEle.remove();
            },
            Events: {
                beforeGenerateContent: (content, jsonRow) => content,
                onGenerateContent: (content, jsonRow) => content,
                onGenerateNode: (mainNode, jsonRow) => { },
                onDataExport: (data) => {
                    return false;
                },
                onDataImport: (data) => {
                    return false;
                },
            },
            find: (skey, fromHT) => {
                let exp = /(["=> \w\[\]-^|#~$*.+]*)(::|:)([-\w\(\)]+)/g;
                let ar = skey.split(",");
                let ext = this.extended;
                let q = "";
                let uniqStamp = ext.stampRow.uniqStamp;
                ar = ar.map((s) => {
                    s = filterContent_1.FilterContent.select_inline_filter(s, uniqStamp);
                    return s;
                });
                return Array.from(ext.wrapper.querySelectorAll(ar.join(",")));
            },
            getAllControls: (specific, fromHT) => {
                let childs = {};
                let uExt = this;
                let fromElement = fromHT;
                if (specific != undefined) {
                    let uniqStamp = uExt.extended.stampRow.uniqStamp;
                    specific.forEach((itmpath) => {
                        if (!(itmpath in childs)) {
                            let ele = fromElement.querySelector(`[${common_1.propOpt.ATTR.ACCESS_KEY}='${itmpath}'][${runtimeOpt_1.ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`);
                            fillObj(itmpath, ele);
                        }
                    });
                }
                else {
                    let uniqStamp = uExt.extended.stampRow.uniqStamp;
                    let eleAr = Array.from(fromElement.querySelectorAll(`[${common_1.propOpt.ATTR.ACCESS_KEY}][${runtimeOpt_1.ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`));
                    eleAr.forEach((ele) => {
                        fillObj(ele.getAttribute(common_1.propOpt.ATTR.ACCESS_KEY), ele);
                    });
                }
                function fillObj(itmpath, htEle) {
                    if (htEle != undefined)
                        childs[itmpath] = htEle;
                    else
                        console.warn("empty-controls-returned");
                }
                return childs;
            },
            templeteList: {},
            fillTemplates: (mainNode) => {
                let ext = this.extended;
                ext.templeteList = {};
                let nodes = mainNode.querySelectorAll(`:scope > [${common_1.propOpt.ATTR.TEMPLETE_ACCESS_KEY}]`);
                if (nodes.length == 0) {
                    ext.templeteList[common_1.propOpt.ATTR.TEMPLETE_DEFAULT] = mainNode.outerHTML;
                }
                else {
                    let mNode = mainNode.cloneNode(true);
                    mNode.innerHTML = "";
                    nodes.forEach((node) => {
                        let role = node.getAttribute(common_1.propOpt.ATTR.TEMPLETE_ACCESS_KEY);
                        let roleLwr = role.toLowerCase();
                        if (!(roleLwr in ext.templeteList)) {
                            mNode.innerHTML = node.innerHTML;
                            ext.templeteList[role] = mNode.outerHTML;
                        }
                    });
                }
            },
        };
        this.extended.main = main;
    }
}
exports.TemplateNode = TemplateNode;
TemplateNode._CSS_VAR_STAMP = 0;
