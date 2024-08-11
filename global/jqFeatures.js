"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.jqFeatures = exports.dataManager = void 0;
const common_1 = require("ucbuilder/build/common");
const regsManage_1 = require("ucbuilder/build/regs/regsManage");
const fileDataBank_1 = require("ucbuilder/global/fileDataBank");
class rowInfo {
    constructor() {
        this.id = "";
        this.data = {};
        this.event = {};
    }
}
class dataManager {
    constructor() {
        this.source = {};
        this.map = {};
        this.eventIncrementId = 0;
        this.elementIncrementId = 0;
        this.getId = (element) => {
            let row = element[dataManager.ATTR.DM_DATA];
            if (row == undefined) {
                let _id = "id_" + this.elementIncrementId++;
                row = new rowInfo();
                row.id = _id;
                element[dataManager.ATTR.DM_DATA] = row;
                this.source[_id] = element;
            }
            return row;
        };
    }
    getElement(id) {
        return this.source[id];
    }
    fillObjectRef(targetObject, arr) {
        arr.push(this.getId(targetObject).id);
        common_1.looping.htmlChildren(targetObject, s => this.fillObjectRef(s, arr));
    }
    deleteObjectRef(targetObject) {
        let keylist = [];
        this.fillObjectRef(targetObject, keylist);
        keylist.forEach(e => delete this.source[e]);
    }
    getData(targetObject, key) {
        let row = this.getId(targetObject);
        switch (arguments.length) {
            case 2:
                return row.data[key];
            case 1:
                return row.data;
            default:
                return row;
        }
    }
    setData(targetObject, key, value) {
        let row = this.getId(targetObject);
        switch (arguments.length) {
            case 3:
                row.data[key] = value;
                break;
            case 2:
                row.data = value;
                break;
        }
    }
    compareElements(ele1, ele2) {
        return this.getId(ele1).id === this.getId(ele2).id;
    }
    initElement(target) {
        target.querySelectorAll('*').forEach((ele) => {
            this.getId(ele);
        });
    }
    setEvent(element, eventName, key, handler) {
        let evt = {};
        let row = this.getId(element);
        if (eventName in row.event) {
            evt = row.event[eventName];
            evt[key] = handler;
        }
        else {
            evt[key] = handler;
            row.event[eventName] = evt;
        }
        element.addEventListener(eventName, handler, false);
    }
    unSetEvent(element, eventName, key, handler) {
        let evt = {};
        if (handler == undefined) {
            let row = this.getId(element);
            if (eventName in row.event) {
                evt = row.event[eventName];
                if (key == undefined) {
                    Object.keys(evt).forEach(s => element.removeEventListener(eventName, evt[s], false));
                }
                else {
                    handler = evt[key];
                    element.removeEventListener(eventName, handler, false);
                }
            }
        }
        else
            element.removeEventListener(eventName, handler, false);
    }
    onHandler(element, eventName, handler) {
        let eType = eventName.split(".");
        if (eType.length == 0) {
            this.setEvent(element, eType[0], common_1.uniqOpt.guidAs_, handler);
        }
        else {
            this.setEvent(element, eType[0], eType[1], handler);
        }
    }
    offHandler(element, eventName, handler) {
        let eType = eventName.split(".");
        if (eType.length == 0) {
            this.unSetEvent(element, eType[0], undefined, handler);
        }
        else {
            this.unSetEvent(element, eType[0], eType[1], handler);
        }
    }
}
exports.dataManager = dataManager;
dataManager.ATTR = {
    DM_DATA: "dm" + common_1.uniqOpt.randomNo(),
};
class jqFeatures {
    static getEventType(evtName) {
        return (evtName in jqFeatures.eventMap) ? jqFeatures.eventMap[evtName] : "Event";
    }
    static getElementById(id) {
        return this.data.getElement(id);
    }
    static onReady(callback = () => { }) {
        if ( /*document.readyState === 'ready' || */document.readyState === 'complete') {
            callback();
        }
        else {
            document.onreadystatechange = function () {
                if (document.readyState == "complete") {
                    callback();
                }
            };
        }
    }
    static doCommonDomProto(commonPrototype) {
        commonPrototype.index = function () {
            var i = 0;
            let child = this;
            while ((child = child.previousElementSibling) != null)
                i++;
            return i;
        };
        commonPrototype.selector = function () {
            let elm = this;
            if (elm.tagName === "BODY")
                return "BODY";
            const names = [];
            while (elm.parentElement && elm.tagName !== "BODY") {
                names.unshift(elm.tagName + ":nth-child(" + elm.index() + ")");
                elm = elm.parentElement;
            }
            return names.join(">");
        };
        commonPrototype.find = function (selector, exclude) {
            let res = [];
            let trec = this.querySelectorAll(selector);
            if (exclude != undefined) {
                let selectorStr = this.selector() + ' ' + exclude;
                trec.forEach(s => {
                    let n = s;
                    if (!n.matches(selectorStr))
                        res.push(n);
                });
            }
            else
                res = Array.from(trec);
            return res;
        };
        commonPrototype.fireEvent = function (eventName, bubble = true, cancable = true) {
            let evt = document.createEvent(jqFeatures.getEventType(eventName));
            evt.initEvent(eventName, bubble, bubble);
            this.dispatchEvent(evt);
        };
        commonPrototype.delete = function () {
            jqFeatures.data.deleteObjectRef(this);
            this.remove();
        };
        commonPrototype.stamp = function () {
            return jqFeatures.data.getId(this).id;
        };
        commonPrototype.data = function (key, value) {
            switch (arguments.length) {
                case 0:
                    return jqFeatures.data.getData(this);
                    break;
                case 1:
                    switch (typeof key) {
                        case "string": return jqFeatures.data.getData(this, key);
                        case "object": jqFeatures.data.getData(this, key);
                    }
                    break;
                case 2:
                    jqFeatures.data.setData(this, key, value);
                    break;
            }
        };
        commonPrototype.is = function (target) {
            if (target == undefined || target == null)
                return false;
            return jqFeatures.data.compareElements(this, target);
        };
        /* commonPrototype.is = function (target: any): boolean {
             return (this as HTMLElement).is(target);
         }*/
        commonPrototype.$ = function () {
            jqFeatures.data.initElement(this);
            return this;
        };
        commonPrototype.on = function (eventList, handlerCallback) {
            let _tar = this;
            eventList.split(" ").forEach(function (e) {
                jqFeatures.data.onHandler(_tar, e, handlerCallback);
            });
        };
        commonPrototype.off = function (eventList, handlerCallback) {
            let _tar = this;
            eventList.split(" ").forEach(function (e) {
                jqFeatures.data.offHandler(_tar, e, handlerCallback);
            });
        };
    }
    static init() {
        if (jqFeatures.isInited)
            return;
        //const commonPrototype = Object.assign({}, HTMLElement.prototype, Element.prototype, EventTarget.prototype);
        this.doCommonDomProto(HTMLElement.prototype);
        this.doCommonDomProto(Element.prototype);
        this.doCommonDomProto(EventTarget.prototype);
        /*HTMLElement.prototype = commonPrototype;
        Element.prototype = commonPrototype;
        EventTarget.prototype = commonPrototype;*/
        NodeList.prototype.on = function (eventList, handlerCallback) {
            Array.from(this).on(eventList, handlerCallback);
        };
        Array.prototype.on = function (eventList, handlerCallback) {
            let splEvt = eventList.split(" ");
            this.forEach((tar) => {
                splEvt.forEach(function (e) {
                    jqFeatures.data.onHandler(tar, e, handlerCallback);
                });
            });
        };
        SVGElement.prototype.data = function (key, value) {
            switch (arguments.length) {
                case 0:
                    return jqFeatures.data.getData(this);
                    break;
                case 1:
                    switch (typeof key) {
                        case "string": return jqFeatures.data.getData(this, key);
                        case "object": jqFeatures.data.getData(this, key);
                    }
                    break;
                case 2:
                    jqFeatures.data.setData(this, key, value);
                    break;
            }
        };
        String.prototype.$ = function () {
            var div = document.createElement('pre');
            div.innerHTML = this.trim();
            jqFeatures.data.initElement(div.firstChild);
            return div.firstChild;
        };
        String.prototype._trim = function (charlist) {
            if (charlist === undefined)
                charlist = "\s";
            return this.replace(new RegExp("^[" + charlist + "]+"), "");
        };
        String.prototype.startsWithI = function (s) {
            return this.match(new RegExp('^' + s, 'i')) != null;
        };
        String.prototype.endsWithI = function (s) {
            return this.match(new RegExp(s + '$', 'i')) != null;
        };
        String.prototype.trim_ = function (charlist) {
            if (charlist === undefined)
                charlist = "\s";
            return this.replace(new RegExp("[" + charlist + "]+$"), "");
        };
        String.prototype.__ = function (jsonRow) {
            let rtrn = this;
            if (jsonRow != undefined)
                rtrn = jqFeatures.regsMng.parse(jsonRow, rtrn);
            return fileDataBank_1.FileDataBank.getReplacedContent(rtrn);
            /* return (async () => {
                 //let { FileDataBank } = await import("ucbuilder/global/fileDataBank");
                 //FileDataBank
                 return FileDataBank.getReplacedContent(rtrn);
             })();*/
            //});
        };
        //console.log(`hello {=s}`.__({ s: 'd' }).then(s => s));
        //
        // String.prototype.__ = async function (jsonRow: {} = undefined): string {
        //     //.then(({ FileDataBank }) => {
        //     let rtrn: string = this as string;
        //     if (jsonRow != undefined)
        //         rtrn = jqFeatures.regsMng.parse(jsonRow, rtrn);
        //     return FileDataBank.getReplacedContent(rtrn);
        //     // });
        // };
        jqFeatures.isInited = true;
    }
}
exports.jqFeatures = jqFeatures;
_a = jqFeatures;
jqFeatures.isInited = false;
jqFeatures.data = new dataManager();
jqFeatures.eventMap = {
    "abort": "UIEvent",
    "animationcancel": "AnimationEvent",
    "animationend": "AnimationEvent",
    "animationiteration": "AnimationEvent",
    "animationstart": "AnimationEvent",
    "auxclick": "MouseEvent",
    "beforeinput": "InputEvent",
    "blur": "FocusEvent",
    "canplay": "Event",
    "canplaythrough": "Event",
    "change": "Event",
    "click": "MouseEvent",
    "close": "Event",
    "compositionend": "CompositionEvent",
    "compositionstart": "CompositionEvent",
    "compositionupdate": "CompositionEvent",
    "contextmenu": "MouseEvent",
    "cuechange": "Event",
    "dblclick": "MouseEvent",
    "drag": "DragEvent",
    "dragend": "DragEvent",
    "dragenter": "DragEvent",
    "dragleave": "DragEvent",
    "dragover": "DragEvent",
    "dragstart": "DragEvent",
    "drop": "DragEvent",
    "durationchange": "Event",
    "emptied": "Event",
    "ended": "Event",
    "error": "ErrorEvent",
    "focus": "FocusEvent",
    "focusin": "FocusEvent",
    "focusout": "FocusEvent",
    "formdata": "FormDataEvent",
    "gotpointercapture": "PointerEvent",
    "input": "Event",
    "invalid": "Event",
    "keydown": "KeyboardEvent",
    "keypress": "KeyboardEvent",
    "keyup": "KeyboardEvent",
    "load": "Event",
    "loadeddata": "Event",
    "loadedmetadata": "Event",
    "loadstart": "Event",
    "lostpointercapture": "PointerEvent",
    "mousedown": "MouseEvent",
    "mouseenter": "MouseEvent",
    "mouseleave": "MouseEvent",
    "mousemove": "MouseEvent",
    "mouseout": "MouseEvent",
    "mouseover": "MouseEvent",
    "mouseup": "MouseEvent",
    "pause": "Event",
    "play": "Event",
    "playing": "Event",
    "pointercancel": "PointerEvent",
    "pointerdown": "PointerEvent",
    "pointerenter": "PointerEvent",
    "pointerleave": "PointerEvent",
    "pointermove": "PointerEvent",
    "pointerout": "PointerEvent",
    "pointerover": "PointerEvent",
    "pointerup": "PointerEvent",
    "progress": "ProgressEvent",
    "ratechange": "Event",
    "reset": "Event",
    "resize": "UIEvent",
    "scroll": "Event",
    "securitypolicyviolation": "SecurityPolicyViolationEvent",
    "seeked": "Event",
    "seeking": "Event",
    "select": "Event",
    "selectionchange": "Event",
    "selectstart": "Event",
    "slotchange": "Event",
    "stalled": "Event",
    "submit": "SubmitEvent",
    "suspend": "Event",
    "timeupdate": "Event",
    "toggle": "Event",
    "touchcancel": "TouchEvent",
    "touchend": "TouchEvent",
    "touchmove": "TouchEvent",
    "touchstart": "TouchEvent",
    "transitioncancel": "TransitionEvent",
    "transitionend": "TransitionEvent",
    "transitionrun": "TransitionEvent",
    "transitionstart": "TransitionEvent",
    "volumechange": "Event",
    "waiting": "Event",
    "webkitanimationend": "Event",
    "webkitanimationiteration": "Event",
    "webkitanimationstart": "Event",
    "webkittransitionend": "Event",
    "wheel": "WheelEvent",
};
jqFeatures.regsMng = new regsManage_1.regsManage();
jqFeatures.importMod = (url, jsonRow = {}) => __awaiter(void 0, void 0, void 0, function* () {
    let { FileDataBank } = yield Promise.resolve().then(() => __importStar(require("ucbuilder/global/fileDataBank")));
    let rtrn = url;
    if (jsonRow != undefined)
        rtrn = jqFeatures.regsMng.parse(jsonRow, rtrn);
    return rtrn;
});
