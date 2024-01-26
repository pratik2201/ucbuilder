"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleScroll = void 0;
const commonEvent_1 = require("ucbuilder/global/commonEvent");
const namingConversion_1 = require("ucbuilder/global/resizer/namingConversion");
class simpleScroll {
    constructor(dir) {
        this.nameList = Object.assign({}, namingConversion_1.namingConversion);
        this.elementNode = {
            sizer: `<sizer style="position: absolute; width: 100%; height: 100%; "></sizer>`,
        };
        this.Event = {
            onScroll: new commonEvent_1.CommonEvent()
        };
        this.dir = dir;
        this.nameList = (0, namingConversion_1.getConvertedNames)(dir == 'Horizontal' ? 'grid-template-columns' : 'grid-template-rows');
    }
    get pagerLv() { return this.main; }
    init(main, scrollbarElement) {
        this.main = main;
        this.scrollbarElement = scrollbarElement;
        this.elementNode.sizer = this.elementNode.sizer.$();
        this.scrollbarElement.appendChild(this.elementNode.sizer);
        let _szr = this.elementNode.sizer;
        let _size_text = this.nameList.size;
        let _offsetsize_text = this.nameList.offsetSize;
        switch (this.dir) {
            case 'Horizontal':
                Object.assign(this.scrollbarElement.style, {
                    "width": "100%",
                    "overflow-x": "auto",
                });
                break;
            case 'Vertical':
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
            this.Event.onScroll.fire([e]);
            this.pagerLv.Records.scrollerElement[_scrollposition_text] = this.scrollbarElement[_scrollposition_text];
        });
    }
}
exports.simpleScroll = simpleScroll;
