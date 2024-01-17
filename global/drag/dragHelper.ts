import { uniqOpt, controlOpt, objectOpt, arrayOpt } from "@ucbuilder:/build/common";
import { CommonEvent } from "@ucbuilder:/global/commonEvent";
import transferDataNode from "@ucbuilder:/global/drag/transferation.js";
import { newObjectOpt } from "@ucbuilder:/global/objectOpt";

interface DragElementEventRow {
    dragenter: string;
    drop: string;
    dragleave: string;
    dragover: string;
    dragNumber: number;
}
type DragDataType = "unknown" | "uc" | "uc-link" | "tpt" | "tpt-link" | "text" | "json" | "link";
interface DragDataNode {
    type: DragDataType,
    unqKey: string,
    data: any,
}
export const dragDataNode: DragDataNode = {
    type: 'unknown',
    unqKey: '',
    data: undefined,
}
class DragRow {
    elements: HTMLElement[] = [];
    event = new CommonEvent();

    clear(): void {
        this.elements.length = 0;
    }
}

class DragNode {
    source: any = {};

    elementList: HTMLElement[] = [];
    callback: Function | undefined = undefined;
    hasBound = false;

    generateEvent(elementList: HTMLElement[], callback: Function): void {
        if (callback != undefined) {
            this.callback = callback;
            this.hasBound = true;
        }
        this.elementList.length = 0;
        if (elementList != undefined)
            this.elementList.push(...elementList);
    }

    reFill(htAr: HTMLElement[], clearOldIfExists: boolean, bindEvent: boolean): void {
        if (clearOldIfExists)
            this.elementList = [];

        this.elementList.push(...htAr);
        if (bindEvent)
            this.addEvent(htAr);
    }

    addEvent(elements = this.elementList): void {
        elements.forEach(element =>
            element.addEventListener(this.eventName, this.eventCaller as DragEventCallback));
    }

    removeEvent(elements = this.elementList): void {
        elements.forEach(element =>
            element.removeEventListener(this.eventName, this.eventCaller as DragEventCallback));
    }

    fireEvent(ev: DragEvent): void {
        if (this.hasBound)
            this.callback(ev);
    }

    main: DragHelper;
    eventName: "dragenter" | "drop" | "dragleave" | "dragover" = "dragenter";
    eventCaller: Function | undefined = undefined;

    init(main: DragHelper, eventName: "dragenter" | "drop" | "dragleave" | "dragover", eventCaller: Function): void {
        this.main = main;
        this.eventName = eventName;
        this.eventCaller = eventCaller;
    }
}
type DragEventCallback = (ev: DragEvent)=> void;

const ATTR = Object.freeze({
    dragTag: "dragTag"
});

export class DragHelper {
    static dragNumberCounter = 0;
    static activeDragTag = "";
    node = {
        drop: new DragNode(),
        enter: new DragNode(),
        leave: new DragNode(),
        over: new DragNode(),
        added: false,
        addEvent: (): void => {
            let nd = this.node;

            if (nd.added) return;
            nd.drop.addEvent();
            nd.enter.addEvent();
            nd.leave.addEvent();
            nd.over.addEvent();
            nd.added = true;
        },
        removeEvent: (): void => {
            let nd = this.node;
            if (!nd.added) return;
            nd.drop.removeEvent();
            nd.enter.removeEvent();
            nd.leave.removeEvent();
            nd.over.removeEvent();
            nd.added = false;
        },
        init: (): void => {
            let nd = this.node;
            nd.drop.init(this, "drop", this._drop_EVENT);
            nd.enter.init(this, "dragenter", this._dragenter_EVENT);
            nd.leave.init(this, "dragleave", this._dragleave_EVENT);
            nd.over.init(this, "dragover", this._dragover_EVENT);
        }
    }
    tagName = "";
    dragNumber: number = -1;
    constructor() {
        DragHelper.dragNumberCounter++;
        this.dragNumber = DragHelper.dragNumberCounter;
        this.tagName = uniqOpt.guidAs_;
        this.node.init();
    }

    static dragEventCallback = (ev: DragEvent): void => { };

    pushElements(htEleAr: HTMLElement[], clearOldIfExists = true): DragHelper {
        this.node.enter.reFill(htEleAr, clearOldIfExists, this.node.added);
        this.node.leave.reFill(htEleAr, clearOldIfExists, this.node.added);
        this.node.over.reFill(htEleAr, clearOldIfExists, this.node.added);
        this.node.drop.reFill(htEleAr, clearOldIfExists, this.node.added);
        return this;
    }

    lastDragEvent: DragEvent | undefined = undefined;

    dragEnter = (callback: DragEventCallback, htEleAr: HTMLElement[]): DragHelper => {
        this.node.enter.generateEvent(htEleAr, callback);
        return this;
    }

    dragDrop = (callback: DragEventCallback, htEleAr: HTMLElement[]): DragHelper => {
        this.node.drop.generateEvent(htEleAr, callback);
        return this;
    }

    dragLeave = (callback: DragEventCallback, htEleAr: HTMLElement[]): DragHelper => {
        this.node.leave.generateEvent(htEleAr, callback);
        return this;
    }

    dragOver = (callback: DragEventCallback, htEleAr: HTMLElement[]): DragHelper => {
        this.node.over.generateEvent(htEleAr, callback);
        return this;
    }

    static ON_START = (onStart: DragEventCallback, onEnd: DragEventCallback): void => {
        this._dragstart.on(onStart);
        this._dragend.on(onEnd);
       // return DragHelper;
    }

    static _dragend = new CommonEvent();
    static _dragstart = new CommonEvent();

    static draggedData = Object.assign({},dragDataNode);
    static dragResult = false;

    start(): void {
        this.node.addEvent();
    }

    stop(): void {
        this.node.removeEvent();
    }

    isEntered = false;
    RES: DragElementEventRow | undefined = undefined;
    lastEnteredElement: any = undefined;

    _dragenter_EVENT = (ev: DragEvent): void => {
        this.lastDragEvent = ev;
        this.node.enter.fireEvent(ev);
    }

    _dragover_EVENT = (ev: DragEvent): void => {
        ev.preventDefault();
        this.lastDragEvent = ev;
        this.node.over.fireEvent(ev);
        ev.dataTransfer.dropEffect = "move";
    }

    _dragleave_EVENT = (ev: DragEvent): void => {
        this.lastDragEvent = ev;
        this.node.leave.fireEvent(ev);
    }

    _drop_EVENT = (ev: DragEvent): void => {
        this.isEntered = false;
        this.lastDragEvent = ev;
        this.node.drop.fireEvent(ev);
    }

    getDTag(ele: HTMLElement, eventName: "dragenter" | "drop" | "dragleave" | "dragover"): string {
        let dTAg = ele.data(ATTR.dragTag);
        if (dTAg != undefined) {
            if (dTAg.dragNumber != this.dragNumber) dTAg = undefined;
            else return dTAg[eventName];
        }
        if (dTAg == undefined) {
            let pe = ele.parentElement;
            if (pe != undefined) return this.getDTag(pe, eventName);
        }
        return dTAg;
    }
}

