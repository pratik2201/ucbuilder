import { pathInfo, strOpt } from "ucbuilder/build/common";
import { replaceTextRow, ReplaceTextRow, RootPathRow, PathType } from "ucbuilder/global/findAndReplace";
import { rootPathParam, RootPathParam } from 'ucbuilder/enumAndMore';
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { builder } from "ucbuilder/build/builder";
import { UcConfig } from "ucbuilder/start";

export class rootPathHandler {

    private static _source: RootPathRow[] = [];
    static get source(): RootPathRow[] { return this._source; }
    static contentHT = document.body;
    static setDefaultLoadElement(path: string, ele: HTMLElement) {
        let rInfo = this.getInfo(path);
        if (rInfo != undefined)
            rInfo.defaultLoadAt = ele;
    }
    static getDefaultLoadElement(path: string): HTMLElement {
        let rInfo = this.getInfo(path);
        if (rInfo != undefined) return rInfo.defaultLoadAt;
    }
    static checkStatus(textToFindLower: string, textToReplaceLower: string): "newRegister" | "alreadyRegistered" | "sameAlicesAlreadyExist" {
        let findex = this.source.findIndex(s =>
            // s.tInfo.originalLowerCaseText.includes(textToFindLower)
            s.tInfo.originalFinderText.includesI(textToFindLower).result

            ||
            //textToFindLower.includes(s.tInfo.originalLowerCaseText)
            textToFindLower.includesI(s.tInfo.originalFinderText).result
        );
        // console.log('<<< '+ findex+" >>>>");

        if (findex == -1) {
            return "newRegister";
        } else {
            let row = this.source[findex];

            return
            /*(row.tInfo.replaceLowerCaseText === textToReplaceLower.toLowerCase())*/
            (row.tInfo.replaceWith.equalIgnoreCase(textToReplaceLower))
                ?
                "alreadyRegistered"
                :
                "sameAlicesAlreadyExist";
        }
    }

    static addRoot = (projectName: string, rootDirectoryOf: UcConfig /*replaceAlicesWith: string*/, pera: RootPathParam): boolean => {
        let param2 = newObjectOpt.copyProps(pera, rootPathParam);
        let pathAlicesLower = projectName/*.toLowerCase()*/;
        let result = this.checkStatus(pathAlicesLower, rootDirectoryOf.rootDir);
        switch (result) {
            case "newRegister":
                //replaceAlicesWith = strOpt.trim__(replaceAlicesWith.replace(/[\\/]{1,}/g, "/").toLowerCase(), '/');
            //console.log(param2.addIntoFileDataBankAlso);
            //console.log([projectName,rootDirectoryOf.rootDir]);
            
                if (param2.addIntoFileDataBankAlso) {
                    (async () => {
                        let { FileDataBank } = await import('ucbuilder/global/fileDataBank');
                        FileDataBank.pushReplacableText(projectName, rootDirectoryOf.rootDir);// replaceAlicesWith
                    })();
                }



                if (param2.buildOption.addPathInProjectBuild) {
                    builder.addThisDirectories(rootDirectoryOf.rootDir);
                }

                if (param2.buildOption.removeSomeSpecialPathFromProjectBuild) {
                    builder.ignoreThisDirectories(
                        rootDirectoryOf.rootDir + '/node_modules',
                        rootDirectoryOf.rootDir + '/.git',
                        rootDirectoryOf.rootDir + '/.vscode'
                    );
                }
                if (param2.addModule) {
                    //console.log( (rootDirectoryOf.rootDir + "/" + rootDirectoryOf.outDir).toFilePath());

                    require('module-alias')
                        .addAlias(projectName, (rootDirectoryOf.rootDir + "/" + rootDirectoryOf.outDir).toFilePath());

                }

                let rnode: RootPathRow;
                rnode = {
                    id: this.source.length,
                    path: rootDirectoryOf.rootDir,
                    alices: projectName,
                    isAlreadyFullPath: false,
                    pathType: "none",
                    cssVars: [],
                    outputDirectory: '',
                    index: -1,
                    location: rootDirectoryOf,
                    defaultLoadAt:document.body,
                    tInfo: {
                        id: this.source.length,
                        originalFinderText: projectName,
                        //originalLowerCaseText: pathAlicesLower,
                        textToFind: strOpt.cleanTextForRegs(projectName),
                        replaceWith: rootDirectoryOf.rootDir,
                        //replaceLowerCaseText: rootDirectoryOf.rootDir.toLowerCase().trim(),
                        cssVars: [],
                    }
                }
                /* let record: ReplaceTextRow;
                 record = {
                     id: this.source.length,
                     originalFinderText: projectName,
                     originalLowerCaseText: pathAlicesLower,
                     textToFind: strOpt.cleanTextForRegs(projectName),
                     replaceWith: replaceAlicesWith,
                     replaceLowerCaseText: replaceAlicesWith.toLowerCase(),
                     cssVars: [],
                 }*/

                this.source.push(rnode);


                this.source.sort((a, b) => {
                    return b.tInfo.replaceWith.length - a.tInfo.replaceWith.length
                    //return b.tInfo.replaceLowerCaseText.length - a.tInfo.replaceLowerCaseText.length
                });


                // console.log(this.source);
                // console.log(this.source);

                return true;
            case "sameAlicesAlreadyExist":
                /*document.write(`    
                        ROOT ALICES ALREADY EXIST <br>
                        YOU ARE TRING TO ADD '${projectName}' THAT ALREADY EXISTED LIST <br> SEE
                        ${this._source.map(s => s.originalFinderText).join("<br>")}                                
                `);*/
                //this_is_for_break_execution = true;
                return false;
            case "alreadyRegistered": return true;
        }
    }

    // static originalPath = "";
    // static path = "";
    static fullPath(_pth = ""): string {
        let src = _pth;//.toLowerCase().trim();
        let node = this.source.find(s => src.startsWithI(s.tInfo.originalFinderText));
        if (node == undefined) return _pth;
        else return pathInfo.cleanPath(`${node.tInfo.replaceWith}${strOpt._trim(_pth, node.tInfo.textToFind)}`);
    }

    static getInfo(_pth = ""): RootPathRow | undefined {
        let src = _pth;//.toLowerCase().trim();
        let isAlreadyFullPath = false;
        let pathtype: PathType = 'none';
        //console.log('sharepnl//\//\///lffib\\mainForm.uc.js');        
        //console.log("sharepnl//\//\///lffib\\mainForm.uc.js".toFilePath());        
        // console.log('######################'+_pth);

        //console.clear();
        let findex = this.source.findIndex(s => {
            // console.log("=====>  "+s.tInfo.replaceLowerCaseText);
            if (src.startsWithI(s.tInfo.originalFinderText)) {
                pathtype = 'alice';
                return true;
            } else {
                pathtype = 'full';
                isAlreadyFullPath = src.startsWithI(s.tInfo.replaceWith);
                return isAlreadyFullPath;
            }
        });
        if (findex == -1) return undefined;
        let node = this.source[findex];
        node.index = findex;
        node.pathType = pathtype;
        node.isAlreadyFullPath = isAlreadyFullPath;
        //console.log(node.pathType);
        return node;
        /*let rtrn = rootPathHandler.convertToRow(node, isAlreadyFullPath);
        rtrn.index = findex;
        return rtrn;*/
    }

    static getInfoByAlices(alices: string): RootPathRow | undefined {
        //alices = alices.toLowerCase();
        let findex = this.source.findIndex(s => alices.equalIgnoreCase(s.tInfo.originalFinderText));
        if (findex == -1) return undefined;
        let node = this.source[findex];
        let rtrn = node;//rootPathHandler.convertToRow(node, false);
        rtrn.index = findex;
        return rtrn;
    }

    /*static convertToRow(node: ReplaceTextRow, isAlreadyFullPath: boolean): RootPathRow {
        return {
            id: node.id,
            path: node.replaceWith,
            alices: node.originalFinderText,
            isAlreadyFullPath: isAlreadyFullPath,
            cssVars: node.cssVars,
            index: -1,
        };
    }*/
}