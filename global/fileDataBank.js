const { strOpt } = require("@ucbuilder:/build/common");
const { replaceTextRow } = require("@ucbuilder:/appBuilder/Window/codeFile/findAndReplace");
const { readFileSync, writeFileSync, existsSync } = require("fs");
const { fileInfo } = require("@ucbuilder:/build/codeFileInfo");
const fileDataRow = {
    path: "",
    originalContent: "",
    content: "",
};

class fileDataBank {
    /** @type {fileDataRow[]}  */
    static source = [];
    constructor() { }
    /** @type {replaceTextRow[]}  */
    static replacableText = [];
    /**
     * @param {string} textToFind 
     * @returns {boolean}
     */
    static checkIfValidReplacable(textToFind) {
        let textToFindLower = textToFind.toLowerCase();
        return this.replacableText.findIndex(s =>
            s.originalLowerCaseText.includes(textToFindLower)
            ||
            textToFindLower.includes(s.originalLowerCaseText)
        ) == -1;
    }
    /**
     * @param {string} textToFind 
     * @param {string} replaceWith 
     * @returns {boolean} true if pushed or false return
     */
    static pushReplacableText(textToFind, replaceWith) {
        let textToFindLower = textToFind.toLowerCase();
        let fval = this.replacableText.find(s => s.originalLowerCaseText == textToFindLower);
        if (fval == undefined) {
            this.replacableText.push({
                originalFinderText: textToFind,
                originalLowerCaseText: textToFindLower,
                textToFind: strOpt.cleanTextForRegs(textToFind),
                replaceWith: replaceWith,
                replaceLowerCaseText: replaceWith.toLowerCase(),
            });
        } else {
            fval.originalFinderText = textToFind;
            fval.originalLowerCaseText = textToFindLower;
            fval.textToFind = strOpt.cleanTextForRegs(textToFind);
            fval.replaceWith = replaceWith;
            fval.replaceLowerCaseText = replaceWith.toLowerCase();
        }
    }

    /**
     * @param {string} content 
     * @returns {string}
     */
    static getReplacedContent(content) {
        this.replacableText.forEach(rw => {
            content = strOpt.replaceAll(content, rw.textToFind, rw.replaceWith);
        });
        return content;
    }
    static options = {
        reloadData: false,
        /**  @type {boolean} find and replace all key and value in content */
        replaceContentWithKeys: true,
        isFullPath: false,
    }
    /**
     * @param {string} path 
     * @param {fileDataBank.options} param1
     * @returns {string}
     */
    static readFile(path, {
        reloadData = false,
        /**  @type {boolean}  find and replace all key and value in content */
        replaceContentWithKeys = true,
        isFullPath = false,
    } = {}) {
        let fullPath = path.toLowerCase().trim();

        if (!isFullPath) {
            let fing = new fileInfo();
            fing.parse(path, true);
            fullPath = fing.fullPath;
        }
        if (!existsSync(fullPath)) return undefined;

        let data = this.source.find(s => s.path == fullPath);
        if (data != undefined) {
            if (!reloadData)
                return replaceContentWithKeys ? data.content : data.originalContent;
            let originalContent = readFileSync(fullPath, "binary");
            let content = this.getReplacedContent(originalContent);
            data.originalContent = originalContent;
            data.content = content;

            return replaceContentWithKeys ? content : originalContent;
        }
        else {
            let originalContent = readFileSync(fullPath, "binary");
            let content = this.getReplacedContent(originalContent);
            this.source.push({
                path: fullPath,
                content: content,
                originalContent: originalContent,
            });
            return replaceContentWithKeys ? content : originalContent;
        }
    }
    /**
     * @param {string} path 
     * @param {string} data 
     */
    static writeFile(path, data) {
        writeFileSync(path, data);
    }
}

module.exports = { fileDataBank, fileDataRow };