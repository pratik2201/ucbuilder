const { pathInfo, objectOpt } = require("@ucbuilder:/build/common");
const { fileDataBank } = require("@ucbuilder:/global/fileDataBank");
const { Usercontrol } = require("@ucbuilder:/Usercontrol");
const { sessionOptions } = require("@ucbuilder:/enumAndMore");


class SessionManager {
    constructor() { }
    varName = "SESSION_DATA";
    fStamp = "";
    /** @type {sessionOptions}  */
    options = undefined;
    /** 
     * @param {Usercontrol} main 
     * @param {string} uniqIdentity 
     * @param {sessionOptions} options
     */
    init(main, options, uniqIdentity = "") {

        this.options = options;
        this.main = main;
        this.ucExt = main.ucExtends;
        //this.options.uniqueIdentity = /*this.fStamp + */ "" + uniqIdentity;
        this.dataPath = this.main.ucExtends.fileInfo.mainFilePath + '.sessionData.json';
    }
    //options.uniqueIdentity = "";
    //get stamp() { return this.ucExt.fileStamp/*+"_"+this.uniqIdentity*/; }

    prepareForAutoLoadIfExist() {
        let ext = this.main.ucExtends;
        this.set("", this.main[this.varName]);
        if (this.autoLoadSession) {
            if (this.options.addNodeToParentSession) {
                let parent = ext.PARENT;
                if (!parent.ucExtends.session.has(this.options.uniqueIdentity) && !ext.isForm) {

                    parent.ucExtends.session.set(this.options.uniqueIdentity, this._source);
                    //console.log(parent.ucSession.source);uniqueIdentity
                    this.parentSource = parent.ucExtends.session.source;
                }
                parent.ucExtends.Events.loadLastSession.on(() => {
                    this.setSession(parent.ucExtends.session.get(this.options.uniqueIdentity));
                });
            }
        }
    }
    varify = (newSession) => {
        return true;
    }
    /** @type {{}}  */
    parentSource = undefined;
    callmeOnNextexParent = undefined;
    exchangeParentWith(newParent, callmeOnNextexParent = () => { }) {


        newParent[this.options.uniqueIdentity] = this._source;//this.get();

        if (this.parentSource != undefined) {
            delete this.parentSource[this.options.uniqueIdentity];
        }
        if (this.callmeOnNextexParent != undefined) this.callmeOnNextexParent();
        this.callmeOnNextexParent = callmeOnNextexParent;
        this.parentSource = newParent;
    }


    autoLoadSession = true;

    //addSessionNodeToParentUC = false;

    //hasLoadedBySession = false;


    /** @private */
    _source = {
        // "": {},
    };
    get source() { return this._source; }
    set source(val) {
        this._source = val;
    }
    /**
     * @param {{}} src 
     * @returns {boolean} return true if assigned otherwise false 
     */
    setSession(src) {
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
        if (/*key == "" || */key == undefined || key == null)
            key = "";
        this.source[key] = value;
    }





    onModify() {
        let parent = this.main.ucExtends.PARENT;
        if (!parent.ucExtends.self.is(this.main.ucExtends.self))
            parent.ucExtends.session.onModify();
        else { this.writeFile(); }
    }

    dataPath = "";
    /**
     * @param {string} fPath session file path
     * @returns {boolean} return true if assigned otherwise false 
     */
    readfile(fPath = "") {
        if (fPath != "") this.dataPath = fPath;
        if (pathInfo.existFile(this.dataPath)) {
            let data = fileDataBank.readFile(this.dataPath, {
                reloadData: true,
                replaceContentWithKeys: false,
            });
            let ssn = this.setSession(JSON.parse(data));
            this.main.ucExtends.formExtends.Events.completeSessionLoad.fire();
            return ssn;
        } else return false;
    }
    writeFile() {
        pathInfo.writeFile(this.dataPath, JSON.stringify(this.source));
    }
}
module.exports = { SessionManager }