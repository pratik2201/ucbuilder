import fs from "fs";
import path from "path";
import { CommonRow } from "ucbuilder/build/buildRow.js";
import { SpecialExtType } from "ucbuilder/build/common";
import { regsManage } from "ucbuilder/build/regs/regsManage.js";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import {  TemplateMaker } from "ucbuilder/build/regs/TemplateMaker";

interface CodeFilesNode {
    DESIGNER: string,
    CODE: string,
    STYLE: string,
}
interface TNode {
    HTML: string,
    STYLE: string,
}
interface BaseTypeNode {
    UC: CodeFilesNode,
    TPT: CodeFilesNode,
}

interface SourceTypeNode {
    JS: BaseTypeNode,
    TS: BaseTypeNode,
}
export class commonGenerator {
    rows: CommonRow[] = [];
    DEFAULT_TEMPLEATES: SourceTypeNode = {
        JS: {
            TPT: {
                CODE: FileDataBank.readFile('ucbuilder/src/build/buildTempates/js/tpt/codefile.js', { isFullPath: false, }),
                DESIGNER: FileDataBank.readFile('ucbuilder/src/build/buildTempates/js/tpt/designer.js', { isFullPath: false, }),
                STYLE: FileDataBank.readFile('ucbuilder/src/build/buildTempates/js/tpt/styles.css', { isFullPath: false, }),
            },
            UC: {
                CODE: FileDataBank.readFile('ucbuilder/src/build/buildTempates/js/uc/codefile.js', { isFullPath: false, }),
                DESIGNER: FileDataBank.readFile('ucbuilder/src/build/buildTempates/js/uc/designer.js', { isFullPath: false, }),
                STYLE: FileDataBank.readFile('ucbuilder/src/build/buildTempates/js/uc/styles.css', { isFullPath: false, }),
            },
        },
        TS: {
            TPT: {
                CODE: FileDataBank.readFile('ucbuilder/src/build/buildTempates/ts/tpt/codefile.php', { isFullPath: false, }),
                DESIGNER: FileDataBank.readFile('ucbuilder/src/build/buildTempates/ts/tpt/designer.php', { isFullPath: false, replaceContentWithKeys: false }),
                STYLE: FileDataBank.readFile('ucbuilder/src/build/buildTempates/ts/tpt/styles.css', { isFullPath: false, }),
            },
            UC: {
                CODE: FileDataBank.readFile('ucbuilder/src/build/buildTempates/ts/uc/codefile.php', { isFullPath: false, }),
                DESIGNER: FileDataBank.readFile('ucbuilder/src/build/buildTempates/ts/uc/designer.php', { isFullPath: false, replaceContentWithKeys: false }),
                STYLE: FileDataBank.readFile('ucbuilder/src/build/buildTempates/ts/uc/styles.css', { isFullPath: false, }),
            },
        }
    }
    private _CodeFilesNode(type: 'js' | 'ts', extType: SpecialExtType): CodeFilesNode {
        switch (type) {
            case 'js': return _BaseTypeNode(this.DEFAULT_TEMPLEATES.JS, extType);
            case 'ts': return _BaseTypeNode(this.DEFAULT_TEMPLEATES.TS, extType);
        }
        function _BaseTypeNode(parent: BaseTypeNode, extType: SpecialExtType): CodeFilesNode {
            switch (extType) {
                case '.tpt': return parent.TPT;
                case '.uc': return parent.UC;
            }
            return undefined;
        }
        return undefined;
    }
    designerTMPLT: { [key: string]: string } = {};
    codefileTMPLT: { [key: string]: string } = {};
    styleTMPLT: { [key: string]: string } = {};
    tMaker = new TemplateMaker();
    //dTpt = '' as string;
    constructor() {
        this.rgxManage = new regsManage();
      //  this.dTpt = 

    }

    Events = {
        onDemandDesignerFile: (type: 'js' | 'ts', extType: SpecialExtType) => {
            return this._CodeFilesNode(type, extType).DESIGNER;
        },
        onDemandCodeFile: (type: 'js' | 'ts', extType: SpecialExtType) => {
            return this._CodeFilesNode(type, extType).CODE;
        },
        onDemandStyleFile: (type: 'js' | 'ts', extType: SpecialExtType) => {
            return this._CodeFilesNode(type, extType).STYLE;
        }
    }
    rgxManage: regsManage;
    static ensureDirectoryExistence(filePath: string) {
        var dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) {
            return true;
        }
        this.ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }
    generateFiles(rows: CommonRow[] = []) {
        let _this = this;
        this.rows = rows;
        let _data = "";
        for (let i = 0, len = this.rows.length; i < len; i++) {
            const row = this.rows[i];
            let srctype = row.src.rootInfo.location.type;
            let uctype = row.src.extCode;

            commonGenerator.ensureDirectoryExistence(row.src.designer.fullPath);

            /*_data = _this.generateNew(row, _this.Events.onDemandDesignerFile(srctype, uctype));
            fs.writeFileSync(row.src.designer.fullPath, _data);
            let tcode = _this.tMaker(this.dTpt)(row);
            console.log(tcode);*/
            if (uctype == '.uc')
                _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.UC.DESIGNER)(row);
            else if (uctype == '.tpt') 
                _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.TPT.DESIGNER)(row);
            else _data = _this.generateNew(row, _this.Events.onDemandDesignerFile(srctype, uctype));

            fs.writeFileSync(row.src.designer.fullPath, _data);
           // let tcode = _this.tMaker(this.dTpt)(row);

            if (row.htmlFile.reGenerate)
                fs.writeFileSync(`${row.src.html.fullPath}`, row.htmlFile.content);

            if (!fs.existsSync(row.src.code.fullPath)) {
                if (uctype == '.uc')
                    _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.UC.CODE)(row);
                else if (uctype == '.tpt') 
                    _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.TPT.CODE)(row);
                else _data = _this.generateNew(row, _this.Events.onDemandDesignerFile(srctype, uctype));
               // _data = _this.generateNew(row, _this.Events.onDemandCodeFile(srctype, uctype));
                fs.writeFileSync(row.src.code.fullPath, _data);
            }
            if (!fs.existsSync(row.src.style.fullPath)) {
                //_data = _this.generateNew(row, _this.Events.onDemandStyleFile(srctype, uctype));                
                if (uctype == '.uc')
                    _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.UC.STYLE)(row);
                else if (uctype == '.tpt') 
                    _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.TPT.STYLE)(row);
                else _data = _this.generateNew(row, _this.Events.onDemandDesignerFile(srctype, uctype));
                fs.writeFileSync(row.src.style.fullPath, _data);
                if (row.src.extCode == ".tpt") {
                    let commonCssFile = `${row.src.mainFilePath}.common.scss`;
                    if (!fs.existsSync(commonCssFile))
                        fs.writeFileSync(commonCssFile, '');
                }
            }
        }

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
