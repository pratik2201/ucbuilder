const { uniqOpt } = require("@ucbuilder:/build/common");

module.exports = {
    /** @type {"DISPLAYED"|"OUTSIDE"|"LAST"|"FIRST"}  */
    PageNavigationResult: "DISPLAYED",
    pagerATTR: Object.freeze({
        itemIndex: "itmIndx" + uniqOpt.randomNo()
    }),
    scrollerUIElements: {
        /** @type {HTMLElement}  */
        scrollbar: `<scrollbar></scrollbar>`,
        /** @type {HTMLElement}  */
        track: `<track></track>`,
        /** @type {HTMLElement}  */
        scroller: `<scroller></scroller>`,
        /** @type {HTMLElement}  */
        beginText: `<scroller-text role="begin"></scroller-text>`,
        /** @type {HTMLElement}  */
        endText: `<scroller-text role="end"></scroller-text>`,
        /** @type {HTMLElement}  */
        beginBtn: `<scroller-btn role="begin"></scroller-btn>`,
        /** @type {HTMLElement}  */
        endBtn: `<scroller-btn role="end"></scroller-btn>`,
        /**
         * @param {"pager"|"simple"} type 
         */
        initByType(type) {
            switch (type) {
                case 'pager':
                    this.scrollbar = this.scrollbar.$();
                    this.track   = this.track.$();
                    this.scroller = this.scroller.$();
                    this.beginText = this.beginText.$();
                    this.endText = this.endText.$();
                    this.beginBtn = this.beginBtn.$();
                    this.endBtn = this.endBtn.$();

                    this.scrollbar.appendChild(this.beginBtn);
                    this.scrollbar.appendChild(this.track);
                    this.track.appendChild(this.scroller);
                    this.scroller.appendChild(this.beginText);
                    this.scroller.appendChild(this.endText);
                    this.scrollbar.appendChild(this.endBtn);
                    break;
                case 'simple':
                    this.scrollbar = this.scrollbar.$();
                    this.track   = this.track.$();
                    this.scroller = this.scroller.$();
                    this.beginBtn = this.beginBtn.$();
                    this.endBtn = this.endBtn.$();

                    this.scrollbar.appendChild(this.beginBtn);
                    this.scrollbar.appendChild(this.track);
                    this.track.appendChild(this.scroller);
                    this.scrollbar.appendChild(this.endBtn);
                    break;
            }
        }
    },
    namingConversion: {
        offsetPoint: "offsetY",
        offsetSize: "offsetHeight",
        point: "y",
        position: "top",
        size: "height",
        initByType(dir) {
            switch (dir) {
                case 'h':
                    this.offsetPoint = "offsetX";
                    this.offsetSize = "offsetWidth";
                    this.point = "x";
                    this.position = "left";
                    this.size = "width";
                    break;
                case 'v':
                    this.offsetPoint = "offsetY";
                    this.offsetSize = "offsetHeight";
                    this.point = "y";
                    this.position = "top";
                    this.size = "height";
                    break;
            }
        }
    }
}