"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceManage = exports.pagerATTR = exports.scrollerUIElements = void 0;
const common_1 = require("ucbuilder/build/common");
const commonEvent_1 = require("ucbuilder/global/commonEvent");
exports.scrollerUIElements = {
    sizer: `<sizer style="position: absolute; width: 100%; height: 100%; "></sizer>`.$(),
    scrollbar: `<scrollbar></scrollbar>`.$(),
    track: `<track></track>`.$(),
    scroller: `<scroller></scroller>`.$(),
    beginText: `<scroller-text role="begin"></scroller-text>`.$(),
    endText: `<scroller-text role="end"></scroller-text>`.$(),
    beginBtn: `<scroller-btn role="begin"></scroller-btn>`.$(),
    endBtn: `<scroller-btn role="end"></scroller-btn>`.$(),
    doCommon() {
        let _this = exports.scrollerUIElements;
        if (common_1.objectOpt.getClassName(_this.scrollbar) == "String")
            _this.scrollbar = _this.scrollbar.$();
        if (common_1.objectOpt.getClassName(_this.beginBtn) == "String") {
            _this.beginBtn = _this.beginBtn.$();
            _this.scrollbar.appendChild(_this.beginBtn);
        }
        else if (_this.beginBtn.parentElement == null)
            _this.scrollbar.appendChild(_this.beginBtn);
        if (common_1.objectOpt.getClassName(_this.track) == "String") {
            _this.track = _this.track.$();
            _this.scrollbar.appendChild(_this.track);
        }
        else if (_this.track.parentElement == null)
            _this.scrollbar.appendChild(_this.track);
        if (common_1.objectOpt.getClassName(_this.scroller) == "String") {
            _this.scroller = _this.scroller.$();
            _this.track.appendChild(_this.scroller);
        }
        else if (_this.scroller.parentElement == null)
            _this.track.appendChild(_this.scroller);
        if (common_1.objectOpt.getClassName(_this.endBtn) == "String") {
            _this.endBtn = _this.endBtn.$();
            _this.scrollbar.appendChild(_this.endBtn);
        }
        else if (_this.endBtn.parentElement == null)
            _this.scrollbar.appendChild(_this.endBtn);
    },
    initByType(type) {
        let _this = exports.scrollerUIElements;
        _this.doCommon();
        switch (type) {
            case 'pager':
                if (common_1.objectOpt.getClassName(_this.beginText) == "String") {
                    _this.beginText = _this.beginText.$();
                    _this.scroller.appendChild(_this.beginText);
                }
                else if (_this.beginText.parentElement == null)
                    _this.scroller.appendChild(_this.beginText);
                if (common_1.objectOpt.getClassName(_this.endText) == "String") {
                    _this.endText = _this.endText.$();
                    _this.scroller.appendChild(_this.endText);
                }
                else if (_this.endText.parentElement == null)
                    _this.scroller.appendChild(_this.endText);
                break;
        }
    }
};
exports.pagerATTR = Object.freeze({
    itemIndex: "itmIndx" + common_1.uniqOpt.randomNo()
});
class SourceManage {
    constructor() {
        this.onUpdate = new commonEvent_1.CommonEvent();
    }
    get rows() {
        return this._rows;
    }
    set rows(value) {
        this._rows = value;
        this.update();
    }
    update() {
        this.onUpdate.fire([this._rows.length]);
    }
}
exports.SourceManage = SourceManage;
;
