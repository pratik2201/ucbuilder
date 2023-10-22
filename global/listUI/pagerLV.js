
const { looping, controlOpt, objectOpt, numOpt } = require("@ucbuilder:/build/common");
const { keyBoard } = require("@ucbuilder:/global/hardware/keyboard");
const { listUiHandler } = require("@ucbuilder:/global/listUI/extended/listUiHandler");
const { pagerATTR, PageNavigationResult } = require("@ucbuilder:/global/listUI/pager/enumAndMore");
const { Usercontrol } = require("@ucbuilder:/Usercontrol");
const { scrollbarHandler } = require("@ucbuilder:/global/listUI/pager/scrollbarHandler");
const { timeoutCall } = require("@ucbuilder:/global/timeoutCall");



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
            _begin: 0,
            _currentIndex: 0,

            get bottomIndex() { return (this._begin + this.perPageRecord) - 1; },
            get topHiddenRowCount() {
                return ((this.bottomIndex - this.perPageRecord) + 1);
            },
            get bottomHiddenRowCount() {
                return Math.max(0, (this.length - (this._begin + this.perPageRecord)));
            },
            get lastSideTopIndex() { return Math.max(0, this.length - this.perPageRecord); },
            get isLastSideTopIndex() { return this.lastSideTopIndex == this._begin; },
        },
        defaultIndex: 0,
        selectedRow: undefined,
        set top(val) { this.extended._begin = Math.max((this.extended.length <= this.extended.perPageRecord) ? 0 : val, 0); },
        get top() { return this.extended._begin; },

        /** @type {pagerLV}  */
        pagelv: undefined,


        get minBottomIndex() { return Math.min(this.extended.bottomIndex, this.extended.length - 1); },

    }
    /** @type {number}  */
    get currentIndex() { return this.OPTIONS.SESSION.currentIndex; }
    set currentIndex(val) {
        this.setCurrentIndex(val);
    }

    /**
     * @param {number} val 
     * @param {MouseEvent|KeyboardEvent} evt 
     * @param {"Other"|"Keyboard"|"Mouse"} eventType
     */
    setCurrentIndex = (val, evt, eventType = "Other") => {
        //        debugger;
        let oldIndex = this.currentIndex;
        let changed = (val !== oldIndex);
        let currentItem = this.OPTIONS.currentItem;
        let options = this.OPTIONS;
        let session = options.SESSION;

        if (currentItem != undefined)
            currentItem.setAttribute('iscurrent', '0');
        let pgInfo = this.pageInfo;
        let pgInfoExt = pgInfo.extended;
        let bIndex = pgInfo.minBottomIndex;
        if (val >= pgInfoExt._begin && val <= bIndex) {
            session.currentIndex = val;
        } else {
            if (val < pgInfoExt._begin) {
                pgInfo.top = val;
            } else {
                pgInfo.top = val - pgInfoExt.perPageRecord + 1;
            }
            session.currentIndex = val;
        }
        let eletof = session.currentIndex - pgInfo.top;
        this.OPTIONS.currentItem = this.Records.lstVWEle.children[eletof];
        currentItem = this.OPTIONS.currentItem;
        if (currentItem != undefined)
            currentItem.setAttribute('iscurrent', '1');
        if (changed)
            this.Events.currentItemIndexChange.fire(oldIndex, session.currentIndex, evt, eventType);
    }


    /**
    * @param {HTMLElement} lstVw 
    * @param {HTMLElement} scrollContainer 
    * @param {Usercontrol} uc 
    */
    init(lstVw, scrollContainer, uc) {
        super.init(lstVw, scrollContainer);
        this.uc = uc;
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
        let s = this.itemTemplate.extended.size;
        _itemSize.height = s.height;
        _itemSize.width = s.width;
        console.log(this.uc);
        console.log(_itemSize);
        /*this.Events.newItemGenerate.on((itmnode) => {
            if (!_itemSize.hasSet) _itemSize.update(itmnode);
        });*/
    }
    initkeyEvents() {
        this.Records.lstVWEle.addEventListener("wheel", (e) => {
            if (e.deltaY > 0) {
                this.navigatePages.pageTo.downSide.Go(e);
            } else {
                this.navigatePages.pageTo.upSide.Go(e);
            }
        });
        this.Events.onkeydown = (e) => {
            switch (e.keyCode) {
                case keyBoard.keys.up: // up key
                    this.navigatePages.moveTo.prevSide.Go(e);
                    break;
                case keyBoard.keys.down: // down key
                    this.navigatePages.moveTo.nextSide.Go(e);

                    break;
                case keyBoard.keys.pageUp: // page up key
                    this.navigatePages.pageTo.upSide.Go(e);
                    break;
                case keyBoard.keys.pageDown: // page down key
                    this.navigatePages.pageTo.downSide.Go(e);
                    break;
                case keyBoard.keys.end: // end key
                    this.currentIndex = this.length - 1;
                    this.nodes.callToFill();
                    this.nodes.onRendar();
                    break;
                case keyBoard.keys.home: // home key
                    this.currentIndex = 0;
                    this.nodes.callToFill();
                    this.nodes.onRendar();
                    break;
            }
        };
    }
    initNodes() {
        this.nodes.prepend = (index, replaceNode = false) => {
            let _records = this.Records;
            let itemNode = _records.getNode(index);
            itemNode.data(pagerATTR.itemIndex, index);
            let allHT = this.allItemHT;
            if (allHT.length == 0)
                _records.lstVWEle.appendChild(itemNode);
            else {
                if (!replaceNode) {
                    _records.lstVWEle.prepend(itemNode);
                } else {
                    allHT[index].replaceWith(itemNode);
                }
            }
            this.Events.newItemGenerate.fire(itemNode, index);
            return itemNode;
        }
        this.nodes.append = (index, replaceNode = false) => {


            let _records = this.Records;
            let itemNode = _records.getNode(index);
            itemNode.data(pagerATTR.itemIndex, index);
            itemNode.setAttribute('iscurrent', '0');
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
        let calledToFill = false;
        this.nodes.callToFill = () => {
            if (calledToFill) return;
            calledToFill = true;
            timeoutCall.start(() => {
                if (this.Events.beforeOldItemRemoved.length != 0) {
                    let cntnr = this.Records.lstVWEle.children;
                    for (let index = 0; index < cntnr.length; index++) {
                        const element = cntnr.item(index);
                        this.Events.beforeOldItemRemoved.fire(element);
                        element.remove();
                    }
                }
                this.nodes.fill();
                //this.currentIndex = this.currentIndex;
                calledToFill = false;
            });
        }
        this.nodes.indexOf = (ele) => {
            return ele.data(pagerATTR.itemIndex);
        }
        this.nodes.loopVisibleRows = (callback = (ele) => { return true; }) => {
            let _records = this.Records;
            let _chldrns = _records.lstVWEle.children;
            let cIndex = this.currentIndex;
            for (let index = 0; index < _chldrns.length; index++) {
                const element = _chldrns[index];
                let itemindex = parseInt(element.data(pagerATTR.itemIndex));
                element.setAttribute('isCurrent', (itemindex == cIndex) ? '1' : '0');
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
        /**
         * 
         * @param {(evt:KeyboardEvent,valToAddRemove:number)=>{}} callback 
         * @param {KeyboardEvent} event 
         * @param {number} valToAddRemove 
         */
        callNavigate: (callback = (evt) => { }, event, valToAddRemove) => {
            this.Events.onRowNavigationChanged(callback, event, valToAddRemove);
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
                        this.pageInfo.extended._begin += this.pageInfo.extended.perPageRecord;
                    },
                    last: () => {
                        if (this.pageInfo.extended.bottomIndex > this.length) {
                            this.pageInfo.extended._begin = 0;
                            this.currentIndex = this.pageInfo.defaultIndex;
                        } else this.pageInfo.extended._begin = this.length - this.pageInfo.extended.perPageRecord;
                    },
                },
                /**
                 * @param {KeyboardEvent & WheelEvent} event 
                 * @param {valToAdd}
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
                    this.currentIndex = this.pageInfo.minBottomIndex;
                    //this.nodes.render();
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
                        this.pageInfo.extended._begin -= this.pageInfo.extended.perPageRecord;
                        //console.log(this.pageInfo.extended._begin);
                        this.nodes.callToFill();
                        //console.log(this.pageInfo.extended._begin);
                        this.currentIndex = this.pageInfo.extended._begin;
                    },
                    first: () => {
                        this.pageInfo.extended._begin = 0;
                        this.SESSION.currentIndex = this.pageInfo.defaultIndex;
                        this.nodes.callToFill();
                        this.currentIndex = this.pageInfo.extended._begin;
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
                    this.nodes.render();
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
                    dispayed: (evt, valToCount = 1) => {
                        this.currentIndex -= valToCount;
                    },
                    /**
                     * 
                     * @returns {HTMLElement} first item of displayed list
                     */
                    outside: (evt, valToCount = 1) => {
                        let eleToRem = this.Records.lstVWEle.lastElementChild;
                        this.Events.beforeOldItemRemoved.fire(eleToRem);
                        eleToRem.remove();
                        this.pageInfo.extended._begin--;
                        let ele = this.nodes.prepend(this.pageInfo.top);
                        this.currentIndex--;
                        return ele;
                    },
                    first: (evt, valToCount = 1) => {
                        if (this.Events.onReachFirstRecord()) {
                            this.pageInfo.extended._begin = this.pageInfo.extended.lastSideTopIndex;//Math.max(0, this.PageManage_extended.indexes.__recordCount - this.pageInfo.extended.perPageRecord);
                            this.nodes.callToFill();
                            this.currentIndex = this.pageInfo.minBottomIndex;
                        }
                    }
                },
                /**
                 * @param {KeyboardEvent} event 
                 * @param {number} valToCount
                 */
                Go: (event, valToCount = 1) => {
                    let prvSide = this.navigatePages.moveTo.prevSide;
                    let cmd = prvSide.check();
                    switch (cmd) {
                        case "DISPLAYED":
                            this.navigatePages.callNavigate(prvSide.Advance.dispayed, event, valToCount);
                            break;
                        case "OUTSIDE":
                            this.navigatePages.callNavigate(prvSide.Advance.outside, event, valToCount);
                            break;
                        case "FIRST":
                            this.navigatePages.callNavigate(prvSide.Advance.first, event, valToCount);
                            break;
                    }
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
                check: (valToCount = 1) => {
                    return (this.currentIndex < this.pageInfo.minBottomIndex) ?
                        "DISPLAYED"
                        :
                        (this.pageInfo.extended.bottomIndex < this.length - 1) ?
                            "OUTSIDE"
                            :
                            "LAST";
                },
                Advance: {
                    dispayed: (evt, valToCount = 1) => {
                        this.currentIndex += valToCount;
                    },
                    /**
                    * 
                    * @returns {HTMLElement} last item of displayed list
                    */
                    outside: (evt, valToCount = 1) => {
                        let lastTopIndex = this.pageInfo.extended.lastSideTopIndex;
                        if (this.pageInfo.top < lastTopIndex) {
                            let eleToRem = this.Records.lstVWEle.firstElementChild;
                            this.Events.beforeOldItemRemoved.fire(eleToRem);
                            eleToRem.remove();
                            this.pageInfo.extended._begin++;
                        } else this.pageInfo.extended._begin = lastTopIndex;
                        let newItemEle = this.nodes.append(this.pageInfo.minBottomIndex); // this.PageManage_extended.indexes.bottomIndex
                        this.currentIndex++;
                        return newItemEle;
                    },
                    last: (evt, valToCount = 1) => {
                        if (this.Events.onReachLastRecord()) {
                            this.pageInfo.extended._begin = 0;
                            this.currentIndex = this.pageInfo.defaultIndex;
                            this.nodes.callToFill();
                        }
                    }
                },
                /**
                 * @param {KeyboardEvent} event 
                 * @param {number} valToCount
                 */
                Go: (event, valToCount = 1) => {
                    let nxtSide = this.navigatePages.moveTo.nextSide;
                    let cmd = nxtSide.check(valToCount);

                    switch (cmd) {
                        case "DISPLAYED":
                            this.navigatePages.callNavigate(nxtSide.Advance.dispayed, event, valToCount);
                            break;
                        case "OUTSIDE":
                            this.navigatePages.callNavigate(nxtSide.Advance.outside, event, valToCount);
                            break;
                        case "LAST":
                            this.navigatePages.callNavigate(nxtSide.Advance.last, event, valToCount);
                            break;
                    }
                }
            }
        },
    }
}

module.exports = { pagerLV }