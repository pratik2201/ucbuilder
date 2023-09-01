const fs = require('fs');
const { buildRow } = require('@ucbuilder:/build/buildRow.js');
const { regsManage } = require('@ucbuilder:/build/regs/regsManage.js');
const { buildOptions, pathInfo } = require('@ucbuilder:/build/common');
const { fileDataBank } = require('@ucbuilder:/global/fileDataBank');

const { rootPathHandler } = require('@ucbuilder:/global/rootPathHandler');

class commonGenerator {
    /**
     * @type {buildRow.commonRow[]}
     */
    rows = [];
    //templatePath = rootPathHandler.rootPath('common/utility/appBuilder/templete/designer.js');
    constructor() {
        this.rgxManage = new regsManage();

        this.designerTMPLT[buildOptions.extType.Usercontrol] = fileDataBank.readFile('@ucbuilder:/buildTempates/uc/designer.js', { replaceContentWithKeys: true, });
        this.codefileTMPLT[buildOptions.extType.Usercontrol] = fileDataBank.readFile('@ucbuilder:/buildTempates/uc/codefile.js', { replaceContentWithKeys: true, });
        this.styleTMPLT[buildOptions.extType.Usercontrol] = fileDataBank.readFile('@ucbuilder:/buildTempates/uc/styles.css', { replaceContentWithKeys: true, });


        this.designerTMPLT[buildOptions.extType.template] = fileDataBank.readFile('@ucbuilder:/buildTempates/tpt/designer.js', { replaceContentWithKeys: true, });
        this.codefileTMPLT[buildOptions.extType.template] = fileDataBank.readFile('@ucbuilder:/buildTempates/tpt/codefile.js', { replaceContentWithKeys: true, });
        this.styleTMPLT[buildOptions.extType.template] = fileDataBank.readFile('@ucbuilder:/buildTempates/tpt/styles.css', { replaceContentWithKeys: true, });


    }
    designerTMPLT = {};
    codefileTMPLT = {};
    styleTMPLT = {};

    /** @param {buildRow.commonRow[]} rows */
    generateFiles(rows = []) {
        let _this = this;
        this.rows = rows;
        let _data = "";
        this.rows.forEach(row => {
            _data = _this.generateNew(row, _this.designerTMPLT[row.src.extCode]);
            fs.writeFileSync(`${row.src.designer.fullPath}`, _data);

            if (row.htmlFile.reGenerate)
                fs.writeFileSync(`${row.src.html.fullPath}`, row.htmlFile.content);

            if (!fs.existsSync(`${row.src.code.fullPath}`)) {
                _data = _this.generateNew(row, _this.codefileTMPLT[row.src.extCode]);
                fs.writeFileSync(`${row.src.code.fullPath}`, _data);
            }
            if (!fs.existsSync(`${row.src.style.fullPath}`)) {
                _data = _this.generateNew(row, _this.styleTMPLT[row.src.extCode]);
                fs.writeFileSync(`${row.src.style.fullPath}`, _data);
            }/*else{
                //console.log(row.src.style.fullPath);
                //let replsName = row.src.style.fullPath.replace(".css",".scss");
                //console.log(replsName);
                //fs.renameSync(row.src.style.fullPath,replsName);
            }*/
        });
    }
    /** @param {buildRow.commonRow} rw */
    getDesignerCode(rw) {
        return this.generateNew(rw, this.designerTMPLT[rw.src.extCode]);
    }
    /** @param {buildRow.commonRow} rw */
    getJsFileCode(rw) {
        return this.generateNew(rw, this.codefileTMPLT[rw.src.extCode]);
    }

    /**
     * @private
     * @param {buildRow.commonRow} node 
     * @returns 
     */
    generateNew(node, templateText) {
        let dta = templateText;

        dta = this.rgxManage.parse(node, dta);
        return dta;
    }
}
module.exports = { commonGenerator };