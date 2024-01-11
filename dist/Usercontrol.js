const { propOpt, objectOpt } = require("@ucbuilder:/build/common");
const { filterContent } = require("@ucbuilder:/global/filterContent");
const { commonEvent } = require("@ucbuilder:/global/commonEvent");
const { UCGenerateMode, ucOptions, ucStates } = require('@ucbuilder:/enumAndMore');
const { userControlStamp } = require("@ucbuilder:/global/userControlStamp");
const { SessionManager } = require("@ucbuilder:/global/SessionManager");
const { fileDataBank } = require("@ucbuilder:/global/fileDataBank");
const { loadGlobal } = require("@ucbuilder:/global/loadGlobal");
const { ATTR_OF } = require("@ucbuilder:/global/runtimeOpt");
const { ResourcesUC } = require("@ucbuilder:/ResourcesUC");
const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");
const { stylerRegs } = require("@ucbuilder:/global/stylerRegs");
class Usercontrol {
    constructor() {
        this.ucExtends = {
            get formExtends() { return this.form.ucExtends; },
            mode: 'client',
            get self() { return this.wrapperHT; },
            set caption(text) {
                this.designer.setCaption(text);
            },
            find(skey) {
                let ar = skey.split(',');
                let uniqStamp = this.stampRow.uniqStamp;
                ar = ar.map((s) => {
                    s = filterContent.select_inline_filter(s, uniqStamp);
                    return s;
                });
                return Array.from(this.self.querySelectorAll(ar.join(",")));
            },
            garbageElementsHT: undefined,
            setCSS_globalVar(key, value) {
                stylerRegs.__VAR.SETVALUE(key, this.stampRow.styler.rootInfo.id, 'g', value);
            },
            setCSS_localVar(key, value) {
                stylerRegs.__VAR.SETVALUE(key, this.cssVarStampKey, 'l', value, this.self);
            },
            setCSS_internalVar(key, value) {
                stylerRegs.__VAR.SETVALUE(key, stylerRegs.internalKey, 'i', value, this.self);
            },
            getCSS_globalVar(key) {
                return document.body.style.getPropertyValue(stylerRegs.__VAR.getKeyName(key, this.stampRow.styler.rootInfo.id, 'g'));
            },
            getCSS_localVar(key, localEle) {
                return this.self.style.getPropertyValue(stylerRegs.__VAR.getKeyName(key, this.cssVarStampKey, 'l'));
            },
            getCSS_internalVar(key, value) {
                return this.self.style.getPropertyValue(stylerRegs.__VAR.getKeyName(key, stylerRegs.internalKey, 'i'));
            },
            cssVarStampKey: '0',
            initializecomponent: (param0) => {
                let ucExt = this.ucExtends;
                ucExt.mode = param0.mode;
                if (param0.events.beforeInitlize != undefined)
                    param0.events.beforeInitlize(this);
                ucExt.isForm = (param0.parentUc == undefined);
                ucExt.fileInfo = param0.source.cfInfo;
                ucExt.session.init(this, param0.session, param0.session.uniqueIdentity);
                ucExt.stampRow = userControlStamp.getStamp(param0.source);
                ucExt.wrapperHT = ucExt.stampRow.dataHT.cloneNode(true);
                if (ucExt.isForm) {
                    ucExt.PARENT = this;
                    ucExt.form = this;
                    ResourcesUC.styler
                        .pushChild(ucExt.fileInfo.mainFilePath, ucExt.stampRow.styler, param0.wrapperHT.nodeName);
                    param0.wrapperHT.appendChild(ucExt.wrapperHT);
                }
                else {
                    ucExt.form = param0.parentUc.ucExtends.form;
                    ucExt.PARENT = param0.parentUc;
                    newObjectOpt.copyAttr(param0.wrapperHT, ucExt.wrapperHT);
                    ucExt.PARENT.ucExtends.stampRow.styler
                        .pushChild(ucExt.fileInfo.mainFilePath, ucExt.stampRow.styler, param0.wrapperHT.nodeName);
                    ucExt.garbageElementsHT = param0.wrapperHT.children;
                    param0.wrapperHT.after(ucExt.wrapperHT);
                    param0.wrapperHT.remove();
                }
                ucExt.wrapperHT.data(propOpt.ATTR.BASE_OBJECT, this);
                ucExt.passElement(ucExt.wrapperHT.children);
                let sizeChangeEvt = ucExt.Events.sizeChanged;
                sizeChangeEvt.Events.onChangeEventList = () => {
                    if (ucExt.resizerObserver == undefined) {
                        ucExt.resizerObserver = new ResizeObserver((cbpera) => {
                            sizeChangeEvt.fire(cbpera);
                        });
                        ucExt.resizerObserver.observe(ucExt.wrapperHT);
                    }
                    else {
                        if (sizeChangeEvt.length == 0) {
                            ucExt.resizerObserver.disconnect();
                            ucExt.resizerObserver = undefined;
                        }
                    }
                };
                ucExt.Events.activate.Events.onChangeEventList = () => {
                    if (ucExt.Events.activate.onCounter == 1) {
                        ucExt.self.addEventListener("focusin", (e) => {
                            ucExt.Events.activate.fire();
                        });
                    }
                };
                ucExt.Events.onDataExport = (data) => ucExt.PARENT.ucExtends.Events.onDataExport(data);
            },
            resizerObserver: undefined,
            finalizeInit: (param0) => {
                let ext = this.ucExtends;
                param0.source.cssContents = ext.stampRow.styler.parseStyleSeperator_sub({
                    data: (param0.source.cssContents == undefined ?
                        fileDataBank.readFile(ext.fileInfo.style.rootPath)
                        :
                            param0.source.cssContents),
                    localNodeElement: ext.self,
                    cssVarStampKey: ext.cssVarStampKey
                });
                loadGlobal.pushRow({
                    url: ext.fileInfo.style.rootPath,
                    stamp: ext.stampRow.stamp,
                    reloadDesign: param0.source.reloadDesign,
                    reloadKey: param0.source.reloadKey,
                    cssContents: param0.source.cssContents
                });
                ext.Events.afterInitlize.fire();
            },
            queryElements(selector, callback) {
                let elements = document.querySelectorAll(selector);
                elements.forEach(element => callback(element));
            },
            idList: [],
            passElement: (ele, applySubTree = true) => {
                let uExt = this.ucExtends;
                uExt.stampRow.passElement(ele, applySubTree);
                return ele;
            },
            isOurElement(ele) { return this.stampRow.isOurElement(ele); },
            isForm: false,
            fileInfo: undefined,
            wrapperHT: undefined,
            stageHT: undefined,
            form: undefined,
            session: new SessionManager(),
            Events: {
                afterInitlize: new commonEvent(),
                beforeClose: new commonEvent(),
                afterClose: new commonEvent(),
                captionChanged: new commonEvent(),
                winStateChanged: new commonEvent(),
                activate: new commonEvent(),
                loaded: new commonEvent(),
                loadLastSession: new commonEvent(),
                _newSessionGenerate: new commonEvent(),
                get newSessionGenerate() {
                    return this.winExt().Events._newSessionGenerate;
                },
                _completeSessionLoad: new commonEvent(),
                get completeSessionLoad() {
                    return this.winExt().Events._completeSessionLoad;
                },
                sizeChanged: new commonEvent(),
                winExt: () => this.ucExtends.form.ucExtends,
                onDataExport: (_data) => {
                    return false;
                },
                onDataImport: (_data) => {
                    return false;
                },
            },
            _windowstate: 'normal',
            get windowstate() { return this._windowstate; },
            set windowstate(state) { this._windowstate = state; this.Events.winStateChanged.fire(state); },
            PARENT: undefined,
            options: {
                ucExt: () => { return this.ucExtends; },
            },
            stampRow: undefined,
            destruct: () => {
                let res = { prevent: false };
                this.ucExtends.Events.beforeClose.fire(res);
                if (!res.prevent) {
                    this.ucExtends.wrapperHT.delete();
                    this.ucExtends.Events.afterClose.fire();
                    for (const key in this) {
                        this[key] = null;
                    }
                    return true;
                }
                return false;
            },
            designer: {
                setCaption: (text) => {
                    this.ucExtends.wrapperHT.setAttribute("x-caption", text);
                    this.ucExtends.Events.captionChanged.fire(text);
                },
                getAllControls: (specific) => {
                    let childs = {};
                    let uExt = this.ucExtends;
                    let fromElement = uExt.wrapperHT;
                    let uniqStamp = uExt.stampRow.uniqStamp;
                    if (specific != undefined) {
                        specific.forEach(itmpath => {
                            if (!(itmpath in childs)) {
                                let ele = fromElement.querySelector(`[${propOpt.ATTR.ACCESS_KEY}='${itmpath}'][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`);
                                fillObj(itmpath, ele);
                            }
                        });
                    }
                    else {
                        let eleAr = Array.from(fromElement.querySelectorAll(`[${propOpt.ATTR.ACCESS_KEY}][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`));
                        eleAr.forEach((ele) => {
                            fillObj(ele.getAttribute(propOpt.ATTR.ACCESS_KEY), ele);
                        });
                    }
                    function fillObj(itmpath, htEle) {
                        if (htEle != undefined)
                            childs[itmpath] = htEle;
                        else
                            console.warn('empty-controls-returned');
                    }
                    return childs;
                }
            },
        };
        Usercontrol._CSS_VAR_STAMP++;
        this.ucExtends.cssVarStampKey = 'u' + Usercontrol._CSS_VAR_STAMP;
    }
    static get ucOptionsStc() { return undefined; }
    static setChildValueByNameSpace(obj, namespace, valToAssign) {
        return objectOpt.setChildValueByNameSpace(obj, namespace, valToAssign);
    }
    static get giveMeHug() {
        let evalExp = /\(@([\w.]*?)\)/gim;
        let thisExp = /(^|\s)(this)(\W|$)/gim;
        return `
            arguments[arguments.length-1].source.beforeContentAssign = (content) => {
                let rtrn = content.replace(${evalExp},
                    (match, namespacetoObject, offset, input_string) => {
                        return eval(namespacetoObject);
                    });
                return rtrn;
            };
            super(arguments);
            Array.from(this.ucExtends.self.attributes)
            .filter(s => s.nodeName.startsWith("x."))
            .forEach(p => {
                let atr = p.nodeName.slice(2);
                let cv = designer.setChildValueByNameSpace(this, atr, eval(p.value.startsWith("=") ? "'" + p.value.slice(1) + "'" : p.value.replace(${thisExp},(mch,fc,ths,lc)=>fc+'this.ucExtends.PARENT'+lc)));
                if(!cv)
                    console.log("'"+ atr +"' property not set from designer");                
                else this.ucExtends.self.removeAttribute(p.nodeName)
            });
            
            if(arguments[arguments.length-1].mode=='designer'){  }
           
            `;
    }
}
Usercontrol._CSS_VAR_STAMP = 0;
module.exports = {
    Usercontrol
};
//# sourceMappingURL=Usercontrol.js.map