"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragHelper = exports.DragRow = void 0;
const common_1 = require("ucbuilder/build/common");
const commonEvent_1 = require("ucbuilder/global/commonEvent");
const transferation_1 = require("ucbuilder/global/drag/transferation");
//type DragingEvent = <K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any)=> void;
class DragRow {
    constructor() {
        this.elements = [];
        this.event = new commonEvent_1.CommonEvent();
    }
    clear() {
        this.elements.length = 0;
    }
}
exports.DragRow = DragRow;
class DragNode {
    constructor() {
        this.source = {};
        this.elementList = [];
        this.callback = undefined;
        this.hasBound = false;
        this.main = undefined;
        this.eventName = "dragenter";
        this.eventCaller = undefined;
    }
    generateEvent(elementList, callback) {
        if (callback != undefined) {
            this.callback = callback;
            this.hasBound = true;
        }
        this.elementList.length = 0;
        if (elementList != undefined)
            this.elementList.push(...elementList);
    }
    reFill(htAr, clearOldIfExists, bindEvent) {
        if (clearOldIfExists)
            this.elementList = [];
        this.elementList.push(...htAr);
        if (bindEvent)
            this.addEvent(htAr);
    }
    addEvent(elements = this.elementList) {
        elements.forEach(element => element.addEventListener(this.eventName, this.eventCaller));
    }
    removeEvent(elements = this.elementList) {
        elements.forEach(element => element.removeEventListener(this.eventName, this.eventCaller));
    }
    fireEvent(ev) {
        if (this.hasBound)
            this.callback(ev);
    }
    init(main, eventName, eventCaller) {
        this.main = main;
        this.eventName = eventName;
        this.eventCaller = eventCaller;
    }
}
const ATTR = Object.freeze({
    dragTag: "dragTag"
});
class DragHelper {
    constructor() {
        this.node = {
            drop: new DragNode(),
            enter: new DragNode(),
            leave: new DragNode(),
            over: new DragNode(),
            added: false,
            addEvent: () => {
                let nd = this.node;
                if (nd.added)
                    return;
                nd.drop.addEvent();
                nd.enter.addEvent();
                nd.leave.addEvent();
                nd.over.addEvent();
                nd.added = true;
            },
            removeEvent: () => {
                let nd = this.node;
                if (!nd.added)
                    return;
                nd.drop.removeEvent();
                nd.enter.removeEvent();
                nd.leave.removeEvent();
                nd.over.removeEvent();
                nd.added = false;
            },
            init: () => {
                let nd = this.node;
                nd.drop.init(this, "drop", this._drop_EVENT);
                nd.enter.init(this, "dragenter", this._dragenter_EVENT);
                nd.leave.init(this, "dragleave", this._dragleave_EVENT);
                nd.over.init(this, "dragover", this._dragover_EVENT);
            }
        };
        this.tagName = "";
        this.dragNumber = 0;
        this.lastDragEvent = undefined;
        this.dragEnter = (callback, htEleAr) => {
            this.node.enter.generateEvent(htEleAr, callback);
            return this;
        };
        this.dragDrop = (callback, htEleAr) => {
            this.node.drop.generateEvent(htEleAr, callback);
            return this;
        };
        this.dragLeave = (callback, htEleAr) => {
            this.node.leave.generateEvent(htEleAr, callback);
            return this;
        };
        this.dragOver = (callback, htEleAr) => {
            this.node.over.generateEvent(htEleAr, callback);
            return this;
        };
        this.isEntered = false;
        this.RES = undefined;
        this.lastEnteredElement = undefined;
        this._dragenter_EVENT = (ele, ev) => {
            this.lastDragEvent = ev;
            this.node.enter.fireEvent(ev);
        };
        this._dragover_EVENT = (ele, ev) => {
            ev.preventDefault();
            this.lastDragEvent = ev;
            this.node.over.fireEvent(ev);
            ev.dataTransfer.dropEffect = "move";
        };
        this._dragleave_EVENT = (ele, ev) => {
            this.lastDragEvent = ev;
            this.node.leave.fireEvent(ev);
        };
        this._drop_EVENT = (ele, ev) => {
            this.isEntered = false;
            this.lastDragEvent = ev;
            this.node.drop.fireEvent(ev);
        };
        DragHelper.dragNumberCounter++;
        this.dragNumber = DragHelper.dragNumberCounter;
        this.tagName = common_1.uniqOpt.guidAs_;
        this.node.init();
    }
    //static dragEventCallback = (ev: DragEvent): void => { };
    pushElements(htEleAr, clearOldIfExists = true) {
        this.node.enter.reFill(htEleAr, clearOldIfExists, this.node.added);
        this.node.leave.reFill(htEleAr, clearOldIfExists, this.node.added);
        this.node.over.reFill(htEleAr, clearOldIfExists, this.node.added);
        this.node.drop.reFill(htEleAr, clearOldIfExists, this.node.added);
        return this;
    }
    start() {
        this.node.addEvent();
    }
    stop() {
        this.node.removeEvent();
    }
    static DRAG_ME(elements, callOnDragStart = (evt) => {
        return {
            type: "unknown",
            data: undefined,
        };
    }, callOnDragEnd = (evt) => { }) {
        let dragstartEventListner = (ev) => {
            //this.lastDragEvent = ev;
            DragHelper.draggedData = callOnDragStart(ev);
            DragHelper._dragstart.fire([ev.currentTarget, ev]);
        };
        // dragHelper._dragend.assign(callOnDragEnd);
        let dragendEventListner = (ev) => {
            //this.lastDragEvent = ev;
            DragHelper._dragend.fire([ev.currentTarget, ev]);
            callOnDragEnd(ev);
            DragHelper.dragResult = false;
        };
        let ar = common_1.controlOpt.getArray(elements);
        ar.forEach(element => {
            element.addEventListener("dragstart", dragstartEventListner);
            element.addEventListener("dragend", dragendEventListner);
        });
    }
    getDTag(ele, eventName) {
        let dTAg = ele.data(ATTR.dragTag);
        if (dTAg != undefined) {
            if (dTAg.dragNumber != this.dragNumber)
                dTAg = undefined;
            else
                return dTAg[eventName];
        }
        if (dTAg == undefined) {
            let pe = ele.parentElement;
            if (pe != undefined)
                return this.getDTag(pe, eventName);
        }
        return dTAg;
    }
}
exports.DragHelper = DragHelper;
_a = DragHelper;
DragHelper.dragNumberCounter = 0;
DragHelper.activeDragTag = "";
DragHelper.ON_START = (onStart, onEnd) => {
    _a._dragstart.on(onStart);
    _a._dragend.on(onEnd);
    // return this;
};
DragHelper._dragend = new commonEvent_1.CommonEvent();
DragHelper._dragstart = new commonEvent_1.CommonEvent();
DragHelper.draggedData = common_1.objectOpt.clone(transferation_1.transferDataNode);
DragHelper.dragResult = false;
