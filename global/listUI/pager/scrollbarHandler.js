"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrollbarHandler = void 0;
const shapes_1 = require("ucbuilder/global/drawing/shapes");
const pagerScroll_1 = require("ucbuilder/global/listUI/pager/scrollNodes/pagerScroll");
class scrollbarHandler {
    constructor() {
        this.scrollBox = {
            vScrollbar: new pagerScroll_1.pagerScroll('Vertical'),
            init: () => {
                let sbox = this.scrollBox;
                sbox.vScrollbar.getComplete(this);
            },
            onClearList: () => {
                //  this.main.Records.lstVWEle.append(this.scrollBox.scrollbar);
            }
        };
        this.mutate = undefined;
        this.viewSize = new shapes_1.Size();
    }
    get vRefresh() { return this.scrollBox.vScrollbar.refresh; }
    init(main) {
        this.main = main;
        this.main.Events.onListUISizeChanged.on((rect) => {
            this.viewSize.setBy.HTMLEle(this.main.Records.scrollerElement);
            let ppr = (this.viewSize.height / this.main.nodes.itemSize.height);
            if (ppr == Infinity)
                return;
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
exports.scrollbarHandler = scrollbarHandler;
