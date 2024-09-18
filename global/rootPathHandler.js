"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootPathHandler = void 0;
const common_1 = require("ucbuilder/build/common");
const enumAndMore_1 = require("ucbuilder/enumAndMore");
const objectOpt_1 = require("ucbuilder/global/objectOpt");
const builder_1 = require("ucbuilder/build/builder");
class rootPathHandler {
    static get source() { return this._source; }
    static checkStatus(textToFindLower, textToReplaceLower) {
        let findex = this.source.findIndex(s => 
        // s.tInfo.originalLowerCaseText.includes(textToFindLower)
        s.tInfo.originalFinderText.includesI(textToFindLower)
            ||
                //textToFindLower.includes(s.tInfo.originalLowerCaseText)
                textToFindLower.includesI(s.tInfo.originalFinderText));
        // console.log('<<< '+ findex+" >>>>");
        if (findex == -1) {
            return "newRegister";
        }
        else {
            let row = this.source[findex];
            return;
            /*(row.tInfo.replaceLowerCaseText === textToReplaceLower.toLowerCase())*/
            (row.tInfo.replaceWith.equalIgnoreCase(textToReplaceLower))
                ?
                    "alreadyRegistered"
                :
                    "sameAlicesAlreadyExist";
        }
    }
    static fullPath(_pth = "") {
        let src = _pth; //.toLowerCase().trim();
        let node = this.source.find(s => src.startsWithI(s.tInfo.originalFinderText));
        if (node == undefined)
            return _pth;
        else
            return common_1.pathInfo.cleanPath(`${node.tInfo.replaceWith}${common_1.strOpt._trim(_pth, node.tInfo.textToFind)}`);
    }
    static getInfo(_pth = "") {
        let src = _pth; //.toLowerCase().trim();
        let isAlreadyFullPath = false;
        let pathtype = 'none';
        console.log('######################' + _pth);
        //console.clear();
        let findex = this.source.findIndex(s => {
            // console.log("=====>  "+s.tInfo.replaceLowerCaseText);
            if (src.startsWithI(s.tInfo.originalFinderText)) {
                pathtype = 'alice';
                return true;
            }
            else {
                pathtype = 'full';
                isAlreadyFullPath = src.startsWithI(s.tInfo.replaceWith);
                return isAlreadyFullPath;
            }
        });
        if (findex == -1)
            return undefined;
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
    static getInfoByAlices(alices) {
        //alices = alices.toLowerCase();
        let findex = this.source.findIndex(s => alices.equalIgnoreCase(s.tInfo.originalFinderText));
        if (findex == -1)
            return undefined;
        let node = this.source[findex];
        let rtrn = node; //rootPathHandler.convertToRow(node, false);
        rtrn.index = findex;
        return rtrn;
    }
}
exports.rootPathHandler = rootPathHandler;
_a = rootPathHandler;
rootPathHandler._source = [];
rootPathHandler.addRoot = (projectName, rootDirectoryOf /*replaceAlicesWith: string*/, pera) => {
    let param2 = objectOpt_1.newObjectOpt.copyProps(pera, enumAndMore_1.rootPathParam);
    let pathAlicesLower = projectName /*.toLowerCase()*/;
    let result = _a.checkStatus(pathAlicesLower, rootDirectoryOf.rootDir);
    switch (result) {
        case "newRegister":
            //replaceAlicesWith = strOpt.trim__(replaceAlicesWith.replace(/[\\/]{1,}/g, "/").toLowerCase(), '/');
            if (param2.addIntoFileDataBankAlso) {
                (() => __awaiter(void 0, void 0, void 0, function* () {
                    let { FileDataBank } = yield Promise.resolve().then(() => __importStar(require('ucbuilder/global/fileDataBank')));
                    FileDataBank.pushReplacableText(projectName, rootDirectoryOf.rootDir); // replaceAlicesWith
                }))();
            }
            if (param2.buildOption.addPathInProjectBuild) {
                builder_1.builder.addThisDirectories(rootDirectoryOf.rootDir);
            }
            if (param2.buildOption.removeSomeSpecialPathFromProjectBuild) {
                builder_1.builder.ignoreThisDirectories(rootDirectoryOf.rootDir + '/node_modules', rootDirectoryOf.rootDir + '/.git', rootDirectoryOf.rootDir + '/.vscode');
            }
            if (param2.addModule) {
                require('module-alias')
                    .addAlias(projectName, rootDirectoryOf.rootDir);
            }
            let rnode;
            rnode = {
                id: _a.source.length,
                path: rootDirectoryOf.rootDir,
                alices: projectName,
                isAlreadyFullPath: false,
                pathType: "none",
                cssVars: [],
                outputDirectory: '',
                index: -1,
                location: rootDirectoryOf,
                tInfo: {
                    id: _a.source.length,
                    originalFinderText: projectName,
                    //originalLowerCaseText: pathAlicesLower,
                    textToFind: common_1.strOpt.cleanTextForRegs(projectName),
                    replaceWith: rootDirectoryOf.rootDir,
                    //replaceLowerCaseText: rootDirectoryOf.rootDir.toLowerCase().trim(),
                    cssVars: [],
                }
            };
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
            _a.source.push(rnode);
            _a.source.sort((a, b) => {
                return b.tInfo.replaceWith.length - a.tInfo.replaceWith.length;
                //return b.tInfo.replaceLowerCaseText.length - a.tInfo.replaceLowerCaseText.length
            });
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
};
rootPathHandler.originalPath = "";
rootPathHandler.path = "";
