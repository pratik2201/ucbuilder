const { commonEvent } = require("@ucbuilder:/global/commonEvent");
const { keyBoard } = require("@ucbuilder:/global/hardware/keyboard");
const { listUiSearch } = require("@ucbuilder:/global/listUiSearch");
/**
 * @typedef {import ("@ucbuilder:/Template").Template} Template
 */
class listUiHandler {
    constructor() {
        this.search = new listUiSearch(this);
    }

    OPTIONS = {
        SESSION: {
            currentIndex: -1,
            scrollTop: 0,
        },
        
        /** @type {DOMRectReadOnly}  */
        listSize: undefined,
        /** @type {HTMLElement}  */
        currentItem: undefined,
    }
    source = {
        _rows: [],
        get rows() {
            return this._rows;
        },
        _this : () => this,
        set rows(value) {
            this._rows = value;
            
        },
        update(){
            this._this().length = this._rows.length;
        }
    }

    /** @type {Template}  */
    itemTemplate = undefined;
    /** @type {number}  */ 
    length = 0;
    /*get length() { return this.source.rows.length; }
    set length(val) { this.source.rows.length = val; }*/
    Records = {

        /**
         * @param {number} index 
         * @returns {HTMLElement}
         */
        itemAt(index) { return undefined; },
        /** @type {HTMLElement}  */
        container: undefined,
        /** @type {HTMLElement}  */
        scrollerElement: undefined,
        /**
         * @param {HTMLElement} ele 
         * @returns {HTMLElement}
         */
        getItemFromChild(ele) {
            let _container = this.container;
            while (true) {
                if (ele.parentElement == null) { return null; }
                else if (_container.is(ele.parentElement)) {
                    return ele;
                } else {
                    ele = ele.parentElement;
                }
            }
        },
        /**
         * @param {number} index 
         * @returns {HTMLElement}
         */
        getNode: (index) => {
            return this.itemTemplate.extended.generateNode(this.source.rows[index]);
        },




        clear() {
            this.container.innerHTML = '';
        },
        fill: () => {
            console.log('ds');
        },
    }
    Events = {

        /**
         * @type {{on:(callback = (
         *          index:number,
         *          evt:MouseEvent
         * ) =>{})} & commonEvent}
         */
        itemDoubleClick: new commonEvent(),

        /**
         * @type {{on:(callback = (
         *          index:number,
         *          evt:MouseEvent
         * ) =>{})} & commonEvent}
         */
        itemMouseDown: new commonEvent(),

        /**
         * 
         * @type {{on:(callback = (
         *          index:number,
         *          evt:MouseEvent
         * ) =>{})} & commonEvent}
         */
        itemMouseUp: new commonEvent(),




        /**
         * @type {{on:(callback = (
         *          oldIndex:number,
         *          newIndex:number,
         *          evt:MouseEvent|KeyboardEvent,
         *          eventType:"Other"|"Keyboard"|"Mouse" = "Other"
         * ) =>{})} & commonEvent}
         */
        currentItemIndexChange: new commonEvent(),

        /**
         * @type {{on:(callback = (
         *          itemnode:HTMLElement,
         *          index:number
         * ) =>{})} & commonEvent}
         */
        newItemGenerate: new commonEvent(),
        /**
         * @type {{on:(callback = (
         *          rect:DOMRectReadOnly
         * ) =>{})} & commonEvent}
         */
        onListUISizeChanged: new commonEvent(),
    };
    set currentIndex(val) {
        this.setCurrentIndex(val);
    }

    get currentRecord() { return this.source.rows[this.currentIndex]; }
    get currentIndex() { return this.OPTIONS.SESSION.currentIndex; }
    set scrollerElement(val) {
        if (val == undefined) return;
        if (this.resizeObsrv != undefined)
            this.resizeObsrv.disconnect();
        this.resizeObsrv = new window.ResizeObserver((pera) => {
            this.OPTIONS.listSize = pera[0].contentRect;
            this.Events.onListUISizeChanged.fire(pera[0].contentRect);
        });
        this.Records.scrollerElement = val;
        this.resizeObsrv.observe(val);
    }
    /**
     * @param {HTMLElement} lstVw 
     * @param {HTMLElement} scrollContainer 
     */
    init(lstVw, scrollerElement) {
        this.Records.container = lstVw;
        this.scrollerElement = scrollerElement;
        lstVw.addEventListener("dblclick", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null)
                this.Events.itemDoubleClick.fire(this.currentIndex, e);
        });
        this.Records.container.addEventListener("keydown", (e) => { this.keydown_listner(e); });
    }
    /**
    * @param {number} val 
    * @param {MouseEvent|KeyboardEvent} evt 
    * @param {"Other"|"Keyboard"|"Mouse"} eventType
    */
    setCurrentIndex(val, evt, eventType) { }
    /** @param {KeyboardEvent} e */
    keydown_listner(e) { }
}
module.exports = { listUiHandler }