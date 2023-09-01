const { pathInfo, strOpt } = require("@ucbuilder:/build/common");
const { replaceTextRow } = require("@ucbuilder:/appBuilder/Window/codeFile/findAndReplace");
const { rootPathParam } = require('@ucbuilder:/enumAndMore');
let { clone, copyProps } = require("@ucbuilder:/global/objectOpt");
const rootPathRow = {
    id: '',
    path: '',
    alices: '',
    index: -1,
    isAlreadyFullPath: false,
}

class rootPathHandler {
    /** @type {replaceTextRow[]}  @private */
    static _source = [];
    static get source() { return this._source; }

    /**
     * @param {string} projectName 
     * @param {string} replaceAlicesWith 
     * @param {rootPathParam} pera
     */
    static addRoot(projectName, replaceAlicesWith, pera) {
        //let { rootPathHandler } =  require('@ucbuilder:/global/rootPathHandler');

        /** @type {rootPathParam}  */
        let param2 = clone(rootPathParam);
        copyProps(pera, param2);
        let pathAlicesLower = projectName.toLowerCase();

        if (this.checkIfValidReplacable(pathAlicesLower)) {
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
            });
            //console.log(param2);
            //console.log(pathAlices+";"+replaceAlicesWith);
            return true;
        }
        document.write(`    
                ROOT ALICES ALREADY EXIST <br>
                YOU ARE TRING TO ADD '${projectName}' THAT ALREADY EXISTED LIST <br> SEE
                ${this._source.map(s => s.originalFinderText).join("<br>")}                                
        `);
        this_is_for_break_execution = true;
        return false;
    }


    /**
     * @param {string} textToFindLower 
     * @returns {boolean}
     */
    static checkIfValidReplacable(textToFindLower) {
        //let textToFindLower = textToFind.toLowerCase();
        return this.source.findIndex(s =>
            s.originalLowerCaseText.includes(textToFindLower)
            ||
            textToFindLower.includes(s.originalLowerCaseText)
        ) == -1;
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
            // console.log(_pth+"\n"+s.replaceLowerCaseText);
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
        /*    return {
                id: node.id,
                index:findex,
                path: node.replaceWith,
                alices: node.originalFinderText,
                isAlreadyFullPath: isAlreadyFullPath,
            }  */

    }

    /**
     * @param {string} alices
     * @returns {rootPathRow} 
     */
    static getInfoByAlices(alices){
        alices = alices.toLowerCase();
        let findex = this.source.findIndex(s=>alices == s.originalLowerCaseText);
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