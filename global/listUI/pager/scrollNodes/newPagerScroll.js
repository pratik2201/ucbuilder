const { namingConversion } = require("@ucbuilder:/global/listUI/pager/enumAndMore");
const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");
const { pagerLV } = require("@ucbuilder:/global/listUI/pagerLV");
const { commonEvent } = require("@ucbuilder:/global/commonEvent");
class newPagerScroll {
    nameList = newObjectOpt.copyProps(namingConversion, {});
    elementNode = {
        /** @type {HTMLElement}  */
        sizer: `<sizer style="position: absolute; width: 100%; height: 100%; "></sizer>`,
        /** @type {HTMLElement}  */
        beginText: `<scroller-text role="begin"></scroller-text>`,
        /** @type {HTMLElement}  */
        endText: `<scroller-text role="end"></scroller-text>`,
    }
    /**
     * @param {"h"|"v"} dir 
     */
    constructor(dir) {
        this.nameList.initByType(dir);
        this.dir = dir;
    }


    get pagerLv() { return this.main; }
    get pageLvExtend() { return this.pagerLv.pageInfo.extended; }

    /**
     * @param {pagerLV} main
     * @param {HTMLElement} scrollbarElement
     */
    init(main, scrollbarElement) {
        this.main = main;
        this.scrollbarElement = scrollbarElement;
        this.elementNode.sizer = this.elementNode.sizer.$();
        this.scrollbarElement.appendChild(this.elementNode.sizer);
        Object.assign(this.scrollbarElement.style, this.dir == 'h' ?
            { "width": "100%", "overflow-x": "auto", } :
            { "height": "100%", "overflow-y": "auto", });


        let _szr = this.elementNode.sizer;
        let _size_text = this.nameList.size;
        let _offsetsize_text = this.nameList.offsetSize;

        this.pagerLv.Events.onSourceUpdate.on((srcLen) => {
            this.itemHeight = this.pagerLv.nodes.itemSize.height;
            this.sourceLength = srcLen;
            let th = (this.itemHeight * srcLen);
            if (th == Infinity || th == null || th == undefined) return;
            _szr.style[_size_text] = th + 'px';
        });
        this.scrollbarElement.addEventListener("scroll", (e) => {
            this.scrollTop = Math.floor(this.scrollbarElement.scrollTop / this.itemHeight);
            this.doContentScrollAt(this.scrollTop, false);
        });
    }
    doContentScrollAt(scrollval, useTimeOut = true) {
        if (this.isfilling) return;
        this.isfilling = true;
        //this.pagerLv.Records.scrollerElement.scrollHeight
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
            _this.Events.onChangeHiddenCount.fire(_this.pageLvExtend.topHiddenRowCount, _this.pageLvExtend.bottomHiddenRowCount);
        }
    }
    Events = {
        /**
         * @type {{on:(callback = (
         *          beforeHiddenCount:number
         *          afterHiddenCount:number
         * ) =>{})} & commonEvent}
         */
         onChangeHiddenCount: new commonEvent()
    }

}
module.exports = { newPagerScroll }