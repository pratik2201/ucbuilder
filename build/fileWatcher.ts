import fs from "fs";
import { builder } from "./builder";
import { codeFileInfo } from "./codeFileInfo";

export class fileWatcher {
    constructor(main: builder) { this.main = main; }
    main: builder;
    init(dirPath: string) {
        this.dirPath = dirPath;
    }
    dirPath: string = "";
    startWatch() {
        this.watcher = fs.watch(this.dirPath, { recursive: true }, this.watch_Listner);
    }
    stopWatch() {
        if (this.watcher != undefined)
            this.watcher.close();
    }
    watcher: fs.FSWatcher = undefined;

    watch_Listner = (evt: fs.WatchEventType, filepath: string) => {
        if (filepath == null || filepath == undefined) return;
        filepath = filepath;
        if (filepath.endsWithI(codeFileInfo.___DESIGNER_EXT) || filepath.endsWithI(codeFileInfo.___DESIGNER_SRC_EXT)) {
            switch (evt) {
                //case "change":
                //    console.log(`CHANGED :- ${filepath}`);

                //    break;
                case "rename":
                    let fullpath = (this.dirPath + '/' + filepath).toFilePath();
                    this.filesInQueue.push(fullpath);
                    if (this.generatingIsInProcess) return;
                    this.checkFile();
                    break;
            }
        }
    };
    static oPath = /_FILE_PATH\s*=\s*window\s*\.\s*atob\s*\(\s*('|"|`)(.*?)\1\s*\)/gm;
    static getFilePathFromDesigner(content: string):string|undefined {
        let match = content.matchAll(this.oPath);
        let rval = match.next();
        let key = rval.value[2];
        return key;
    }
    generatingIsInProcess = false;
    filesInQueue:string[] = [];
    checkFile() {
        let _this = this;
        _this.generatingIsInProcess = false;
        let pathlist = (this.filesInQueue.distinct()).filter(s => s.endsWithI(codeFileInfo.___DESIGNER_EXT));

        setTimeout(() => {
            for (let i = 0; i < pathlist.length; i++) {
                const _path = pathlist[i];
                console.log(_path);
            }
        }, 2000)
       
        /*if (fs.existsSync(fullpath)) {
            let content = fs.readFileSync(fullpath, 'binary');            
            let key = fileWatcher.getFilePathFromDesigner(content);
            if (key!=undefined) {
                let fpath = window.atob(key);
                let cfile = new codeFileInfo(codeFileInfo.getExtType(fullpath));
                cfile.parseUrl(fullpath);
                if (!cfile.mainFileRootPath.equalIgnoreCase(fpath)) {
                    this.main.commonMng.pathReplacement.push({
                        findPath: fpath,
                        replaceWith: cfile.mainFileRootPath
                    });
                    console.log(this.main.commonMng.pathReplacement.length);

                    if (this.main.commonMng.pathReplacement.length > 0) {
                        if (_this.generatingIsInProcess) return;
                        this.generatingIsInProcess = true;
                        setTimeout(() => {

                            _this.main.renameFiles();
                            _this.main.commonMng.rows.length = 0;
                            _this.main.buildALL(false);
                            _this.generatingIsInProcess = false;
                        }, 2000)
                    }
                }
            }
        }*/

    }
}