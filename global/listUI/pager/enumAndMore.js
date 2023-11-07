const { uniqOpt, objectOpt } = require("@ucbuilder:/build/common");

module.exports = {
    /** @type {"DISPLAYED"|"OUTSIDE"|"LAST"|"FIRST"}  */
    PageNavigationResult: "DISPLAYED",
    pagerATTR: Object.freeze({
        itemIndex: "itmIndx" + uniqOpt.randomNo()
    }),
    scrollerUIElements: {
        /** @type {HTMLElement}  */
        sizer : `<sizer style="position: absolute; width: 100%; height: 100%; "></sizer>`,
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
        doCommon() {
            if (objectOpt.getClassName(this.scrollbar) == "String")
                this.scrollbar = this.scrollbar.$();

            if (objectOpt.getClassName(this.beginBtn) == "String") {
                this.beginBtn = this.beginBtn.$();
                this.scrollbar.appendChild(this.beginBtn);
            } else if (this.beginBtn.parentElement == null) this.scrollbar.appendChild(this.beginBtn);


            if (objectOpt.getClassName(this.track) == "String") {
                this.track = this.track.$();
                this.scrollbar.appendChild(this.track);
            } else if (this.track.parentElement == null) this.scrollbar.appendChild(this.track);

            if (objectOpt.getClassName(this.scroller) == "String") {
                this.scroller = this.scroller.$();
                this.track.appendChild(this.scroller);
            } else if (this.scroller.parentElement == null) this.track.appendChild(this.scroller);



            if (objectOpt.getClassName(this.endBtn) == "String") {
                this.endBtn = this.endBtn.$();
                this.scrollbar.appendChild(this.endBtn);
            } else if (this.endBtn.parentElement == null) this.scrollbar.appendChild(this.endBtn);

        },
        /**
         * @param {"pager"|"simple"} type 
         */
        initByType(type) {
            this.doCommon();
            switch (type) {
                case 'pager':
                    if (objectOpt.getClassName(this.beginText) == "String") {
                        this.beginText = this.beginText.$();
                        this.scroller.appendChild(this.beginText);
                    } else if (this.beginText.parentElement == null) this.scroller.appendChild(this.beginText);

                    if (objectOpt.getClassName(this.endText) == "String") {
                        this.endText = this.endText.$();
                        this.scroller.appendChild(this.endText);
                    } else if (this.endText.parentElement == null) this.scroller.appendChild(this.endText);

                    break;
            }
        }
    },
    namingConversion: {
        offsetPoint: "offsetY",
        offsetSize: "offsetHeight",
        scrollPosition: "scrollTop",
        point: "y",
        position: "top",
        size: "height",
        initByType(dir) {
            switch (dir) {
                case 'h':
                    this.offsetPoint = "offsetX";
                    this.offsetSize = "offsetWidth";
                    this.scrollPosition = "scrollLeft";
                    this.point = "x";
                    this.position = "left";
                    this.size = "width";
                    break;
                case 'v':
                    this.offsetPoint = "offsetY";
                    this.offsetSize = "offsetHeight";
                    this.scrollPosition = "scrollTop";
                    this.point = "y";
                    this.position = "top";
                    this.size = "height";
                    break;
            }
        }
    }
}