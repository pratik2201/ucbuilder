const { Point, Size } = require("@ucbuilder:/global/drawing/shapes");
const { numOpt } = require("@ucbuilder:/build/common");
const { mouseForMove } = require("@ucbuilder:/global/mouseForMove");
const { scrollbarHandler } = require("@ucbuilder:/global/listUI/pager/scrollbarHandler");
const { namingConversion, scrollerUIElements } = require("@ucbuilder:/global/listUI/pager/enumAndMore");
const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");
const { pagerLV } = require("@ucbuilder:/global/listUI/pagerLV");
const { commonEvent } = require("@ucbuilder:/global/commonEvent");
class simpleScroll {
    nameList = newObjectOpt.copyProps(namingConversion, {});
    elementNode = {
        /** @type {HTMLElement}  */
        sizer: `<sizer style="position: absolute; width: 100%; height: 100%; "></sizer>`,
    }
    /**
     * @param {"h"|"v"} dir 
     */
    constructor(dir) {
        this.nameList.initByType(dir);
        this.dir = dir;
    }
    get contentWidth() {
        return this.pagerLv.Records.lstVWEle.offsetWidth;
    }

    get pagerLv() { return this.main; }

    /**
     * @param {pagerLV} main
     * @param {HTMLElement} hscrollbar1
     */
    init(main, hscrollbar1) {
        this.main = main;
        this.hscrollbar1 = hscrollbar1;
        this.elementNode.sizer = this.elementNode.sizer.$();
        this.hscrollbar1.appendChild(this.elementNode.sizer);
        let _szr = this.elementNode.sizer;
        let _size_text = this.nameList.size;
        let _offsetsize_text = this.nameList.offsetSize;
        switch (this.dir) {
            case 'h':
                Object.assign(this.hscrollbar1.style, {
                    "width": "100%",
                    "overflow-x": "auto",
                });
                break;
            case 'v':
                Object.assign(this.hscrollbar1.style, {
                    "height": "100%",
                    "overflow-y": "auto",
                });
                break;
        }
        new ResizeObserver((e, obs) => {
            _szr.style[_size_text] = this.pagerLv.Records.lstVWEle[_offsetsize_text] + "px";
        }).observe(this.pagerLv.Records.lstVWEle, { box: "border-box" });

        let _scrollposition_text = this.nameList.scrollPosition;
        this.hscrollbar1.addEventListener("scroll", (e) => {
            this.Event.onScroll.fire(e);
            this.pagerLv.Records.scrollerElement[_scrollposition_text] = this.hscrollbar1[_scrollposition_text];
        });
    }

    Event = {
        /**
         * @type {{on:(callback = (
         *          e:Event
         * ) =>{})} & commonEvent}
         */

        onScroll: new commonEvent()
    }

}
module.exports = { simpleScroll }