const { pagerLV } = require("@ucbuilder:/global/listUI/pagerLV");
const { Point, Size } = require("@ucbuilder:/global/drawing/shapes");
const { numOpt } = require("@ucbuilder:/build/common");
const { mouseForMove } = require("@ucbuilder:/global/mouseForMove");

class scrollNode {
    get pagerLv() { return this.main.main; }
    /**
     * @param {"h"|"v"} dir 
     * @param {scrollbarHandler} main
     */
    constructor(dir, main) {
        this.main = main;
        this.dir = dir;
        this.scrollbar.setAttribute('dir', dir);
    }

    refresh = {
        scrollPosition: () => {            
            if (this.hasMouseDown) return;
            if (this.mainlength != this.pagerLv.length) { this.refresh.scrollSize(); return; }
            let tpos = this.pagerLv.pageInfo.extended.bottomIndex;
            let ts = this.trackSize - this.scrollSize;
            let stop = numOpt.gtvc(this.mainlength, ts, tpos);
            this.scrollTop = Math.min(stop, (this.trackSize - this.scrollSize));

        },
        scrollSize: () => {
            this.mainlength = this.pagerLv.length;
            this.trackSize = this.track.offsetHeight;
            let avval = this.mainlength / this.pagerLv.pageInfo.extended.perPageRecord;
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
        this.scroller.style.height = value + "px";
    }
    trackSize = 0;
    _scrollTop = 0;
    get scrollTop() {
        return this._scrollTop;
    }
    set scrollTop(value) {
        this._scrollTop = value;
        this.scroller.style.top = value + "px";
        this.beginText.innerText = this.pagerLv.pageInfo.extended.topHiddenRowCount;
        this.endText.innerText = this.pagerLv.pageInfo.extended.bottomHiddenRowCount;
    }
    /** @type {HTMLElement}  */
    scrollbar = `<scrollbar></scrollbar>`.$();
    /** @type {HTMLElement}  */
    track = `<track></track>`.$();
    /** @type {HTMLElement}  */
    scroller = `<scroller></scroller>`.$();
    /** @type {HTMLElement}  */
    beginText = `<scroller-text role="begin"></scroller-text>`.$();
    /** @type {HTMLElement}  */
    endText = `<scroller-text role="end"></scroller-text>`.$();
    /** @type {HTMLElement}  */
    beginBtn = `<scroller-btn role="begin"></scroller-btn>`.$();
    /** @type {HTMLElement}  */
    endBtn = `<scroller-btn role="end"></scroller-btn>`.$();
    hasMouseDown = false;
    getComplete() {
        this.scrollbar.appendChild(this.beginBtn);
        this.scrollbar.appendChild(this.track);
        this.track.appendChild(this.scroller);
        this.scroller.appendChild(this.beginText);
        this.scroller.appendChild(this.endText);
        this.scrollbar.appendChild(this.endBtn);
        if(this.scrollbar.parentElement==null){
            this.pagerLv.uc.ucExtends.passElement(this.scrollbar);
            this.pagerLv.Records.scrollerElement.appendChild(this.scrollbar);
        }
        
        let mouseMv = new mouseForMove();
        let tstamp = this.track.stamp();
        this.track.addEventListener("mousedown", (e) => {
            if (e.target.stamp() === tstamp) {
                let hs = e.offsetY - Math.floor(this.scrollSize / 2);
                this.doContentScrollAt(hs);
                mouseMv.doMouseDown(e);
            }
        });

        mouseMv.bind(this.scroller, {
            onDown: (evt, pt) => {
                pt.y -= this.scrollTop;
                this.main.scrollBox.vScrollbar.scrollbar.setAttribute('active', '1');
                this.hasMouseDown = true;
            },
            onMove: (evt, diff) => {
                this.doContentScrollAt(diff.y);
            },
            onUp: (evt, diff) => {
                this.hasMouseDown = false;
                this.main.scrollBox.vScrollbar.scrollbar.setAttribute('active', '0');
            }
        });
    }
    isfilling = false;
    doContentScrollAt(scrollval) {
        if (this.isfilling) return;
        let stop = Math.max(Math.min(scrollval, (this.trackSize - this.scrollSize)), 0);
        let sch = (this.mainlength / (this.trackSize - this.scrollSize)) * stop;
        this.pagerLv.pageInfo.top = Math.floor(sch - this.pagerLv.pageInfo.extended.perPageRecord);
        this.isfilling = true;
        setTimeout(() => {
            this.pagerLv.nodes.fill();
            this.scrollTop = stop;
            this.isfilling = false;
        });
    }
}
class scrollbarHandler {
    constructor() { }
    scrollBox = {
        /** @type {HTMLElement}  */
        scrollgroup: `<scrollgroup ></scrollgroup>`.$(),
        hScrollbar: new scrollNode('h', this),
        vScrollbar: new scrollNode('v', this),

        init: () => {
            let sbox = this.scrollBox;
            //sbox.hScrollbar.getComplete();
            sbox.vScrollbar.getComplete();

        },
        onClearList: () => {
            //  this.main.Records.lstVWEle.append(this.scrollBox.scrollbar);
        }
    }
    //mainlength = 0;
    /** @type {MutationObserver}  */
    mutate = undefined;
    get refresh(){ return this.scrollBox.vScrollbar.refresh; }
    viewSize = new Size();
    /** @param {pagerLV} main */
    init(main) {
        this.main = main;
        this.scrollBox.init();
        this.mutate = new MutationObserver((e) => {
            this.refresh.scrollPosition();           
        });
        this.mutate.observe(this.main.Records.lstVWEle, { childList: true });

        this.main.Events.onListUISizeChanged.on((rect) => {
            setTimeout(() => {
                this.viewSize.setBy.HTMLEle(this.main.Records.scrollerElement)
                let ppr = (this.viewSize.height / this.main.nodes.itemSize.height);
                this.main.pageInfo.extended.perPageRecord = Math.floor(ppr);
                this.main.nodes.fill();
                this.refresh.scrollSize();
            });
        });
        this.main.Records.scrollerElement.addEventListener('mouseenter', (e) => {

        });
    }
}
module.exports = { scrollbarHandler, scrollNode };