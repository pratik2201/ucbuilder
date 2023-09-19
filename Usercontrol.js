
const { propOpt, controlOpt, uniqOpt, objectOpt } = require("@ucbuilder:/build/common");
const { filterContent } = require("@ucbuilder:/global/filterContent");
const { commonEvent } = require("@ucbuilder:/global/commonEvent");
const { ucOptions,ucStates } = require('@ucbuilder:/enumAndMore');
const { focusManage } = require("@ucbuilder:/global/focusManage");
const { userControlStamp } = require("@ucbuilder:/global/userControlStamp");
const { SessionManager } = require("@ucbuilder:/global/SessionManager");
const { fileDataBank } = require("@ucbuilder:/global/fileDataBank");
const { loadGlobal } = require("@ucbuilder:/global/loadGlobal");
const { ATTR_OF } = require("@ucbuilder:/global/runtimeOpt");
const { ResourcesUC } = require("@ucbuilder:/ResourcesUC");
const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");

/** 
 * @typedef {import ('@ucbuilder:/global/stylerRegs').stylerRegs} stylerRegs
 * @typedef {import ('@ucbuilder:/global/userControlStamp').userControlStampRow} userControlStampRow
 * @typedef {import ('@ucbuilder:/global/drag/transferation').transferDataNode} transferDataNode
 * @typedef {import ('@ucbuilder:/build/codeFileInfo').codeFileInfo} codeFileInfo
 */
class Usercontrol {

    

    /** @type {ucOptions}  */
    static get ucOptionsStc() { return undefined; }
    /**
    * @param {{}} obj 
    * @param {string} namespace property name i.e. person.address.home;
    * @param {string} valToAssign value to assign last property
    */
    static setChildValueByNameSpace(obj, namespace, valToAssign) {
        return objectOpt.setChildValueByNameSpace(obj, namespace, valToAssign)
    }
    static get giveMeHug() {
        let evalExp = /\(@([\w.]*?)\)/gim;
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
                let cv = designer.setChildValueByNameSpace(this, atr, eval(p.value.startsWith("=") ? "'"+p.value.slice(1)+"'":p.value));
                if(!cv)
                    console.log("'"+ atr +"' property not set from designer");                
                else this.ucExtends.self.removeAttribute(p.nodeName)
            });
            `;

    }
    static NEW_VALUE = "ANKITA LOVE PRATIK";
    constructor() {
        
    }
    /** @private */
    static ATTR = {
        DISABLE: {
            NEW_VALUE: "disnval" + uniqOpt.randomNo(),
            OLD_VALUE: "disoval" + uniqOpt.randomNo(),
        }
    }
    ucExtends = {
        get formExtends() { return this.form.ucExtends; },
        get self() { return this.wrapperHT; },
        /** @type {string}  */
        set caption(text) {
            this.designer.setCaption(text);
        },
        /**
        * @param {string} skey 
        * @returns {HTMLElement[]}
        */
        find(skey) {
            //let exp = /(["=> \w\[\]-^|#~$*.+]*)(::|:)([-\w\(\)]+)/g;
            let ar = skey.split(',');
            //let q = "";
            let uniqStamp = this.stampRow.uniqStamp;
            ar = ar.map((s) => {
                s = filterContent.select_inline_filter(s, uniqStamp);
                return s;
            });
            // console.log(ar.join(","));
            return Array.from(this.self.querySelectorAll(ar.join(",")));
        },
        //fileStamp: "",
        /** @type {HTMLCollection}  */
        garbageElementsHT: undefined,
        /**
         * @param {ucOptions} param0 
         */
        initializecomponent: (param0) => {
            let ucExt = this.ucExtends;
            if (param0.events.beforeInitlize != undefined) param0.events.beforeInitlize(this);
            ucExt.isForm = (param0.parentUc == undefined);
            ucExt.fileInfo = param0.source.fInfo;
            
            ucExt.session.init(this, param0.session, param0.session.uniqueIdentity);
            ucExt.stampRow = userControlStamp.getStamp(param0.source);
            ucExt.wrapperHT = ucExt.stampRow.dataHT.cloneNode(true);
            if (ucExt.isForm) { /// form
                ucExt.PARENT = this;
                ucExt.form = this;
                ResourcesUC.styler
                    .pushChild(
                        ucExt.fileInfo.mainFilePath,
                        ucExt.stampRow.styler, param0.wrapperHT.nodeName);
                param0.wrapperHT.appendChild(ucExt.wrapperHT);
            } else {   // usercontrol
                ucExt.form = param0.parentUc.ucExtends.form;
                ucExt.PARENT = param0.parentUc;
                newObjectOpt.copyAttr(param0.wrapperHT, ucExt.wrapperHT);
                
                ucExt.PARENT.ucExtends.stampRow.styler
                    .pushChild(
                        ucExt.fileInfo.mainFilePath,
                        ucExt.stampRow.styler, param0.wrapperHT.nodeName);
                ucExt.garbageElementsHT = param0.wrapperHT.children;
                // console.log(param0.wrapperHT);
                param0.wrapperHT.after(ucExt.wrapperHT);
                param0.wrapperHT.remove();
            }
            ucExt.wrapperHT.data(propOpt.ATTR.BASE_OBJECT, this);
            ucExt.passElement(ucExt.wrapperHT.children);
            /** @type {commonEvent}  */
            let sizeChangeEvt = ucExt.Events.sizeChanged;
            sizeChangeEvt.Events.onChangeEventList = () => {
                if (ucExt.resizerObserver == undefined) {
                    ucExt.resizerObserver = new ResizeObserver((cbpera) => {
                        sizeChangeEvt.fire(cbpera);
                    });
                    ucExt.resizerObserver.observe(ucExt.wrapperHT);
                } else {
                    if (sizeChangeEvt.length == 0) {
                        ucExt.resizerObserver.disconnect();
                        ucExt.resizerObserver = uniqOpt;
                    }
                }
            }
            ucExt.Events.activate.Events.onChangeEventList = () => {
                if (ucExt.Events.activate.onCounter == 1) {
                    ucExt.self.addEventListener("focusin", (e) => {
                        ucExt.Events.activate.fire();
                    });
                }
            }
            ucExt.Events.onDataExport = (data) =>
                ucExt.PARENT.ucExtends.Events.onDataExport(data);
        },
        /** @type {ResizeObserver}  */
        resizerObserver: undefined,
        /**
        * @private
        * @param {ucOptions} param0 
        */
        finalizeInit: (param0) => {
            let ext = this.ucExtends;
            param0.source.cssContents = ext.stampRow.styler.parseStyleSeperator(
                (param0.source.cssContents == undefined ?
                    fileDataBank.readFile(ext.fileInfo.style.rootPath)
                    :
                    param0.source.cssContents));
            loadGlobal.pushRow({
                url: ext.fileInfo.style.rootPath,
                stamp: ext.stampRow.stamp,
                reloadDesign: param0.source.reloadDesign,
                reloadKey: param0.source.reloadKey,
                cssContents: param0.source.cssContents
            });
            if (param0.events.afterInitlize != undefined) param0.events.afterInitlize(this);
        },


        queryElements(selector, callback) {
            let elements = document.querySelectorAll(selector);
            elements.forEach(element => callback(element));
        },


        idList: [],
        /**
         * @param {boolean} applySubTree 
         * @returns {HTMLElement}
         */
        passElement: (ele, applySubTree = true) => {
            let uExt = this.ucExtends;
            /*uExt.idList.push(...*/uExt.stampRow.passElement(ele, applySubTree);/*);*/
            return ele;
        },
        isOurElement(ele) { return this.stampRow.isOurElement(ele); },
        isForm: false,
        /** @type {codeFileInfo} */
        fileInfo: undefined,

        /** @type {HTMLElement}  */
        wrapperHT: undefined,
        /** @type {HTMLElement}  */
        stageHT: undefined,
        /** @type {Usercontrol} */
        form: undefined,
        /** @type {SessionManager}  */
        session: new SessionManager(),

        Events: {
            /**
             * @type {{on:(callback = (
             *          _callback:(prevent:boolean = false)=>{  },
             *          _stamp:string|undefined,
             * ) =>{})} & commonEvent}
             */
            beforeClose: new commonEvent(),

            /**
             * @type {{on:(callback = () =>{})} & commonEvent}
             */
            afterClose: new commonEvent(),

            /**
             * @type {{on:(callback = (
             *          _newCaptionText:string
             * ) =>{})} & commonEvent}
             */
            captionChanged: new commonEvent(),

            /**
             * @type {{on:(callback = (
             *          _state:ucStates
             * ) =>{})} & commonEvent}
             */
            winStateChanged: new commonEvent(),

            /**
             * @type {{on:(callback = () =>{})} & commonEvent}
             */
            loadLastSession: new commonEvent(),

            /**
             * @type {{on:(callback = () =>{})} & commonEvent}
             */
            activate: new commonEvent(),

            /** 
             * @type {{on:(callback = () =>{})} & commonEvent} 
             **/
            loaded: new commonEvent(),

            /** @private @type {{on:(callback = () =>{})} & commonEvent} */
            _completeSessionLoad: new commonEvent(),
            get completeSessionLoad() {
                return this.winExt().Events._completeSessionLoad;
            },

            /** 
             * @private
             * @type {{on:(callback = (
             *          _arg:ResizeObserverEntry[]
             * ) =>{})} & commonEvent}
             */
            sizeChanged: new commonEvent(),

            winExt: () => this.ucExtends.form.ucExtends,

            /** @param {transferDataNode} _data @returns bool whether successful or not */
            onDataExport: (_data) => {
                return false;
            },

            /** @param {transferDataNode} _data @returns bool whether successful or not */
            onDataImport: (_data) => {
                return false;
            },

        },

        /** 
         * @private 
         * @type {ucStates}
         */
        _windowstate: 'normal',
        get windowstate() { return this._windowstate; },
        set windowstate(state) { this._windowstate = state; this.Events.winStateChanged.fire(state); },
        /** @type {Usercontrol} PARENT OBJECT REFERENCE   */
        PARENT: undefined,
        options: {
            /** @private */
            ucExt: () => { return this.ucExtends; },



            /*  activate() {
                  this.ucExt().Events.activate.fire();
              }*/
        },
        /** @private */
        focusMng: new focusManage(),
        /** @type {userControlStampRow} css selector to self user control */
        stampRow: undefined,


        //styler: new stylerRegs(),
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

            setfreez: (freez) => {
                let ucExt = this.ucExtends;
                let element = ucExt.wrapperHT;
                if (freez) {
                    ucExt.focusMng.fatch();
                    element.setAttribute('active', '0');
                    let eles = element.querySelectorAll(controlOpt.ATTR.editableControls);
                    eles.forEach(
                        /** @param {HTMLElement} e */
                        e => {
                            let disableAttr = e.getAttribute("disabled");
                            if (disableAttr != null) e.data(Usercontrol.ATTR.DISABLE.OLD_VALUE, disableAttr);
                            e.setAttribute('disabled', true);
                            e.setAttribute(Usercontrol.ATTR.DISABLE.NEW_VALUE, true);
                        });
                } else {
                    element.setAttribute('active', '1');
                    let eles = element.querySelectorAll(`[${Usercontrol.ATTR.DISABLE.NEW_VALUE}]`);
                    eles.forEach(
                        /** @param {HTMLElement} e */
                        e => {
                            let disableAttr = e.data(Usercontrol.ATTR.DISABLE.OLD_VALUE);
                            if (disableAttr != undefined) e.setAttribute('disabled', disableAttr);
                            else e.setAttribute('disabled', false);
                            e.removeAttribute('disabled', Usercontrol.ATTR.DISABLE.NEW_VALUE);
                        });
                    //ucExt.Events.activate.fire();
                    ucExt.focusMng.focus();
                }
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
                } else {
                    let eleAr = Array.from(fromElement.querySelectorAll(`[${propOpt.ATTR.ACCESS_KEY}][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`));
                    eleAr.forEach((ele) => {
                        fillObj(ele.getAttribute(propOpt.ATTR.ACCESS_KEY), ele);
                    });
                }
                /**
                 * @param {string} itmpath 
                 * @param {HTMLElement} htEle 
                 */
                function fillObj(itmpath, htEle) {
                    if (htEle != undefined)
                        childs[itmpath] = htEle;
                    else
                        console.warn('empty-controls-returned');
                }
                return childs;
            }
        },

        // process: {
        //     /** @private */
        //     _me: () => this.ucExtends.wrapperHT,
        //     get me() { return this._me; },
        //     /** @private */
        //     _main: () => this.ucExtends.form,
        //     /** @type {Usercontrol} */
        //     get main() { return this._main(); },
        //     focusNext: () => { /*this.ucExtends.form.Form_extended.tabManage.manager.focusNext();*/ },
        //     focusPrev: () => { /*this.ucExtends.Form_extended.tabManage.manager.focusPrev();*/ },
        //     getwins: (url) => { /*return this.ucExtends.form.Form_extended.process.getwins(url);*/ },
        //     getucs: (url) => { /*return this.ucExtends.form.Form_extended.process.getucs(url);*/ },
        //     get events() { /*return this.main.Form_extended.Events;*/ },
        //     get tabManage() {/* return this.main.Form_extended.tabManage;*/ },
        //     get resources() {/* return this.main.Form_extended.resources;*/ },
        // }
    };
}
module.exports = {
    Usercontrol
};