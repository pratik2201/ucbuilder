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
    static isGenerating = false;
    static hasTimeoutCleared = false;
    static timeoutInterval: any;
    static rowsToFollow: { evt: fs.WatchEventType, filepath: string }[] = [];

    watch_Listner = (evt: fs.WatchEventType, filepath: string) => {
        if (filepath != null) {
           /* let filename = filepath.substring(filepath.lastIndexOf('/'));
            //console.log(filename);            
            if ((filename.includes('.uc') || filename.includes('.tpt')) && !filename.endsWith('.js')) {
                console.log([evt, filepath]);
            }*/
                
        }
        
        let _this = this;
        if (filepath == null || filepath == undefined/* || filepath.startsWith('.git')*/) return;
        if (filepath.endsWithI(codeFileInfo.___DESIGNER_EXT) ||
            filepath.endsWithI(SpecialExtEnum.uc + '.html') ||
            filepath.endsWithI(SpecialExtEnum.tpt + '.html')) {
            //this.WHATTODO(evt,filepath);
            fileWatcher.rowsToFollow.push({ evt, filepath });
            clearTimeout(fileWatcher.timeoutInterval);
            fileWatcher.timeoutInterval = setTimeout(timerCall, 1500);
        }
        function timerCall() {
            let rows = [...fileWatcher.rowsToFollow];
            fileWatcher.rowsToFollow.length = 0;
            _this.stopWatch();
            console.log(rows);
            
            for (let i = 0; i < rows.length; i++) {
                const rw = rows[i];
                _this.WHATTODO(rw.evt, rw.filepath);
            }
            _this.startWatch();
        }
    };

    WHATTODO(evt: fs.WatchEventType, filepath: string) {

        this.stopWatch();
        switch (evt) {
            case "change":
                this.CHECK_FILE_MODIFIED((this.dirPath + '/' + filepath).toFilePath());
                break;
            case "rename": // IF FILE CHANGED...
                this.CHECK_FILE_MOVE((this.dirPath + '/' + filepath).toFilePath());
                break;
        }
        this.startWatch();

    }
    CHECK_FILE_MODIFIED(currentPath: string) {
        let _this = this;
        if (currentPath.endsWithI(SpecialExtEnum.uc + '.html') || currentPath.endsWithI(SpecialExtEnum.tpt + '.html')) {
            console.log('FILE_MODIFIED');
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
        console.log('FILE_MOVE');
        let _this = this;
        let cFinfo: codeFileInfo, oFinfo: codeFileInfo;
        _this.generatingIsInProcess = true;
        if (currentPath.endsWith('.html')) { //
            cFinfo = new codeFileInfo(codeFileInfo.getExtType(currentPath));
            cFinfo.parseUrl(currentPath);
            if (fs.existsSync(cFinfo.html.fullPath)) {

                let htContent = fs.readFileSync(cFinfo.html.fullPath, 'binary');
                if (htContent == '') {
                    _this.main.commonMng.rows.length = 0;
                    _this.main.buildFile(cFinfo);
                    _this.generatingIsInProcess = false;
                }
                return;
            } else {
                fs.rmSync(cFinfo.designer.fullPath);
                return;
            }
        }
        if (!fs.existsSync(currentPath)) return;
        let key = fileWatcher.getFilePathFromDesigner(fs.readFileSync(currentPath, 'binary'));
        if (key == undefined) return;
        let oldPath = key;//window.atob(key);
        cFinfo = new codeFileInfo(codeFileInfo.getExtType(currentPath));
        cFinfo.parseUrl(currentPath);
        oFinfo = new codeFileInfo(codeFileInfo.getExtType(oldPath));
        oFinfo.parseUrl(oldPath);
        if (!oFinfo.mainFileRootPath.equalIgnoreCase(cFinfo.mainFileRootPath)) {
            
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