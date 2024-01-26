"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagerScroll = void 0;
const common_1 = require("ucbuilder/build/common");
const mouseForMove_1 = require("ucbuilder/global/mouseForMove");
const enumAndMore_1 = require("ucbuilder/global/listUI/pager/enumAndMore");
const keyboard_1 = require("ucbuilder/global/hardware/keyboard");
const namingConversion_1 = require("ucbuilder/global/resizer/namingConversion");
class pagerScroll {
    constructor(dir) {
        this.nameList = Object.assign({}, namingConversion_1.namingConversion);
        this.dir = 'Vertical';
        this.doDebug = false;
        this.refresh = {
            scrollPosition: () => {
                if (this.hasMouseDown)
                    return;
                if (this.mainlength != this.pagerLv.length) {
                    this.refresh.scrollSize();
                    return;
                }
                if (this.doDebug)
                    debugger;
                let tpos = this.pagerLv.pageInfo.extended._begin;
                let ts = this.trackSize;
                let stop = common_1.numOpt.gtvc(this.mainlength, ts, tpos);
                this.scrollTop = Math.min(stop, this.trackSize - this.scrollSize);
            },
            scrollSize: () => {
                this.mainlength = this.pagerLv.length;
                this.trackSize = this.nodes.track[this.nameList.offsetSize];
                let avval = this.mainlength / this.perPageRecord;
                this.scrollSize = Math.min(Math.max(this.trackSize / avval, 15), this.trackSize);
                this.refresh.scrollPosition();
            },
        };
        this.mainlength = 0;
        this._scrollSize = 0;
        this.trackSize = 0;
        this._scrollTop = 0;
        this.Events = {
            onChangeHiddenCount: (beginHiddenCount, endHiddenCount) => {
                this.nodes.beginText.innerText = '' + beginHiddenCount;
                this.nodes.endText.innerText = '' + endHiddenCount;
            },
        };
        this.nodes = Object.assign({}, enumAndMore_1.scrollerUIElements);
        this.hasMouseDown = false;
        this.DOWN_PER_PAGE_ROW = 0;
        this.DOWN_SCROLL_POS = 0;
        this.isfilling = false;
        this.nameList = (0, namingConversion_1.getConvertedNames)(dir == 'Horizontal' ? 'grid-template-columns' : 'grid-template-rows');
        this.dir = dir;
    }
    get scrollSize() {
        return this._scrollSize;
    }
    set scrollSize(value) {
        this._scrollSize = value;
        this.nodes.scroller.style[this.nameList.size] = value + "px";
    }
    get scrollTop() {
        return this._scrollTop;
    }
    set scrollTop(value) {
        this._scrollTop = value;
        this.nodes.scroller.style[this.nameList.dir] = value + "px";
        this.Events.onChangeHiddenCount(this.pageLvExtend.topHiddenRowCount, this.pageLvExtend.bottomHiddenRowCount);
    }
    get pagerLv() {
        return this.main.main;
    }
    get pageLvExtend() {
        return this.pagerLv.pageInfo.extended;
    }
    /**
     * @param {scrollbarHandler} main
     */
    getComplete(main) {
        this.main = main;
        this.pagerLv.Records.scrollerElement.addEventListener("keydown", (e) => {
            if (e.keyCode === keyboard_1.keyBoard.keys.single_quote) {
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
        this.pagerLv.Events.onListUISizeChanged.on((r) => {
            // console.log(this.perPageRecord);
            this.refresh.scrollSize();
        });
        let mouseMv = new mouseForMove_1.MouseForMove();
        let tstamp = this.nodes.track.stamp();
        this.nodes.track.addEventListener("mousedown", (e) => {
            if (e.target.stamp() === tstamp) {
                let hs = e[this.nameList.offsetPoint] - Math.floor(this.scrollSize / 2);
                this.DOWN_SCROLL_POS = 0;
                this.doContentScrollAt(hs, false);
                mouseMv.doMouseDown(e);
            }
        });
        mouseMv.bind({
            onDown: (evt, pt) => {
                this.DOWN_PER_PAGE_ROW = this.perPageRecord;
                this.DOWN_SCROLL_POS = this.scrollTop;
                this.main.scrollBox.vScrollbar.nodes.scrollbar.setAttribute("active", "1");
                this.hasMouseDown = true;
            },
            onMove: (evt, diff) => {
                this.doContentScrollAt(diff[this.nameList.point]);
            },
            onUp: (evt, diff) => {
                this.hasMouseDown = false;
                this.main.scrollBox.vScrollbar.nodes.scrollbar.setAttribute("active", "0");
            },
        }, this.nodes.scroller);
    }
    get perPageRecord() {
        return this.pagerLv.pageInfo.extended.perPageRecord;
    }
    doContentScrollAt(scrollval, useTimeOut = true) {
        if (this.isfilling)
            return;
        this.isfilling = true;
        //this.pagerLv.Records.scrollerElement.scrollHeight
        let _this = this;
        if (useTimeOut)
            setTimeout(doscroll);
        else
            doscroll();
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
            let sch = ((_this.mainlength - _this.DOWN_PER_PAGE_ROW) /
                (_this.trackSize - _this.scrollSize)) *
                scrollval;
            _this.pagerLv.pageInfo.top = Math.floor(sch);
            _this.pagerLv.nodes.fill();
            _this.scrollTop = scrollval;
            _this.isfilling = false;
        }
    }
}
exports.pagerScroll = pagerScroll;
