"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const common_1 = require("ucbuilder/build/common");
const fileDataBank_1 = require("ucbuilder/global/fileDataBank");
class SessionManager {
    constructor() {
        this.varName = "SESSION_DATA";
        this.fStamp = "";
        this.dataPath = "";
        this.varify = (newSession) => {
            return true;
        };
        this.parentSource = undefined;
        this.callmeOnNextexParent = undefined;
        this.autoLoadSession = true;
        this._source = {};
    }
    init(main, options, uniqIdentity = "") {
        this.options = options;
        this.main = main;
        this.ucExt = main.ucExtends;
        this.dataPath = this.main.ucExtends.fileInfo.mainFilePath + '.sessionData.json';
    }
    prepareForAutoLoadIfExist() {
        let ext = this.main.ucExtends;
        this.set("", this.main[this.varName]);
        if (this.autoLoadSession) {
            if (this.options.addNodeToParentSession) {
                let parent = ext.PARENT;
                if (!parent.ucExtends.session.has(this.options.uniqueIdentity) && !ext.isForm) {
                    parent.ucExtends.session.set(this.options.uniqueIdentity, this._source);
                    this.parentSource = parent.ucExtends.session.source;
                }
                parent.ucExtends.Events.loadLastSession.on(() => {
                    this.setSession(parent.ucExtends.session.get(this.options.uniqueIdentity));
                });
            }
        }
    }
    exchangeParentWith(newParent, callmeOnNextexParent = () => { }) {
        newParent[this.options.uniqueIdentity] = this._source;
        if (this.parentSource != undefined) {
            delete this.parentSource[this.options.uniqueIdentity];
        }
        if (this.callmeOnNextexParent != undefined)
            this.callmeOnNextexParent();
        this.callmeOnNextexParent = callmeOnNextexParent;
        this.parentSource = newParent;
    }
    get source() {
        return this._source;
    }
    set source(val) {
        this._source = val;
    }
    setSession(src) {
        if (src != undefined && Object.keys(src).length != 0) {
            this._source = src;
            let ssnJsn = this.main[this.varName];
            if (ssnJsn == undefined)
                this.main[this.varName] = {};
            this.main[this.varName] = this.get("");
            this.main.ucExtends.Events.loadLastSession.fire();
            return true;
        }
        else {
            src = this._source;
            return false;
        }
    }
    getSession() {
        return this.source;
    }
    has(key) {
        return key in this.source;
    }
    get(key = '') {
        if (key == "" || key == undefined || key == null)
            key = "";
        return this.source[key];
    }
    set(key = '', value) {
        if (key == undefined || key == null)
            key = "";
        this.source[key] = value;
    }
    onModify() {
        let parent = this.main.ucExtends.PARENT;
        if (!parent.ucExtends.self.is(this.main.ucExtends.self))
            parent.ucExtends.session.onModify();
        else {
            this.writeFile();
        }
    }
    readfile(fPath = "") {
        if (fPath != "")
            this.dataPath = fPath;
        if (common_1.pathInfo.existFile(this.dataPath)) {
            let data = fileDataBank_1.FileDataBank.readFile(this.dataPath, {
                reloadData: true,
                replaceContentWithKeys: false,
            });
            let ssn = this.setSession(JSON.parse(data));
            this.main.ucExtends.formExtends.Events.completeSessionLoad.fire();
            return ssn;
        }
        else {
            this.main.ucExtends.Events.newSessionGenerate.fire();
            return false;
        }
    }
    writeFile() {
        common_1.pathInfo.writeFile(this.dataPath, JSON.stringify(this.source));
    }
}
exports.SessionManager = SessionManager;
