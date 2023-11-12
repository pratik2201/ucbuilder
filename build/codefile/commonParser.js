const { commonGenerator } = require('@ucbuilder:/build/codefile/commonGenerator');
const { codeFileInfo } = require('@ucbuilder:/build/codeFileInfo');
const { buildRow } = require('@ucbuilder:/build/buildRow.js');
const { buildOptions, objectOpt, propOpt, uniqOpt } = require('@ucbuilder:/build/common');
const { filterContent } = require('@ucbuilder:/global/filterContent');
const { fileDataBank } = require('@ucbuilder:/global/fileDataBank');
const { aliceManager } = require('@ucbuilder:/build/codefile/aliceManager');
const { jqFeatures } = require('@ucbuilder:/global/jqFeatures');
const { Template } = require('@ucbuilder:/Template');

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
       
        /** @type {HTMLElement}  */
        this.formHT = code.$();

        this.aliceMng.fillAlices(this.formHT);
        _row.designer.className =
            _row.codefile.baseClassName = "designer";
        _row.codefile.className = _row.src.name;
        if (!isUserControl) {
            let cntnt = Template.getTemplates.byDirectory(filePath);
            _row.designer.baseClassName = "Template";
            let tptbyCntnt = Template.getTemplates.byContents(code, _row.src.mainFilePath);
            
            let tpts = _row.designer.templetes;
            tptbyCntnt.forEach(template => {
                let rolelwr = template.name.toLowerCase();
                if (tpts.findIndex(s => s.name.toLowerCase() == rolelwr) != -1) return;
                /** @type {buildRow.controls[]}  */
                let controls = [];
                /** @type {HTMLElement}  */
                let cntHT = template.htmlContents.$();
                let _htEleAr = Array.from(cntHT.querySelectorAll(`[${propOpt.ATTR.ACCESS_KEY}]`));
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
                    name: template.name,
                    scope: "public",
                    controls: controls
                });
            });
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