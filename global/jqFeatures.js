const { looping, uniqOpt } = require("@ucbuilder:/build/common");
const { regsManage } = require("@ucbuilder:/build/regs/regsManage");
const { fileDataBank } = require("@ucbuilder:/global/fileDataBank");

class rowInfo {
    id = "";
    data = {};
    /** @type {{{}}}}  */
    event = {};
}
class dataManager {
    constructor() {

    }
    source = {};
    map = {};
    static ATTR = {
        DM_DATA: "dm" + uniqOpt.randomNo(),
    }
    /** @private */
    eventIncrementId = 0;
    /** @private */
    elementIncrementId = 0;
    /**
     * @param {HTMLElement} element 
     * @returns {rowInfo}
     */
    getId = (element) => {
        /** @type {rowInfo}  */
        let row = element[dataManager.ATTR.DM_DATA];
        if (row == undefined) {
            let _id = "id_" + this.elementIncrementId++;
            row = new rowInfo();
            row.id = _id;
            element[dataManager.ATTR.DM_DATA] = row;
            this.source[_id] = element;
        }
        return row;
    }

    getElement(id) {
        return this.source[id];
    }

    /**
     * @param {HTMLElement} targetObject 
     * @param {[]} arr 
     */
    fillObjectRef(targetObject, arr) {
        arr.push(this.getId(targetObject).id);
        looping.htmlChildren(targetObject, s => this.fillObjectRef(s, arr));
    }
    deleteObjectRef(targetObject) {
        let keylist = [];
        this.fillObjectRef(targetObject, keylist);
        keylist.forEach(e => delete this.source[e]);
    }
    getData(targetObject, key) {
        /** @type {rowInfo}  */
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
        /** @type {rowInfo}  */
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
    /** @param {HTMLElement} target */
    initElement(target) {
        target = target.querySelectorAll('*').forEach((ele) => {
            this.getId(ele);
        });
    }
    /**
     * 
     * @param {HTMLElement} element 
     * @param {string} eventName 
     * @param {string} key 
     * @param {Function} handler 
     */
    setEvent(element, eventName, key, handler) {
        let evt = {};
        let row = this.getId(element);
        if (eventName in row.event) {
            evt = row.event[eventName];
            evt[key] = handler;
        } else {
            evt[key] = handler;
            row.event[eventName] = evt;
        }
        element.addEventListener(eventName, handler, false);
    }
    /**
         * 
         * @param {HTMLElement} element 
         * @param {string} eventName 
         * @param {string} key 
         * @param {Function} handler 
         */
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
        } else element.removeEventListener(eventName, handler, false);

    }
    /**
     * @param {HTMLElement} element 
     * @param {string} eventName 
     * @param {Function} handler 
     */
    onHandler(element, eventName, handler) {
        let eType = eventName.split(".");
        if (eType == 0) {
            this.setEvent(element, eType[0], uniqOpt.guidAs_, handler);
        } else {
            this.setEvent(element, eType[0], eType[1], handler);
        }
    }
    offHandler(element, eventName, handler) {
        let eType = eventName.split(".");
        if (eType == 0) {
            this.unSetEvent(element, eType[0], undefined, handler);
        } else {
            this.unSetEvent(element, eType[0], eType[1], handler);
        }
        return;
        if (eType == 0) {
            this.unSetEvent(element, eType[0]);
        } else {
            this.unSetEvent(element, eType[0], eType[1]);
        }
    }
}
class jqFeatures {
    /** @private */
    static isInited = false;
    static data = new dataManager();
    static eventMap = {
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
    static getEventType(evtName) {
        return (evtName in jqFeatures.eventMap) ? jqFeatures.eventMap[evtName] : "Event";
    }
    static getElementById(id) {
        return this.data.getElement(id);
    }
    static onReady(callback = () => { }) {
        if (document.readyState === 'ready' || document.readyState === 'complete') {
            callback();
        } else {
            document.onreadystatechange = function () {
                if (document.readyState == "complete") {
                    callback();
                }
            }
        }
    }
    static regsMng = new regsManage();
    static init() {
        if (jqFeatures.isInited) return;

        HTMLElement.prototype.index = function () {
            var i = 0;
            let child = this;
            while ((child = child.previousElementSibling) != null)
                i++;
            return i;
        }
        /** @returns {string} */
        HTMLElement.prototype.selector = function () {
            let elm = this;
            if (elm.tagName === "BODY") return "BODY";
            const names = [];
            while (elm.parentElement && elm.tagName !== "BODY") {
                /*if (elm.id) {
                    names.unshift("#" + elm.getAttribute("id")); // getAttribute, because `elm.id` could also return a child element with name "id"
                    break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
                } else {
    
                //let c = 1, e = elm;
                //for (; e.previousElementSibling; e = e.previousElementSibling, c++);*/
                names.unshift(elm.tagName + ":nth-child(" + elm.index() + ")");
                //}
                elm = elm.parentElement;
            }
            return names.join(">");
        }
        HTMLElement.prototype.find = function (selector, exclude) {
            /** @type {container[]}  */
            let res = [];
            /** @type {container[]}  */
            let trec = this.querySelectorAll(selector);
            if (exclude != undefined) {
                /** @type {string}  */
                let selectorStr = this.selector() + ' ' + exclude;
                trec.forEach(s => {
                    if (!s.matches(selectorStr))
                        res.push(s);
                });
            } else res = Array.from(trec);
            return res;
        }
        HTMLElement.prototype.fireEvent = function (eventName, bubble = true, cancable = true) {
            let evt = document.createEvent(jqFeatures.getEventType(eventName));
            evt.initEvent(eventName, bubble, bubble);
            this.dispatchEvent(evt);
        }
        HTMLElement.prototype.delete = function () {
            jqFeatures.data.deleteObjectRef(this);
            this.remove();
        }
        HTMLElement.prototype.stamp = function () {
            return jqFeatures.data.getId(this).id;
        }
        HTMLElement.prototype.data = function (key, value) {
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
        }
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
        }


        HTMLElement.prototype.is = function (target) {
            if (target == undefined || target == null) return false;
            return jqFeatures.data.compareElements(this, target);
        }
        HTMLElement.prototype.$ = function () {
            jqFeatures.data.initElement(this);
            return this;
        }
        /*function getParentByCurName(nodeName){
            switch(nodeName){
                case ""
            }
        }*/
        String.prototype.$ = function () {
            var div = document.createElement('pre');
            div.innerHTML = this.trim();
            jqFeatures.data.initElement(div.firstChild);

            return div.firstChild;
        }

        NodeList.prototype.on =
            /**
            * @param {string} eventList 
            * @param {Function} handlerCallback 
            */
            function (eventList, handlerCallback) {
                Array.from(this).on(eventList, handlerCallback);
            }
        Array.prototype.on =
            /**
            * @param {string} eventList 
            * @param {Function} handlerCallback 
            */
            function (eventList, handlerCallback) {
                let splEvt = eventList.split(" ");
                this.forEach(
                    /** @type {HTMLElement}  */
                    (tar) => {
                        splEvt.forEach(function (e) {
                            jqFeatures.data.onHandler(tar, e, handlerCallback);
                        });
                    });
            }
        HTMLElement.prototype.on =
            /**
             * @param {string} eventList 
             * @param {Function} handlerCallback 
             */
            function (eventList, handlerCallback) {
                let _tar = this;
                eventList.split(" ").forEach(function (e) {
                    jqFeatures.data.onHandler(_tar, e, handlerCallback);
                });
            }
        HTMLElement.prototype.off =
            /**
             * @param {string} eventList 
             * @param {Function} handlerCallback 
             */
            function (eventList, handlerCallback) {
                let _tar = this;
                eventList.split(" ").forEach(function (e) {
                    jqFeatures.data.offHandler(_tar, e, handlerCallback);
                });
            }
        String.prototype._trim = function (charlist) {
            if (charlist === undefined)
                charlist = "\s";
            return this.replace(new RegExp("^[" + charlist + "]+"), "");
        };
        String.prototype.trim_ = function (charlist) {
            if (charlist === undefined)
                charlist = "\s";
            return this.replace(new RegExp("[" + charlist + "]+$"), "");
        };
        /**
         * @param {{}} jsonRow 
         * @returns 
         */
        String.prototype.__ = function (jsonRow = undefined) {
            let rtrn = this;
            if (jsonRow != undefined)
                rtrn = jqFeatures.regsMng.parse(jsonRow, rtrn);
            return fileDataBank.getReplacedContent(rtrn);
        };

        jqFeatures.isInited = true;
    }
}
module.exports = { dataManager, jqFeatures };