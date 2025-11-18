import { log } from "console";
import { register } from "module";
import { FILE_WARCHER_FILE_ROW, ucUtil } from "../global/ucUtil.js";
import { IpcRendererHelper } from "../ipc/IpcRendererHelper.js";
import { nodeFn } from "../nodeFn.js";
import { builder } from "./builder.js";
import { codeFileInfo } from "./codeFileInfo.js";
import { correctpath } from "../ipc/enumAndMore.js";
import { UcDependencyScanner } from "./fileStates.js";
const renderer = IpcRendererHelper.Group(import.meta.url);
export class fileWatcher {
    //  /(x-from)="(.*?)"|import\s+(.*?)\s+from\s+["'](.*?)["'];|(@use|@import)\s["'](.*?)["']|({:)(.*?)}/gi
    constructor(main: builder) { this.main = main; }
    main: builder;

    WATCH_LIST = {
        removed: [] as string[],
        modified: [] as string[],
        moved: [] as { oldFile: string, newFile: string }[],
    }
    clear() {
        this.WATCH_LIST.modified.length =
            this.WATCH_LIST.removed.length =
            this.WATCH_LIST.moved.length = 0;
    }
    init() {
        const _this = this;

        renderer.on("updates", (e, update: string) => {
            this.doRecursion(update);
        });
        /*renderer.on("watch_removed", (e, removedPath) => {
             // console.log("🔴 File removed:", removedPath);
             _this.WATCH_LIST.removed.push(removedPath);
             _this.doWatch();
         });
         renderer.on("watch_modified", (e, changedPath) => {
             //console.log("🟠 File modified:", changedPath);
             _this.WATCH_LIST.modified.push(changedPath);
             _this.doWatch();
         });
 
         renderer.on("watch_moved", (e, oldFile, newFile) => {
             _this.WATCH_LIST.moved.push({ oldFile: oldFile, newFile: newFile });
             _this.doWatch();
             //console.log(`🔁 File moved: ${oldFile} → ${newFile}`);
         });*/
    }
    checkDesignerMove(update: FILE_WARCHER_FILE_ROW) {
        let toBuild: codeFileInfo[] = [];
        return;
        update.moved.forEach(f => {
            if (f.from.endsWith('.uc.ts') || f.from.endsWith('.tpt.ts')) {
                let tocInfo = new codeFileInfo(codeFileInfo.getExtType(f.to));
                tocInfo.parseUrl(f.to, 'src', nodeFn.url.pathToFileURL(f.to));
                toBuild.push(tocInfo);
            }
        });
        if (toBuild.length > 0) {
            let bld = window['$ucbuilder'] as builder;
            bld.buildFiles(toBuild, () => {
                console.log('builded..');
            });
        }
    }
    depScanner = new UcDependencyScanner(nodeFn.path as any,nodeFn.fs as any);
    static PATTERN: RegExp = /(x-from)\s*=\s*"(.*?)"|(import\s+.*?)\s+from\s+["'](.*?)["'];|(@use|@import)\s["'](.*?)["'];|({:)(.*?)}/gi;
    doRecursion = (updateStr: string) => {
        const _builder = this.main;
        const update: FILE_WARCHER_FILE_ROW = JSON.parse(updateStr);
        const _this = this;
        const changedFiles = new Map<string, string>();
        let bpath = nodeFn.path.join(_this.main.project.projectPath, _this.main.project.config.developer.build.buildPath);

        _builder.recursive(bpath, undefined, (pth) => {
            if (fileWatcher.isValidFileForPathReplacer(pth)) {
               
                let ext = pth.slice(pth.lastIndexOf('.'));
                if (!nodeFn.fs.existsSync(pth)) { console.log(pth); return; }
                let data = nodeFn.fs.readFileSync(pth, 'binary', undefined, false);
                let isChanged = false;
                let xdata =  _this.depScanner.ReplaceAll(data, pth, (e) => {
                   console.log(e);
                    return e.match;
                });
               
                
                data = data.replace(fileWatcher.PATTERN, (m, preeText: string, xpath: string) => {
                    if (preeText == undefined || xpath == undefined) {
                        console.log(m); console.log('----------------------'); 
                        return m;
                    }
                    console.log(preeText, xpath); 
                    let fpath = nodeFn.path.resolveFilePath(pth, xpath);
                    let findex = update.moved.findIndex(s => nodeFn.path.isSamePath(s.from, fpath));
                    let REL_PATH = '';
                    if (findex != -1) {
                        REL_PATH = nodeFn.path.relativeFilePath(pth, update.moved[findex].to);
                        isChanged = true;
                        REL_PATH = ucUtil.devEsc(REL_PATH);
                        switch (preeText) {
                            case 'x-from': return ` x-from="${REL_PATH}"`;
                            case '@use': return `@use "${REL_PATH}";`;
                            case '@import': return `@import "${REL_PATH}";`;
                            case '{:': return `{:${REL_PATH}}`;
                            default: return `${preeText} from "${REL_PATH}"`;  // import {} from "";
                        }
                    }
                    return m;
                });
            }
        });
        this.checkDesignerMove(update);
        // console.log(changedFiles);
        let isChanged = false;
        let replacedPath: string[] = [];

        update.moved.forEach((fnode) => {
            let data = undefined;
            if (fnode.to.endsWith('.designer.ts')) return;
            //  debugger;
            let ext = fnode.to.slice(fnode.to.lastIndexOf('.'));
            let ___kp = Object.keys(changedFiles).find(s => nodeFn.path.isSamePath(fnode.to, s));
            if (___kp != undefined) data = changedFiles[___kp];
            if (data == undefined && nodeFn.fs.existsSync(fnode.to)) {
                data = nodeFn.fs.readFileSync(fnode.to, 'binary', undefined, false);
            }
            isChanged = false;
            data = data.replace(/{:(.*?)}/gm, (m, xpath: string) => {
                if (xpath.length == 0) return m;
                let IsChanged_prevVal = isChanged;
                try {
                    let actualimportedFilePath = nodeFn.path.resolveFilePath(fnode.from, xpath);
                    let relpath = nodeFn.path.relativeFilePath(fnode.to, actualimportedFilePath);
                    isChanged = true;
                    replacedPath.push(fnode.from)
                    return `{:${relpath}}`;
                }
                catch (e) { isChanged = IsChanged_prevVal; return m; }
                return m;
            });
            //debugger;
            switch (ext) {
                case '.html':
                    data = data.replace(/\s+x-from\s*=\s*([\"'`])((?:\\.|(?!\1)[^\\])*)\1\s+/gim, (m, q: string, xpath: string) => {
                        xpath = ucUtil.devEsc(xpath);
                        if (xpath.length == 0 || replacedPath.includes(xpath)) return m;
                        let IsChanged_prevVal = isChanged;
                        try {
                            let actualimportedFilePath = nodeFn.path.resolveFilePath(fnode.from, xpath);
                            let relpath = nodeFn.path.relativeFilePath(fnode.to, actualimportedFilePath);
                            isChanged = true;
                            replacedPath.push(fnode.from)
                            return ` x-from="{:${relpath}}" `;
                        }
                        catch (e) { isChanged = IsChanged_prevVal; return m; }
                        return m;
                    });
                    break;
                case '.scss':
                    data = data.replace(/@(use|import)\s*\s+?["']([^"']+)["']\s*;/gim, (m, useOrImport, xpath: string) => {
                        xpath = ucUtil.devEsc(xpath);
                        if (xpath.length == 0 || replacedPath.includes(xpath)) return m;
                        let IsChanged_prevVal = isChanged;
                        try {
                            let actualimportedFilePath = nodeFn.path.resolveFilePath(fnode.from, xpath);
                            let relpath = nodeFn.path.relativeFilePath(fnode.to, actualimportedFilePath);
                            isChanged = true;
                            replacedPath.push(fnode.from)
                            return `@${useOrImport} "${relpath}";`;
                        }
                        catch (e) { isChanged = IsChanged_prevVal; return m; }
                        return m;
                    });
                    break;
            }
            if (isChanged) {
                changedFiles.set(fnode.to, data);
            }
        });
        renderer.sendSync('writeContents', [Object.fromEntries(changedFiles.entries())]);
        // let keys = Array.from(changedFiles.keys());
        // if (keys.length > 0)
        //     if (renderer.sendSync('rendererIgnorance.adFd', [...keys]) == true) {
        //         for (const [_path, contents] of changedFiles) {
        //             //if (nodeFn.fs.existsSync(_path))
        //             nodeFn.fs.writeFileSync(_path, contents, undefined, 'binary');
        //         }
        //         renderer.sendSync('rendererIgnorance.remoFve', [...keys]);
        //     }
    }
    isGenerating = false;
    isCollectiong = false;
    static isTSFile(filePath: string) { return filePath.match(/\.ts$/i) != null; }
    static isHTMLFile(filePath: string) { return filePath.match(/\.uc\.html$|\.tpt\.html$/i) != null; }
    static isUcHTMLFile(filePath: string) { return filePath.match(/\.uc\.html$/i) != null; }
    static isSCSSFile(filePath: string) { return filePath.match(/\.scss$/i) != null; }
    static isValidFileForPathReplacer(filePath: string) { return filePath.match(/\.ts$|\.scss$|\.html$/i) != null; }

    startWatch() {
        // let _this = this;
        // _this.watcher = nodeFn.fs.watch(_this.dirPath, { recursive: true }, _this.watch_Listner);
        let bpath = nodeFn.path.join(this.main.project.projectPath, this.main.project.config.developer.build.buildPath);

        renderer.send("startWatch", [bpath]);
    }
    async stopWatch() {
        return await renderer.Invoke("stopWatch", []);
    }

}