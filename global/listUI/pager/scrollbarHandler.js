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
    scrollSize = 0;
    trackSize = 0;
    scrollTop = 0;
    /** @type {HTMLElement}  */
    scrollbar = `<scrollbar></scrollbar>`.$();
    /** @type {HTMLElement}  */
    track = `<track></track>`.$();
    /** @type {HTMLElement}  */
    scroller = `<scroller></scroller>`.$();
    /** @type {HTMLElement}  */
    beginBtn = `<begin-btn></begin-btn>`.$();
    /** @type {HTMLElement}  */
    endBtn = `<end-btn></end-btn>`.$();
    hasMouseDown = false;
    getComplete() {
        this.scrollbar.appendChild(this.beginBtn);
        this.scrollbar.appendChild(this.track);
        this.track.appendChild(this.scroller);
        this.scrollbar.appendChild(this.endBtn);
        let sbox = this.main.scrollBox;
        this.pagerLv.uc.ucExtends.passElement(sbox.hScrollbar.scrollbar);
        this.pagerLv.uc.ucExtends.passElement(sbox.vScrollbar.scrollbar);
        this.pagerLv.Records.scrollerElement.appendChild(sbox.hScrollbar.scrollbar);
        this.pagerLv.Records.scrollerElement.appendChild(sbox.vScrollbar.scrollbar);


        let mouseMv = new mouseForMove();
        /** @type {Point}  */
        let dpt = undefined;
        let len = 0;
        let isfilling = false;
        mouseMv.bind(this.scroller, {
            onDown: (evt, pt) => {
                dpt = pt;
                len = this.main.mainlength;
                pt.y -= this.scrollTop;
                this.hasMouseDown = true;
            },
            onMove: (evt, diff) => {
                let tp = diff.y;
                this.scrollTop = Math.max(Math.min(tp, (this.trackSize - this.scrollSize)), 0);
                this.scroller.style.top = this.scrollTop + "px";
                let sch = (len / (this.trackSize - this.scrollSize)) * this.scrollTop;
                this.pagerLv.pageInfo.top = Math.floor(sch - this.pagerLv.pageInfo.extended.perPageRecord);
                if(isfilling)return;
                setTimeout(()=>{                    
                    isfilling = true;
                    this.pagerLv.nodes.fill();
                    isfilling = false;
                },1)
            },
            onUp: (evt, diff) => {
                this.hasMouseDown = false;
            }
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
            _scrollbar.scrollTop = numOpt.gtvc(this.mainlength, ts, tpos);
            _scrollbar.scrollTop = Math.min(_scrollbar.scrollTop, (_scrollbar.trackSize - _scrollbar.scrollSize));

            _scrollbar.scroller.style.top = _scrollbar.scrollTop + "px";
        },
        scrollSize: () => {
            this.mainlength = this.main.length;
            let _scrollbar = this.scrollBox.vScrollbar;
            _scrollbar.trackSize = _scrollbar.track.offsetHeight;
            let avval = this.mainlength / this.main.pageInfo.extended.perPageRecord;
            _scrollbar.scrollSize = Math.min(Math.max((_scrollbar.trackSize / avval), 15), _scrollbar.trackSize);
            _scrollbar.scroller.style.height = _scrollbar.scrollSize + "px";
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