const { namingConversion } = require("@ucbuilder:/global/listUI/pager/enumAndMore");
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
    

    get pagerLv() { return this.main; }

    /**
     * @param {pagerLV} main
     * @param {HTMLElement} scrollbarElement
     */
    init(main, scrollbarElement) {
        this.main = main;
        this.scrollbarElement = scrollbarElement;
        this.elementNode.sizer = this.elementNode.sizer.$();
        this.scrollbarElement.appendChild(this.elementNode.sizer);
        let _szr = this.elementNode.sizer;
        let _size_text = this.nameList.size;
        let _offsetsize_text = this.nameList.offsetSize;
        switch (this.dir) {
            case 'h':
                Object.assign(this.scrollbarElement.style, {
                    "width": "100%",
                    "overflow-x": "auto",
                });
                break;
            case 'v':
                Object.assign(this.scrollbarElement.style, {
                    "height": "100%",
                    "overflow-y": "auto",
                });
                break;
        }
        new ResizeObserver((e, obs) => {
            _szr.style[_size_text] = this.pagerLv.Records.lstVWEle[_offsetsize_text] + "px";
        }).observe(this.pagerLv.Records.lstVWEle, { box: "border-box" });

        let _scrollposition_text = this.nameList.scrollPosition;
        this.scrollbarElement.addEventListener("scroll", (e) => {
            this.Event.onScroll.fire(e);
            this.pagerLv.Records.scrollerElement[_scrollposition_text] = this.scrollbarElement[_scrollposition_text];
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