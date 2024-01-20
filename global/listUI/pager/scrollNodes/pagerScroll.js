const { Point, Size } = require("ucbuilder/global/drawing/shapes");
const { numOpt } = require("ucbuilder/build/common");
const { mouseForMove } = require("ucbuilder/global/mouseForMove");
const { scrollbarHandler } = require("ucbuilder/global/listUI/pager/scrollbarHandler");
const { namingConversion, scrollerUIElements } = require("ucbuilder/global/listUI/pager/enumAndMore");
const { newObjectOpt } = require("ucbuilder/global/objectOpt");
const { keyBoard } = require("ucbuilder/global/hardware/keyboard");
const { timeoutCall } = require("ucbuilder/global/timeoutCall");
class pagerScroll {

    nameList = newObjectOpt.copyProps(namingConversion, {});


    /**
     * @param {"h"|"v"} dir 
     */
    constructor(dir) {

        this.nameList.initByType(dir);
        this.dir = dir;

    }
    doDebug = false;
    refresh = {
        scrollPosition: () => {
            if (this.hasMouseDown) return;
            if (this.mainlength != this.pagerLv.length) { this.refresh.scrollSize(); return; }
            if (this.doDebug)
                debugger;
            let tpos = this.pagerLv.pageInfo.extended._begin    ;
            let ts = this.trackSize;
            let stop = numOpt.gtvc(this.mainlength, ts, tpos);
            this.scrollTop = Math.min(stop, (this.trackSize - this.scrollSize));

        },
        scrollSize: () => {
            this.mainlength = this.pagerLv.length;
            this.trackSize = this.nodes.track[this.nameList.offsetSize];

            let avval = this.mainlength / this.perPageRecord;
            this.scrollSize = Math.min(Math.max((this.trackSize / avval), 15), this.trackSize);
            this.refresh.scrollPosition();
        }
    }
    mainlength = 0;
    _scrollSize = 0;
    get scrollSize() {
        return this._scrollSize;
    }
    set scrollSize(value) {
        this._scrollSize = value;
        this.nodes.scroller.style[this.nameList.size] = value + "px";
    }
    trackSize = 0;
    _scrollTop = 0;
    get scrollTop() {
        return this._scrollTop;
    }
    set scrollTop(value) {
        this._scrollTop = value;
        this.nodes.scroller.style[this.nameList.position] = value + "px";
        this.Events.onChangeHiddenCount(this.pageLvExtend.topHiddenRowCount, this.pageLvExtend.bottomHiddenRowCount)
    }
    Events = {
        onChangeHiddenCount: (beginHiddenCount, endHiddenCount) => {
            this.nodes.beginText.innerText = beginHiddenCount;
            this.nodes.endText.innerText = endHiddenCount;
        }
    }
    nodes = newObjectOpt.copyProps(scrollerUIElements, {});

    hasMouseDown = false;


    get pagerLv() { return this.main.main; }
    get pageLvExtend() { return this.pagerLv.pageInfo.extended; }


    /**
     * @param {scrollbarHandler} main
     */
    getComplete(main) {
        this.main = main;
        this.pagerLv.Records.scrollerElement.addEventListener("keydown", (e) => {
            if (e.keyCode === keyBoard.keys.single_quote) {
                this.doDebug = !this.doDebug;
                console.log('debug state : ' + this.doDebug);
            }
        });
        
        this.nodes.initByType('pager');
        this.nodes.scrollbar.setAttribute('dir', this.dir);
        if (this.nodes.scrollbar.parentElement == null) {
            this.pagerLv.uc.ucExtends.passElement(this.nodes.scrollbar);
            this.pagerLv.Records.scrollerElement.appendChild(this.nodes.scrollbar);
        }
        
        this.pagerLv.Events.onListUISizeChanged.on((r) => {
           // console.log(this.perPageRecord);
            this.refresh.scrollSize();
        });
        let mouseMv = new mouseForMove();
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
                this.main.scrollBox.vScrollbar.nodes.scrollbar.setAttribute('active', '1');
                this.hasMouseDown = true;
            },
            onMove: (evt, diff) => {
                this.doContentScrollAt(diff[this.nameList.point]);
            },
            onUp: (evt, diff) => {
                this.hasMouseDown = false;
                this.main.scrollBox.vScrollbar.nodes.scrollbar.setAttribute('active', '0');
            }
        },this.nodes.scroller);
    }
    get perPageRecord(){
        return  this.pagerLv.pageInfo.extended.perPageRecord;
    }
    DOWN_PER_PAGE_ROW = 0;
    DOWN_SCROLL_POS = 0;
    isfilling = false;
    doContentScrollAt(scrollval, useTimeOut = true) {
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
            scrollval = Math.min(scrollval, (_this.trackSize - _this.scrollSize));
            scrollval = Math.max(scrollval, 0);
            let sch = ((_this.mainlength - _this.DOWN_PER_PAGE_ROW) / (_this.trackSize - _this.scrollSize)) * scrollval;
            _this.pagerLv.pageInfo.top = Math.floor(sch);
            _this.pagerLv.nodes.fill();
            _this.scrollTop = scrollval;
            _this.isfilling = false;
        }
    }
}
module.exports = { pagerScroll }