import fs from 'fs';
import { CommonRow } from 'ucbuilder/build/buildRow.js';
import { regsManage } from 'ucbuilder/build/regs/regsManage.js';
import { buildOptions, pathInfo } from 'ucbuilder/build/common';
import {  FileDataBank } from 'ucbuilder/global/fileDataBank';

export class commonGenerator {
    rows: CommonRow[] = [];
    designerTMPLT: { [key: string]: string } = {};
    codefileTMPLT: { [key: string]: string } = {};
    styleTMPLT: { [key: string]: string } = {};

    constructor() {
        this.rgxManage = new regsManage();

        this.designerTMPLT[buildOptions.extType.Usercontrol] = FileDataBank.readFile('ucbuilder/buildTempates/uc/designer.js', { replaceContentWithKeys: true, });
        this.codefileTMPLT[buildOptions.extType.Usercontrol] = FileDataBank.readFile('ucbuilder/buildTempates/uc/codefile.js', { replaceContentWithKeys: true, });
        this.styleTMPLT[buildOptions.extType.Usercontrol] = FileDataBank.readFile('ucbuilder/buildTempates/uc/styles.css', { replaceContentWithKeys: true, });

        this.designerTMPLT[buildOptions.extType.template] = FileDataBank.readFile('ucbuilder/buildTempates/tpt/designer.js', { replaceContentWithKeys: true, });
        this.codefileTMPLT[buildOptions.extType.template] = FileDataBank.readFile('ucbuilder/buildTempates/tpt/codefile.js', { replaceContentWithKeys: true, });
        this.styleTMPLT[buildOptions.extType.template] = FileDataBank.readFile('ucbuilder/buildTempates/tpt/styles.css', { replaceContentWithKeys: true, });
    }

    rgxManage: regsManage;

    generateFiles(rows: CommonRow[] = []) {
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
            }
        });
    }

    getDesignerCode(rw: CommonRow) {
        return this.generateNew(rw, this.designerTMPLT[rw.src.extCode]);
    }

    getJsFileCode(rw: CommonRow) {
        return this.generateNew(rw, this.codefileTMPLT[rw.src.extCode]);
    }

    private generateNew(node: CommonRow, templateText: string) {
        let dta = templateText;

        dta = this.rgxManage.parse(node, dta);
        return dta;
    }
}
