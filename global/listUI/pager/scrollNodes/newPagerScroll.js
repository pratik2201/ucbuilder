"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPagerScroll = void 0;
const keyboard_1 = require("ucbuilder/global/hardware/keyboard");
const namingConversion_1 = require("ucbuilder/global/resizer/namingConversion");
class newPagerScroll {
    constructor(dir) {
        this.nameList = Object.assign({}, namingConversion_1.namingConversion);
        this.elementNode = {
            sizer: `<sizer style="position: absolute; width: 100%; height: 100%; "></sizer>`.$(),
            beginText: `<scroller-text role="begin"></scroller-text>`.$(),
            endText: `<scroller-text role="end"></scroller-text>`.$(),
        };
        this.nameList = (0, namingConversion_1.getConvertedNames)(dir == 'Horizontal' ? 'grid-template-columns' : 'grid-template-rows');
        this.dir = dir;
    }
    get pagerLv() { return this.main; }
    get pageLvExtend() { return this.pagerLv.pageInfo.extended; }
    init(main, scrollbarElement) {
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
        this.pagerLv.Events.onSourceUpdate.on((srcLen) => {
            this.itemHeight = this.pagerLv.nodes.itemSize.height;
            this.sourceLength = srcLen;
            let th = (this.itemHeight * srcLen);
            if (th == Infinity || th == null || th == undefined)
                return;
            _szr.style[_size_text] = th + 'px';
        });
        this.fireScrollEvent = true;
        this.scrollbarElement.addEventListener("scroll", (e) => {
            if (!this.fireScrollEvent) {
                this.fireScrollEvent = true;
                return;
            }
            this.scrollTop = Math.floor(this.scrollbarElement.scrollTop / this.itemHeight);
            this.doContentScrollAt(this.scrollTop, false);
        });
        this.pagerLv.Records.lstVWEle.addEventListener("wheel", (e) => {
            if (e.deltaY > 0) {
                this.navigatePages.pageTo.downSide.Go(e);
            }
            else {
                this.navigatePages.pageTo.upSide.Go(e);
            }
            this.refreshScrollbarSilantly();
        });
        let hasCompleteKeyDownEvent = true;
        this.pagerLv.Events.onkeydown = (e) => {
            if (!hasCompleteKeyDownEvent)
                return;
            hasCompleteKeyDownEvent = false;
            setTimeout(() => {
                this.doKeyEvent(e);
                hasCompleteKeyDownEvent = true;
            }, 1);
        };
    }
    get navigatePages() { return this.pagerLv.navigatePages; }
    get nodes() { return this.pagerLv.nodes; }
    doKeyEvent(e) {
        switch (e.keyCode) {
            case keyboard_1.keyBoard.keys.up: // up key
                this.navigatePages.moveTo.prevSide.Go(e);
                break;
            case keyboard_1.keyBoard.keys.down: // down key
                this.navigatePages.moveTo.nextSide.Go(e);
                break;
            case keyboard_1.keyBoard.keys.pageUp: // page up key
                this.navigatePages.pageTo.upSide.Go(e);
                break;
            case keyboard_1.keyBoard.keys.pageDown: // page down key
                this.navigatePages.pageTo.downSide.Go(e);
                break;
            case keyboard_1.keyBoard.keys.end: // end key
                this.currentIndex = this.length - 1;
                this.nodes.callToFill();
                this.nodes.onRendar();
                break;
            case keyboard_1.keyBoard.keys.home: // home key
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
    doContentScrollAt(scrollval, useTimeOut = true) {
        if (this.isfilling)
            return;
        this.isfilling = true;
        let _this = this;
        let element = this.scrollbarElement;
        if (element.scrollTop + element.offsetHeight >= element.scrollHeight) { // is bottom reached
            scrollval = this.sourceLength - this.pagerLv.pageInfo.extended.perPageRecord;
        }
        if (useTimeOut)
            setTimeout(doscroll);
        else
            doscroll();
        function doscroll() {
            _this.pagerLv.pageInfo.top = Math.floor(scrollval);
            _this.pagerLv.nodes.fill();
            _this.scrollTop = scrollval;
            _this.isfilling = false;
            _this.Events.onChangeHiddenCount.fire([_this.pageLvExtend.topHiddenRowCount, _this.pageLvExtend.bottomHiddenRowCount]);
        }
    }
}
exports.newPagerScroll = newPagerScroll;
