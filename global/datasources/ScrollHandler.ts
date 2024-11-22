import { numOpt } from "ucbuilder/build/common";
import { SourceProperties } from "ucbuilder/global/datasources/PropertiesHandler";
import { SourceManage } from "ucbuilder/global/datasources/SourceManage";
import { NodeHandler } from "ucbuilder/global/datasources/NodeHandler";

export class SourceScrollHandler<K = any> {
    source: SourceManage<K>;
    config: SourceProperties<K>;
    nodes: NodeHandler<K>;
    hasInited = false;
    constructor() { }
    init(src: SourceManage<K>) {
        this.source = src;
        this.config = src.info;
        this.nodes = src.nodes;
    }
    sizerElement: HTMLElement = '<sizer></sizer>'.$();
    vScrollElement: HTMLElement;
    setup(vScrollbarElement: HTMLElement) {
        let cfg = this.config;
        this.vScrollElement = vScrollbarElement;
        this.vScrollElement.appendChild(this.sizerElement);
        this.fireScrollEvent = true;
        this.vScrollElement.addEventListener("scroll", (e: Event) => {
            if (!this.fireScrollEvent) { this.fireScrollEvent = true; return; }
            let vScroll = this.vScrollElement;

            const scrollTop = vScroll.scrollTop || document.body.scrollTop;
            const scrollHeight = vScroll.scrollHeight - vScroll.clientHeight;
            const scrollPercentage = Math.ceil((scrollTop / scrollHeight) * 100);



            //let scrollTop = Math.floor(this.main.vscrollbar1.scrollTop / this.navigatePages.config.itemSize.height);
            let tval = numOpt.gtvc(100, cfg.height - cfg.viewSize.height, scrollPercentage);
            tval = Math.floor(tval);
            // console.log(tval);
            let top = this.source.getIndex(tval);
            this.doVerticalContentScrollAt(top, false);

            //console.log([top,tval]);
            // this.doVerticalContentScrollAt(top, false);
            //let topInfo = src.getTopIndex(bottom,cfg.viewSize.height,{overflowed:false});  
            // console.log([topInfo.index,topInfo.status,tval]);

            //this.doVerticalContentScrollAt(top, false);
        });
        this.hasInited = true;
    }
    isfilling: boolean = false;
    doVerticalContentScrollAt(scrollval: number, useTimeOut: boolean = true) {
        //console.log(this.navigatePages.config.top);
        if (this.isfilling) return;
        this.isfilling = true;
        console.log(this);

        let _this = this;
        /*let element = this.main.vscrollbar1;
        if (element.scrollTop + element.offsetHeight >= element.scrollHeight - 1) { // is bottom reached
          scrollval = this.main.source.length - this.navigatePages.config.perPageRecord;
        }*/
        if (useTimeOut) setTimeout(doscroll);
        else doscroll();
        function doscroll() {
            let config = _this.config;
            config.top = Math.floor(scrollval);
            _this.nodes.fill();
            _this.isfilling = false;

            _this.source.Events.onChangeHiddenCount.fire([config.topHiddenRowCount, config.bottomHiddenRowCount]);
        }
    }
    fireScrollEvent = true;
    refreshScrollbarSilantly(): void {
        let src = this.source;
        
        let config = this.config;
        if (!this.hasInited || src.length == 0) {
            src.Events.onChangeHiddenCount.fire([config.topHiddenRowCount, config.bottomHiddenRowCount]);
            return;
        }
        this.fireScrollEvent = false;

        let vScroll = this.vScrollElement;
        let top = src.getRow(config.top);
        let rw = top.runningHeight - top.height;
        vScroll.scrollTo(0, rw);

        src.Events.onChangeHiddenCount.fire([config.topHiddenRowCount, config.bottomHiddenRowCount]);
    }
    refreshScrollSize() {
        if (!this.hasInited) return;
        this.sizerElement.style['height'] = this.config.height + 'px';
        //this.scrollSubElements.horizontalSizerHT.style['width'] = this.main.navigate.config.itemsTotalSize.width + 'px';
    }
}