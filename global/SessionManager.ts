import { pathInfo, objectOpt } from "@ucbuilder:/build/common";
import { FileDataBank } from "@ucbuilder:/global/fileDataBank";
import { Usercontrol } from "@ucbuilder:/Usercontrol";
import { sessionOptions,SessionOptions } from "@ucbuilder:/enumAndMore";

class SessionManager {
    varName: string = "SESSION_DATA";
    fStamp: string = "";
    options: SessionOptions;
    main: Usercontrol | undefined;
    ucExt: any;
    dataPath: string = "";

    init(main: Usercontrol, options: SessionOptions, uniqIdentity: string = ""): void {
        this.options = options;
        this.main = main;
        this.ucExt = main.ucExtends;
        this.dataPath = this.main.ucExtends.fileInfo.mainFilePath + '.sessionData.json';
    }

    prepareForAutoLoadIfExist(): void {
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

    varify = (newSession: any): boolean => {
        return true;
    }

    parentSource: any = undefined;
    callmeOnNextexParent: any = undefined;
    exchangeParentWith(newParent: any, callmeOnNextexParent: any = () => { }): void {
        newParent[this.options.uniqueIdentity] = this._source;
        if (this.parentSource != undefined) {
            delete this.parentSource[this.options.uniqueIdentity];
        }
        if (this.callmeOnNextexParent != undefined) this.callmeOnNextexParent();
        this.callmeOnNextexParent = callmeOnNextexParent;
        this.parentSource = newParent;
    }

    autoLoadSession: boolean = true;

    _source: any = {};

    get source(): any {
        return this._source;
    }

    set source(val: any) {
        this._source = val;
    }

    setSession(src: any): boolean {
        if (src != undefined && Object.keys(src).length != 0) {
            this._source = src;
            let ssnJsn = this.main[this.varName];
            if (ssnJsn == undefined) this.main[this.varName] = {};
            this.main[this.varName] = this.get("");
            this.main.ucExtends.Events.loadLastSession.fire();
            return true;
        } else {
            src = this._source;
            return false;
        }
    }

    getSession(): any {
        return this.source;
    }

    has(key: string): boolean {
        return key in this.source;
    }

    get(key: string = ''): any {
        if (key == "" || key == undefined || key == null)
            key = "";
        return this.source[key];
    }

    set(key: string = '', value: any): void {
        if (key == undefined || key == null)
            key = "";
        this.source[key] = value;
    }

    onModify(): void {
        let parent = this.main.ucExtends.PARENT;
        if (!parent.ucExtends.self.is(this.main.ucExtends.self))
            parent.ucExtends.session.onModify();
        else { this.writeFile(); }
    }


    readfile(fPath: string = ""): boolean {
        if (fPath != "") this.dataPath = fPath;
        if (pathInfo.existFile(this.dataPath)) {
            let data = FileDataBank.readFile(this.dataPath, {
                reloadData: true,
                replaceContentWithKeys: false,
            });
            let ssn = this.setSession(JSON.parse(data));
            this.main.ucExtends.formExtends.Events.completeSessionLoad.fire();
            return ssn;
        } else { 
            this.main.ucExtends.Events.newSessionGenerate.fire();
            return false;
        }
    }

    writeFile(): void {
        pathInfo.writeFile(this.dataPath, JSON.stringify(this.source));
    }
}

export { SessionManager }