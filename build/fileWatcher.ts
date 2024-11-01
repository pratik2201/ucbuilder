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

    static isValidFileForPathReplacer(filePath: string) { return filePath.match(/\.ts$|\.scss$|\.html$/i) != null; }
    static isTSFile(filePath: string) { return filePath.match(/\.ts$/i) != null; }
    static isHTMLFile(filePath: string) { return filePath.match(/\.uc\.html$|\.tpt\.html$/i) != null; }
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
        if (fileWatcher.isHTMLFile(filepath)) {
            //this.WHATTODO(evt,filepath);
            fileWatcher.rowsToFollow.push({ evt, filepath });
            clearTimeout(fileWatcher.timeoutInterval);
            fileWatcher.timeoutInterval = setTimeout(timerCall, 1500);
        }
        function timerCall() {
            let rows = [...fileWatcher.rowsToFollow];
            fileWatcher.rowsToFollow.length = 0;
            _this.stopWatch();
           // console.log(rows);
          
           _this.main.commonMng.reset();
            for (let i = 0; i < rows.length; i++) {
                const rw = rows[i];
                
                _this.WHATTODO(rw.evt, rw.filepath);
            }
            _this.generatingIsInProcess = true;
          //  _this.main.renameFiles();
            console.log([..._this.main.commonMng.pathReplacement]);
            
            _this.main.buildALL();
            _this.generatingIsInProcess = false;
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
        /*if (currentPath.endsWith('.html')) { //
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
        }*/
        if (!fs.existsSync(currentPath)) return;
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
            fs.rmSync(oFinfo.designer.fullPath);
           // let fileFolders = fs.readdirSync(dirPath);


        }

        //}
        _this.generatingIsInProcess = false;
    
    }
}