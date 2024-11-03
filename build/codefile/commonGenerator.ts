import fs from "fs";
import { CommonRow } from "ucbuilder/build/buildRow.js";
import { regsManage } from "ucbuilder/build/regs/regsManage.js";
import { buildOptions, pathInfo } from "ucbuilder/build/common";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { rfileGenerator } from "ucbuilder/build/codefile/rfileGenerator";
import path from "path";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";

export class commonGenerator {
    rows: CommonRow[] = [];
    designerTMPLT: { [key: string]: string } = {};
    codefileTMPLT: { [key: string]: string } = {};
    styleTMPLT: { [key: string]: string } = {};

    constructor() {
        this.rgxManage = new regsManage();

        this.designerTMPLT[buildOptions.extType.Usercontrol] = FileDataBank.readFile('ucbuilder/buildTempates/uc/designer.js', { isFullPath: false, });
        this.codefileTMPLT[buildOptions.extType.Usercontrol] = FileDataBank.readFile('ucbuilder/buildTempates/uc/codefile.js', { isFullPath: false, });
        this.styleTMPLT[buildOptions.extType.Usercontrol] = FileDataBank.readFile('ucbuilder/buildTempates/uc/styles.css', { isFullPath: false, });

        this.designerTMPLT[buildOptions.extType.template] = FileDataBank.readFile('ucbuilder/buildTempates/tpt/designer.js', { isFullPath: false, });
        this.codefileTMPLT[buildOptions.extType.template] = FileDataBank.readFile('ucbuilder/buildTempates/tpt/codefile.js', { isFullPath: false, });
        this.styleTMPLT[buildOptions.extType.template] = FileDataBank.readFile('ucbuilder/buildTempates/tpt/styles.css', { isFullPath: false, });
    }

    rgxManage: regsManage;
    static ensureDirectoryExistence(filePath:string) {
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
        /*for (let i = 0; i < rootPathHandler.source.length; i++) {
            const src = rootPathHandler.source[i];
            if (src.location.designerDir != '/') {
                let rootDir = (src.path + "/" + src.location.designerDir).toFilePath();
                console.log(rootDir);
                
            }
        }*/
        this.rows.forEach(row => {
            // console.log(row.src);            
            commonGenerator.ensureDirectoryExistence(row.src.designer.fullPath);
           // console.log(row.src.designer.rootPath);
        
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
          
            //  fs.rmSync(row.src.mainFilePath+'.designer.ts');
                
        });
        //let rfileFrm = new rfileGenerator();
       // rfileFrm.fill(rows);
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
