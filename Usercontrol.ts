import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { objectOpt } from "ucbuilder/build/common";
import { IUcOptions, UCGenerateMode, UcStates, uniqOpt, WhatToDoWithTargetElement } from "ucbuilder/enumAndMore";
import { CommonEvent } from "ucbuilder/global/commonEvent";
import { TransferDataNode } from "ucbuilder/global/drag/transferation";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { FilterContent } from "ucbuilder/global/filterContent";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { SessionManager } from "ucbuilder/lib/SessionManager";
import { IPassElementOptions, SourceNode, StampNode } from "ucbuilder/lib/StampGenerator";
import { CSSVariableScope, StylerRegs, VariableList } from "ucbuilder/lib/stylers/StylerRegs";
import { TabIndexManager } from "ucbuilder/lib/TabIndexManager";
import { WinManager } from "ucbuilder/lib/WinManager";
/*export enum ucVisibility{
    inherit = 0,
    visible = 1,
    hidden = 2
}*/

export type ucVisibility = 'inherit' | 'visible' | 'hidden';
export class Usercontrol {


    static HiddenSpace: HTMLElement = document.createElement('hspc' + uniqOpt.randomNo());

    static extractArgs = (args: IArguments) => newObjectOpt.extractArguments(args);
    static UcOptionsStc: IUcOptions;
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
    static get designerToCode(): string {
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
    //static _CSS_VAR_STAMP = 0;
    constructor() {
        //Usercontrol._CSS_VAR_STAMP++;
        //this.ucExtends.cssVarStampKey = 'u' + Usercontrol._CSS_VAR_STAMP;

    }

    public ucExtends = {

        mode: 'client' as UCGenerateMode,
        fileInfo: undefined as codeFileInfo,
        form: undefined as Usercontrol,
        dialogForm: undefined as Usercontrol,
        PARENT: undefined as Usercontrol,
        session:undefined as SessionManager,// new SessionManager(),
        //stampRow: undefined as userControlStampRow,
        //stampNode: undefined as StampNode,
        srcNode: undefined as SourceNode,

        wrapperHT: undefined as HTMLElement,
        isDialogBox: false as boolean,
        keepVisible: false as boolean,
        parentDependantIndex: -1 as number,
        dependant: [] as Usercontrol[],
        isForm: false,
        get formExtends() { return (this.form as Usercontrol).ucExtends; },
        get self(): HTMLElement { return this.wrapperHT; },
        set caption(text: string) {
            this.designer.setCaption(text);
        },
        find: (skey: string): HTMLElement[] => {
            let ar = skey.split(',');
            let _this = this.ucExtends;
            let uniqStamp = _this.srcNode.uniqStamp;
            ar = ar.map((s) => {
                s = FilterContent.select_inline_filter(s, uniqStamp);
                return s;
            });
            let nodeList = _this.self.querySelectorAll(ar.join(","));
            return Array.from(nodeList) as HTMLElement[];
        },
        initalComponents: {
            elements: undefined as HTMLCollection,
            stageHT: undefined as HTMLElement,
            changeStage: (newStage: HTMLElement): boolean => {
                let ucExt = this.ucExtends;
                if (!this.ucExtends.wrapperHT.contain(newStage)) return false;
                let initCompo = ucExt.initalComponents;
                let arL = Array.from(initCompo.elements);
                let ctrls: HTMLElement[] = [];
                for (let index = 0, len = arL.length; index < len; index++) {
                    const node = arL[index] as HTMLElement;
                    if (!node.contains(newStage)) {
                        newStage.appendChild(node);
                    }
                }
                initCompo.stageHT = newStage;
                return true;
            }
        },

        setCssVariable: (varList: VariableList, scope: CSSVariableScope) => {
            let styler = this.ucExtends.srcNode.styler;
            switch (scope) {
                case 'global': styler.__VAR.SETVALUE(varList, '' + styler.LOCAL_STAMP_KEY, "g"); break;
                //case 'template': styler.__VAR.SETVALUE(varList, styler.TEMPLATE_STAMP_KEY, "t", this.ucExtends.self); break;
                case 'local': styler.__VAR.SETVALUE(varList, styler.LOCAL_STAMP_KEY, "l", this.ucExtends.self); break;
                case 'internal': styler.__VAR.SETVALUE(varList, StylerRegs.internalKey, "i", this.ucExtends.self); break;
            }
        },
        getCssVariable: (key: string, scope: CSSVariableScope): string => {
            let styler = this.ucExtends.srcNode.styler;
            switch (scope) {
                case 'global': return document.body.style.getPropertyValue(
                    styler.__VAR.getKeyName(key, '' + styler.ROOT_STAMP_KEY, "g"));
                /*case 'template': return this.ucExtends.self.style.getPropertyValue(
                    styler.__VAR.getKeyName(key, styler.TEMPLATE_STAMP_KEY, "t"));*/
                case 'local': return this.ucExtends.self.style.getPropertyValue(
                    styler.__VAR.getKeyName(key, styler.LOCAL_STAMP_KEY, "l"));
                case 'internal': return this.ucExtends.self.style.getPropertyValue(
                    styler.__VAR.getKeyName(key, StylerRegs.internalKey, "i"));
                default: return '';
            }
        },
        cssVarStampKey: '0',
        initializecomponent: (param0: IUcOptions): void => {
            let ucExt = this.ucExtends;
            ucExt.mode = param0.mode;
            if (param0.events.beforeInitlize != undefined) param0.events.beforeInitlize(this);
            ucExt.isForm = (param0.parentUc == undefined);
            ucExt.fileInfo = param0.cfInfo;
            //console.log(param0.session);
            if (param0.session.loadBySession) {
                ucExt.session = new SessionManager();                
                ucExt.session.init(this, param0.session, param0.session.uniqueIdentity);
            }
            //param0.source.addTabIndex = ucExt.isForm;
            /*let stmpNode = StampNode.generateSource({
                stampKeys: ucExt.fileInfo.mainFileRootPath,
                root: ucExt.fileInfo.rootInfo,
                htmlFilePath: ucExt.fileInfo.html.fullPath
            });


            // if (ucExt.fileInfo.mainFileRootPath.endsWithI('ListView.uc')) debugger;
            let res = stmpNode.stamp.generateSource('', {
                htmlFilePath: ucExt.fileInfo.html.fullPath
            });*/
            /* if (ucExt.fileInfo.style.rootPath.includes('fixed')) {
                 console.log(this);
                 
             }*/


            ucExt.srcNode = StampNode.registerSoruce({
                key: ucExt.fileInfo.style.rootPath,
                root: ucExt.fileInfo.rootInfo
            });
            let isAlreadyExist = ucExt.srcNode.htmlCode.load(FileDataBank.readFile(ucExt.fileInfo.html.fullPath, { isFullPath: true }));
            if (!isAlreadyExist)
                ucExt.srcNode.loadHTML(/*param0.source.beforeContentAssign*/);

            //console.log([ucExt.fileInfo.mainFileRootPath,res.hasHTMLContentExists]);

            //ucExt.stampRow = UserControlStamp.getStamp(param0.source);
            ucExt.wrapperHT = ucExt.srcNode.dataHT.cloneNode(true) as HTMLElement;
            //console.log(param0.targetElement.nodeName);
            ucExt.srcNode.styler.controlName = param0.accessName;
            //console.log(ucExt.fileInfo.mainFilePath+":"+param0.accessName);

            if (ucExt.isForm) {
                ucExt.PARENT = this;
                ucExt.form = this;
                ucExt.fileInfo.rootInfo.stampSRC.styler
                    .pushChild(
                        ucExt.fileInfo.mainFilePath,
                        ucExt.srcNode.styler, param0.accessName); // param0.targetElement.nodeName
                // param0.wrapperHT.appendChild(ucExt.wrapperHT);
            } else {
                ucExt.form = param0.parentUc.ucExtends.form;
                ucExt.PARENT = param0.parentUc;
                ucExt.PARENT.ucExtends.srcNode.styler
                    .pushChild(
                        ucExt.fileInfo.mainFilePath,
                        ucExt.srcNode.styler, param0.accessName);  // param0.targetElement.nodeName

                ucExt.srcNode.styler.parent = ucExt.PARENT.ucExtends.srcNode.styler;
                if (param0.targetElement) {
                    ucExt.initalComponents.elements = param0.targetElement.children;
                    if (param0.decisionForTargerElement == 'replace')
                        newObjectOpt.copyAttr(param0.targetElement, ucExt.wrapperHT);

                    Usercontrol.HiddenSpace.append(ucExt.wrapperHT);
                } else {
                    Usercontrol.HiddenSpace.append(ucExt.wrapperHT);
                }
            }

            ucExt.loadAt.setValue(param0.decisionForTargerElement, param0.targetElement);
            let pucExt = ucExt.PARENT.ucExtends;
            ucExt.wrapperHT.data(ATTR_OF.BASE_OBJECT, this);
            if (!ucExt.isForm) {
                ucExt.parentDependantIndex = pucExt.dependant.length;
                pucExt.dependant.push(this);
            }
            ucExt.controls = ucExt.passElement(ucExt.wrapperHT, { skipTopEle: true }); //.children
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
                //if(ucExt.keepReference)
                for (let i = ucExt.dependant.length - 1; i >= 0; i--) {
                    ucExt.dependant[i]?.ucExtends.destruct();
                }
                pucExt.dependant[ucExt.parentDependantIndex] = undefined;
            });
            ucExt.Events.onDataExport = (data) =>
                pucExt.Events.onDataExport(data);
            if (ucExt.dialogForm == undefined && pucExt.dialogForm != undefined)
                ucExt.dialogForm = pucExt.dialogForm;
            ucExt.initalComponents.stageHT = ucExt.wrapperHT;
            //ucExt.wrapperHT.setAttribute(ATTR_OF.UC.UC_STAMP+"__", ucExt.srcNode.uniqStamp);
            //console.log(ucExt.wrapperHT.children);


            ucExt.wrapperHT.setAttribute(ATTR_OF.UC.ALL, ucExt.srcNode.uniqStamp);
            //ucExt.wrapperHT.classList.add(ATTR_OF.getUc(ucExt.srcNode.uniqStamp));
        },
        controls: undefined as { [xname: string]: HTMLElement | HTMLElement[] },
        resizerObserver: undefined as ResizeObserver,
        finalizeInit: (param0: IUcOptions): void => {
            let ext = this.ucExtends;
            ext.srcNode.pushCSS(ext.fileInfo.style.fullPath, ext.self);
            ext.Events.afterInitlize.fire();
        },
        loadAt: {
            decision: "waitForDecision" as WhatToDoWithTargetElement,
            element: undefined as HTMLElement,
            setValue: (decision: WhatToDoWithTargetElement, element: HTMLElement) => {
                let _loadAt = this.ucExtends.loadAt;
                _loadAt.decision = decision ? decision : 'waitForDecision';
                _loadAt.element = element;
            }
        },
        visibility: 'inherit' as ucVisibility,
        getVisibility: (): ucVisibility => {
            let ext = this.ucExtends;
            return (ext.isForm || ext.visibility != 'inherit') ?
                ext.visibility : ext.PARENT.ucExtends.visibility;
        },
        show: ({ at = undefined, decision = undefined, }:
            { at?: HTMLElement, decision?: WhatToDoWithTargetElement, visibility?: ucVisibility } = {}) => {
            let _extend = this.ucExtends;
            let _loadAt = _extend.loadAt;
            let dec = decision ? decision : _loadAt.decision as WhatToDoWithTargetElement;
            let ele = at ? at : _loadAt.element as HTMLElement;
            if (ele == undefined) {
                ele = _extend.fileInfo.rootInfo.defaultLoadAt;
            }
            if (_loadAt.element == undefined) {
                _loadAt.element = this.ucExtends.fileInfo.rootInfo.defaultLoadAt;
            }
            // _extend.loadAt.element = ele;
            if (ele) {
                switch (dec) {
                    case 'replace':
                        ele.after(_extend.wrapperHT);
                        ele.remove();
                        break;
                    case 'append': ele.append(_extend.wrapperHT); break;
                    case 'prepend': ele.prepend(_extend.wrapperHT); break;
                    case 'waitForDecision':
                        ele.append(_extend.wrapperHT);
                        break;
                }
            }
            if (_extend.dialogForm == undefined)
                _extend.dialogForm = _extend.isForm ? this : _extend.PARENT.ucExtends.dialogForm;
            _extend.Events.loaded.fire();
            _extend.visibility = 'visible';
            //return undefined as Usercontrol
        },
        showDialog: ({ defaultFocusAt = undefined, keepCurrentVisible = true, afterClose = undefined }: {
            at?: HTMLElement,
            keepCurrentVisible?: boolean,
            decision?: WhatToDoWithTargetElement,
            defaultFocusAt?: HTMLElement,
            afterClose?: () => void,
        } = {}): void => {
            let _extends = this.ucExtends;
            let alreadyLoadedBefore = _extends.isDialogBox;
            _extends.isDialogBox = true;
            let _parentExt = _extends.PARENT.ucExtends;
            let _oldParentVisibleValue = _parentExt.keepVisible;
            _parentExt.keepVisible = keepCurrentVisible;
            let loadAt = _extends.loadAt;// as WhatToDoWithTargetElement;
            if (loadAt.element == undefined) {
                loadAt.element = _extends.fileInfo.rootInfo.defaultLoadAt;
            }
            WinManager.push(this);
            if (loadAt.element) {
                switch (loadAt.decision) {
                    case 'replace':
                        loadAt.element.after(_extends.wrapperHT);
                        loadAt.element.remove();
                        break;
                    case 'append': loadAt.element.append(_extends.wrapperHT); break;
                    case 'prepend': loadAt.element.prepend(_extends.wrapperHT); break;
                    case 'waitForDecision':
                        loadAt.element.append(_extends.wrapperHT);
                        break;
                }
            }
            //_extends.passElement(WinManager.transperency);
            //_extends.wrapperHT.before(WinManager.transperency);

            _extends.Events.afterClose.on(() => {
                _extends.PARENT.ucExtends.keepVisible = _oldParentVisibleValue;
            });
            if (afterClose)
                _extends.Events.afterClose.on(afterClose);

            // setTimeout(() => {

            if (_extends.dialogForm == undefined)
                _extends.dialogForm = this;
            //}, 1);
            if (!alreadyLoadedBefore)
                _extends.Events.loaded.fire();
            if (!defaultFocusAt) {
                TabIndexManager.moveNext(_extends.self);
            } else {
                TabIndexManager.focusTo(defaultFocusAt);
            }
            // });
        },
        close: () => {
            this.ucExtends.destruct();
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
        getChildsRefByMainPath: (_mainfileRootpath: string): Usercontrol[] => {
            let _ext = this.ucExtends;
            return _ext.dependant.filter(s => s.ucExtends.fileInfo.mainFileRootPath.equalIgnoreCase(_mainfileRootpath));
        },
        getFirstChildRefByMainPath: (_mainfileRootpath: string): Usercontrol => {
            let _ext = this.ucExtends;
            return _ext.dependant.find(s => s.ucExtends.fileInfo.mainFileRootPath.equalIgnoreCase(_mainfileRootpath));
        },
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
            beforeFreez: new CommonEvent<(newUc: Usercontrol) => void>(),
            beforeUnFreez: new CommonEvent<(oldUc: Usercontrol) => void>(),
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
        hide: () => {
            let _ext = this.ucExtends;
            _ext.visibility = 'hidden';
            Usercontrol.HiddenSpace.appendChild(_ext.wrapperHT);
            if (_ext.isDialogBox)
                WinManager.pop();
        },
        destruct: (): boolean => {
            let res = { prevent: false };
            let _this = this;
            let _ext = _this.ucExtends;
            if (!res.prevent) {
                _ext.Events.beforeClose.fire([res]);
                _ext.wrapperHT.delete();
                if (_ext.isDialogBox)
                    WinManager.pop();
                _ext.Events.afterClose.fire();
                //if (!_ext.keepReference) {
                // Clear all properties of the Usercontrol instance after a delay
                setTimeout(() => {
                    _ext.srcNode.release();
                    for (const key in _this) {
                        //if (_this.hasOwnProperty(key)) {
                        _this[key] = undefined;
                        //}
                    }
                }, 0); // Adjust the delay as needed
                // }
                return true;
            }
            return false;
        },
        passElement: (ele: HTMLElement | HTMLElement[], options?: IPassElementOptions): { [xname: string]: HTMLElement | HTMLElement[] } => {
            return this.ucExtends.srcNode.passElement(ele, options);
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
                let uniqStamp = uExt.srcNode.uniqStamp;
                if (specific != undefined) {
                    for (let i = 0, len = specific.length; i < len; i++) {
                        const itmpath = specific[i];
                        if (!(itmpath in childs)) {
                            let ele = fromElement.querySelector(`[${ATTR_OF.X_NAME}='${itmpath}'][${ATTR_OF.UC.ALL}^='${uniqStamp}_']`) as HTMLElement; // old one `[${propOpt.ATTR.ACCESS_KEY}='${itmpath}'][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`
                            //let ele = fromElement.querySelector(`[${propOpt.ATTR.ACCESS_KEY}='${itmpath}']${ATTR_OF.setParent(uniqStamp)}`) as HTMLElement; 
                            fillObj(itmpath, ele);
                        }
                    }
                } else {
                    let eleAr = Array.from(fromElement.querySelectorAll(`[${ATTR_OF.X_NAME}][${ATTR_OF.UC.ALL}^='${uniqStamp}_']`)) as HTMLElement[];  // old one `[${propOpt.ATTR.ACCESS_KEY}][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`
                    for (let i = 0, len = eleAr.length; i < len; i++) {
                        const ele = eleAr[i];
                        fillObj(ele.getAttribute(ATTR_OF.X_NAME), ele);
                    }
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
