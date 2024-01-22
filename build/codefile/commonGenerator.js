"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonGenerator = void 0;
const fs_1 = __importDefault(require("fs"));
const regsManage_js_1 = require("ucbuilder/build/regs/regsManage.js");
const common_1 = require("ucbuilder/build/common");
const fileDataBank_1 = require("ucbuilder/global/fileDataBank");
class commonGenerator {
    constructor() {
        this.rows = [];
        this.designerTMPLT = {};
        this.codefileTMPLT = {};
        this.styleTMPLT = {};
        this.rgxManage = new regsManage_js_1.regsManage();
        this.designerTMPLT[common_1.buildOptions.extType.Usercontrol] = fileDataBank_1.FileDataBank.readFile('ucbuilder/buildTempates/uc/designer.js', { replaceContentWithKeys: true, });
        this.codefileTMPLT[common_1.buildOptions.extType.Usercontrol] = fileDataBank_1.FileDataBank.readFile('ucbuilder/buildTempates/uc/codefile.js', { replaceContentWithKeys: true, });
        this.styleTMPLT[common_1.buildOptions.extType.Usercontrol] = fileDataBank_1.FileDataBank.readFile('ucbuilder/buildTempates/uc/styles.css', { replaceContentWithKeys: true, });
        this.designerTMPLT[common_1.buildOptions.extType.template] = fileDataBank_1.FileDataBank.readFile('ucbuilder/buildTempates/tpt/designer.js', { replaceContentWithKeys: true, });
        this.codefileTMPLT[common_1.buildOptions.extType.template] = fileDataBank_1.FileDataBank.readFile('ucbuilder/buildTempates/tpt/codefile.js', { replaceContentWithKeys: true, });
        this.styleTMPLT[common_1.buildOptions.extType.template] = fileDataBank_1.FileDataBank.readFile('ucbuilder/buildTempates/tpt/styles.css', { replaceContentWithKeys: true, });
    }
    generateFiles(rows = []) {
        let _this = this;
        this.rows = rows;
        let _data = "";
        this.rows.forEach(row => {
            _data = _this.generateNew(row, _this.designerTMPLT[row.src.extCode]);
            fs_1.default.writeFileSync(`${row.src.designer.fullPath}`, _data);
            if (row.htmlFile.reGenerate)
                fs_1.default.writeFileSync(`${row.src.html.fullPath}`, row.htmlFile.content);
            if (!fs_1.default.existsSync(`${row.src.code.fullPath}`)) {
                _data = _this.generateNew(row, _this.codefileTMPLT[row.src.extCode]);
                fs_1.default.writeFileSync(`${row.src.code.fullPath}`, _data);
            }
            if (!fs_1.default.existsSync(`${row.src.style.fullPath}`)) {
                _data = _this.generateNew(row, _this.styleTMPLT[row.src.extCode]);
                fs_1.default.writeFileSync(`${row.src.style.fullPath}`, _data);
            }
        });
    }
    getDesignerCode(rw) {
        return this.generateNew(rw, this.designerTMPLT[rw.src.extCode]);
    }
    getJsFileCode(rw) {
        return this.generateNew(rw, this.codefileTMPLT[rw.src.extCode]);
    }
    generateNew(node, templateText) {
        let dta = templateText;
        dta = this.rgxManage.parse(node, dta);
        return dta;
    }
}
exports.commonGenerator = commonGenerator;
