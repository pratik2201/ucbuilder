import { Point, Size } from "ucbuilder/global/drawing/shapes";
import { numOpt } from "ucbuilder/build/common";
import { MouseForMove } from "ucbuilder/global/mouseForMove";
import { scrollbarHandler } from "ucbuilder/global/listUI/pager/scrollbarHandler";
import { ScrollerType, ScrollerUIElements, scrollerUIElements } from "ucbuilder/global/listUI/pager/enumAndMore";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { keyBoard } from "ucbuilder/global/hardware/keyboard";
import { timeoutCall } from "ucbuilder/global/timeoutCall";
import { getConvertedNames, namingConversion, NamingConversion } from "ucbuilder/global/resizer/namingConversion";

export class pagerScroll {
    nameList: NamingConversion = Object.assign({}, namingConversion);

    dir: ScrollerType = 'Vertical';
    constructor(dir: ScrollerType) {
        this.nameList = getConvertedNames(dir == 'Horizontal' ? 'grid-template-columns' : 'grid-template-rows');
        this.dir = dir;
    }
    doDebug: boolean = false;
    refresh = {
        scrollPosition: (): void => {
            if (this.hasMouseDown) return;
            if (this.mainlength != this.pagerLv.length) {
                this.refresh.scrollSize();
                return;
            }
            if (this.doDebug) debugger;
            let tpos = this.pagerLv.pageInfo.extended._begin;
            let ts = this.trackSize;
            let stop = numOpt.gtvc(this.mainlength, ts, tpos);
            this.scrollTop = Math.min(stop, this.trackSize - this.scrollSize);
        },
        scrollSize: (): void => {
            this.mainlength = this.pagerLv.length;
            this.trackSize = this.nodes.track[this.nameList.offsetSize];

            let avval = this.mainlength / this.perPageRecord;
            this.scrollSize = Math.min(
                Math.max(this.trackSize / avval, 15),
                this.trackSize
            );
            this.refresh.scrollPosition();
        },
    };
    mainlength: number = 0;
    _scrollSize: number = 0;
    get scrollSize(): number {
        return this._scrollSize;
    }
    set scrollSize(value: number) {
        this._scrollSize = value;
        this.nodes.scroller.style[this.nameList.size] = value + "px";
    }
    trackSize: number = 0;
    _scrollTop: number = 0;
    get scrollTop(): number {
        return this._scrollTop;
    }
    set scrollTop(value: number) {
        this._scrollTop = value;
        this.nodes.scroller.style[this.nameList.dir] = value + "px";
        this.Events.onChangeHiddenCount(
            this.pageLvExtend.topHiddenRowCount,
            this.pageLvExtend.bottomHiddenRowCount
        );
    }
    Events = {
        onChangeHiddenCount: (beginHiddenCount: number, endHiddenCount: number): void => {
            this.nodes.beginText.innerText = ''+beginHiddenCount;
            this.nodes.endText.innerText = ''+endHiddenCount;
        },
    };
    nodes: ScrollerUIElements = Object.assign({},scrollerUIElements);

    hasMouseDown: boolean = false;

    get pagerLv() {
        return this.main.main;
    }
    get pageLvExtend(): any {
        return this.pagerLv.pageInfo.extended;
    }
    main: scrollbarHandler;
    /**
     * @param {scrollbarHandler} main
     */
    getComplete(main: scrollbarHandler): void {
        this.main = main;
        this.pagerLv.Records.scrollerElement.addEventListener("keydown", (e: any) => {
            if (e.keyCode === keyBoard.keys.single_quote) {
                this.doDebug = !this.doDebug;
                console.log("debug state : " + this.doDebug);
            }
        });

        this.nodes.initByType("pager");
        this.nodes.scrollbar.setAttribute("dir", this.dir);
        if (this.nodes.scrollbar.parentElement == null) {
            this.pagerLv.uc.ucExtends.passElement(this.nodes.scrollbar);
            this.pagerLv.Records.scrollerElement.appendChild(this.nodes.scrollbar);
        }

        this.pagerLv.Events.onListUISizeChanged.on((r: any) => {
            // console.log(this.perPageRecord);
            this.refresh.scrollSize();
        });
        let mouseMv = new MouseForMove();
        let tstamp = this.nodes.track.stamp();
        this.nodes.track.addEventListener("mousedown", (e: any) => {
            if (e.target.stamp() === tstamp) {
                let hs = e[this.nameList.offsetPoint] - Math.floor(this.scrollSize / 2);
                this.DOWN_SCROLL_POS = 0;
                this.doContentScrollAt(hs, false);
                mouseMv.doMouseDown(e);
            }
        });

        mouseMv.bind(
            {
                onDown: (evt: any, pt: any): void => {
                    this.DOWN_PER_PAGE_ROW = this.perPageRecord;
                    this.DOWN_SCROLL_POS = this.scrollTop;
                    this.main.scrollBox.vScrollbar.nodes.scrollbar.setAttribute(
                        "active",
                        "1"
                    );
                    this.hasMouseDown = true;
                },
                onMove: (evt: any, diff: any): void => {
                    this.doContentScrollAt(diff[this.nameList.point]);
                },
                onUp: (evt: any, diff: any): void => {
                    this.hasMouseDown = false;
                    this.main.scrollBox.vScrollbar.nodes.scrollbar.setAttribute(
                        "active",
                        "0"
                    );
                },
            },
            this.nodes.scroller
        );
    }
    get perPageRecord(): number {
        return this.pagerLv.pageInfo.extended.perPageRecord;
    }
    DOWN_PER_PAGE_ROW: number = 0;
    DOWN_SCROLL_POS: number = 0;
    isfilling: boolean = false;
    doContentScrollAt(scrollval: number, useTimeOut: boolean = true): void {
        if (this.isfilling) return;
        this.isfilling = true;
        //this.pagerLv.Records.scrollerElement.scrollHeight
        let _this = this;
        if (useTimeOut) setTimeout(doscroll);
        else doscroll();
        function doscroll() {
            /*  
            scrollval += this.DOWN_SCROLL_POS;
             scrollval = Math.min(scrollval, (this.trackSize - this.scrollSize));
             scrollval = Math.max(scrollval, 0);
             let st = (scrollval * this.contentSize) / this.trackSize;
             this.scrollAt = scrollval;
             this.pagerLv.Records.scrollerElement[this.nameList.scrollPosition] = st;
             
             */

            scrollval += _this.DOWN_SCROLL_POS;
            scrollval = Math.min(scrollval, _this.trackSize - _this.scrollSize);
            scrollval = Math.max(scrollval, 0);
            let sch =
                ((_this.mainlength - _this.DOWN_PER_PAGE_ROW) /
                    (_this.trackSize - _this.scrollSize)) *
                scrollval;
            _this.pagerLv.pageInfo.top = Math.floor(sch);
            _this.pagerLv.nodes.fill();
            _this.scrollTop = scrollval;
            _this.isfilling = false;
        }
    }
}