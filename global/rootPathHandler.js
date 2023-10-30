const { pathInfo, strOpt } = require("@ucbuilder:/build/common");
const { replaceTextRow } = require("@ucbuilder:/global/findAndReplace");
const { rootPathParam } = require('@ucbuilder:/enumAndMore');
let { newObjectOpt } = require("@ucbuilder:/global/objectOpt");
const rootPathRow = {
    id: '',
    path: '',
    alices: '',
    index: -1,
    isAlreadyFullPath: false,
    /** @type {{key:string,value:string}[]}  */ 
    cssVars : [],
}

class rootPathHandler {
    /** @type {replaceTextRow[]}  @private */
    static _source = [];
    static get source() { return this._source; }

    /**
     * @param {string} textToFindLower 
     * @param {string} textToReplaceLower 
     * @returns {"newRegister"|"alreadyRegistered"|"sameAlicesAlreadyExist"}
     */
    static checkStatus(textToFindLower, textToReplaceLower) {
        //let textToFindLower = textToFind.toLowerCase();
        let findex = this.source.findIndex(s =>
            s.originalLowerCaseText.includes(textToFindLower)
            ||
            textToFindLower.includes(s.originalLowerCaseText)
        );        
        if (findex == -1) {
            return "newRegister";
        } else {
            let row = this.source[findex];
          
            return (row.replaceLowerCaseText === textToReplaceLower.toLowerCase()) ?
                "alreadyRegistered"
                :
                "sameAlicesAlreadyExist";
        }
    }


    /**
     * @param {string} projectName 
     * @param {string} replaceAlicesWith 
     * @param {rootPathParam} pera
     */
    static addRoot = (projectName, replaceAlicesWith, pera) => {
        let param2 = newObjectOpt.copyProps(pera,rootPathParam);
        let pathAlicesLower = projectName.toLowerCase();
        let result = this.checkStatus(pathAlicesLower, replaceAlicesWith);
        switch (result) {
            case "newRegister":
                replaceAlicesWith = replaceAlicesWith.replace(/[\\/]{1,}/g, "/").toLowerCase().trim_('/');
                if (param2.addIntoFileDataBankAlso) {
                    let { fileDataBank } = require("@ucbuilder:/global/fileDataBank")
                    fileDataBank.pushReplacableText(projectName, replaceAlicesWith);
                }
                let { builder } = require("@ucbuilder:/build/builder");
                if (param2.buildOption.addPathInProjectBuild) {
                    builder.addThisDirectories(replaceAlicesWith);
                }

                if (param2.buildOption.removeSomeSpecialPathFromProjectBuild) {
                    builder.ignoreThisDirectories(
                        replaceAlicesWith + '/node_modules',
                        replaceAlicesWith + '/.git',
                        replaceAlicesWith + '/.vscode'
                    );
                }
                if (param2.addModule) {
                    require('module-alias')
                        .addAlias(projectName, replaceAlicesWith);

                }
                this.source.push({
                    id: this.source.length,
                    originalFinderText: projectName,
                    originalLowerCaseText: pathAlicesLower,
                    textToFind: strOpt.cleanTextForRegs(projectName),
                    replaceWith: replaceAlicesWith,
                    replaceLowerCaseText: replaceAlicesWith.toLowerCase(),
                    cssVars: [],
                });
                return true;
            case "sameAlicesAlreadyExist":
                document.write(`    
                        ROOT ALICES ALREADY EXIST <br>
                        YOU ARE TRING TO ADD '${projectName}' THAT ALREADY EXISTED LIST <br> SEE
                        ${this._source.map(s => s.originalFinderText).join("<br>")}                                
                `);
                this_is_for_break_execution = true;
                return false;
            case "alreadyRegistered": return true;
        }


    }



    static originalPath = "";
    static path = "";
    static fullPath(_pth = "") {
        let src = _pth.toLowerCase().trim();
        let node = this.source.find(s => src.startsWith(s.originalLowerCaseText));
        if (node == undefined) return _pth;
        else return pathInfo.cleanPath(`${node.replaceWith}${strOpt._trim(_pth, node.textToFind)}`);
    }
    /**
     * @param {string} _pth
     * @returns {rootPathRow} 
     */
    static getInfo(_pth = "") {
        let src = _pth.toLowerCase().trim();
        let isAlreadyFullPath = false;
        let findex = this.source.findIndex(s => {
            if (src.startsWith(s.originalLowerCaseText)) return true;
            else {
                isAlreadyFullPath = src.startsWith(s.replaceLowerCaseText);
                return isAlreadyFullPath;
            }
        });
        if (findex == -1) return undefined;
        let node = this.source[findex];
        let rtrn = rootPathHandler.convertToRow(node, isAlreadyFullPath);
        rtrn.index = findex;
        return rtrn;
    }

    /**
     * @param {string} alices
     * @returns {rootPathRow} 
     */
    static getInfoByAlices(alices) {
        alices = alices.toLowerCase();
        let findex = this.source.findIndex(s => alices == s.originalLowerCaseText);
        if (findex == -1) return undefined;
        let node = this.source[findex];
        let rtrn = rootPathHandler.convertToRow(node, false);
        rtrn.index = findex;
        return rtrn;
    }
    /**
     * 
     * @param {replaceTextRow} node
     * @param {boolean} isAlreadyFullPath
     * @returns {rootPathRow} 
     */
    static convertToRow(node, isAlreadyFullPath) {
        return {
            id: node.id,
            path: node.replaceWith,
            alices: node.originalFinderText,
            isAlreadyFullPath: isAlreadyFullPath,
            cssVars: node.cssVars,
            index:-1,
        }
    }
}
/*class rootDir {
    static originalPath = "";
    static path = "";

    static fullPath(_pth = "") {
        return pathInfo.cleanPath(rootDir.path + '/' + _pth);
    }
}*/
module.exports = { rootPathHandler, rootPathRow }