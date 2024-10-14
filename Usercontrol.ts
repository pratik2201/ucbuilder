
import { propOpt, objectOpt, controlOpt } from "ucbuilder/build/common";
import { FilterContent } from "ucbuilder/global/filterContent";
import { CommonEvent } from "ucbuilder/global/commonEvent";
import { UCGenerateMode, UcOptions, UcStates } from 'ucbuilder/enumAndMore';
import { userControlStamp, userControlStampRow } from "ucbuilder/global/userControlStamp";
import { SessionManager } from "ucbuilder/global/SessionManager";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { LoadGlobal } from "ucbuilder/global/loadGlobal";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { ResourcesUC } from "ucbuilder/ResourcesUC";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { stylerRegs } from "ucbuilder/global/stylerRegs";
import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { TransferDataNode } from "ucbuilder/global/drag/transferation";


export class Usercontrol {
    static extractArgs = (args: IArguments) => newObjectOpt.extractArguments(args);
    static UcOptionsStc: UcOptions;
    static setChildValueByNameSpace(obj: {}, namespace: string, valToAssign: string): boolean {
        return objectOpt.setChildValueByNameSpace(obj, namespace, valToAssign);
    }
    static assignPropertiesFromDesigner(form: Usercontrol) {
        let _self = form.ucExtends.self as HTMLElement;
        let thisExp = /(^|\s)(this)(\W|$)/gim;
        Array.from(_self.attributes)
            .filter(s => s.nodeName.startsWith("x."))
            .forEach(p => {
                let atr = p.nodeName.slice(2);
                console.log(atr + ' = ' + p.value.slice(1));
                objectOpt.setChildValueByNameSpace(form, atr,
                    p.value.startsWith("=") ?
                        p.value.slice(1)
                        :
                        eval(p.value.replace(thisExp, (mch, fc, ths, lc) => fc + 'form.ucExtends.PARENT' + lc))

                );
                /* let cv = this.setChildValueByNameSpace(form, atr,
                     eval(
                         p.value.startsWith("=") ?
                             "'" + p.value.slice(1) + "'"
                         :
                             p.value.replace(thisExp, (mch, fc, ths, lc) => fc + 'this.ucExtends.PARENT' + lc)));
                 if(!cv)
                     console.log("'"+ atr +"' property not set from designer");                
                 else _self.removeAttribute(p.nodeName)*/
            });
    }
    static get giveMeHug(): string {
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
    static _CSS_VAR_STAMP = 0;
    constructor() {
        Usercontrol._CSS_VAR_STAMP++;
        this.ucExtends.cssVarStampKey = 'u' + Usercontrol._CSS_VAR_STAMP;
    }

    public ucExtends = {

        mode: 'client' as UCGenerateMode,
        fileInfo: undefined as codeFileInfo,
        form: undefined as Usercontrol,
        PARENT: undefined as Usercontrol,
        session: new SessionManager(),
        stampRow: undefined as userControlStampRow,
        wrapperHT: undefined as HTMLElement,
        stageHT: undefined as HTMLElement,
        isDialogBox: false as boolean,
        parentDependantIndex: -1 as number,
        dependant: [] as Usercontrol[],
        isForm: false,
        get formExtends() { return this.form.ucExtends; },
        get self(): HTMLElement { return this.wrapperHT; },
        set caption(text: string) {
            this.designer.setCaption(text);
        },
        find(skey: string): HTMLElement[] {
            let ar = skey.split(',');
            let uniqStamp = this.stampRow.uniqStamp;
            ar = ar.map((s) => {
                s = FilterContent.select_inline_filter(s, uniqStamp);
                return s;
            });
            return Array.from(this.self.querySelectorAll(ar.join(",")));
        },
        garbageElementsHT: undefined as HTMLCollection,
        setCSS_globalVar(key: string, value: string): void {
            stylerRegs.__VAR.SETVALUE(key, '' + this.stampRow.styler.rootInfo.id, 'g', value);
        },
        setCSS_localVar(key: string, value: string): void {
            stylerRegs.__VAR.SETVALUE(key, this.cssVarStampKey, 'l', value, this.self);
        },
        setCSS_internalVar(key: string, value: string): void {
            stylerRegs.__VAR.SETVALUE(key, stylerRegs.internalKey, 'i', value, this.self);
        },
        getCSS_globalVar(key: string): string {
            return document.body.style.getPropertyValue(stylerRegs.__VAR.getKeyName(key, '' + this.stampRow.styler.rootInfo.id, 'g'));
        },
        getCSS_localVar(key: string, localEle: HTMLElement): string {
            return this.self.style.getPropertyValue(stylerRegs.__VAR.getKeyName(key, this.cssVarStampKey, 'l'));
        },
        getCSS_internalVar(key: string, value: string): string {
            return this.self.style.getPropertyValue(stylerRegs.__VAR.getKeyName(key, stylerRegs.internalKey, 'i'));
        },
        cssVarStampKey: '0',
        initializecomponent: (param0: UcOptions): void => {
            let ucExt = this.ucExtends;
            ucExt.mode = param0.mode;
            if (param0.events.beforeInitlize != undefined) param0.events.beforeInitlize(this);
            ucExt.isForm = (param0.parentUc == undefined);
            ucExt.fileInfo = param0.source.cfInfo;

            ucExt.session.init(this, param0.session, param0.session.uniqueIdentity);
            ucExt.stampRow = userControlStamp.getStamp(param0.source);
            ucExt.wrapperHT = ucExt.stampRow.dataHT.cloneNode(true) as HTMLElement;
           
            if (ucExt.isForm) {
                ucExt.PARENT = this;
                ucExt.form = this;
                ResourcesUC.styler
                    .pushChild(
                        ucExt.fileInfo.mainFilePath,
                        ucExt.stampRow.styler, param0.replaceWrapperWith.nodeName);
               // param0.wrapperHT.appendChild(ucExt.wrapperHT);
            } else {
                ucExt.form = param0.parentUc.ucExtends.form;
                ucExt.PARENT = param0.parentUc;
                newObjectOpt.copyAttr(param0.replaceWrapperWith, ucExt.wrapperHT);
                ucExt.PARENT.ucExtends.stampRow.styler
                    .pushChild(
                        ucExt.fileInfo.mainFilePath,
                        ucExt.stampRow.styler, param0.replaceWrapperWith.nodeName);
                ucExt.garbageElementsHT = param0.replaceWrapperWith.children;
                
                console.log(param0.replaceWrapperWith.isConnected+":"+ucExt.wrapperHT.isConnected);
                console.log(ucExt.wrapperHT);
                
                param0.replaceWrapperWith.after(ucExt.wrapperHT);
                param0.replaceWrapperWith.remove();
            }
            let pucExt = ucExt.PARENT.ucExtends;
            ucExt.wrapperHT.data(propOpt.ATTR.BASE_OBJECT, this);
            if (!ucExt.isForm) {
                ucExt.parentDependantIndex = pucExt.dependant.length;
                pucExt.dependant.push(this);
            }
            ucExt.passElement(controlOpt.getArray(ucExt.wrapperHT.children));
            let sizeChangeEvt = ucExt.Events.sizeChanged;
            sizeChangeEvt.Events.onChangeEventList = () => {
                if (ucExt.resizerObserver == undefined) {
                    ucExt.resizerObserver = new ResizeObserver((cbpera) => {
                        sizeChangeEvt.fire([cbpera]);
                    });
                    ucExt.resizerObserver.observe(ucExt.wrapperHT);
                } else {
                    if (sizeChangeEvt.length == 0) {
                        ucExt.resizerObserver.disconnect();
                        ucExt.resizerObserver = undefined;
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
            ucExt.Events.beforeClose.on(({ prevent }) => {
                for (let i = ucExt.dependant.length - 1; i > 0; i--) {
                    ucExt.dependant[i]?.ucExtends.destruct();
                }
                pucExt.dependant[ucExt.parentDependantIndex]  = undefined;             
            })
            ucExt.Events.onDataExport = (data) =>
                pucExt.Events.onDataExport(data);
        },
        resizerObserver: undefined as ResizeObserver,
        finalizeInit: (param0: UcOptions): void => {
            let ext = this.ucExtends;
            param0.source.cssContents = ext.stampRow.styler.parseStyleSeperator_sub(
                {
                    data: (param0.source.cssContents == undefined ?
                        FileDataBank.readFile(ext.fileInfo.style.rootPath)
                        :
                        param0.source.cssContents),
                    localNodeElement: ext.self,
                    cssVarStampKey: ext.cssVarStampKey
                });
            //setTimeout(() => {
                LoadGlobal.pushRow({
                    url: ext.fileInfo.style.rootPath,
                    stamp: ext.stampRow.stamp,
                    reloadDesign: param0.source.reloadDesign,
                    reloadKey: param0.source.reloadKey,
                    cssContents: param0.source.cssContents
                });
            //}, 1);
            ext.Events.afterInitlize.fire();
        },
        queryElements(selector: string, callback: (element: HTMLElement) => void): void {
            let elements = document.querySelectorAll(selector);
            elements.forEach(element => callback(element as HTMLElement));
        },
        idList: [],
        //stampRow: userControlStampRow,
        _windowstate: 'normal' as UcStates,
        get windowstate() { return this._windowstate; },
        set windowstate(state: UcStates) { this._windowstate = state; this.Events.winStateChanged.fire([state]); },

        options: {
            ucExt: () => this.ucExtends,
        },
        Events: {
            afterInitlize: new CommonEvent<() => void>(),
            // @ts-ignore
            beforeClose: new CommonEvent<({ prevent = false }) => void>(),
            afterClose: new CommonEvent<() => void>(),
            captionChanged: new CommonEvent<(newCaptionText: string) => void>(),
            winStateChanged: new CommonEvent<(state: UcStates) => void>(),
            activate: new CommonEvent<() => void>(),
            loaded: new CommonEvent<() => void>(),
            loadLastSession: new CommonEvent<() => void>(),
            _newSessionGenerate: new CommonEvent<() => void>(),
            get newSessionGenerate() { return this.winExt().Events._newSessionGenerate; },
            _completeSessionLoad: new CommonEvent<() => void>(),
            get completeSessionLoad() { return this.winExt().Events._completeSessionLoad; },
            sizeChanged: new CommonEvent<(size: ResizeObserverEntry[]) => void>(),
            winExt: () => this.ucExtends.form.ucExtends,
            onDataExport: (_data: TransferDataNode) => { return false; },
            onDataImport: (_data: TransferDataNode) => { return false; },
        },
        destruct: (): boolean => {
            let res = { prevent: false };
            this.ucExtends.Events.beforeClose.fire([res]);
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
        passElement: (ele: HTMLElement | HTMLElement[], applySubTree: boolean = true): HTMLElement | HTMLElement[] => {
            let uExt = this.ucExtends;
            uExt.stampRow.passElement(ele, applySubTree);
            return ele;
        },
        designer: {
            setCaption: (text: string) => {
                this.ucExtends.wrapperHT.setAttribute("x-caption", text);
                this.ucExtends.Events.captionChanged.fire([text]);
            },
            getAllControls: (specific?: string[]): { [key: string]: HTMLElement } => {
                let childs: { [key: string]: HTMLElement } = {};
                let uExt = this.ucExtends;
                let fromElement = uExt.wrapperHT;
                let uniqStamp = uExt.stampRow.uniqStamp;
                if (specific != undefined) {
                    specific.forEach(itmpath => {
                        if (!(itmpath in childs)) {
                            let ele = fromElement.querySelector(`[${propOpt.ATTR.ACCESS_KEY}='${itmpath}'][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`) as HTMLElement;
                            fillObj(itmpath, ele);
                        }
                    });
                } else {
                    let eleAr = Array.from(fromElement.querySelectorAll(`[${propOpt.ATTR.ACCESS_KEY}][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`)) as HTMLElement[];
                    eleAr.forEach((ele) => {
                        fillObj(ele.getAttribute(propOpt.ATTR.ACCESS_KEY), ele);
                    });
                }
                function fillObj(itmpath: string, htEle: HTMLElement): void {
                    if (htEle != undefined)
                        childs[itmpath] = htEle;
                    else
                        console.warn('empty-controls-returned');
                }
                return childs;
            }
        },
    };
}