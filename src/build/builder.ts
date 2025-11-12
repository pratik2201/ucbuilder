
import { SourceCodeNode } from "../ESUtil.js";
import { CommonEvent } from "../global/commonEvent.js";
import { SpecialExtEnum } from "../global/ucUtil.js";
import { IpcRendererHelper } from "../ipc/IpcRendererHelper.js";
import { ProjectManage } from "../ipc/ProjectManage.js";
import { ProjectRowR } from "ucbuilder/ipc/enumAndMore.js";
import { nodeFn } from "../nodeFn.js";
import { CommonRow } from "./buildRow.js";
import { commonParser } from "./codefile/commonParser.js";
import { codeFileInfo } from "./codeFileInfo.js";
import { fileWatcher } from "./fileWatcher.js";

export class builder {
    private ignoreDirs: string[] = [];
    project: ProjectRowR;
    ROOT_DIR = '';
    private static INSTANCE: builder;
    static GetInstance() {
        return this.INSTANCE ?? new builder();
    }
    constructor() {
        if (builder.INSTANCE != undefined) { throw new Error(`SINGLE INSTANCE ONLY use instead builder`); }
        this.ROOT_DIR = nodeFn.path.resolve();
        this.project = ProjectManage.getInfoByProjectPath(this.ROOT_DIR); 
        this.commonMng = new commonParser(this); 
        const _this = this;
        this.project.config.developer.build.ignorePath.forEach(pth => {
            _this.addToIgnore(pth);
        });
    } 
    projectDir: string = '';
    addToIgnore = (...pathlist: string[]) => {
        pathlist.forEach(p =>
            this.ignoreDirs.push(nodeFn.path.normalize(nodeFn.path.join(this.ROOT_DIR, p)))
        );
    }

    // buildThisDir(...pathlist: string[]) {
    //     for (let i = 0, iObj = pathlist, ilen = iObj.length; i < ilen; i++) {
    //         const iItem = iObj[i];
    //         this.dirsToBuild.push(ProjectManage.resolve(iItem, this.project.importMetaURL)/*["#toFilePath"](true)*/);
    //     }
    // }

    //filewatcher: fileWatcher;
    commonMng: commonParser;

    Event = {
        onSelect_xName: new CommonEvent<(ele: HTMLElement, row: CommonRow) => void>()
    }

    async buildALL(onComplete = () => { }, _fillReplacerPath = true) {
        let _this = this;
        let bpath = nodeFn.path.join(this.project.projectPath, this.project.config.developer.build.buildPath);
        this.recursive(bpath, undefined, (pth) => {
            _this.checkFileState(pth);
        });
        this.commonMng.gen.generateFiles(this.commonMng.rows);
        onComplete();
        // if (this.filewatcher != undefined) this.filewatcher.startWatch();
    }
    isIgnored = (pth: string, igList = this.ignoreDirs) => {
        return this.ignoreDirs.findIndex(s => {
            return nodeFn.path.isSamePath(s, pth)
        }) != -1;
    }
    /** @private */
    recursive(parentDir: string, ignoreDir = this.ignoreDirs, callback: (path: string) => void) {
        const _this = this;
        let DirectoryContents = nodeFn.fs.readdirSync(parentDir + '/');

        DirectoryContents.forEach((file: string) => {
            //let _path = pathInfo.cleanPath(parentDir + '/' + file);
            let _path = nodeFn.path.join(parentDir, file);//["#toFilePath"]();
            if (nodeFn.fs.isDirectory(_path)) {
                if (!_this.isIgnored(_path, ignoreDir))
                    this.recursive(_path, ignoreDir, callback);
            } else {
                callback(_path);
            }
        });
    }

    /** @param {codeFileInfo} fInfo */
    buildFiles(fInfos: codeFileInfo[], onComplete = () => { }) {
        setTimeout(() => {
            this.commonMng.reset();
            for (let i = 0, ilen = fInfos.length; i < ilen; i++) {
                const fInfo = fInfos[i];
                if (nodeFn.fs.existsSync(fInfo.pathOf[".html"])) {
                    this.checkFileState(fInfo.pathOf[".html"]);
                    this.commonMng.gen.generateFiles(this.commonMng.rows);
                }
            }
            onComplete();
        }, 1);
    }

    getOutputCode(fInfo: codeFileInfo, htmlContents: string): SourceCodeNode {
        this.checkFileState(fInfo.pathOf[".html"], htmlContents);
        let row = this.commonMng.rows[0];
        return {
            designerCode: this.commonMng.gen.getDesignerCode(row),
            jsFileCode: this.commonMng.gen.getJsFileCode(row)
        };
    }

    checkFileState(filePath: string, htmlContents?: string) {
        if (filePath.endsWith(SpecialExtEnum.uc + '.html')) { //  IF USER CONTROL
            this.commonMng.init(filePath, htmlContents);
        } else if (filePath.endsWith(SpecialExtEnum.tpt + '.html')) { //  IF TEMPLATE
            this.commonMng.init(filePath, htmlContents);
        }
    }
}

