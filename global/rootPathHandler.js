"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootPathHandler = exports.rootPathRow = void 0;
const common_1 = require("ucbuilder/build/common");
const enumAndMore_1 = require("ucbuilder/enumAndMore");
const objectOpt_1 = require("ucbuilder/global/objectOpt");

const builder_1 = require("ucbuilder/build/builder");
exports.rootPathRow = {
    id: -1,
    path: '',
    alices: '',
    index: -1,
    isAlreadyFullPath: false,
    cssVars: [],
};
class rootPathHandler {
    static get source() { return this._source; }
    static checkStatus(textToFindLower, textToReplaceLower) {
        let findex = this.source.findIndex(s => s.originalLowerCaseText.includes(textToFindLower)
            ||
                textToFindLower.includes(s.originalLowerCaseText));
        if (findex == -1) {
            return "newRegister";
        }
        else {
            let row = this.source[findex];
            return (row.replaceLowerCaseText === textToReplaceLower.toLowerCase()) ?
                "alreadyRegistered"
                :
                    "sameAlicesAlreadyExist";
        }
    }
    static fullPath(_pth = "") {
        let src = _pth.toLowerCase().trim();
        let node = this.source.find(s => src.startsWith(s.originalLowerCaseText));
        if (node == undefined)
            return _pth;
        else
            return common_1.pathInfo.cleanPath(`${node.replaceWith}${common_1.strOpt._trim(_pth, node.textToFind)}`);
    }
    static getInfo(_pth = "") {
        let src = _pth.toLowerCase().trim();
        let isAlreadyFullPath = false;
        let findex = this.source.findIndex(s => {
            if (src.startsWith(s.originalLowerCaseText))
                return true;
            else {
                isAlreadyFullPath = src.startsWith(s.replaceLowerCaseText);
                return isAlreadyFullPath;
            }
        });
        if (findex == -1)
            return undefined;
        let node = this.source[findex];
        let rtrn = rootPathHandler.convertToRow(node, isAlreadyFullPath);
        rtrn.index = findex;
        return rtrn;
    }
    static getInfoByAlices(alices) {
        alices = alices.toLowerCase();
        let findex = this.source.findIndex(s => alices == s.originalLowerCaseText);
        if (findex == -1)
            return undefined;
        let node = this.source[findex];
        let rtrn = rootPathHandler.convertToRow(node, false);
        rtrn.index = findex;
        return rtrn;
    }
    static convertToRow(node, isAlreadyFullPath) {
        return {
            id: node.id,
            path: node.replaceWith,
            alices: node.originalFinderText,
            isAlreadyFullPath: isAlreadyFullPath,
            cssVars: node.cssVars,
            index: -1,
        };
    }
}
exports.rootPathHandler = rootPathHandler;
_a = rootPathHandler;
rootPathHandler._source = [];
rootPathHandler.addRoot = (projectName, replaceAlicesWith, pera) => {
    let param2 = objectOpt_1.newObjectOpt.copyProps(pera, enumAndMore_1.rootPathParam);
    let pathAlicesLower = projectName.toLowerCase();
    let result = _a.checkStatus(pathAlicesLower, replaceAlicesWith);
    switch (result) {
        case "newRegister":
            replaceAlicesWith = common_1.strOpt.trim__(replaceAlicesWith.replace(/[\\/]{1,}/g, "/").toLowerCase(), '/');
            if (param2.addIntoFileDataBankAlso) {
                let { fileDataBank } = require("@ucbuilder:/global/fileDataBank");
                fileDataBank.pushReplacableText(projectName, replaceAlicesWith);
            }
            if (param2.buildOption.addPathInProjectBuild) {
                builder_1.builder.addThisDirectories(replaceAlicesWith);
            }
            if (param2.buildOption.removeSomeSpecialPathFromProjectBuild) {
                builder_1.builder.ignoreThisDirectories(replaceAlicesWith + '/node_modules', replaceAlicesWith + '/.git', replaceAlicesWith + '/.vscode');
            }
            if (param2.addModule) {
                require('module-alias')
                    .addAlias(projectName, replaceAlicesWith);
            }
            _a.source.push({
                id: _a.source.length,
                originalFinderText: projectName,
                originalLowerCaseText: pathAlicesLower,
                textToFind: common_1.strOpt.cleanTextForRegs(projectName),
                replaceWith: replaceAlicesWith,
                replaceLowerCaseText: replaceAlicesWith.toLowerCase(),
                cssVars: [],
            });
            return true;
        case "sameAlicesAlreadyExist":
            document.write(`    
                        ROOT ALICES ALREADY EXIST <br>
                        YOU ARE TRING TO ADD '${projectName}' THAT ALREADY EXISTED LIST <br> SEE
                        ${_a._source.map(s => s.originalFinderText).join("<br>")}                                
                `);
            //this_is_for_break_execution = true;
            return false;
        case "alreadyRegistered": return true;
    }
};
rootPathHandler.originalPath = "";
rootPathHandler.path = "";
