const { Point, Size } = require("@ucbuilder:/global/drawing/shapes");
const { numOpt } = require("@ucbuilder:/build/common");
const { mouseForMove } = require("@ucbuilder:/global/mouseForMove");
const { scrollbarHandler } = require("@ucbuilder:/global/listUI/pager/scrollbarHandler");
class simpleScroll {
    nameList = {
        offsetPoint: "offsetY",
        offsetSize: "offsetHeight",
        position: "top",
        point: "y",
        size: "height",
        initByType(dir) {
            switch (dir) {
                case 'h':
                    this.offsetPoint = "offsetX";
                    this.offsetSize = "offsetWidth";
                    this.point= "x";
                    this.position = "left";
                    this.size = "width";
                    break;
                case 'v': break;
            }
        }
    };
    get pagerLv() { return this.main.main; }
    /**
     * @param {"h"|"v"} dir 
     * @param {scrollbarHandler} main
     */
    constructor(dir, main) {
        this.main = main;
        this.nameList.initByType(dir);
        this.dir = dir;
        this.nodes.scrollbar.setAttribute('dir', dir);
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
            this.trackSize = this.nodes.track[this.nameList.offsetSize];
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
       // this.nodes.beginText.innerText = this.pagerLv.pageInfo.extended.topHiddenRowCount;
       // this.nodes.endText.innerText = this.pagerLv.pageInfo.extended.bottomHiddenRowCount;
    }
    nodes = {
        /** @type {HTMLElement}  */
        scrollbar: `<scrollbar></scrollbar>`.$(),
        /** @type {HTMLElement}  */
        track: `<track></track>`.$(),

        /** @type {HTMLElement}  */
        scroller: `<scroller></scroller>`.$(),

        /** @type {HTMLElement}  */
        beginBtn: `<scroller-btn role="begin"></scroller-btn>`.$(),
        /** @type {HTMLElement}  */
        endBtn: `<scroller-btn role="end"></scroller-btn>`.$(),
    }






    hasMouseDown = false;
    getComplete() {
        this.nodes.scrollbar.appendChild(this.nodes.beginBtn);
        this.nodes.scrollbar.appendChild(this.nodes.track);
        this.nodes.track.appendChild(this.nodes.scroller);
      //  this.nodes.scroller.appendChild(this.nodes.beginText);
      //  this.nodes.scroller.appendChild(this.nodes.endText);
        this.nodes.scrollbar.appendChild(this.nodes.endBtn);

        if (this.nodes.scrollbar.parentElement == null) {
            this.pagerLv.uc.ucExtends.passElement(this.nodes.scrollbar);
            this.pagerLv.Records.scrollerElement.appendChild(this.nodes.scrollbar);
        }

        let mouseMv = new mouseForMove();
        let tstamp = this.nodes.track.stamp();
        /*this.nodes.track.addEventListener("mousedown", (e) => {
            if (e.target.stamp() === tstamp) {
                let hs = e[this.nameList.offsetPoint] - Math.floor(this.scrollSize / 2);
                this.doContentScrollAt(hs);
                mouseMv.doMouseDown(e);
            }
        });*/

        mouseMv.bind(this.nodes.scroller, {
            onDown: (evt, pt) => {
                //pt[this.nameList.point] -= this.scrollTop;
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
        });
    }
    isfilling = false;
    doContentScrollAt(scrollval) {
        
        this.pagerLv.Records.scrollerElement.scrollLeft = scrollval;
        this.scrollTop = scrollval;
        return;
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
module.exports = { simpleScroll }