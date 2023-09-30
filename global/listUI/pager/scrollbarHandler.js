const { pagerLV } = require("@ucbuilder:/global/listUI/pagerLV");
const { Size } = require("@ucbuilder:/global/drawing/shapes");
const { pagerScroll } = require("@ucbuilder:/global/listUI/pager/scrollNodes/pagerScroll");
const { simpleScroll } = require("@ucbuilder:/global/listUI/pager/scrollNodes/simpleScroll");


class scrollbarHandler {
    constructor() { }
    scrollBox = {
        /** @type {simpleScroll}  */
        hScrollbar: new simpleScroll('h'),
        /** @type {pagerScroll}  */
        vScrollbar: new pagerScroll('v'),

        init: () => {
            let sbox = this.scrollBox;
            sbox.vScrollbar.getComplete(this);
            sbox.hScrollbar.getComplete(this);
        },
        onClearList: () => {
            //  this.main.Records.lstVWEle.append(this.scrollBox.scrollbar);
        }
    }
    //mainlength = 0;
    /** @type {MutationObserver}  */
    mutate = undefined;
    get vRefresh() { return this.scrollBox.vScrollbar.refresh; }

    viewSize = new Size();
    /** @param {pagerLV} main */
    init(main) {
        this.main = main;
        this.main.Events.onListUISizeChanged.on((rect) => {
            this.viewSize.setBy.HTMLEle(this.main.Records.scrollerElement)
            let ppr = (this.viewSize.height / this.main.nodes.itemSize.height);
            this.main.pageInfo.extended.perPageRecord = Math.floor(ppr);
            this.main.nodes.fill();
        });
        this.scrollBox.init();
        this.mutate = new MutationObserver((e) => {
            this.vRefresh.scrollPosition();
        });
        this.mutate.observe(this.main.Records.lstVWEle, { childList: true });

       
    }
}
module.exports = { scrollbarHandler };