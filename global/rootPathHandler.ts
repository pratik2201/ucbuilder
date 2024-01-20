import { pathInfo, strOpt } from "ucbuilder/build/common";
import { replaceTextRow, ReplaceTextRow } from "ucbuilder/global/findAndReplace";
import { rootPathParam, RootPathParam } from 'ucbuilder/enumAndMore';
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { builder } from "ucbuilder/build/builder";
export interface RootPathRow {
    id: number,
    path: string,
    alices: string,
    index: number,
    isAlreadyFullPath: boolean,
    cssVars: { key: string, value: string }[],
}
export const rootPathRow: RootPathRow = {
    id: -1,
    path: '',
    alices: '',
    index: -1,
    isAlreadyFullPath: false,
    cssVars: [],
}
export class rootPathHandler {
    private static _source: ReplaceTextRow[] = [];
    static get source(): ReplaceTextRow[] { return this._source; }

    static checkStatus(textToFindLower: string, textToReplaceLower: string): "newRegister" | "alreadyRegistered" | "sameAlicesAlreadyExist" {
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

    static addRoot = (projectName: string, replaceAlicesWith: string, pera: RootPathParam): boolean => {
        let param2 = newObjectOpt.copyProps(pera, rootPathParam);
        let pathAlicesLower = projectName.toLowerCase();
        let result = this.checkStatus(pathAlicesLower, replaceAlicesWith);
        switch (result) {
            case "newRegister":
                replaceAlicesWith = strOpt.trim__(replaceAlicesWith.replace(/[\\/]{1,}/g, "/").toLowerCase(), '/');
                if (param2.addIntoFileDataBankAlso) {
                    (async () => {
                        let { FileDataBank } = await import('ucbuilder/global/fileDataBank');
                        FileDataBank.pushReplacableText(projectName, replaceAlicesWith);
                    })();
                }



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
                //this_is_for_break_execution = true;
                return false;
            case "alreadyRegistered": return true;
        }
    }

    static originalPath = "";
    static path = "";
    static fullPath(_pth = ""): string {
        let src = _pth.toLowerCase().trim();
        let node = this.source.find(s => src.startsWith(s.originalLowerCaseText));
        if (node == undefined) return _pth;
        else return pathInfo.cleanPath(`${node.replaceWith}${strOpt._trim(_pth, node.textToFind)}`);
    }

    static getInfo(_pth = ""): RootPathRow | undefined {
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

    static getInfoByAlices(alices: string): RootPathRow | undefined {
        alices = alices.toLowerCase();
        let findex = this.source.findIndex(s => alices == s.originalLowerCaseText);
        if (findex == -1) return undefined;
        let node = this.source[findex];
        let rtrn = rootPathHandler.convertToRow(node, false);
        rtrn.index = findex;
        return rtrn;
    }

    static convertToRow(node: ReplaceTextRow, isAlreadyFullPath: boolean): RootPathRow {
        return {
            id: node.id,
            path: node.replaceWith,
            alices: node.originalFinderText,
            isAlreadyFullPath: isAlreadyFullPath,
            cssVars: node.cssVars,
            index: -1,
        }
    }
}