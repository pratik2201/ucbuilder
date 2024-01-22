"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonParser = void 0;
const commonGenerator_1 = require("ucbuilder/build/codefile/commonGenerator");
const codeFileInfo_1 = require("ucbuilder/build/codeFileInfo");
const buildRow_js_1 = require("ucbuilder/build/buildRow.js");
const common_1 = require("ucbuilder/build/common");
const filterContent_1 = require("ucbuilder/global/filterContent");
const fileDataBank_1 = require("ucbuilder/global/fileDataBank");
const aliceManager_1 = require("ucbuilder/build/codefile/aliceManager");
const Template_1 = require("ucbuilder/Template");
class commonParser {
    constructor(bldr) {
        this.rows = [];
        this.aliceMng = new aliceManager_1.AliceManager();
        this._filterText = new filterContent_1.FilterContent();
        this.bldr = bldr;
        this.gen = new commonGenerator_1.commonGenerator();
    }
    init(filePath, htmlContents = undefined) {
        let row = this.fill(filePath, htmlContents);
        if (row != undefined)
            this.rows.push(row);
    }
    fill(filePath, htmlContents = undefined) {
        let _row = common_1.objectOpt.clone(buildRow_js_1.commonRow);
        _row.src = new codeFileInfo_1.codeFileInfo(codeFileInfo_1.codeFileInfo.getExtType(filePath));
        if (!_row.src.parseUrl(filePath))
            return undefined;
        let code = (htmlContents == undefined) ? fileDataBank_1.FileDataBank.readFile(_row.src.html.rootPath, {
            replaceContentWithKeys: false
        }) : htmlContents;
        let isUserControl = _row.src.extCode == common_1.buildOptions.extType.Usercontrol;
        this.formHT = code.$();
        this.aliceMng.fillAlices(this.formHT);
        _row.designer.className =
            _row.codefile.baseClassName = "Designer";
        _row.codefile.className = _row.src.name;
        if (!isUserControl) {
            _row.designer.baseClassName = "Template";
            let tptbyCntnt = Template_1.Template.getTemplates.byDirectory(filePath);
            let tpts = _row.designer.templetes;
            tptbyCntnt.forEach(template => {
                let rolelwr = template.name.toLowerCase();
                if (tpts.findIndex(s => s.name.toLowerCase() == rolelwr) != -1)
                    return;
                let controls = [];
                let cntHT = template.htmlContents.$();
                let _htEleAr = Array.from(cntHT.querySelectorAll(`[${common_1.propOpt.ATTR.ACCESS_KEY}]`));
                _htEleAr.forEach(e => {
                    let scope = e.getAttribute(common_1.propOpt.ATTR.SCOPE_KEY);
                    if (scope == undefined)
                        scope = 'public';
                    controls.push({
                        name: e.getAttribute("x-name"),
                        nodeName: e.nodeName,
                        proto: common_1.objectOpt.getClassName(e),
                        scope: scope,
                    });
                });
                tpts.push({
                    name: template.name,
                    scope: "public",
                    controls: controls
                });
            });
        }
        else {
            _row.designer.baseClassName = "Usercontrol";
            let elem = Array.from(this.formHT.querySelectorAll(`[${common_1.propOpt.ATTR.ACCESS_KEY}]`));
            elem.forEach((ele) => {
                let nameAttr = ele.getAttribute(common_1.propOpt.ATTR.ACCESS_KEY);
                let nodeName = ele.nodeName;
                let scope = ele.getAttribute(common_1.propOpt.ATTR.SCOPE_KEY);
                if (scope == undefined)
                    scope = 'public';
                let proto = Object.getPrototypeOf(ele).constructor.name;
                if (ele.hasAttribute("x-from")) {
                    let _subpath = ele.getAttribute("x-from");
                    let uFInf = new codeFileInfo_1.codeFileInfo(codeFileInfo_1.codeFileInfo.getExtType(_subpath));
                    uFInf.parseUrl(_subpath);
                    console.log(filePath);
                    console.log(uFInf.html.fullPath);
                    if (uFInf.existCodeFile || uFInf.existHtmlFile || uFInf.existDeignerFile) {
                        _row.designer.controls.push({
                            name: nameAttr,
                            proto: proto,
                            scope: scope,
                            type: uFInf.extCode,
                            nodeName: uFInf.name,
                            src: uFInf,
                        });
                    }
                }
                else {
                    _row.designer.controls.push({
                        name: nameAttr,
                        proto: proto,
                        scope: scope,
                        type: 'none',
                        nodeName: nodeName,
                    });
                }
            });
        }
        return _row;
    }
}
exports.commonParser = commonParser;
