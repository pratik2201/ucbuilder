"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDataBank = void 0;

const codeFileInfo_1 = require("ucbuilder/build/codeFileInfo");
const common_1 = require("ucbuilder/build/common");
const fs_1 = require("fs");
class FileDataBank {
    static checkIfValidReplacable(textToFind) {
        let textToFindLower = textToFind.toLowerCase();
        return this.replacableText.findIndex(s => s.originalLowerCaseText.includes(textToFindLower)
            ||
                textToFindLower.includes(s.originalLowerCaseText)) == -1;
    }
    static pushReplacableText(textToFind, replaceWith) {
        let textToFindLower = textToFind.toLowerCase();
        let fval = this.replacableText.find(s => s.originalLowerCaseText == textToFindLower);
        if (fval == undefined) {
            this.replacableText.push({
                originalFinderText: textToFind,
                originalLowerCaseText: textToFindLower,
                textToFind: common_1.strOpt.cleanTextForRegs(textToFind),
                replaceWith: replaceWith,
                replaceLowerCaseText: replaceWith.toLowerCase(),
            });
        }
        else {
            fval.originalFinderText = textToFind;
            fval.originalLowerCaseText = textToFindLower;
            fval.textToFind = common_1.strOpt.cleanTextForRegs(textToFind);
            fval.replaceWith = replaceWith;
            fval.replaceLowerCaseText = replaceWith.toLowerCase();
        }
    }
    static getReplacedContent(content) {
        this.replacableText.forEach(rw => {
            content = common_1.strOpt.replaceAll(content, rw.textToFind, rw.replaceWith);
        });
        return content;
    }
    static readFile(path, { reloadData = false, replaceContentWithKeys = true, isFullPath = false, } = {}) {
        let fullPath = path.toLowerCase().trim();
        if (!isFullPath) {
            let fing = new codeFileInfo_1.FileInfo();
            fing.parse(path, true);
            fullPath = fing.fullPath;
        }
        if (!(0, fs_1.existsSync)(fullPath))
            return undefined;
        let data = this.source.find(s => s.path == fullPath);
        if (data != undefined) {
            if (!reloadData)
                return replaceContentWithKeys ? data.content : data.originalContent;
            let originalContent = (0, fs_1.readFileSync)(fullPath, "binary");
            let content = this.getReplacedContent(originalContent);
            data.originalContent = originalContent;
            data.content = content;
            return replaceContentWithKeys ? content : originalContent;
        }
        else {
            let originalContent = (0, fs_1.readFileSync)(fullPath, "binary");
            let content = this.getReplacedContent(originalContent);
            this.source.push({
                path: fullPath,
                content: content,
                originalContent: originalContent,
            });
            return replaceContentWithKeys ? content : originalContent;
        }
    }
    static writeFile(path, data) {
        (0, fs_1.writeFileSync)(path, data);
    }
}
exports.FileDataBank = FileDataBank;
FileDataBank.source = [];
FileDataBank.replacableText = [];
FileDataBank.options = {
    reloadData: false,
    replaceContentWithKeys: true,
    isFullPath: false,
};
