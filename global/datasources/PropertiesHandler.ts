import { SourceManage, SearchStatus, RowInfo } from "ucbuilder/global/datasources/SourceManage";
import { Size } from "ucbuilder/global/drawing/shapes";
import { TemplateNode } from "ucbuilder/Template";
interface PosNode {
  topIndex: number, append: number[], prepend: number[], remove: number[],
}
export class SourceProperties<K = any> {
  main: SourceManage<K>;
  constructor(main: SourceManage<K>) { this.main = main; }
  top = 0; viewSize = new Size(0, 0);
  currentItem: RowInfo<K>;

  length = 0;
  height = 0;
  width = 0;
  EditorMode = false;
  defaultIndex = 0;
  doForAll(s: { isModified?: boolean; isVisible?: boolean; searchStatus?: SearchStatus; isSelectable?: boolean; } = {}) {
    let src = this.main;
    if (src.length == 0) { return; }
    let obj: K = undefined;
    for (let i = 0, ilen = this.main.length; i < ilen; i++) {
      obj = src[i];
      let rInfo = SourceManage.getRow(obj);
      //let before = rInfo.isVisible;
      Object.assign(rInfo, s);
      // console.log([before,rInfo.isVisible]);
    }
  }
  refresh() {
    let ar = this.main;
    let akey = SourceManage.ACCESS_KEY;
    this.length = this.height = this.width = 0;
    if (ar.length == 0) { return; }
    let rInfo = ar.getRow(0);
    let w = 0, h = 0, len = 0, index = 0;
    let obj: K = undefined;
    let prevRow: RowInfo<K>;
    let src = this.main;
    src.makeAllElementsCssDisplay();
    this.length = this.main.length;
    //debugger;
    for (let i = 0, ilen = this.length; i < ilen; i++) {
      obj = src[i];
      prevRow = rInfo;
      rInfo = obj[akey];
      h += rInfo.height;
      rInfo.index = i;
      let ele = rInfo.element;
      if (ele) {
        ele.setAttribute('x-tabindex', '' + i);
      }
      rInfo.runningHeight = h;
      w = Math.max(w, rInfo.width);
      rInfo.prev = prevRow;
      if (i > 0) prevRow.next = rInfo;
    }
    this.height = h;
    this.width = w;
  }

  get sourceLength() { return this.main.length; }
  public get currentIndex() {
    return this.currentItem?.index ?? 0;
  }
  public set currentIndex(value) {
    //let eletof = value - this.top;
    if (value < 0 || value >= this.length) return;
    let cItem = this.currentItem;
    let prevIndex = 0;
    let isPreviousUndefined = (cItem == undefined);

    if (!isPreviousUndefined) { prevIndex = cItem.index; cItem.element.setAttribute('aria-current', `false`); }
    let src = this.main;
    let rObj = src.getRow(value);
    if (!rObj.isSelectable) {
      this.currentItem = rObj;
      if (prevIndex > value) { //  IF TOP SIDE SELECTED
        this.movePrev(undefined as KeyboardEvent);
      } else {      //  IF BOTTOM SIDE SELECTED
        this.moveNext(undefined as KeyboardEvent);
      }
      if (this.currentIndex != value) return;
      else {

        //console.log(prevIndex);
        rObj = src.getRow(prevIndex);

      }
    }
    cItem = this.currentItem = rObj;
    /*if (value <= 0) {
        this.main.vscrollbar1.scrollTop =
        this.top = 0;
    } */
    cItem.element.setAttribute('aria-current', 'true');
  }
  get bottomIndex() {
    let src = this.main;
    let vh = this.viewSize.height;
    if (vh == 0) return src.length - 1;
    return src.getBottomIndex(this.top, vh, { overflowed: false }).index;
  }
  get lastSideTopIndex() {
    let src = this.main;
    return src.getTopIndex(src.length - 1, this.viewSize.height, { overflowed: false }).index;
  }
  get topHiddenRowCount() {
    return this.top;
  }
  get bottomHiddenRowCount() {
    let len = this.main.length;
    let vh = this.viewSize.height;
    if (vh == 0) return 0;
    let bIndex = this.main.getBottomIndex(this.top, vh, { length: len, overflowed: false })
    return Math.max(0, len - (bIndex.index) - 1);
    //return Math.max(0, (this.length - (this.top + this.perPageRecord)));
  }
  get isLastSideTopIndex() { return this.lastSideTopIndex == this.top; }
  applyPos(whatsNext: PosNode) {

    let nodes = this.main.nodes;
    let src = this.main;
    src.ArrangingContents = true;
    let _remove = whatsNext.remove;
    for (let i = 0; i < _remove.length; i++) src.getRow(_remove[i]).element.style.display = 'none';
    let _append = whatsNext.append;
    for (let i = 0; i < _append.length; i++) nodes.append(_append[i]);
    let _prepend = whatsNext.prepend;
    for (let i = 0; i < _prepend.length; i++) nodes.prepend(_prepend[i]);
    this.top = whatsNext.topIndex;
  }
  getPos(cIndex = this.currentIndex): PosNode {
    let top = this.top;
    let rtrn: PosNode = { topIndex: top, prepend: [], append: [], remove: [], }
    let src = this.main;
    if (cIndex < 0 || cIndex >= src.info.length) return rtrn;
    let curBottomIndex = this.bottomIndex;
    let bottom = curBottomIndex;
    // let cIndex = this.currentIndex;
    let viewHeight = this.viewSize.height;

    let freespace = 0;
    if (cIndex < top) {
      top = cIndex;
      let bottomObj = src.getBottomIndex(top, viewHeight, { overflowed: false });
      bottom = bottomObj.index;
      freespace = viewHeight - bottomObj.size;
      if (freespace > 0)
        top = src.getTopIndex(top - 1, freespace, { overflowed: false }).index;
      for (let i = this.top - 1; i >= top; i--)rtrn.prepend.push(i);
      for (let i = bottom + 1; i <= curBottomIndex; i++)rtrn.remove.push(i);
      /*for (let i = this.newTop - 1; i >= top; i--) {
        //console.log('UP ADDED...'+i);
        this.main.nodes.prepend(i)
      }
      for (let i = bottom + 1; i <= this.newBottom; i++) {
        //console.log('UP REMOVED...'+i);
        SourceManage.getRow(src[i]).element.remove();
      }*/
      // console.log([this.newTop-top, this.newBottom-bottom,prevIndex,cIndex]);
    }
    if (bottom == 0) bottom = src.getBottomIndex(top, viewHeight, { overflowed: false }).index;
    if (cIndex > bottom) {
      bottom = cIndex;
      let topObj = src.getTopIndex(bottom, viewHeight, { overflowed: false });
      top = topObj.index;
      freespace = viewHeight - topObj.size;
      if (freespace > 0)
        bottom = src.getBottomIndex(bottom + 1, freespace, { overflowed: false }).index;

      for (let i = this.top; i < top; i++)
        rtrn.remove.push(i);
      for (let i = curBottomIndex + 1; i <= bottom; i++)
        rtrn.append.push(i);
      /*for (let i = this.newTop; i < top; i++) {
        console.log('DOWN REMOVED...' + i);
        SourceManage.getRow(src[i]).element.remove();
      }
      for (let i = this.newBottom + 1; i <= bottom; i++) {
        console.log('DOWN ADDED...' + i);
        this.main.nodes.append(i)
      }
      console.log([top - this.newTop, bottom - this.newBottom, this.newTop, this.newBottom,cIndex]);*/
    }
    rtrn.topIndex = top;
    //for (let i = this.newTop; i < top; i++)
    return rtrn;
  }

  updatePos() {
    this.top = this.getPos().topIndex;
    this.main.scrollbar.refreshScrollbarSilantly();
  }

  movePrev(event: KeyboardEvent, valToCount: number = 1): void {
    let cfg = this;
    let src = this.main;
    let whatsNext = cfg.getPos(cfg.currentIndex - 1);
    if (whatsNext.topIndex == cfg.top) { cfg.currentIndex--; return; }
    cfg.applyPos(whatsNext);
    cfg.currentIndex--;
    return;
  }



  moveNext(event: KeyboardEvent, valToCount: number = 1): void {
    let cfg = this;
    let src = this.main;
    let whatsNext = cfg.getPos(cfg.currentIndex + 1);

    if (whatsNext.topIndex == cfg.top) { cfg.currentIndex++; return; }
    cfg.applyPos(whatsNext);
    cfg.currentIndex++;
    return;
  }


  pageNext = (event: KeyboardEvent): void => {
    let src = this.main;
    let cfg = src.info;
    let len = src.length;
    let bindex = cfg.bottomIndex;
    if (bindex == len - 1) return;
    //  debugger;
    let nextPageBottom = src.getBottomIndex(cfg.top, cfg.viewSize.height * 2, { length: len, overflowed: false });
    switch (nextPageBottom.status) {
      case 'continue':
        //this.callNavigate(() => {
        cfg.top = bindex + 1;
        //}, event);
        //this.callNavigate(dwnSide.Advance.outside, event);
        break;
      case 'isAtLast':
        cfg.top = src.getTopIndex(len - 1, cfg.viewSize.height, { length: len, overflowed: false }).index;
        break;
    }
    this.main.nodes.fill();
  }



  pagePrev = (event: KeyboardEvent): void => {
    let src = this.main;
    let cfg = src.info;
    if (cfg.top == 0) return;
    let previousPageTop = src.getTopIndex(cfg.top, cfg.viewSize.height, { overflowed: false });
    switch (previousPageTop.status) {
      case 'continue':
        //this.callNavigate(() => {
        cfg.top = previousPageTop.index;
        //}, event);
        break;
      case 'isAtTop':
        cfg.top = 0;
        break;
    }
    this.main.nodes.fill();
  }




}
