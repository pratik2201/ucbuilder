const { listUiHandler } = require("@ucbuilder:/global/listUI/extended/listUiHandler");
class pagerLV extends listUiHandler {
    constructor() {
        super();
    }
    get SESSION() { return this.OPTIONS.SESSION; }
    source = {
        _rows: [],
        get rows() {
            return this._rows;
        },
        _this: () => this,
        set rows(value) {
            this._rows = value;
            this.update();
        },
        update(){
            let ths = this._this();
            ths.length =
                ths.pageInfo.extended.length = this._rows.length;
        }
    }
    /** @type {HTMLElement[]}  */
    allItemHT = undefined;
    pageInfo = {
        /** @private */
        extended: {
            perPageRecord: 20,
            length: 0,
            _top: 0,
            _currentIndex: 0,

            get bottomIndex() { return (this._top + this.perPageRecord) - 1; },
            get topHiddenRowCount() {
                return ((this.bottomIndex - this.perPageRecord) + 1);
            },
            get bottomHiddenRowCount() {
                return Math.max(0, (this.length - (this._top + this.perPageRecord)));
            },
            get lastSideTopIndex() { return Math.max(0, this.length - this.perPageRecord); },
            get isLastSideTopIndex() { return this.extended.lastSideTopIndex == this.top; },
        },
        defaultIndex: 0,
        selectedRow: undefined,
        set top(val) { this.extended._top = Math.max((this.extended.length <= this.extended.perPageRecord) ? 0 : val, 0); },
        get top() { return this.extended._top; },

        /** @type {pagerLV}  */
        pagelv: undefined,


        get minBottomIndex() { return Math.min(this.extended.bottomIndex, this.extended.length - 1); },

    }
    /** @type {number}  */
    set currentIndex(val) {
        let pgInfo = this.pageInfo;
        let pgInfoExt = pgInfo.extended;
        let bIndex = pgInfo.minBottomIndex;
        if (val >= pgInfoExt._top && val <= bIndex) {
            pgInfoExt._currentIndex = val;
        } else {
            if (val < pgInfoExt._top) {
                pgInfo.top = val;
            } else {
                pgInfo.top = val - pgInfoExt.perPageRecord + 1;
            }
            pgInfoExt._currentIndex = val;
        }
    }
    /**
     * @param {number} val 
     * @param {MouseEvent|KeyboardEvent} evt 
     * @param {"Other"|"Keyboard"|"Mouse"} eventType
     */
    setCurrentIndex(val, evt, eventType = "Other") {        
        let oldIndex = this.currentIndex;
        let changed = (val !== oldIndex);
        let _records = this.Records;
        let _scrollElement = _records.scrollerElement;
        let currentItem = this.OPTIONS.currentItem;
        let options = this.OPTIONS;
        let allItems = this.allItemHT;
        let session = options.SESSION;
        if (val >= 0 && val < allItems.length) {
            if (currentItem != undefined)
                currentItem.setAttribute('current-index', '0');
            session.currentIndex = val;
            this.OPTIONS.currentItem = allItems[val];
            currentItem = this.OPTIONS.currentItem;
            currentItem.setAttribute('current-index', '1');
            currentItem.focus();
            /*if (_scrollElement != undefined &&
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
            }*/
        }

        if (changed)
            this.Events.currentItemIndexChange.fire(oldIndex, session.currentIndex, evt, eventType);
    }


    /**
    * @param {HTMLElement} lstVw 
    * @param {HTMLElement} scrollContainer 
    */
    init(lstVw, scrollContainer) {
        super.init(lstVw, scrollContainer);
        this.allItemHT = lstVw.childNodes;
        this.Events.onListUISizeChanged.on((rect) => {
            console.log(this.length);
            console.log(rect);
        });

        this.Records.itemAt = (index) => {
            return this.allItemHT[index];
        }
        this.Records.fill = () => {
            let _records = this.Records;
            _records.clear();
            this.search.takeBlueprint();
            for (let index = 0, len = 10/*this.length - 1*/; index <= len; index++)
                this.append(index);
        }
        super.keydown_listner = (e) => {

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


        lstVw.addEventListener("mousedown", (e) => {
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
    }

    /**
    * @param {number} index 
    * @param {boolean} replaceNode 
    * @returns {HTMLElement}
    */
    append = (index, replaceNode = false) => {
        let _records = this.Records;
        let itemNode = _records.getNode(index);
        itemNode.setAttribute('item-index', index);

        let allHT = this.allItemHT;
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
        let allItems = this.allItemHT;
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

    /**
            * @param {number} index 
            * @returns {HTMLElement}
            */
    update = (index) => {
        let rec = this.Records
        let ele = this.append(index, true);
        this.setCurrentIndex(this.currentIndex);
        return ele;
    }
}
module.exports = { pagerLV }