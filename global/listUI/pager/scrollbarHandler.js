const { pagerLV } = require("@ucbuilder:/global/listUI/pagerLV");
const { Point, Size } = require("@ucbuilder:/global/drawing/shapes");
const { numOpt } = require("@ucbuilder:/build/common");
const { mouseForMove } = require("@ucbuilder:/global/mouseForMove");

class scrollNode {
    get pagerLv() { return this.main.main; }
    /**
     *  @param {"h"|"v"} dir 
     * @param {scrollbarHandler} main
     */
    constructor(dir, main) {
        this.main = main;
        this.dir = dir;
        this.scrollbar.setAttribute('dir', dir);
    }
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
        this.scrollbar.setAttribute("blink","1");
        this.beginText.innerText = this.pagerLv.pageInfo.extended.topHiddenRowCount;
        this.endText.innerText = this.pagerLv.pageInfo.extended.bottomHiddenRowCount;
        this.scrollbar.setAttribute("blink","0");
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
    beginBtn = `<begin-btn></begin-btn>`.$();
    /** @type {HTMLElement}  */
    endBtn = `<end-btn></end-btn>`.$();
    hasMouseDown = false;
    getComplete() {
        this.scrollbar.appendChild(this.beginBtn);
        this.scrollbar.appendChild(this.track);
        this.track.appendChild(this.scroller);
        this.scroller.appendChild(this.beginText);
        this.scroller.appendChild(this.endText);
        this.scrollbar.appendChild(this.endBtn);
        let sbox = this.main.scrollBox;
        this.pagerLv.uc.ucExtends.passElement(sbox.hScrollbar.scrollbar);
        this.pagerLv.uc.ucExtends.passElement(sbox.vScrollbar.scrollbar);
        this.pagerLv.Records.scrollerElement.appendChild(sbox.hScrollbar.scrollbar);
        this.pagerLv.Records.scrollerElement.appendChild(sbox.vScrollbar.scrollbar);


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
        let sch = (this.main.mainlength / (this.trackSize - this.scrollSize)) * stop;
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
            sbox.hScrollbar.getComplete();
            sbox.vScrollbar.getComplete();

        },
        onClearList: () => {
            //  this.main.Records.lstVWEle.append(this.scrollBox.scrollbar);
        }
    }
    mainlength = 0;
    /** @type {MutationObserver}  */
    mutate = undefined;
    refresh = {
        scrollPosition: () => {
            let _scrollbar = this.scrollBox.vScrollbar;
            if (_scrollbar.hasMouseDown) return;
            if (this.mainlength != this.main.length) { this.refresh.scrollSize(); return; }
            let tpos = this.main.pageInfo.extended.bottomIndex;
            let ts = _scrollbar.trackSize - _scrollbar.scrollSize;
            let stop = numOpt.gtvc(this.mainlength, ts, tpos);
            _scrollbar.scrollTop = Math.min(stop, (_scrollbar.trackSize - _scrollbar.scrollSize));

        },
        scrollSize: () => {
            this.mainlength = this.main.length;
            let _scrollbar = this.scrollBox.vScrollbar;
            _scrollbar.trackSize = _scrollbar.track.offsetHeight;
            let avval = this.mainlength / this.main.pageInfo.extended.perPageRecord;
            _scrollbar.scrollSize = Math.min(Math.max((_scrollbar.trackSize / avval), 15), _scrollbar.trackSize);
            this.refresh.scrollPosition();
        }
    }
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