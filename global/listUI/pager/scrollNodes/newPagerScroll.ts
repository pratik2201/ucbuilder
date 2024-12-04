
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { pagerLV } from "ucbuilder/global/listUI/pagerLV";
import { CommonEvent } from "ucbuilder/global/CommonEvent";
import { KeyboardKeys } from "ucbuilder/lib/hardware";
import { getConvertedNames, namingConversion,NamingConversion } from "ucbuilder/global/resizer/namingConversion";
import { ScrollerType } from "ucbuilder/global/listUI/pager/enumAndMore";


export class newPagerScroll {
    nameList: NamingConversion = Object.assign({},namingConversion);
    elementNode: any = {
        sizer: `<sizer style="position: absolute; width: 100%; height: 100%; "></sizer>`.$(),
        beginText: `<scroller-text role="begin"></scroller-text>`.$(),
        endText: `<scroller-text role="end"></scroller-text>`.$(),
    };
    dir: ScrollerType;

    main: pagerLV;
    scrollbarElement: HTMLElement;
    itemHeight: number;
    sourceLength: number;
    scrollTop: number;
    fireScrollEvent: boolean;
    isfilling: boolean;
    currentIndex: number;
    length: number;
    Events: {
        onChangeHiddenCount: CommonEvent<(topHiddenCount:number,bottomHiddenCount:number)=>void>;
        onkeydown: (e: KeyboardEvent) => void;
    } = {
            onChangeHiddenCount: new CommonEvent<(topHiddenCount: number, bottomHiddenCount: number) => void>(),
            onkeydown: (e: KeyboardEvent) => {}
    };

    constructor(dir: ScrollerType) {
        this.nameList= getConvertedNames(dir == 'Horizontal' ? 'grid-template-columns' : 'grid-template-rows');
        this.dir = dir;
    }

    get pagerLv() { return this.main; }
    get pageLvExtend() { return this.pagerLv.pageInfo.extended; }

    init(main: pagerLV, scrollbarElement: HTMLElement) {
        this.main = main;
        this.scrollbarElement = scrollbarElement;
        this.elementNode.sizer = this.elementNode.sizer.$();
        this.scrollbarElement.appendChild(this.elementNode.sizer);
        Object.assign(this.scrollbarElement.style, this.dir == 'Horizontal' ?
            { "width": "100%", "overflow-x": "auto", } :
            { "height": "100%", "overflow-y": "auto", });

        let _szr = this.elementNode.sizer;
        let _size_text = this.nameList.size;
        let _offsetsize_text = this.nameList.offsetSize;

        this.pagerLv.Events.onSourceUpdate.on((srcLen: number) => {
            this.itemHeight = this.pagerLv.nodes.itemSize.height;
            this.sourceLength = srcLen;
            let th = (this.itemHeight * srcLen);
            if (th == Infinity || th == null || th == undefined) return;
            _szr.style[_size_text] = th + 'px';
        });
        this.fireScrollEvent = true;
        this.scrollbarElement.addEventListener("scroll", (e: Event) => {
            if (!this.fireScrollEvent) { this.fireScrollEvent = true; return; }
            this.scrollTop = Math.floor(this.scrollbarElement.scrollTop / this.itemHeight);
            this.doContentScrollAt(this.scrollTop, false);
        });

        this.pagerLv.Records.lstVWEle.addEventListener("wheel", (e: WheelEvent) => {
            if (e.deltaY > 0) {
                this.navigatePages.pageTo.downSide.Go(e as unknown as KeyboardEvent);
            } else {
                this.navigatePages.pageTo.upSide.Go(e as unknown as KeyboardEvent);
            }
            this.refreshScrollbarSilantly();
        });
        let hasCompleteKeyDownEvent = true;
        this.pagerLv.Events.onkeydown = (e: KeyboardEvent) => {
            if (!hasCompleteKeyDownEvent) return;
            hasCompleteKeyDownEvent = false;
            setTimeout(() => {
                this.doKeyEvent(e);
                hasCompleteKeyDownEvent = true;
            }, 1);
        };
    }

    get navigatePages() { return this.pagerLv.navigatePages; }
    get nodes() { return this.pagerLv.nodes; }

    doKeyEvent(e: KeyboardEvent) {
        switch (e.keyCode) {
            case KeyboardKeys.Up: // up key
                this.navigatePages.moveTo.prevSide.Go(e);
                break;
            case KeyboardKeys.Down: // down key
                
                this.navigatePages.moveTo.nextSide.Go(e);
                break;
            case KeyboardKeys.PageUp: // page up key
                this.navigatePages.pageTo.upSide.Go(e);
                break;
            case KeyboardKeys.PageDown: // page down key
                this.navigatePages.pageTo.downSide.Go(e);
                break;
            case KeyboardKeys.End: // end key
                this.currentIndex = this.length - 1;
                this.nodes.callToFill();
                this.nodes.onRendar();
                break;
            case KeyboardKeys.Home: // home key
                this.currentIndex = 0;
                this.nodes.callToFill();
                this.nodes.onRendar();
                break;
            default: return;
        }
        this.refreshScrollbarSilantly();
    }

    refreshScrollbarSilantly() {
        this.fireScrollEvent = false;
        this.scrollbarElement.scrollTop = (this.pagerLv.pageInfo.top * this.itemHeight);
        this.Events.onChangeHiddenCount.fire([this.pageLvExtend.topHiddenRowCount, this.pageLvExtend.bottomHiddenRowCount]);
    }

    doContentScrollAt(scrollval: number, useTimeOut: boolean = true) {
        if (this.isfilling) return;
        this.isfilling = true;
        let _this = this;
        let element = this.scrollbarElement;
        if (element.scrollTop + element.offsetHeight >= element.scrollHeight) { // is bottom reached
            scrollval = this.sourceLength - this.pagerLv.pageInfo.extended.perPageRecord;
        }
        if (useTimeOut) setTimeout(doscroll);
        else doscroll();
        function doscroll() {
            _this.pagerLv.pageInfo.top = Math.floor(scrollval);
            _this.pagerLv.nodes.fill();
            _this.scrollTop = scrollval;
            _this.isfilling = false;
            _this.Events.onChangeHiddenCount.fire([_this.pageLvExtend.topHiddenRowCount, _this.pageLvExtend.bottomHiddenRowCount]);
        }
    }
}