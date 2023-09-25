const { uniqOpt, controlOpt, objectOpt, arrayOpt } = require("@ucbuilder:/build/common");
const { commonEvent } = require("@ucbuilder:/global/commonEvent");
const { transferDataNode } = require("@ucbuilder:/global/drag/transferation");

const dragElementEventRow = {
    "dragenter": "",
    "drop": "",
    "dragleave": "",
    "dragover": "",
    dragNumber: -1,
};

class dragrow {
    /** @type {container[]}  */
    elements = [];
    event = new commonEvent();

    clear() {
        this.elements.length = 0;
    }
}
class dragNode {

    source = {};

    /** @type {container[]}  */
    elementList = [];
    callback = undefined;
    hasBound = false;
    /**
     * @param {container[]} elementList 
     * @param {Function} callback 
     */
    generateEvent(elementList, callback) {
        if (callback != undefined) {
            this.callback = callback;
            this.hasBound = true;
        }
        this.elementList.length = 0;
        if (elementList != undefined)
            this.elementList.push(...elementList);
    }
    /** @param {container[]} htAr @param {boolean} clearOldIfExists @param {boolean} bindEvent */
    reFill(htAr, clearOldIfExists, bindEvent) {
        if (clearOldIfExists)
            this.elementList = [];

        this.elementList.push(...htAr);
        if (bindEvent)
            this.addEvent(htAr);
    }

    addEvent(elements = this.elementList) {
        elements.forEach(element =>
            element.addEventListener(this.eventName, this.eventCaller));
    }
    removeEvent(elements = this.elementList) {
        elements.forEach(element =>
            element.removeEventListener(this.eventName, this.eventCaller));
    }
    /**
     * 
     * @param {DragEvent} ev 
     */
    fireEvent(ev) {
        if (this.hasBound)
            this.callback(ev);
    }
    /** @type {dragHelper}  */
    main = undefined;

    /** @type {"dragenter"|"drop"|"dragleave"|"dragover"}  */
    eventName = "dragenter";

    /** @type {Function}  */
    eventCaller = undefined;
    /**
     * @param {dragHelper} main 
     * @param {"dragenter"|"drop"|"dragleave"|"dragover"} eventName
     * @param {Function} eventCaller
     */
    init(main, eventName, eventCaller) {
        this.main = main;
        this.eventName = eventName;
        this.eventCaller = eventCaller;
    }
}
const ATTR = Object.freeze({
    dragTag: "dragTag"
});
class dragHelper {
    static dragNumberCounter = 0;

    static activeDragTag = "";
    node = {
        drop: new dragNode(),
        enter: new dragNode(),
        leave: new dragNode(),
        over: new dragNode(),
        added: false,
        addEvent: () => {
            let nd = this.node;

            if (nd.added) return;
            nd.drop.addEvent();
            nd.enter.addEvent();
            nd.leave.addEvent();
            nd.over.addEvent();
            nd.added = true;
        },
        removeEvent: () => {
            let nd = this.node;
            if (!nd.added) return;
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
    }
    tagName = "";
    constructor() {
        dragHelper.dragNumberCounter++;
        this.dragNumber = dragHelper.dragNumberCounter;
        this.tagName = uniqOpt.guidAs_;
        this.node.init();
    }


    static dragEventCallback = /** @param {DragEvent} ev */(ev) => { };
    /**
     * @param {container[]} htEleAr  
     * @param {boolean} clearOldIfExists 
     * @returns {dragHelper}
     */
    pushElements(htEleAr, clearOldIfExists = true) {
        this.node.enter.reFill(htEleAr, clearOldIfExists, this.node.added);
        this.node.leave.reFill(htEleAr, clearOldIfExists, this.node.added);
        this.node.over.reFill(htEleAr, clearOldIfExists, this.node.added);
        this.node.drop.reFill(htEleAr, clearOldIfExists, this.node.added);
    }
    /** @type {DragEvent}  */
    lastDragEvent = undefined;
    /**
     * @param {dragHelper.dragEventCallback} callback 
     * @param {container[]} htEleAr 
     * @param {boolean} clearOldIfExists 
     * @returns {dragHelper}
     */
    dragEnter = (callback, htEleAr) => {
        this.node.enter.generateEvent(htEleAr, callback);
        //Array.from(htEleAr).forEach(s=>s.addEventListener("dragenter",callback));
        return this;
    }
    /**
     * @param {dragHelper.dragEventCallback} callback 
     * @param {container[]} htEleAr 
     * @param {boolean} clearOldIfExists 
     * @returns {dragHelper}
     */
    dragDrop = (callback, htEleAr) => {
        this.node.drop.generateEvent(htEleAr, callback);
        //Array.from(htEleAr).forEach(s=>s.addEventListener("drop",callback));
        return this;
    }
    /**
     * @param {dragHelper.dragEventCallback} callback 
     * @param {container[]} htEleAr 
     * @param {boolean} clearOldIfExists 
     * @returns {dragHelper}
     */
    dragLeave = (callback, htEleAr) => {
        this.node.leave.generateEvent(htEleAr, callback);
        //Array.from(htEleAr).forEach(s=>s.addEventListener("dragleave",callback));
        return this;
    }
    /**
     * @param {dragHelper.dragEventCallback} callback  
     * @param {container[]} htEleAr 
     * @param {boolean} clearOldIfExists 
     * @returns {dragHelper}
     */
    dragOver = (callback, htEleAr) => {
        this.node.over.generateEvent(htEleAr, callback);
        //Array.from(htEleAr).forEach(s=>s.addEventListener("dragover",callback));
        return this;
    }



    /** @private */
    static _dragend = new commonEvent();
    /** @private */
    static _dragstart = new commonEvent();
    /**
    * @param {dragHelper.dragEventCallback} onStart 
    * @param {dragHelper.dragEventCallback} onEnd 
    * @returns {dragHelper}
    */
    static ON_START = (onStart, onEnd) => {
        this._dragstart.on(onStart);
        this._dragend.on(onEnd);
        return this;
    }



    //static draggedDataType = dragDataTypes.unknown;
    /** @type {transferDataNode}  */ 
    static draggedData = objectOpt.clone(transferDataNode);
    /*static draggedData = {
        /**  @type {"unknown"|"uc"|"uc-link"|"tpt"|"tpt-link"|"text"|"json"|"link"}  
        type: "unknown",
        unqKey: "",
        data: undefined,
    };*/
    static dragResult = false;
    start() {
        this.node.addEvent();
    }
    stop() {
        this.node.removeEvent();
    }

    /**
     * @param {container|container[]} elements 
    */
    static DRAG_ME(elements,
        callOnDragStart =
            /** 
             * @param {DragEvent} evt  
             * @returns {transferDataNode}
             */
            (evt) => {
                return {
                    type: "unknown",
                    data: undefined,
                }
            },
        callOnDragEnd =  /** @param {DragEvent} evt */ (evt) => { }) {
        let dragstartEventListner = (ev) => {
            this.lastDragEvent = ev;
            dragHelper.draggedData = callOnDragStart(ev);
            dragHelper._dragstart.fire(ev);
        };
        // dragHelper._dragend.assign(callOnDragEnd);
        let dragendEventListner = (ev) => {
            this.lastDragEvent = ev;
            dragHelper._dragend.fire(ev);
            callOnDragEnd(ev);
            dragHelper.dragResult = false;
        };
        let ar = controlOpt.getArray(elements);

        ar.forEach(element => {
            element.addEventListener("dragstart", dragstartEventListner);
            element.addEventListener("dragend", dragendEventListner);
        });
        return this;
    }
    isEntered = false;

    /** @type {dragElementEventRow}  */
    RES = undefined;
    lastEnteredElement = undefined;
    /**
      * @private
      * @param {DragEvent} ev 
      */
    _dragenter_EVENT = (ev) => {        
       // if (this.isEntered) { return; }
       // else {
       //     this.isEntered = true; 
            this.lastDragEvent = ev;
            this.node.enter.fireEvent(ev);
       // }
    }
    /**
    * @private
    * @param {DragEvent} ev 
    */
    _dragover_EVENT = (ev) => {

        ev.preventDefault();
        this.lastDragEvent = ev;
        this.node.over.fireEvent(ev);
        ev.dataTransfer.dropEffect = "move";



        // console.log(tag);
        //console.log(this.node.over.source);
    }
    /**
     * @private
     * @param {DragEvent} ev 
     */
    _dragleave_EVENT = (ev) => {
        this.lastDragEvent = ev;
        this.node.leave.fireEvent(ev);
      //  this.isEntered = false;

    }
    /**
     * @private
     * @param {DragEvent} ev 
     */
    _drop_EVENT = (ev) => {

        this.isEntered = false;
        this.lastDragEvent = ev;
        this.node.drop.fireEvent(ev);
        //dragHelper._dragend.fire(ev);
        //dragHelper.dragResult = false;
    }







    /** 
     * @param {container} ele 
     * @param {"dragenter"|"drop"|"dragleave"|"dragover"}  eventName
     * @returns {string}
     */
    getDTag(ele, eventName) {
        /** @type {dragElementEventRow}  */
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
module.exports = { dragHelper, DragEvent }