import { SpecialExtType, ucUtil } from "../../global/ucUtil.js";
import { nodeFn } from "../../nodeFn.js";
import { CommonRow } from "../buildRow.js";
import { regsManage } from "../regs/regsManage.js";
import { TemplateMaker } from "../regs/TemplateMaker.js";

 

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
    DEFAULT_TEMPLEATES: SourceTypeNode;
    getfile(pth: string) {
        return nodeFn.fs.readFileSync(nodeFn.path.resolveFilePath(import.meta.url, ucUtil.devEsc(pth)), undefined, import.meta.url,false);
    }
    private initTemplates() {
        this.DEFAULT_TEMPLEATES = {
            JS: {
                TPT: {
                    CODE: this.getfile('{:../../../assets/buildTempates/js/tpt/codefile.php}'),
                    DESIGNER: this.getfile('{:../../../assets/buildTempates/js/tpt/designer.php}'),
                    STYLE: this.getfile('{:../../../assets/buildTempates/js/tpt/styles.css}'),
                },
                UC: {
                    CODE: this.getfile('{:../../../assets/buildTempates/js/uc/codefile.php}'),
                    DESIGNER: this.getfile('{:../../../assets/buildTempates/js/uc/designer.php}'),
                    STYLE: this.getfile('{:../../../assets/buildTempates/js/uc/styles.css}'),
                },
            },
            TS: {
                TPT: {
                    CODE: this.getfile('{:../../../assets/buildTempates/ts/tpt/codefile.php}'),
                    DESIGNER: this.getfile('{:../../../assets/buildTempates/ts/tpt/designer.php}'),
                    STYLE: this.getfile('{:../../../assets/buildTempates/ts/tpt/styles.css}'),
                },
                UC: {
                    CODE: this.getfile('{:../../../assets/buildTempates/ts/uc/codefile.php}'),
                    DESIGNER: this.getfile('{:../../../assets/buildTempates/ts/uc/designer.php}'),
                    STYLE: this.getfile('{:../../../assets/buildTempates/ts/uc/styles.css}'),
                },
            }
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
    tMaker = new TemplateMaker(import.meta.url);
    //dTpt = '' as string;
    constructor() {
        this.initTemplates();
        this.rgxManage = new regsManage();
        //  this.dTpt = 
        //console.log(this.DEFAULT_TEMPLEATES);        
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

        const dirname = nodeFn.path.dirname(filePath);
        if (!nodeFn.fs.existsSync(dirname)) {
            nodeFn.fs.mkdirSync(dirname, { recursive: true });
        }
        /*var dirname = nodeFn.path.dirname(filePath);
        if (nodeFn.fs.existsSync(dirname)) {
            return true;
        }
        this.ensureDirectoryExistence(dirname);
        nodeFn.fs.mkdirSync(dirname);*/
    }
    generateFiles(rows: CommonRow[] = []) {
        let _this = this;
        this.rows = rows;
        let _data = "";
        // console.log('G');

        for (let i = 0, len = this.rows.length; i < len; i++) {
            const row = this.rows[i];
            let srctype = row.src.projectInfo.type;
            let uctype = row.src.extCode;
            //console.log(row);
            
            commonGenerator.ensureDirectoryExistence(row.src.pathOf['.designer.ts']);

            /*_data = _this.generateNew(row, _this.Events.onDemandDesignerFile(srctype, uctype));
            nodeFn.fs.writeFileSync(row.src.designer.fullPath, _data);
            let tcode = _this.tMaker(this.dTpt)(row);
            console.log(tcode);*/
            // if (row.src.pathOf[".html"].includes('itemNode.tpt')) debugger;
            if (uctype == '.uc')
                _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.UC.DESIGNER)(row);
            else if (uctype == '.tpt')
                _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.TPT.DESIGNER)(row);
            else _data = _this.generateNew(row, _this.Events.onDemandDesignerFile(srctype, uctype));

            nodeFn.fs.writeFileSync(row.src.pathOf['.designer.ts'], _data);
            // let tcode = _this.tMaker(this.dTpt)(row);
           // console.log(row.htmlFileContent);

            if (row.htmlFileContent != undefined)
                nodeFn.fs.writeFileSync(`${row.src.pathOf[".html"]}`, row.htmlFileContent);

            if (!nodeFn.fs.existsSync(row.src.pathOf['.ts'])) {
                if (uctype == '.uc')
                    _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.UC.CODE)(row);
                else if (uctype == '.tpt')
                    _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.TPT.CODE)(row);
                else _data = _this.generateNew(row, _this.Events.onDemandDesignerFile(srctype, uctype));
                // _data = _this.generateNew(row, _this.Events.onDemandCodeFile(srctype, uctype));
                nodeFn.fs.writeFileSync(row.src.pathOf['.ts'], _data);
            }
            if (!nodeFn.fs.existsSync(row.src.pathOf['.scss'])) {
                //_data = _this.generateNew(row, _this.Events.onDemandStyleFile(srctype, uctype));                
                if (uctype == '.uc')
                    _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.UC.STYLE)(row);
                else if (uctype == '.tpt') {
                    //debugger;
                    _data = _this.tMaker.compileTemplate(this.DEFAULT_TEMPLEATES.TS.TPT.STYLE)(row);
                }
                else _data = _this.generateNew(row, _this.Events.onDemandDesignerFile(srctype, uctype));
                nodeFn.fs.writeFileSync(row.src.pathOf['.scss'], _data);
                if (row.src.extCode == ".tpt") {
                    let commonCssFile = `${row.src.pathWithExt('.html')}.common.scss`;
                    if (!nodeFn.fs.existsSync(commonCssFile))
                        nodeFn.fs.writeFileSync(commonCssFile, '');
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
