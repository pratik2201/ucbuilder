//import { namingConversion } from "ucbuilder/global/listUI/pager/enumAndMore";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { pagerLV } from "ucbuilder/global/listUI/pagerLV";
import { CommonEvent } from "ucbuilder/global/commonEvent";
import { getConvertedNames, namingConversion,NamingConversion } from "ucbuilder/global/resizer/namingConversion";
import { ScrollerType } from "ucbuilder/global/listUI/pager/enumAndMore";

export class simpleScroll {
    nameList: NamingConversion = Object.assign({}, namingConversion);
    elementNode: any = {
        sizer: `<sizer style="position: absolute; width: 100%; height: 100%; "></sizer>`,
    }
    dir: ScrollerType;

    main: pagerLV;
    scrollbarElement: HTMLElement;

    constructor(dir: ScrollerType) {
        this.dir = dir;
        this.nameList = getConvertedNames(dir == 'Horizontal' ? 'grid-template-columns' : 'grid-template-rows');
    }

    get pagerLv(): pagerLV { return this.main; }

    init(main: pagerLV, scrollbarElement: HTMLElement) {
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

    Event = {
        onScroll: new CommonEvent<(evt: Event) => void>()
    }
}