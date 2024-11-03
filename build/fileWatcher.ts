import fs, { readFileSync } from "fs";
import timers from "timers";
import { builder } from "ucbuilder/build/builder";
import { codeFileInfo, FileInfo } from "ucbuilder/build/codeFileInfo";

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
    static rowsToFollow: { evt: fs.WatchEventType, isFolder: boolean, filepath: string }[] = [];

    static isValidFileForPathReplacer(filePath: string) { return filePath.match(/\.ts$|\.scss$|\.html$/i) != null; }
    static isTSFile(filePath: string) { return filePath.match(/\.ts$/i) != null; }
    static isHTMLFile(filePath: string) { return filePath.match(/\.uc\.html$|\.tpt\.html$/i) != null; }
    dirMoveInfo = {
        newPath: '' as string,
        oldPath: '' as string,
    }
    watch_Listner = (evt: fs.WatchEventType, filepath: string) => {
        let _this = this;
        if (filepath == null || filepath == undefined || filepath.startsWith('node_modules')) return;

        let isFolder = fs.existsSync(filepath) && fs.lstatSync(filepath).isDirectory();
        if (fileWatcher.isHTMLFile(filepath) || isFolder) {
            //this.WHATTODO(evt,filepath);
            fileWatcher.rowsToFollow.push({ evt: evt, isFolder: isFolder, filepath: filepath });
            //if (fileWatcher.isGenerating) return;
            //timerCall();     

            timers.clearTimeout(fileWatcher.timeoutInterval);
            fileWatcher.timeoutInterval = timers.setTimeout(timerCall, 1000);
        }
        function timerCall() {
            let rows = [...fileWatcher.rowsToFollow];
            fileWatcher.isGenerating = true;
            fileWatcher.rowsToFollow.length = 0;
            _this.stopWatch();
            
            /*
            WHOLE FOLDER MOVE CODE
            console.log(rows); 
            let len = rows.length;
            console.log(len);
            if (len == 3) {
                let frow = rows[0];
                let lrow = rows[2];
                if (fs.existsSync(frow.filepath) && fs.existsSync(lrow.filepath)) {
                    let fstate = fs.lstatSync(frow.filepath);
                    let lstate = fs.lstatSync(lrow.filepath);
                    if (fstate.isDirectory() && lstate.isDirectory()) {
                        if (frow.evt == 'rename' && lrow.evt == 'change' && rows.length == 4) {
                            _this.dirMoveInfo.newPath = frow.filepath;
                            _this.dirMoveInfo.oldPath = lrow.filepath;
                            console.log(_this.dirMoveInfo);
                        }
                    }
                }
            }*/



            _this.main.commonMng.reset();
            for (let i = 0; i < rows.length; i++) {
                const rw = rows[i];
                if (rw.isFolder) continue;
                _this.WHATTODO(rw.evt, rw.filepath);
            }
            _this.generatingIsInProcess = true;
            console.log([..._this.main.commonMng.pathReplacement]);
            //debugger;
            //console.log('BUILDING...'+(new Date()).toLocaleTimeString());

            _this.main.buildALL();
            _this.generatingIsInProcess = false;
            fileWatcher.isGenerating = false;
            _this.startWatch();
        }
    };

    WHATTODO(evt: fs.WatchEventType, filepath: string) {

        //  this.stopWatch();
        switch (evt) {
            case "change":
                this.CHECK_FILE_MODIFIED((this.dirPath + '/' + filepath).toFilePath());
                break;
            case "rename": // IF FILE CHANGED...
                this.CHECK_FILE_MOVE((this.dirPath + '/' + filepath).toFilePath());
                break;
        }
        //  this.startWatch();

    }
    CHECK_FILE_MODIFIED(currentPath: string) {
        let _this = this;
        if (fileWatcher.isHTMLFile(currentPath)) {
            console.log('FILE_MODIFIED');
            let cFinfo = new codeFileInfo(codeFileInfo.getExtType(currentPath));
            cFinfo.parseUrl(currentPath);
            //_this.main.commonMng.rows.length = 0;
            //_this.main.buildFile(cFinfo);
            //_this.generatingIsInProcess = false;
        }
    }
    static oPath = /_FILE_PATH\s*=\s*\s*('|"|`)(.*?)\1\s*/gm;
    static getFilePathFromHTML(content: string): string | undefined {
        try {
            if (content.trim() != '') {
                let formHT = content.$() as HTMLElement;
                return formHT.getAttribute('x-at');
            } else return undefined;
        } catch {
            return undefined;
        }
        /*let match = content.matchAll(this.oPath);
        let rval = match.next();
        if (rval.value)
            return rval.value[2];
        return undefined;*/
    }
    generatingIsInProcess = false;
    filesInQueue: string[] = [];
    CHECK_FILE_MOVE(currentPath: string) {
        console.log('FILE_MOVE');
        let _this = this;
        let cFinfo: codeFileInfo, oFinfo: codeFileInfo;
        if (!fs.existsSync(currentPath)) { ///   IF FILE IS DELETED OR MOVED..
            cFinfo = new codeFileInfo(codeFileInfo.getExtType(currentPath));
            cFinfo.parseUrl(currentPath);
            if (fs.existsSync(cFinfo.designer.fullPath))
                fs.rmSync(cFinfo.designer.fullPath);
            return;
        }
        let key = fileWatcher.getFilePathFromHTML(fs.readFileSync(currentPath, 'binary'));
        if (key == undefined) {
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
                if (fs.existsSync(cFinfo.designer.fullPath))
                    fs.rmSync(cFinfo.designer.fullPath);
                return;
            }
        }
        let oldPath = key;//window.atob(key);
        cFinfo = new codeFileInfo(codeFileInfo.getExtType(currentPath));
        cFinfo.parseUrl(currentPath);
        oFinfo = new codeFileInfo(codeFileInfo.getExtType(oldPath));
        oFinfo.parseUrl(oldPath);
        if (!oFinfo.mainFileRootPath.equalIgnoreCase(cFinfo.mainFileRootPath)) {

            //  sharepnl/sampleForm/buttons/rightSide/rightButtonManage.uc
            let oNameSpace = 'R.' + (oFinfo.mainFileRootPath.split('/').slice(1, -1)).join('.');
            let cNameSpace = 'R.' + (cFinfo.mainFileRootPath.split('/').slice(1, -1)).join('.');
            this.main.commonMng.pushReplacement({
                findPath: oNameSpace,
                replaceWith: cNameSpace,
            })
            this.main.commonMng.pushReplacement({
                findPath: oFinfo.mainFileRootPath,
                replaceWith: cFinfo.mainFileRootPath
            });
            //console.log(oFinfo.designer.rootPath.trim_('.designer.ts'));
            //console.log(cFinfo.designer.rootPath.trim_('.designer.ts'));

            this.main.commonMng.pushReplacement({
                findPath: oFinfo.designer.rootPath.trim_('.designer.ts'),
                replaceWith: cFinfo.designer.rootPath.trim_('.designer.ts')
            });
            if (fs.existsSync(oFinfo.designer.fullPath))
                fs.rmSync(oFinfo.designer.fullPath);
            // let fileFolders = fs.readdirSync(dirPath);


        }

        //}
        _this.generatingIsInProcess = false;

    }
}