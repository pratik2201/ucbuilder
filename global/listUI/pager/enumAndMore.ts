import { uniqOpt, objectOpt } from "ucbuilder/build/common";
import { CommonEvent } from "ucbuilder/global/commonEvent";
export type PageType = "pager" | "simple";
export type ScrollerType = "Horizontal" | "Vertical";
export interface ScrollerUIElements {
  sizer: HTMLElement;
  scrollbar: HTMLElement;
  track: HTMLElement;
  scroller: HTMLElement;
  beginText: HTMLElement;
  endText: HTMLElement;
  beginBtn: HTMLElement;
  endBtn: HTMLElement;
  doCommon?(): void;
  initByType?(type: PageType): void;
}
export const scrollerUIElements: ScrollerUIElements = {
  sizer: `<sizer style="position: absolute; width: 100%; height: 100%; "></sizer>`.$(),
  scrollbar: `<scrollbar></scrollbar>`.$(),
  track: `<track></track>`.$(),
  scroller: `<scroller></scroller>`.$(),
  beginText: `<scroller-text role="begin"></scroller-text>`.$(),
  endText: `<scroller-text role="end"></scroller-text>`.$(),
  beginBtn: `<scroller-btn role="begin"></scroller-btn>`.$(),
  endBtn: `<scroller-btn role="end"></scroller-btn>`.$(),

  doCommon() {
    let _this = scrollerUIElements;
    if (objectOpt.getClassName(_this.scrollbar) == "String")
      _this.scrollbar = _this.scrollbar.$();

    if (objectOpt.getClassName(_this.beginBtn) == "String") {
      _this.beginBtn = _this.beginBtn.$();
      _this.scrollbar.appendChild(_this.beginBtn);
    } else if (_this.beginBtn.parentElement == null) _this.scrollbar.appendChild(_this.beginBtn);


    if (objectOpt.getClassName(_this.track) == "String") {
      _this.track = _this.track.$();
      _this.scrollbar.appendChild(_this.track);
    } else if (_this.track.parentElement == null) _this.scrollbar.appendChild(_this.track);

    if (objectOpt.getClassName(_this.scroller) == "String") {
      _this.scroller = _this.scroller.$();
      _this.track.appendChild(_this.scroller);
    } else if (_this.scroller.parentElement == null) _this.track.appendChild(_this.scroller);



    if (objectOpt.getClassName(_this.endBtn) == "String") {
      _this.endBtn = _this.endBtn.$();
      _this.scrollbar.appendChild(_this.endBtn);
    } else if (_this.endBtn.parentElement == null) _this.scrollbar.appendChild(_this.endBtn);

  },
  initByType(type: PageType) {
    let _this = scrollerUIElements;
    _this.doCommon();
    switch (type) {
      case 'pager':
        if (objectOpt.getClassName(_this.beginText) == "String") {
          _this.beginText = _this.beginText.$();
          _this.scroller.appendChild(_this.beginText);
        } else if (_this.beginText.parentElement == null) _this.scroller.appendChild(_this.beginText);

        if (objectOpt.getClassName(_this.endText) == "String") {
          _this.endText = _this.endText.$();
          _this.scroller.appendChild(_this.endText);
        } else if (_this.endText.parentElement == null) _this.scroller.appendChild(_this.endText);

        break;
    }
  }
};
export type PageNavigationResult = "DISPLAYED" | "OUTSIDE" | "LAST" | "FIRST";

export const pagerATTR = Object.freeze({
  itemIndex: "itmIndx" + uniqOpt.randomNo()
})

export class SourceManage {
  _rows: any[] = [];
  get rows(): any[] {
    return this._rows;
  }
  set rows(value: any[]) {
    this._rows.length = 0;
    this._rows.push(...value);
    //console.log(this._rows.length+":"+value.length);
    
    this.update();
  }
  update() {
    this.onUpdate.fire([this._rows.length]);
  }
  onUpdate = new CommonEvent<(arrayLen: number) => void>();
};
