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
        rows: [],
    }
    // source = {
    //     /** @private */
    //     _rows: [],
    //     get rows() {
    //         return this._rows;
    //     },
    //     _this: () => { return this; },
    //     set rows(value) {
    //         this._rows = value;
    //         let _ths = this._this();
    //         if (value.length > 0)
    //             _ths.search.takeBlueprint();
    //     },
    // }
    /** @type {Template}  */
    itemTemplate = undefined;

    get length() { return this.source.rows.length; }
    set length(val) { this.source.rows.length = val; }
    Records = {
        /** @type {HTMLElement[]}  */
        allItemHT: undefined,
        itemAt(index) { /*console.log(this);*/ return this.allItemHT[index]; },
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
            //return this.itemTemplate.extended.generateNode(_this.source.rows[index]);
        },


        /**
         * @param {number} index 
         * @returns {HTMLElement}
         */
        update: (index) => {
            let rec = this.Records
            let ele = rec.append(index, true);
            this.setCurrentIndex(this.currentIndex);
            return ele;
        },

        /**
          * @param {number} index 
          * @param {boolean} replaceNode 
          * @returns {HTMLElement}
          */
        append: (index, replaceNode = false) => {
            let _records = this.Records;
            let itemNode = _records.getNode(index);
            itemNode.setAttribute('item-index', index);

            let allHT = _records.allItemHT;
            if (allHT.length == 0)
                _records.container.appendChild(itemNode);
            else {
                if (!replaceNode) {
                    let aa = allHT[index - 1];
                    aa.after(itemNode);
                } else {
                    allHT[index].replaceWith(itemNode);
                }
            }
            this.Events.newItemGenerate.fire(itemNode, index);
            return itemNode;
        },
        clear() {
            this.container.innerHTML = '';
        },
        fill: () => {
            let _records = this.Records;
            _records.clear();
            
            this.search.takeBlueprint();
            for (let index = 0, len = this.length - 1; index <= len; index++)
                _records.append(index);
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

    };
    set currentIndex(val) {
        this.setCurrentIndex(val);
    }
    /**
     * @param {number} val 
     * @param {MouseEvent|KeyboardEvent} evt 
     * @param {"Other"|"Keyboard"|"Mouse"} eventType
     */
    setCurrentIndex(val, evt, eventType = "Other") {
        // let pageExtended = this.__extended();
        //if (pageExtended.isFreez) return;
        let oldIndex = this.currentIndex;
        let changed = (val !== oldIndex);
        let _records = this.Records;
        let _scrollElement = _records.scrollerElement;
        let currentItem = this.OPTIONS.currentItem;
        let options = this.OPTIONS;
        let allItems = _records.allItemHT;
        let session = options.SESSION;
        if (val >= 0 && val < allItems.length) {
            if (currentItem != undefined)
                currentItem.setAttribute('current-index', '0');
            session.currentIndex = val;
            this.OPTIONS.currentItem = allItems[val];
            currentItem = this.OPTIONS.currentItem;
            currentItem.setAttribute('current-index', '1');
            currentItem.focus();
            if (_scrollElement != undefined &&
                options.listSize != undefined) {
                let itemTop = currentItem.offsetTop;
                let itemHeight = currentItem.offsetHeight;
                let bottom = itemTop + itemHeight;
                let B_diff = options.listSize.height - bottom;

                let bDiff = B_diff + _scrollElement.scrollTop;
                if (bDiff < 0)
                    _scrollElement.scrollTop = Math.abs(B_diff);

                let tDiff = itemTop - _scrollElement.scrollTop;
                if (tDiff < 0)
                    _scrollElement.scrollTop = itemTop;
                session.scrollTop = _scrollElement.scrollTop;
            }
        }

        if (changed)
            this.Events.currentItemIndexChange.fire(oldIndex, session.currentIndex, evt, eventType);
    }
    get currentRecord() { return this.source.rows[this.currentIndex]; }
    get currentIndex() { return this.OPTIONS.SESSION.currentIndex; }
    set scrollerElement(val) {
        if (val == undefined) return;
        if (this.resizeObsrv != undefined)
            this.resizeObsrv.disconnect();
        this.resizeObsrv = new window.ResizeObserver((pera) => {
            this.OPTIONS.listSize = pera[0].contentRect;
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

        this.Records.allItemHT = this.Records.container.childNodes;
        lstVw.addEventListener("mousedown", (e) => {

        });

        lstVw.addEventListener("dblclick", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.Events.itemDoubleClick.fire(this.currentIndex, e);
            }
        });
        lstVw.addEventListener("mousedown", (e) => {
            //let item = this.Records.getItemFromChild(e.target);
            //if (item != null) this.setCurrentIndex(item.index(), e, "Mouse");
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.setCurrentIndex(itm.index(), e, "Mouse");
                this.Events.itemMouseDown.fire(this.currentIndex, e);
            }
        });
        lstVw.addEventListener("mouseup", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.Events.itemMouseUp.fire(this.currentIndex, e);
            }
        });


        this.Records.container.addEventListener("keydown", this.keydown_listner);
    }
    /** @param {KeyboardEvent} e */
    keydown_listner = (e) => {
        switch (e.keyCode) {
            case keyBoard.keys.up: // up key
                this.setCurrentIndex(this.currentIndex - 1, e);
                e.preventDefault();
                break;
            case keyBoard.keys.down: // down key
                this.setCurrentIndex(this.currentIndex + 1, e);
                e.preventDefault();
                break;
            case keyBoard.keys.pageUp: // page up key
                break;
            case keyBoard.keys.pageDown: // page down key
                break;
            case keyBoard.keys.end: // end key
                this.setCurrentIndex(this.Records.length - 1, e);
                e.preventDefault();
                break;
            case keyBoard.keys.home: // home key
                this.setCurrentIndex(0, e);
                e.preventDefault();
                break;
        }
    }
}
module.exports = { listUiHandler }