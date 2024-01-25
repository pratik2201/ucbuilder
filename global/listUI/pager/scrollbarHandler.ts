import { pagerLV } from "ucbuilder/global/listUI/pagerLV";
import { Size } from "ucbuilder/global/drawing/shapes";
import { pagerScroll } from "ucbuilder/global/listUI/pager/scrollNodes/pagerScroll";
import { simpleScroll } from "ucbuilder/global/listUI/pager/scrollNodes/simpleScroll";

export class scrollbarHandler {
    scrollBox = {
        vScrollbar: new pagerScroll('Vertical'),

        init: () => {
            let sbox: any = this.scrollBox;
            sbox.vScrollbar.getComplete(this);
        },
        onClearList: () => {
            //  this.main.Records.lstVWEle.append(this.scrollBox.scrollbar);
        }
    }
    mutate: MutationObserver | undefined = undefined;
    get vRefresh() { return this.scrollBox.vScrollbar.refresh; }
    main: pagerLV;
    viewSize = new Size();
    init(main: pagerLV) {
        this.main = main;
        
        this.main.Events.onListUISizeChanged.on((rect: any) => {
            this.viewSize.setBy.HTMLEle(this.main.Records.scrollerElement);
            let ppr = (this.viewSize.height / this.main.nodes.itemSize.height);
            if(ppr==Infinity)return;
            
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