
import { ItemIndexChangeBy, listUiHandler } from "ucbuilder/global/listUI/extended/listUiHandler";
import { scrollbarHandler } from "ucbuilder/global/listUI/pager/scrollbarHandler";
import { timeoutCall } from "ucbuilder/global/timeoutCall";
import { pagerATTR, PageNavigationResult } from "ucbuilder/global/listUI/pager/enumAndMore";
import { Usercontrol } from "ucbuilder/Usercontrol";
type KeyboardNavigationCallback = (evt: KeyboardEvent, valToAddRemove: number) => void;

export class pagerLV extends listUiHandler {
    constructor() {
        super();
    }
    scroller: scrollbarHandler = new scrollbarHandler();
    /*source: {
        _rows: any[];
        rows: any[];
        _this: () => pagerLV;
        update: () => void;
    } = {
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
            this._this().Events.onSourceUpdate.fire([this._rows.length]);
        }
    };*/
    allItemHT: NodeListOf<HTMLElement>;
    pageInfo: {
        extended: {
            pgrLv: pagerLV;
            perPageRecord: number;
            length: number;
            _begin: number;
            _currentIndex: number;
            bottomIndex: number;
            topHiddenRowCount: number;
            bottomHiddenRowCount: number;
            lastSideTopIndex: number;
            isLastSideTopIndex: boolean;
        };
        defaultIndex: number;
        selectedRow: any;
        top: number;
        pagelv: pagerLV;
        minBottomIndex: number;
    } = {
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
    get currentIndex(): number { return this.OPTIONS.SESSION.currentIndex; }
    set currentIndex(val: number) {
        this.setCurrentIndex(val);
    }
    setCurrentIndex = (val: number, evt: MouseEvent | KeyboardEvent = undefined, eventType: ItemIndexChangeBy='Other'): void => {
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
        this.OPTIONS.currentItem = this.Records.lstVWEle.children[eletof] as HTMLElement;
        currentItem = this.OPTIONS.currentItem;
        if (currentItem != undefined)
            currentItem.setAttribute('iscurrent', '1');
        if (changed)
            this.Events.currentItemIndexChange.fire([oldIndex, session.currentIndex, evt, eventType]);
    };
    uc: Usercontrol;
    init(lstVw: HTMLElement, scrollContainer: HTMLElement, uc: Usercontrol): void {
        this.pageInfo.pagelv =
            this.pageInfo.extended.pgrLv = this;
        super.init(lstVw, scrollContainer,uc);
        this.uc = uc;
        this.scroller.init(this);
        this.allItemHT = lstVw.childNodes as NodeListOf<HTMLElement>;
        this.Records.itemAt = (index: number) => {
            return this.allItemHT[index];
        };
        this.initkeyEvents();
        lstVw.addEventListener("mousedown", (e: MouseEvent) => {
            let itm = this.Records.getItemFromChild(e.target as HTMLElement);
            if (itm != null) {
                this.setCurrentIndex(itm.data(pagerATTR.itemIndex), e, "Mouse");
                this.Events.itemMouseDown.fire([this.currentIndex, e]);
            }
        });
        lstVw.addEventListener("mouseup", (e: MouseEvent) => {
            let itm = this.Records.getItemFromChild(e.target as HTMLElement);
            if (itm != null) {
                this.Events.itemMouseUp.fire([this.currentIndex, e]);
            }
        });
        this.initNodes();
        /*
        let _itemSize = this.nodes.itemSize;        
        let s = this.itemTemplate.extended.size;
        setTimeout(() => {
            _itemSize.height = s.height;
            _itemSize.width = s.width;
        }, 1);
        */
    }
    initkeyEvents(): void {
    }
    get perPageRecord(): number { return this.pageInfo.extended.perPageRecord; }
    get beginIndex(): number { return this.pageInfo.top; }
    initNodes(): void {
        this.nodes.prepend = (index: number, replaceNode: boolean = false): HTMLElement => {
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
            this.Events.newItemGenerate.fire([itemNode, index]);
            return itemNode;
        };
        this.nodes.append = (index: number, replaceNode: boolean = false): HTMLElement => {
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
            this.Events.newItemGenerate.fire([itemNode, index]);
            return itemNode;
        };
        this.nodes.fill = (): void => {
            let _records = this.pageInfo;
             
            this.nodes.clear();
            for (let index = _records.top, len = _records.minBottomIndex; index <= len; index++)
                this.nodes.append(index);
        };
        let calledToFill = false;
        this.nodes.callToFill = (): void => {
            if (calledToFill) return;
            calledToFill = true;
            timeoutCall.start(() => {
                if (this.Events.beforeOldItemRemoved.length != 0) {
                    let cntnr = this.Records.lstVWEle.children;
                    for (let index = 0; index < cntnr.length; index++) {
                        const element = cntnr.item(index) as HTMLElement;
                        this.Events.beforeOldItemRemoved.fire([element]);
                        element.remove();
                    }
                }
                this.nodes.fill();
                calledToFill = false;
            });
        };
        this.nodes.indexOf = (ele: HTMLElement): number => {
            return ele.data(pagerATTR.itemIndex);
        };
        this.nodes.loopVisibleRows = (callback: (ele: HTMLElement) => boolean = (ele) => { return true; }): void => {
            let _records = this.Records;
            let _chldrns = _records.lstVWEle.children;
            let cIndex = this.currentIndex;
            for (let index = 0; index < _chldrns.length; index++) {
                const element = _chldrns[index] as HTMLElement;
                let itemindex = parseInt(element.data(pagerATTR.itemIndex));
                element.setAttribute('isCurrent', (itemindex == cIndex) ? '1' : '0');
                if (!callback(element)) return;
            }
        };
    }
    update = (index: number): HTMLElement => {
        let rec = this.Records;
        let ele = this.nodes.append(index, true);
        this.setCurrentIndex(this.currentIndex);
        return ele;
    };
    navigatePages = {
        callNavigate: (callback: KeyboardNavigationCallback = (evt,vltr) => { }, event: KeyboardEvent, valToAddRemove?: number): void => {
            this.Events.onRowNavigationChanged(callback, event, valToAddRemove);
        },
        pageTo: {
            downSide: {
                check: (): PageNavigationResult => {
                    let nextPageBottom = this.pageInfo.extended.bottomIndex + this.pageInfo.extended.perPageRecord;
                    return (nextPageBottom < this.length - 1) ?
                        'OUTSIDE'
                        :
                        'LAST';
                },
                Advance: {
                    outside: (): void => {
                        this.pageInfo.extended._begin += this.pageInfo.extended.perPageRecord;
                    },
                    last: (): void => {
                        if (this.pageInfo.extended.bottomIndex > this.length) {
                            this.pageInfo.extended._begin = 0;
                            this.currentIndex = this.pageInfo.defaultIndex;
                        } else this.pageInfo.extended._begin = this.length - this.pageInfo.extended.perPageRecord;
                    },
                },
                Go: (event: KeyboardEvent): void => {
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
                check: (): PageNavigationResult => {
                    let prevPageTop = this.pageInfo.top - this.pageInfo.extended.perPageRecord;
                    return (prevPageTop > this.pageInfo.defaultIndex) ?
                        "OUTSIDE"
                        :
                        "FIRST";
                },
                Advance: {
                    outside: (): void => {
                        this.pageInfo.extended._begin -= this.pageInfo.extended.perPageRecord;
                        this.nodes.callToFill();
                        this.currentIndex = this.pageInfo.extended._begin;
                    },
                    first: (): void => {
                        this.pageInfo.extended._begin = 0;
                        this.OPTIONS.SESSION.currentIndex = this.pageInfo.defaultIndex;
                        this.nodes.callToFill();
                        this.currentIndex = this.pageInfo.extended._begin;
                    },
                },
                Go: (event: KeyboardEvent): void => {
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
                check: (): PageNavigationResult => {
                    return (this.currentIndex > this.pageInfo.top) ?
                        "DISPLAYED"
                        :
                        (this.pageInfo.top > this.pageInfo.defaultIndex) ?
                            "OUTSIDE"
                            :
                            "FIRST";
                },
                Advance: {
                    dispayed: (evt: KeyboardEvent, valToCount: number = 1): void => {
                        this.currentIndex -= valToCount;
                    },
                    outside: (evt: KeyboardEvent, valToCount: number = 1): HTMLElement => {
                        let eleToRem = this.Records.lstVWEle.lastElementChild as HTMLElement;
                        this.Events.beforeOldItemRemoved.fire([eleToRem]);
                        eleToRem.remove();
                        this.pageInfo.extended._begin--;
                        let ele = this.nodes.prepend(this.pageInfo.top);
                        this.currentIndex--;
                        return ele;
                    },
                    first: (evt: KeyboardEvent, valToCount: number = 1): void => {
                        if (this.Events.onReachFirstRecord()) {
                            this.pageInfo.extended._begin = this.pageInfo.extended.lastSideTopIndex;
                            this.nodes.callToFill();
                            this.currentIndex = this.pageInfo.minBottomIndex;
                        }
                    }
                },
                Go: (event: KeyboardEvent, valToCount: number = 1): void => {
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
                check: (valToCount: number = 1): PageNavigationResult => {
                    return (this.currentIndex < this.pageInfo.minBottomIndex) ?
                        "DISPLAYED"
                        :
                        (this.pageInfo.extended.bottomIndex < this.length - 1) ?
                            "OUTSIDE"
                            :
                            "LAST";
                },
                Advance: {
                    dispayed: (evt: KeyboardEvent, valToCount: number = 1): void => {
                        this.currentIndex += valToCount;
                    },
                    outside: (evt: KeyboardEvent, valToCount: number = 1): HTMLElement => {
                        let lastTopIndex = this.pageInfo.extended.lastSideTopIndex;
                        if (this.pageInfo.top < lastTopIndex) {
                            let eleToRem = this.Records.lstVWEle.firstElementChild as HTMLElement;
                            this.Events.beforeOldItemRemoved.fire([eleToRem]);
                            eleToRem.remove();
                            this.pageInfo.extended._begin++;
                        } else this.pageInfo.extended._begin = lastTopIndex;
                        let newItemEle = this.nodes.append(this.pageInfo.minBottomIndex);
                        this.currentIndex++;
                        return newItemEle;
                    },
                    last: (evt: KeyboardEvent, valToCount: number = 1): void => {
                        if (this.Events.onReachLastRecord()) {
                            this.pageInfo.extended._begin = 0;
                            this.currentIndex = this.pageInfo.defaultIndex;
                            this.nodes.callToFill();
                        }
                    }
                },
                Go: (event: KeyboardEvent, valToCount: number = 1): void => {
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