import fs, { readFileSync } from "fs";
import { builder } from "ucbuilder/build/builder";
import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { SpecialExtEnum } from "ucbuilder/build/common";

export class fileWatcher {
    constructor(main: builder) { this.main = main; }
    main: builder;
    init(dirPath: string) {
        this.dirPath = dirPath;
    }
    dirPath: string = "";
    startWatch() {
        let _this = this;
        //  setTimeout(() => {
        _this.watcher = fs.watch(_this.dirPath, { recursive: true }, _this.watch_Listner);
        //  },4000);
    }
    stopWatch() {
        if (this.watcher != undefined)
            this.watcher.close();
    }
    watcher: fs.FSWatcher = undefined;

    watch_Listner = (evt: fs.WatchEventType, filepath: string) => {

        if (filepath == null || filepath == undefined || filepath.startsWith('.git')) return;
        filepath = filepath;
        if (filepath.endsWithI(codeFileInfo.___DESIGNER_EXT) ||
            filepath.endsWithI(SpecialExtEnum.uc + '.html') ||
            filepath.endsWithI(SpecialExtEnum.tpt + '.html')) {
            switch (evt) {
                case "change":

                    this.CHECK_FILE_MODIFIED((this.dirPath + '/' + filepath).toFilePath());
                    break;
                case "rename": // IF FILE CHANGED...
                    this.CHECK_FILE_MOVE((this.dirPath + '/' + filepath).toFilePath());
                    break;
            }
        }
    };
    CHECK_FILE_MODIFIED(currentPath: string) {
        let _this = this;
        if (currentPath.endsWithI(SpecialExtEnum.uc + '.html') || currentPath.endsWithI(SpecialExtEnum.tpt + '.html')) {
            let cFinfo = new codeFileInfo(codeFileInfo.getExtType(currentPath));
            cFinfo.parseUrl(currentPath);
            _this.stopWatch();
            _this.main.commonMng.rows.length = 0;
            _this.main.buildFile(cFinfo);
            _this.generatingIsInProcess = false;
            _this.startWatch();
        }
    }
    static oPath = /_FILE_PATH\s*=\s*\s*('|"|`)(.*?)\1\s*/gm;
    static getFilePathFromDesigner(content: string): string | undefined {

        let match = content.matchAll(this.oPath);
        let rval = match.next();
        if (rval.value)
            return rval.value[2];
        return undefined;
    }
    generatingIsInProcess = false;
    filesInQueue: string[] = [];
    CHECK_FILE_MOVE(currentPath: string) {
        let _this = this;
        let cFinfo: codeFileInfo, oFinfo: codeFileInfo;
        _this.generatingIsInProcess = true;
        console.log('__FILE_WATCHER___ CALLED..');
        console.log('called.');
        if (!fs.existsSync(currentPath)) return;
        if (currentPath.endsWith('.html')) { //
            cFinfo = new codeFileInfo(codeFileInfo.getExtType(currentPath));
            cFinfo.parseUrl(currentPath);
            let htContent = fs.readFileSync(cFinfo.html.fullPath, 'binary');
            if (htContent == '') {
                _this.stopWatch();
                _this.main.commonMng.rows.length = 0;
                _this.main.buildFile(cFinfo);
                _this.generatingIsInProcess = false;
                _this.startWatch();
            }
            return;
        }
        let key = fileWatcher.getFilePathFromDesigner(fs.readFileSync(currentPath, 'binary'));
        if (key == undefined) return;
        let oldPath = key;//window.atob(key);
        cFinfo = new codeFileInfo(codeFileInfo.getExtType(currentPath));
        cFinfo.parseUrl(currentPath);
        oFinfo = new codeFileInfo(codeFileInfo.getExtType(oldPath));
        oFinfo.parseUrl(oldPath);
        if (!oFinfo.mainFileRootPath.equalIgnoreCase(cFinfo.mainFileRootPath)) {
            _this.stopWatch();
            //  sharepnl/sampleForm/buttons/rightSide/rightButtonManage.uc
            let oNameSpace = 'R.' + (oFinfo.mainFileRootPath.split('/').slice(1, -1)).join('.');
            let cNameSpace = 'R.' + (cFinfo.mainFileRootPath.split('/').slice(1, -1)).join('.');
            this.main.commonMng.pathReplacement.push({
                findPath: oNameSpace,
                replaceWith: cNameSpace,
            })
            this.main.commonMng.pathReplacement.push({
                findPath: oFinfo.mainFileRootPath,
                replaceWith: cFinfo.mainFileRootPath
            });
            _this.main.renameFiles();
            _this.main.commonMng.rows.length = 0;
            _this.main.buildALL(false);
            _this.generatingIsInProcess = false;
            _this.startWatch();
        }

        //}
        _this.generatingIsInProcess = false;
        //     pathlist.length = 0;
        // _this.checkFile();
        // }, 2000)

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