const { Point, Size } = require("@ucbuilder:/global/drawing/shapes");
const { numOpt } = require("@ucbuilder:/build/common");
const { mouseForMove } = require("@ucbuilder:/global/mouseForMove");
const { scrollbarHandler } = require("@ucbuilder:/global/listUI/pager/scrollbarHandler");
const { namingConversion, scrollerUIElements } = require("@ucbuilder:/global/listUI/pager/enumAndMore");
const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");
class simpleScroll {
    nameList = newObjectOpt.copyProps(namingConversion, {});
    
    /**
     * @param {"h"|"v"} dir 
     */
    constructor(dir) {
        this.nameList.initByType(dir);
        this.dir = dir;
    }
    get contentWidth() {
        return this.pagerLv.Records.lstVWEle.offsetWidth;
    }
    refresh = {
        scrollPosition: () => {
            if (this.hasMouseDown) return;
            if (this.mainlength != this.pagerLv.length) { this.refresh.scrollSize(); return; }
            let tpos = this.pagerLv.pageInfo.extended.bottomIndex;
            let ts = this.trackSize - this.scrollSize;
            let stop = numOpt.gtvc(this.mainlength, ts, tpos);
            this.scrollAt = Math.min(stop, (this.trackSize - this.scrollSize));

        },
        scrollSize: () => {
            this.contentSize = this.contentWidth;
            this.trackSize = this.nodes.track.offsetWidth;
            this.scrollerSize = this.pagerLv.Records.scrollerElement[this.nameList.offsetSize];
            if (this.contentSize > this.scrollerSize) {
                this.scrollSize = ((this.trackSize * this.trackSize) / this.contentSize);
            }
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
    _scrollAt = 0;
    get scrollAt() {
        return this._scrollAt;
    }
    set scrollAt(value) {
        this._scrollAt = value;

        this.nodes.scroller.style[this.nameList.position] = value + "px";
       
    }
    
    nodes = newObjectOpt.copyProps(scrollerUIElements, {});





    hasMouseDown = false;
    
    get pagerLv() { return this.main.main; }

    /** @param {scrollbarHandler} main */
    getComplete(main) {
        this.main = main;
        this.nodes.initByType('simple');
        this.nodes.scrollbar.setAttribute('dir', this.dir);

        let records = this.pagerLv.Records;
        this.pagerLv.Events.onListUISizeChanged.on((r) => {
            this.refresh.scrollSize();
        });


        if (this.nodes.scrollbar.parentElement == null) {
            this.pagerLv.uc.ucExtends.passElement(this.nodes.scrollbar);
            records.scrollerElement.appendChild(this.nodes.scrollbar);
        }
        let mouseMv = new mouseForMove();

        this.rszObs_lvitemCnt = new ResizeObserver((entries,obs)=>{
            //console.log('s<<<<<<=');
            this.refresh.scrollSize();
            //this.refresh.scrollPosition();
        });
        this.rszObs_lvitemCnt.observe(this.pagerLv.Records.lstVWEle,{ box:"border-box" });

        let tstamp = this.nodes.track.stamp();
        this.nodes.track.addEventListener("mousedown", (e) => {
            if (e.target.stamp() === tstamp) {
                let hs = e[this.nameList.offsetPoint] - Math.floor(this.scrollSize / 2);
                this.DOWN_SCROLL_POS = 0;
                this.doContentScrollAt(hs);
                mouseMv.doMouseDown(e);
            }
        });

        mouseMv.bind(this.nodes.scroller, {
            onDown: (evt, pt) => {
                this.trackSize = this.nodes.track.offsetWidth;
                this.scrollerSize = this.pagerLv.Records.scrollerElement[this.nameList.offsetSize];
                this.contentSize = this.contentWidth;
                this.nodes.scrollbar.setAttribute('active', '1');
                this.hasMouseDown = true;
                this.DOWN_SCROLL_POS = this.scrollAt;
            },
            onMove: (evt, diff) => {
                this.doContentScrollAt(diff[this.nameList.point]);
            },
            onUp: (evt, diff) => {
                this.hasMouseDown = false;
                this.nodes.scrollbar.setAttribute('active', '0');
            }
        });
    }
    DOWN_SCROLL_POS = 0;
    contentSize = 0;
    trackSize = 0
    doContentScrollAt(scrollval) {

        if (this.contentSize > this.scrollerSize) {
            scrollval += this.DOWN_SCROLL_POS;
            scrollval = Math.min(scrollval, (this.trackSize - this.scrollSize));
            scrollval = Math.max(scrollval, 0);
            let st = (scrollval * this.contentSize) / this.trackSize;
            this.scrollAt = scrollval;
            this.pagerLv.Records.scrollerElement[this.nameList.scrollPosition] = st;
        }
    }
}
module.exports = { simpleScroll }