
const { looping } = require("@ucbuilder:/build/common");
const { keyBoard } = require("@ucbuilder:/global/hardware/keyboard");
const { listUiHandler } = require("@ucbuilder:/global/listUI/extended/listUiHandler");
const { pagerATTR, PageNavigationResult } = require("@ucbuilder:/global/listUI/pager/enumAndMore");
class scrollbarHandler {
    constructor() { }
    /** @param {pagerLV} main */
    init(main) {
        this.main = main;
        this.main.Events.onListUISizeChanged.on((rect) => {
            setTimeout(() => {
                let h = (this.main.Records.scrollerElement.offsetHeight / this.main.nodes.itemSize.height);
                this.main.pageInfo.extended.perPageRecord = Math.floor(h) - 1;

                this.main.nodes.fill();
            });
        });

    }
}


class pagerLV extends listUiHandler {

    constructor() {
        super();
        this.pageInfo.extended.pgrLv = this;
    }
    scroller = new scrollbarHandler();
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
        update() {

        }
    }
    /** @type {HTMLElement[]}  */
    allItemHT = undefined;
    pageInfo = {
        /** @private */
        extended: {
            /** @type {pagerLV}  */
            pgrLv: undefined,
            perPageRecord: 20,

            get length() { return this.pgrLv.length; },
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
            get isLastSideTopIndex() { return this.lastSideTopIndex == this._top; },
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
    get currentIndex() { return this.OPTIONS.SESSION.currentIndex; }

    set currentIndex(val) {
        let pgInfo = this.pageInfo;
        let pgInfoExt = pgInfo.extended;
        let bIndex = pgInfo.minBottomIndex;
        if (val >= pgInfoExt._top && val <= bIndex) {
            this.OPTIONS.SESSION.currentIndex = val;
        } else {
            if (val < pgInfoExt._top) {
                pgInfo.top = val;
            } else {
                pgInfo.top = val - pgInfoExt.perPageRecord + 1;
            }
            this.OPTIONS.SESSION.currentIndex = val;
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
        }
        if (changed)
            this.Events.currentItemIndexChange.fire(oldIndex, session.currentIndex, evt, eventType);
    }


    /**
    * @param {HTMLElement} lstVw 
    * @param {HTMLElement} scrollContainer 
    */container
    init(lstVw, scrollContainer) {
        super.init(lstVw, scrollContainer);
        this.scroller.init(this);
        this.allItemHT = lstVw.childNodes;

        this.Records.itemAt = (index) => {
            return this.allItemHT[index];
        }

        this.initkeyEvents();

        lstVw.addEventListener("mousedown", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.setCurrentIndex(itm.data(pagerATTR.itemIndex), e, "Mouse");
                this.Events.itemMouseDown.fire(this.currentIndex, e);
            }
        });
        lstVw.addEventListener("mouseup", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.Events.itemMouseUp.fire(this.currentIndex, e);
            }
        });
        this.initNodes();

        let _itemSize = this.nodes.itemSize;
        this.Events.newItemGenerate.on((itmnode) => {
            if (!_itemSize.hasSet) _itemSize.update(itmnode);
        });
    }
    initkeyEvents() {
        this.Events.onkeydown = (e) => {

            switch (e.keyCode) {
                case keyBoard.keys.up: // up key

                    this.setCurrentIndex(this.currentIndex - 1, e, "Keyboard");
                    e.preventDefault();
                    break;
                case keyBoard.keys.down: // down key
                    this.setCurrentIndex(this.currentIndex + 1, e, "Keyboard");
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
        };
    }
    initNodes() {
        this.nodes.prepend = (index) => {

            return itemNode;
        }
        this.nodes.append = (index, replaceNode = false) => {


            let _records = this.Records;
            let itemNode = _records.getNode(index);
            itemNode.data(pagerATTR.itemIndex, index);
            let allHT = this.allItemHT;
            if (allHT.length == 0)
                _records.lstVWEle.appendChild(itemNode);
            else {
                if (!replaceNode) {
                    _records.lstVWEle.append(itemNode);
                } else {
                    allHT[index].replaceWith(itemNode);
                }
            }
            this.Events.newItemGenerate.fire(itemNode, index);

            return itemNode;
        }
        this.nodes.fill = () => {

            let _records = this.pageInfo;
            this.nodes.clear();
            for (let index = _records.top, len = _records.minBottomIndex; index <= len; index++)
                this.nodes.append(index);
        }
        this.nodes.callToFill = () => {
            if (this.Events.beforeOldItemRemoved.length > 0) {
                let cntnr = this.Records.lstVWEle.children;
                for (let index = 0; index < cntnr.length; index++) {
                    const element = cntnr.item(index);
                    this.Events.beforeOldItemRemoved(element);
                    element.remove();
                }
            }
            this.nodes.fill();
        }
        this.nodes.loopVisibleRows = (callback = (ele) => { return true; }) => {
            let _records = this.Records;
           
            for (let index = 0; index < _records.lstVWEle.length; index++) {
                const element = _records.lstVWEle[index];
                let index = parseInt(element.data(pagerATTR.itemIndex));
                if (index == this.currentIndex) {
                     element.setAttribute('isCurrent', '1');
                }
                else {
                    element.setAttribute('isCurrent', '0');
                }
                if (!callback(element)) return;
            }

        }
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
                currentItem.setAttribute('iscurrent', '0');
            session.currentIndex = val;
            this.OPTIONS.currentItem = allItems[val];
            currentItem = this.OPTIONS.currentItem;
            currentItem.setAttribute('iscurrent', '1');
            currentItem.focus();
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
        let ele = this.nodes.append(index, true);
        this.setCurrentIndex(this.currentIndex);
        return ele;
    }








    navigatePages = {
        callNavigate: (callback = () => { }, event) => {
            this.Events.onRowNavigationChanged(callback, event);
        },
        pageTo: {
            downSide: {
                /**
                 * 
                 * @returns {PageNavigationResult} 
                 *      
                 *      `OUTSIDE` indicate can be move to one page down side
                 * 
                 *      `LAST` indicate already reached to last page record
                 */
                check: () => {
                    let nextPageBottom = this.pageInfo.extended.bottomIndex + this.pageInfo.extended.perPageRecord;
                    return (nextPageBottom < this.length - 1) ?
                        'OUTSIDE'
                        :
                        'LAST';
                },
                Advance: {
                    outside: () => {
                        this.pageInfo.extended._top += this.pageInfo.extended.perPageRecord;
                    },
                    last: () => {
                        if (this.pageInfo.extended.bottomIndex > this.length) {
                            this.pageInfo.extended._top = 0;
                            this.OPTIONS.SESSION.currentIndex = this.pageInfo.defaultIndex;
                        } else this.pageInfo.extended._top = this.length - this.pageInfo.extended.perPageRecord;
                    },
                },
                /**
                 * @param {KeyboardEvent} event 
                 */
                Go: (event) => {
                    let dwnSide = this.navigatePages.pageTo.downSide;
                    let cmd = dwnSide.check();
                    switch (cmd) {
                        case "OUTSIDE":
                            this.navigatePages.callNavigate(dwnSide.Advance.outside, event);
                            break;
                        case "LAST":
                            this.navigatePages.callNavigate(dwnSide.Advance.last, event);
                            break;
                    }
                    this.nodes.callToFill();
                    this.OPTIONS.SESSION.currentIndex = this.pageInfo.minBottomIndex;
                    this.PageManage_extended.records.render();
                }
            },
            upSide: {
                /**
                 * 
                 * @returns {PageNavigationResult} 
                 *      
                 *      `OUTSIDE` indicate can be move to one page up side
                 * 
                 *      `FIRST` indicate already reached to first page record
                 */
                check: () => {
                    let prevPageTop = this.pageInfo.top - this.pageInfo.extended.perPageRecord;
                    return (prevPageTop > this.pageInfo.defaultIndex) ?
                        "OUTSIDE"
                        :
                        "FIRST";
                },
                Advance: {
                    outside: () => {
                        this.pageInfo.extended._top -= this.pageInfo.extended.perPageRecord;
                        this.OPTIONS.SESSION.currentIndex = this.pageInfo.extended._top;
                        this.nodes.callToFill();
                    },
                    first: () => {
                        this.pageInfo.extended._top = 0;
                        this.OPTIONS.SESSION.currentIndex = this.pageInfo.defaultIndex;
                        this.nodes.callToFill();
                    },
                },
                /**
                 * 
                 * @param {KeyboardEvent} event 
                 */
                Go: (event) => {
                    let upSd = this.navigatePages.pageTo.upSide;
                    let cmd = upSd.check();
                    switch (cmd) {
                        case "OUTSIDE":
                            this.navigatePages.callNavigate(upSd.Advance.outside, event);
                            break;
                        case "FIRST":
                            this.navigatePages.callNavigate(upSd.Advance.first, event);
                            break;
                    }
                    this.PageManage_extended.records.render();
                }
            }
        },
        moveTo: {
            prevSide: {
                /**
                 * 
                 * @returns {PageNavigationResult} 
                 *      `DISPLAYED` indicate currentIndex inside displayed items 
                 * 
                 *      `OUTSIDE` indicate currentIndex is the first item of displayed items
                 * 
                 *      `FIRST` indicate currentIndex is the first item of list
                 */
                check: () => {
                    return (this.currentIndex > this.pageInfo.top) ?
                        "DISPLAYED"
                        :
                        (this.pageInfo.top > this.pageInfo.defaultIndex) ?
                            "OUTSIDE"
                            :
                            "FIRST";
                },
                Advance: {
                    dispayed: () => {
                        this.OPTIONS.SESSION.currentIndex--;
                    },
                    /**
                     * 
                     * @returns {HTMLElement} first item of displayed list
                     */
                    outside: () => {
                        let eleToRem = this.Records.lstVWEle.lastElementChild;
                        this.Events.beforeOldItemRemoved.fire(eleToRem);
                        eleToRem.remove();
                        this.pageInfo.extended._top--;
                        let ele = this.nodes.prepend(this.pageInfo.top);
                        this.OPTIONS.SESSION.currentIndex--;
                        return ele;
                    },
                    first: () => {
                        if (this.Events.onReachFirstRecord()) {
                            this.pageInfo.extended._top = this.pageInfo.extended.lastSideTopIndex;//Math.max(0, this.PageManage_extended.indexes.__recordCount - this.pageInfo.extended.perPageRecord);
                            this.nodes.callToFill();
                            this.OPTIONS.SESSION.currentIndex = this.pageInfo.minBottomIndex;
                        }
                    }
                },
                /**
                 * 
                 * @param {KeyboardEvent} event 
                 */
                Go: (event) => {
                    let prvSide = this.navigatePages.moveTo.prevSide;
                    let cmd = prvSide.check();
                    switch (cmd) {
                        case "DISPLAYED":
                            this.navigatePages.callNavigate(prvSide.Advance.dispayed, event);
                            break;
                        case "OUTSIDE":
                            this.navigatePages.callNavigate(prvSide.Advance.outside, event);
                            break;
                        case "FIRST":
                            this.navigatePages.callNavigate(prvSide.Advance.first, event);
                            break;
                    }
                    this.PageManage_extended.records.render();
                }
            },
            nextSide: {
                /**
                 * 
                 * @returns {PageNavigationResult} 
                 *      `DISPLAYED` indicate currentIndex inside displayed items 
                 * 
                 *      `OUTSIDE` indicate currentIndex is the last item of displayed items
                 * 
                 *      `LAST` indicate currentIndex is the last item of list
                 */
                check: () => {
                    return (this.currentIndex < this.pageInfo.minBottomIndex) ?
                        "DISPLAYED"
                        :
                        (this.pageInfo.extended.bottomIndex < this.length - 1) ?
                            "OUTSIDE"
                            :
                            "LAST";
                },
                Advance: {
                    dispayed: () => {
                        this.OPTIONS.SESSION.currentIndex++;
                    },
                    /**
                    * 
                    * @returns {HTMLElement} last item of displayed list
                    */
                    outside: () => {
                        let lastTopIndex = this.pageInfo.extended.lastSideTopIndex;
                        if (this.pageInfo.top < lastTopIndex) {
                            let eleToRem = this.Records.lstVWEle.firstElementChild;
                            this.Events.beforeOldItemRemoved(eleToRem);
                            eleToRem.remove();
                            this.pageInfo.extended._top++;
                        } elsethis.pageInfo.extended._top = lastTopIndex;
                        let newItemEle = this.nodes.append(this.pageInfo.minBottomIndex); // this.PageManage_extended.indexes.bottomIndex
                        this.OPTIONS.SESSION.currentIndex++;
                        return newItemEle;
                    },
                    last: () => {
                        if (this.Events.onReachLastRecord()) {
                            this.pageInfo.extended._top = 0;
                            this.OPTIONS.SESSION.currentIndex = this.pageInfo.defaultIndex;
                            this.nodes.callToFill();
                        }
                    }
                },
                /**
                 * 
                 * @param {KeyboardEvent} event 
                 */
                Go: (event) => {
                    let nxtSide = this.navigatePages.moveTo.nextSide;
                    let cmd = nxtSide.check();
                    switch (cmd) {
                        case "DISPLAYED":
                            this.navigatePages.callNavigate(nxtSide.Advance.dispayed, event);
                            break;
                        case "OUTSIDE":
                            this.navigatePages.callNavigate(nxtSide.Advance.outside, event);
                            break;
                        case "LAST":
                            this.navigatePages.callNavigate(nxtSide.Advance.last, event);
                            break;
                    }
                    this.PageManage_extended.records.render();
                }
            }
        },
    }
}

module.exports = { pagerLV }