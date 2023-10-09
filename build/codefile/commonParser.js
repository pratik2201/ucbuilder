const { commonGenerator } = require('@ucbuilder:/build/codefile/commonGenerator');
const { codeFileInfo } = require('@ucbuilder:/build/codeFileInfo');
const { buildRow } = require('@ucbuilder:/build/buildRow.js');
const { buildOptions, objectOpt, propOpt, uniqOpt } = require('@ucbuilder:/build/common');
const { filterContent } = require('@ucbuilder:/global/filterContent');
const { fileDataBank } = require('@ucbuilder:/global/fileDataBank');
const { aliceManager } = require('@ucbuilder:/build/codefile/aliceManager');
const { jqFeatures } = require('@ucbuilder:/global/jqFeatures');

class commonParser {

    /**
     * @type {buildRow.commonRow[]}
     */
    rows = [];

    /**
     * @param {builder} bldr 
     * @param {string} extCode 
     */
    constructor(bldr) {
        this.bldr = bldr;
        this.gen = new commonGenerator();
    }
    /**
     * @param {string} filePath 
     * @param {string} htmlContents 
     */
    init(filePath, htmlContents = undefined) {
        this.rows.push(this.fill(filePath, htmlContents));
    }
    aliceMng = new aliceManager();
    _filterText = new filterContent();
    /** 
     * @param {string} filePath 
     * @param {string} htmlContents 
     * @returns 
     */
    fill(filePath, htmlContents = undefined) {
        /**
         * @type {buildRow.commonRow}
         */
        let _row = objectOpt.deepClone1(buildRow.commonRow);

        _row.src = new codeFileInfo(codeFileInfo.getExtType(filePath));

        _row.src.parseUrl(filePath);

        let code = (htmlContents == undefined) ? fileDataBank.readFile(_row.src.html.rootPath, {
            replaceContentWithKeys: false
        }) : htmlContents;
        let isUserControl = _row.src.extCode == buildOptions.extType.Usercontrol;
        /*if (_row.src.html.fullPath.includes("attributeTemplate")) {
            console.log(code);
            var div = document.createElement('pre');
            div.innerHTML = code;
            console.log(div.innerHTML);
            //jqFeatures.data.initElement(div.firstChild);
            console.log(div.firstChild);
           // console.log(this.formHT.outerHTML);
        }*/

        //console.log(htmlContents);
        /** @type {HTMLElement}  */
        this.formHT = code.$();

        this.aliceMng.fillAlices(this.formHT);
        //console.log(this.aliceMng.source.length);
        _row.designer.className =
        _row.codefile.baseClassName = "designer";
        _row.codefile.className = _row.src.name;
        if (!isUserControl) {
            _row.designer.baseClassName = "Template";
            let templates = this.formHT.querySelectorAll(`:scope > tpt[${propOpt.ATTR.TEMPLETE_ACCESS_KEY}]`);
            if (templates.length == 0) {
                /** @type {buildRow.templeteControls[]}  */
                let controls = [];
                let _htEleAr = Array.from(this.formHT.querySelectorAll(`[${propOpt.ATTR.ACCESS_KEY}]`));
                _htEleAr.forEach(e => {
                    let scope = e.getAttribute(propOpt.ATTR.SCOPE_KEY);
                    if (scope == undefined)
                        scope = 'public';
                    controls.push({
                        name: e.getAttribute("x-name"),
                        nodeName: e.nodeName,
                        proto: objectOpt.getClassName(e),
                        scope: scope
                    })
                });
                _row.designer.templetes.push({
                    name: "primary",
                    scope: "public",
                    controls: controls
                });
            } else {
                let tpts = _row.designer.templetes;
                templates.forEach(template => {
                    let role = template.getAttribute(propOpt.ATTR.TEMPLETE_ACCESS_KEY);
                    let rolelwr = role.toLowerCase();
                    if (tpts.findIndex(s => s.name.toLowerCase() == rolelwr) != -1) return;
                    /** @type {buildRow.controls[]}  */
                    let controls = [];
                    let _htEleAr = Array.from(template.querySelectorAll(`[${propOpt.ATTR.ACCESS_KEY}]`));
                    _htEleAr.forEach(e => {
                        let scope = e.getAttribute(propOpt.ATTR.SCOPE_KEY);
                        if (scope == undefined)
                            scope = 'public';
                        controls.push({
                            name: e.getAttribute("x-name"),
                            nodeName: e.nodeName,
                            proto: objectOpt.getClassName(e),
                            scope: scope
                        })
                    });
                    tpts.push({
                        name: role,
                        scope: "public",
                        controls: controls
                    });
                });

            }
        } else {
            _row.designer.baseClassName = "Usercontrol";
            let elem = Array.from(this.formHT.querySelectorAll(`[${propOpt.ATTR.ACCESS_KEY}]`));
            elem.forEach((ele) => {
                let nameAttr = ele.getAttribute(propOpt.ATTR.ACCESS_KEY);
                let nodeName = ele.nodeName;
                let scope = ele.getAttribute(propOpt.ATTR.SCOPE_KEY);
                if (scope == undefined)
                    scope = 'public';
                let proto = Object.getPrototypeOf(ele).constructor.name;

                if (isUserControl && ele.hasAttribute("x-from")) {

                    let _subpath = /*(pathToLoad != "" ? pathToLoad :*/ ele.getAttribute("x-from");

                    let uFInf = new codeFileInfo(codeFileInfo.getExtType(_subpath)); //+ ".html"
                    uFInf.parseUrl(_subpath);
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
                } else {
                    _row.designer.controls.push({
                        name: nameAttr,
                        proto: proto,
                        scope: scope,
                        type: buildOptions.extType.none,
                        nodeName: nodeName,
                    });
                }
            });
        }




        return _row;
    }
}
module.exports = { commonParser }