import { codeFileInfo } from "./build/codeFileInfo.js";
import { objectOpt } from "./build/common.js";
import { TemplateMaker } from "./build/regs/TemplateMaker.js";
import { IUcOptions, UCGenerateMode, UcStates, WhatToDoWithTargetElement } from "./enumAndMore.js";
import { CommonEvent } from "./global/commonEvent.js";
import { FilterContent } from "./global/filterContent.js";
import { newObjectOpt } from "./global/objectOpt.js";
import { ATTR_OF } from "./global/runtimeOpt.js";
import { ucUtil } from "./global/ucUtil.js";
import { GetUniqueId } from "./ipc/enumAndMore.js";
import { SessionManager } from "./lib/SessionManager.js";
import { IPassElementOptions, STYLER_SELECTOR_TYPE, SourceNode, StampNode } from "./lib/StampGenerator.js";
import { TabIndexManager } from "./lib/TabIndexManager.js";
import { WinManager } from "./lib/WinManager.js";
import { nodeFn } from "./nodeFn.js";
import { CSSVariableScope, CssVariableHandler, StyleBaseType, VariableList } from "./StylerRegs.js";
export type UcDialogResult = "none" | "ok" | 'cancel' | 'close';
export type ucVisibility = 'inherit' | 'visible' | 'hidden';
export class Usercontrol {
    static Resolver = (absFileUrl: string, relPath: string) => {
        let fp = nodeFn.url.fileURLToPath(absFileUrl); // `absFileUrl` designer js path
        return nodeFn.path.resolveFilePath(fp, relPath);
    }
    static async GenerateControls(mainUc: Usercontrol, args?: IUcOptions, htmlCodePath?: string) {
        const mainFilePath = htmlCodePath;//nodeFn.url.fileURLToPath();
        async function _tpt(xname: string, xfrom: string, targetEle: HTMLElement) {
            let jsPath = ucUtil.changeExtension(nodeFn.path.resolveFilePath(mainFilePath, xfrom), '.html', 'js');
            let className = nodeFn.path.basename(jsPath).split('.')[0];
            let frmType = await import(jsPath)[className] as Usercontrol;
            mainUc[xname] = await frmType['CreateAsync']({
                parentUc: mainUc,
                accessName: "xname",
                elementHT: targetEle
            });
        }
        async function _uc(xname: string, xfrom: string, targetEle: HTMLElement) {
            let jsPath = ucUtil.changeExtension(nodeFn.path.resolveFilePath(mainFilePath, xfrom), '.html', 'js');
            let className = nodeFn.path.basename(jsPath).split('.')[0];
            let ft = await import(jsPath);
            let frmType = ft[className] as Usercontrol;
            if (frmType == undefined) debugger;
            mainUc[xname] = await frmType['CreateAsync']({
                parentUc: mainUc,
                mode: args.mode,
                accessName: xname,
                session: {
                    loadBySession: args.session.loadBySession,
                    uniqueIdentity: xname,
                    addNodeToParentSession: true,
                },
                decisionForTargerElement: 'replace',
                targetElement: targetEle as any
            });
            mainUc[xname].ucExtends.show();
        }
        for (const [xname, htAr] of Object.entries(mainUc.ucExtends.controls)) {
            let ele = htAr as HTMLElement;
            if (ele.hasAttribute('x-from')) {
                let pth = ele.getAttribute(ATTR_OF.X_FROM);
                if (pth.endsWith('.uc.html'))
                    await _uc(xname, pth, ele);
                else
                    await _tpt(xname, pth, ele);
            } else mainUc[xname] = htAr;
        }
        // console.log(importMeta);

        //console.log(uc.ucExtends.controls);

    }

    static HiddenSpace: HTMLElement = document.createElement('hspc' + GetUniqueId());

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
    private hide = () => {
        let _ext = this.ucExtends;
        let res = { prevent: false };

        _ext.visibility = 'hidden';
        Usercontrol.HiddenSpace.appendChild(_ext.wrapperHT);
        if (_ext.isDialogBox)
            WinManager.pop();
        _ext.Events.afterClose.fire([this]);  // _ext.Events.afterHide

    }
    private destruct = (): boolean => {
        let _this = this;
        let _ext = _this.ucExtends;
        _ext.Events.onDestruction.fire();
        if (_ext.isDialogBox)
            WinManager.pop();
        _ext.Events.afterClose.fire([this]);

        requestAnimationFrame(() => {
            _ext.srcNode.release();
            _ext.wrapperHT["#delete"]();
            for (const key in _this) {
                _this[key] = undefined;
            }
        });
        /* setTimeout(() => {
             _ext.srcNode.release();
             for (const key in _this) {
                 _this[key] = undefined;
             }
         }, 0);*/
        return false;
    }
    static templateMkr = new Map<string, string>();
    public ucExtends = {
        get Context() { return this.dialogForm?.ucExtends.___META.CONTEXT; },
        set SetContext(context) {
            /*if (this.dialogForm.ucExtends != this) {
                this.dialogForm.ucExtends.SetContext(context);
            } else {
                this.___META.CONTEXT = context;
                this.Events.contextChange.fire([]);
            }*/
            let df = this.dialogForm.ucExtends;
            df.___META.CONTEXT = context;
            df.Events.contextChange.fire([]);

        },
        DialogResult: undefined as UcDialogResult,
        mode: 'client' as UCGenerateMode,
        ___META: {
            CONTEXT: undefined,
            PREV_CREATED_ID: undefined,
            PREV_UPDATED_ID: undefined,
            SELECTED_ID: undefined,
            CLOSE_ON_SAVE: undefined as boolean,
        },
        fileInfo: undefined as codeFileInfo,
        form: undefined as Usercontrol,
        dialogForm: undefined as Usercontrol,
        PARENT: undefined as Usercontrol,
        session: undefined as SessionManager,// new SessionManager(),
        srcNode: undefined as SourceNode,

        wrapperHT: undefined as HTMLElement,
        isDialogBox: false as boolean,

        keepVisible: false as boolean,
        parentDependantIndex: -1 as number,
        dependant: [] as Usercontrol[],

        //HIDE_OR_CLOSE: 'close' as 'hide' | 'close',
        isForm: false,
        get formExtends() { return (this.form as Usercontrol).ucExtends; },
        get self(): HTMLElement { return this.wrapperHT; },
        set caption(text: string) {
            this.designer.setCaption(text);
        },
        lastFocuedElement: undefined as HTMLElement,
        keepVisible_Till_I_Exist: (I: Usercontrol) => {
            let _this = this;
            let vopt = this.ucExtends.keepVisible;
            this.ucExtends.keepVisible = true;
            I.ucExtends.Events.afterClose.on(() => {
                _this.ucExtends.keepVisible = vopt;
            });
        },
        find: (skey: string): HTMLElement[] => {
            let ar = skey.split(',');
            let _this = this.ucExtends;
            let uniqStamp = _this.srcNode.localStamp;
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
                if (!this.ucExtends.wrapperHT["#contain"](newStage)) return false;
                let initCompo = ucExt.initalComponents;
                let arL = Array.from(initCompo?.elements ?? []);
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
                case 'global': CssVariableHandler.SetCSSVarValue(varList, '' + styler.KEYS.LOCAL, "g"); break;
                //case 'template': CssVariableHandler.SETVALUE(varList, styler.TEMPLATE_STAMP_KEY, "t", this.ucExtends.self); break;
                case 'local': CssVariableHandler.SetCSSVarValue(varList, styler.KEYS.LOCAL, "l", this.ucExtends.self); break;
                case 'internal': CssVariableHandler.SetCSSVarValue(varList, styler.KEYS.INTERNAL, "i", this.ucExtends.self); break; // StylerRegs.internalKey
            }
        },
        getCssVariable: (key: string, scope: CSSVariableScope): string => {
            let styler = this.ucExtends.srcNode.styler;
            switch (scope) {
                case 'global': return document.body.style.getPropertyValue(
                    CssVariableHandler.GetCombinedCSSVarName(key, '' + styler.KEYS.ROOT, "g"));
                /*case 'template': return this.ucExtends.self.style.getPropertyValue(
                    CssVariableHandler.getKeyName(key, styler.TEMPLATE_STAMP_KEY, "t"));*/
                case 'local': return this.ucExtends.self.style.getPropertyValue(
                    CssVariableHandler.GetCombinedCSSVarName(key, styler.KEYS.LOCAL, "l"));
                case 'internal': return this.ucExtends.self.style.getPropertyValue(
                    CssVariableHandler.GetCombinedCSSVarName(key, styler.KEYS.INTERNAL, "i"));  // StylerRegs.internalKey
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

            if (ucExt.isForm) {
                ucExt.dialogForm = this;
            } else ucExt.dialogForm = param0.parentUc.ucExtends.dialogForm;
            if (ucExt.isForm) {
                ucExt.dialogForm.ucExtends.___META.CONTEXT = param0.context;
            }
            //console.log(param0.session);
            if (param0.session.loadBySession) {
                ucExt.session = new SessionManager();
                ucExt.session.init(this, param0.session, param0.session.uniqueIdentity);
            }
            //param0.source.addTabIndex = ucExt.isForm;
            /*let stmpNode = StampNode.generateSource({
                stampKeys: ucExt.fileInfo.mainBase.rootWithExt,
                root: ucExt.fileInfo.rootInfo,
                htmlFilePath: ucExt.fileInfo.html.fullPath
            });


            // if (ucExt.fileInfo.mainBase.rootWithExt.endsWithI('ListView.uc')) debugger;
            let res = stmpNode.stamp.generateSource('', {
                htmlFilePath: ucExt.fileInfo.html.fullPath
            });*/
            /* if (ucExt.fileInfo.style.rootPath.includes('fixed')) {
                 console.log(this);
                 
             }*/

            //        debugger;

            //console.log(param0.source.cssBaseFilePath,ucExt.fileInfo.style.fullPath);
            ucExt.srcNode = StampNode.registerSoruce({
                key: ucExt.fileInfo.pathOf['.scss'],
                cssFilePath: param0.source.cssBaseFilePath ?? ucExt.fileInfo.pathOf['.scss'],
                accessName: param0.accessName,
                project: ucExt.fileInfo.projectInfo,
                baseType: StyleBaseType.UserControl,
                mode: '^',
                //root: ucExt.fileInfo.rootInfo
            });

            //  if (ucExt.fileInfo.html.fullPath.includes('expenseSetup.uc.html')) debugger;
            let htPathToRead = param0.source.htmlFilePath ?? ucExt.fileInfo.pathOf[".html"];
            let htContent = param0.source.htmlContents;
            let tmkr = Usercontrol.templateMkr.get(htPathToRead);
            if (tmkr == undefined) {
                if (htContent == undefined)
                    htContent = nodeFn.fs.readFileSync(htPathToRead);
                let t = new TemplateMaker(htPathToRead);
                tmkr = t.compileTemplate(htContent)(param0.source.htmlRow ?? {});
                Usercontrol.templateMkr.set(htPathToRead, tmkr);
            }
            let isAlreadyExist = ucExt.srcNode.htmlCode.load(
                tmkr
                //,ucExt.fileInfo.actualPrfoject
            );
            if (!isAlreadyExist)
                ucExt.srcNode.loadHTML(/*param0.source.beforeContentAssign*/);

            //console.log([ucExt.fileInfo.mainBase.rootWithExt,res.hasHTMLContentExists]);

            //ucExt.stampRow = UserControlStamp.getStamp(param0.source);
            ucExt.wrapperHT = ucExt.srcNode.dataHT.cloneNode(true) as HTMLElement;



            //console.log(ucExt.fileInfo.mainFilePath+":"+param0.accessName);
            if (ucExt.isForm) {
                ucExt.PARENT = this;
                ucExt.form = this;

                ucExt.srcNode.config({
                    parentUc: ucExt.PARENT,
                    parentSrc: ucExt.fileInfo.projectInfo.stampSRC,
                    wrapper: ucExt.wrapperHT,
                    key: ucExt.fileInfo.pathWithExt('.html'),
                    accessName: param0.accessName
                });

                /*ucExt.fileInfo.rootInfo.stampSRC.styler
                    .pushChild(
                        ucExt.fileInfo.mainFilePath,
                        ucExt.srcNode.styler, param0.accessName);*/ // param0.targetElement.nodeName
                // param0.wrapperHT.appendChild(ucExt.wrapperHT);
            } else {
                ucExt.form = param0.parentUc.ucExtends.form;
                ucExt.PARENT = param0.parentUc;
                ucExt.srcNode.config({
                    parentUc: param0.parentUc,
                    parentSrc: ucExt.PARENT.ucExtends.srcNode,
                    wrapper: ucExt.wrapperHT,
                    key: ucExt.fileInfo.pathWithExt('.html'),
                    accessName: param0.accessName
                });
                // param0.targetElement.nodeName


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
            ucExt.wrapperHT["#data"](ATTR_OF.BASE_OBJECT, this);
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
            ucExt.Events.onDestruction.on(() => {
                //if(ucExt.keepReference)
                for (let i = ucExt.dependant.length - 1; i >= 0; i--) {
                    ucExt.dependant[i]?.destruct();
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

            ucExt.srcNode.setWrapper(ucExt.wrapperHT);
            //ucExt.wrapperHT.setAttribute(ATTR_OF.UC.ALL, ucExt.srcNode.uniqStamp);
            //ucExt.wrapperHT["#clearUcStyleClasses"]();
            //ucExt.wrapperHT.classList.add(ATTR_OF.__CLASS(ucExt.srcNode.uniqStamp, 'm'));

            //ucExt.wrapperHT.classList.add(ATTR_OF.getUc(ucExt.srcNode.uniqStamp));
        },
        controls: undefined as { [xname: string]: HTMLElement | HTMLElement[] },
        resizerObserver: undefined as ResizeObserver,
        finalizeInit: (param0: IUcOptions): void => {
            let ext = this.ucExtends;
            ext.srcNode.pushCSS(ext.srcNode.cssFilePath ?? ext.fileInfo.pathOf['.scss'], ext.fileInfo.projectInfo.importMetaURL, ext.self);
            ext.Events.afterInitlize.fire();
        },
        loadAt: {
            decision: "append" as WhatToDoWithTargetElement,
            element: undefined as HTMLElement,
            setValue: (decision: WhatToDoWithTargetElement, element: HTMLElement) => {
                let _loadAt = this.ucExtends.loadAt;
                _loadAt.decision = decision ?? _loadAt.decision ?? 'append';
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
            let dec = decision ?? _loadAt.decision as WhatToDoWithTargetElement;
            let ele = at ?? _loadAt.element as HTMLElement;
            if (ele == undefined) {
                ele = _extend.fileInfo.projectInfo.defaultLoadAt;
            }
            if (_loadAt.element == undefined) {
                _loadAt.element = this.ucExtends.fileInfo.projectInfo.defaultLoadAt;
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
                    // case 'waitForDecision':
                    default:
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
            afterClose?: (frm: Usercontrol) => void,
        } = {}): void => {
            let _extends = this.ucExtends;
            let alreadyLoadedBefore = _extends.isDialogBox;
            _extends.isDialogBox = true;
            let _parentExt = _extends.PARENT.ucExtends;
            let _oldParentVisibleValue = _parentExt.keepVisible;
            _parentExt.keepVisible = keepCurrentVisible;
            let loadAt = _extends.loadAt;// as WhatToDoWithTargetElement;
            if (loadAt.element == undefined) {
                loadAt.element = _extends.fileInfo.projectInfo.defaultLoadAt;
            }
            WinManager.push(this);
            if (loadAt.element) {
                switch (loadAt.decision) {
                    case 'replace':
                        loadAt.element.after(_extends.wrapperHT);
                        loadAt.element.remove();
                        break;
                    case 'prepend': loadAt.element.prepend(_extends.wrapperHT); break;
                    case 'append': loadAt.element.append(_extends.wrapperHT); break;
                    default:
                        //case 'waitForDecision':
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
            //if (!alreadyLoadedBefore)
            _extends.Events.loaded.fire();
            requestAnimationFrame(() => {

                if (!defaultFocusAt) {
                    TabIndexManager.moveNext(_extends.self, undefined);
                } else {
                    TabIndexManager.focusTo(defaultFocusAt);
                }
            });
            // });
        },

        /*queryElements(selector: string, callback: (element: HTMLElement) => void): void {
            let elements = document.querySelectorAll(selector);
            elements.forEach(element => callback(element as HTMLElement));
        },*/
        //idList: [],
        //stampRow: userControlStampRow,
        _windowstate: 'normal' as UcStates,
        get windowstate() { return this._windowstate; },
        set windowstate(state: UcStates) { this._windowstate = state; this.Events.winStateChanged.fire([state]); },
        getChildsRefByMainPath: (_mainfile_Rootpath: string): Usercontrol[] => {
            let _ext = this.ucExtends;
            return _ext.dependant.filter(s => s.ucExtends.fileInfo.fullWithoutExt('.html')["#equalIgnoreCase"](_mainfile_Rootpath));
        },
        getFirstChildRefByMainPath: (_mainfile_Rootpath: string): Usercontrol => {
            let _ext = this.ucExtends;
            return _ext.dependant.find(s => s.ucExtends.fileInfo.fullWithoutExt('.html')["#equalIgnoreCase"](_mainfile_Rootpath));
        },
        /* options: {
             ucExt: () => this.ucExtends,
         },*/
        Events: {
            _contextChange: new CommonEvent<() => void>(),
            get contextChange() { return this.dialogExt().Events._contextChange; },
            afterInitlize: new CommonEvent<() => void>(),
            // @ts-ignore
            beforeClose: new CommonEvent<({ prevent = false }) => void>(),
            afterClose: new CommonEvent<(uc?: Usercontrol) => void>(),

            /*
            // @ts-ignore
             beforeHide: new CommonEvent<({ prevent = false }) => void>(),
             afterHide: new CommonEvent<() => void>(),*/
            onDestruction: new CommonEvent<({ }) => void>(),

            captionChanged: new CommonEvent<(newCaptionText: string) => void>(),
            winStateChanged: new CommonEvent<(state: UcStates) => void>(),
            activate: new CommonEvent<() => void>(),
            beforeFreez: new CommonEvent<(newUc: Usercontrol) => void>(),
            beforeUnFreez: new CommonEvent<(oldUc: Usercontrol) => void>(),
            loaded: new CommonEvent<() => void>(),
            loadLastSession: new CommonEvent<() => void>(),
            _newSessionGenerate: new CommonEvent<() => void>(),
            get newSessionGenerate() { return this.formExt().Events._newSessionGenerate; },
            _completeSessionLoad: new CommonEvent<() => void>(),
            get completeSessionLoad() { return this.formExt().Events._completeSessionLoad; },
            sizeChanged: new CommonEvent<(size: ResizeObserverEntry[]) => void>(),
            formExt: () => this.ucExtends.form.ucExtends,
            dialogExt: () => this.ucExtends.dialogForm.ucExtends,
            onDataExport: (_data: TransferDataNode) => { return false; },
            onDataImport: (_data: TransferDataNode) => { return false; },
        },

        distructOnClose: true,
        close: () => {
            let _ext = this.ucExtends;
            let res = { prevent: false };
            _ext.Events.beforeClose.fire([res]); // _ext.Events.beforeHide
            if (!res.prevent) {
                if (this.ucExtends.distructOnClose)
                    this.destruct();
                else
                    this.hide();
            }
        },

        passElement: (ele: HTMLElement | HTMLElement[], options?: IPassElementOptions): { [xname: string]: HTMLElement | HTMLElement[] } => {
            return this.ucExtends.srcNode.passElement(ele, options);
        },

        designer: {
            setCaption: (text: string) => {
                this.ucExtends.wrapperHT.setAttribute("x-caption", text);
                this.ucExtends.Events.captionChanged.fire([text]);
            },
            getAllControls: (/*specific?: string[]*/): { [key: string]: HTMLElement | HTMLElement[] } => {
                let childs: { [key: string]: HTMLElement | HTMLElement[] } = {};
                let uExt = this.ucExtends;
                let fromElement = uExt.wrapperHT;
                let uniqStamp = uExt.srcNode.localStamp;
                /*if (specific != undefined) {
                    for (let i = 0, len = specific.length; i < len; i++) {
                        const itmpath = specific[i];
                        if (!(itmpath in childs)) {
                            let ele = fromElement.querySelector(`[${ATTR_OF.X_NAME}='${itmpath}'][${ATTR_OF.UC.ALL}^='${uniqStamp}_']`) as HTMLElement; // old one `[${propOpt.ATTR.ACCESS_KEY}='${itmpath}'][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`
                            //let ele = fromElement.querySelector(`[${propOpt.ATTR.ACCESS_KEY}='${itmpath}']${ATTR_OF.setParent(uniqStamp)}`) as HTMLElement; 
                            fillObj(itmpath, ele);
                        }
                    }
                } else {*/
                let eleAr: HTMLElement[] = [];
                if (StampNode.MODE == STYLER_SELECTOR_TYPE.ATTRIB_SELECTOR) {
                    eleAr = Array.from(fromElement.querySelectorAll(`[${ATTR_OF.X_NAME}][${ATTR_OF.UC.ALL}^='${uniqStamp}_']`)) as HTMLElement[];  // old one `[${propOpt.ATTR.ACCESS_KEY}][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`
                } else {
                    eleAr = Array.from(fromElement.querySelectorAll(`.${ATTR_OF.__CLASS(uniqStamp, 'l')}[${ATTR_OF.X_NAME}]`)) as HTMLElement[];  // old one `[${propOpt.ATTR.ACCESS_KEY}][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`
                }
                for (let i = 0, len = eleAr.length; i < len; i++) {
                    const ele = eleAr[i];
                    SourceNode.ExtendControlObject(childs, ele.getAttribute(ATTR_OF.X_NAME), ele);
                    //fillObj(ele.getAttribute(ATTR_OF.X_NAME), ele);
                }
                //}
                /*function fillObj(itmpath: string, htEle: HTMLElement): void {
                    if (htEle != undefined)
                        childs[itmpath] = htEle;
                    else
                        console.warn('empty-controls-returned');
                }*/
                return childs;
            }
        },
    };
}
export interface TransferDataNode {
    type: "unknown" | "uc" | "uc-link" | "tpt" | "tpt-link" | "text" | "json" | "link";
    unqKey?: string;
    data?: any;
}
;
export const transferDataNode: TransferDataNode = {
    type: "unknown",
    unqKey: '',
    data: undefined,
};

