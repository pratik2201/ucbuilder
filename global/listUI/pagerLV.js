"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagerLV = void 0;
const listUiHandler_1 = require("ucbuilder/global/listUI/extended/listUiHandler");
const scrollbarHandler_1 = require("ucbuilder/global/listUI/pager/scrollbarHandler");
const timeoutCall_1 = require("ucbuilder/global/timeoutCall");
const enumAndMore_1 = require("ucbuilder/global/listUI/pager/enumAndMore");
class pagerLV extends listUiHandler_1.listUiHandler {
    constructor() {
        super();
        this.scroller = new scrollbarHandler_1.scrollbarHandler();
        this.pageInfo = {
            extended: {
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
            top: 0,
            pagelv: undefined,
            get minBottomIndex() { return Math.min(this.extended.bottomIndex, this.extended.length - 1); },
        };
        this.setCurrentIndex = (val, evt = undefined, eventType = 'Other') => {
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
            }
            else {
                if (val < pgInfoExt._begin) {
                    pgInfo.top = val;
                }
                else {
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
                this.Events.currentItemIndexChange.fire([oldIndex, session.currentIndex, evt, eventType]);
        };
        this.update = (index) => {
            let rec = this.Records;
            let ele = this.nodes.append(index, true);
            this.setCurrentIndex(this.currentIndex);
            return ele;
        };
        this.navigatePages = {
            callNavigate: (callback = (evt, vltr) => { }, event, valToAddRemove) => {
                this.Events.onRowNavigationChanged(callback, event, valToAddRemove);
            },
            pageTo: {
                downSide: {
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
                            }
                            else
                                this.pageInfo.extended._begin = this.length - this.pageInfo.extended.perPageRecord;
                        },
                    },
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
                    }
                },
                upSide: {
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
                            this.nodes.callToFill();
                            this.currentIndex = this.pageInfo.extended._begin;
                        },
                        first: () => {
                            this.pageInfo.extended._begin = 0;
                            this.OPTIONS.SESSION.currentIndex = this.pageInfo.defaultIndex;
                            this.nodes.callToFill();
                            this.currentIndex = this.pageInfo.extended._begin;
                        },
                    },
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
                        outside: (evt, valToCount = 1) => {
                            let eleToRem = this.Records.lstVWEle.lastElementChild;
                            this.Events.beforeOldItemRemoved.fire([eleToRem]);
                            eleToRem.remove();
                            this.pageInfo.extended._begin--;
                            let ele = this.nodes.prepend(this.pageInfo.top);
                            this.currentIndex--;
                            return ele;
                        },
                        first: (evt, valToCount = 1) => {
                            if (this.Events.onReachFirstRecord()) {
                                this.pageInfo.extended._begin = this.pageInfo.extended.lastSideTopIndex;
                                this.nodes.callToFill();
                                this.currentIndex = this.pageInfo.minBottomIndex;
                            }
                        }
                    },
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
                        outside: (evt, valToCount = 1) => {
                            let lastTopIndex = this.pageInfo.extended.lastSideTopIndex;
                            if (this.pageInfo.top < lastTopIndex) {
                                let eleToRem = this.Records.lstVWEle.firstElementChild;
                                this.Events.beforeOldItemRemoved.fire([eleToRem]);
                                eleToRem.remove();
                                this.pageInfo.extended._begin++;
                            }
                            else
                                this.pageInfo.extended._begin = lastTopIndex;
                            let newItemEle = this.nodes.append(this.pageInfo.minBottomIndex);
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
        };
    }
    get currentIndex() { return this.OPTIONS.SESSION.currentIndex; }
    set currentIndex(val) {
        this.setCurrentIndex(val);
    }
    init(lstVw, scrollContainer, uc) {
        this.pageInfo.pagelv =
            this.pageInfo.extended.pgrLv = this;
        super.init(lstVw, scrollContainer, uc);
        this.uc = uc;
        this.scroller.init(this);
        this.allItemHT = lstVw.childNodes;
        this.Records.itemAt = (index) => {
            return this.allItemHT[index];
        };
        this.initkeyEvents();
        lstVw.addEventListener("mousedown", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.setCurrentIndex(itm.data(enumAndMore_1.pagerATTR.itemIndex), e, "Mouse");
                this.Events.itemMouseDown.fire([this.currentIndex, e]);
            }
        });
        lstVw.addEventListener("mouseup", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.Events.itemMouseUp.fire([this.currentIndex, e]);
            }
        });
        this.initNodes();
        let _itemSize = this.nodes.itemSize;
        let s = this.itemTemplate.extended.size;
        setTimeout(() => {
            _itemSize.height = s.height;
            _itemSize.width = s.width;
        }, 1);
    }
    initkeyEvents() {
    }
    get perPageRecord() { return this.pageInfo.extended.perPageRecord; }
    get beginIndex() { return this.pageInfo.top; }
    initNodes() {
        this.nodes.prepend = (index, replaceNode = false) => {
            let _records = this.Records;
            let itemNode = _records.getNode(index);
            itemNode.data(enumAndMore_1.pagerATTR.itemIndex, index);
            let allHT = this.allItemHT;
            if (allHT.length == 0)
                _records.lstVWEle.appendChild(itemNode);
            else {
                if (!replaceNode) {
                    _records.lstVWEle.prepend(itemNode);
                }
                else {
                    allHT[index].replaceWith(itemNode);
                }
            }
            this.Events.newItemGenerate.fire([itemNode, index]);
            return itemNode;
        };
        this.nodes.append = (index, replaceNode = false) => {
            let _records = this.Records;
            let itemNode = _records.getNode(index);
            itemNode.data(enumAndMore_1.pagerATTR.itemIndex, index);
            itemNode.setAttribute('iscurrent', '0');
            let allHT = this.allItemHT;
            if (allHT.length == 0)
                _records.lstVWEle.appendChild(itemNode);
            else {
                if (!replaceNode) {
                    _records.lstVWEle.append(itemNode);
                }
                else {
                    allHT[index].replaceWith(itemNode);
                }
            }
            this.Events.newItemGenerate.fire([itemNode, index]);
            return itemNode;
        };
        this.nodes.fill = () => {
            let _records = this.pageInfo;
            this.nodes.clear();
            for (let index = _records.top, len = _records.minBottomIndex; index <= len; index++)
                this.nodes.append(index);
        };
        let calledToFill = false;
        this.nodes.callToFill = () => {
            if (calledToFill)
                return;
            calledToFill = true;
            timeoutCall_1.timeoutCall.start(() => {
                if (this.Events.beforeOldItemRemoved.length != 0) {
                    let cntnr = this.Records.lstVWEle.children;
                    for (let index = 0; index < cntnr.length; index++) {
                        const element = cntnr.item(index);
                        this.Events.beforeOldItemRemoved.fire([element]);
                        element.remove();
                    }
                }
                this.nodes.fill();
                calledToFill = false;
            });
        };
        this.nodes.indexOf = (ele) => {
            return ele.data(enumAndMore_1.pagerATTR.itemIndex);
        };
        this.nodes.loopVisibleRows = (callback = (ele) => { return true; }) => {
            let _records = this.Records;
            let _chldrns = _records.lstVWEle.children;
            let cIndex = this.currentIndex;
            for (let index = 0; index < _chldrns.length; index++) {
                const element = _chldrns[index];
                let itemindex = parseInt(element.data(enumAndMore_1.pagerATTR.itemIndex));
                element.setAttribute('isCurrent', (itemindex == cIndex) ? '1' : '0');
                if (!callback(element))
                    return;
            }
        };
    }
}
exports.pagerLV = pagerLV;
