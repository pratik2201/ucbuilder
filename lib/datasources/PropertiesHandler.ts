import { SourceManage, SearchStatus, RowInfo } from "ucbuilder/lib/datasources/SourceManage";
import { Size } from "ucbuilder/global/drawing/shapes";
import { TemplateNode } from "ucbuilder/Template";
interface PosNode {
  topIndex: number, append: number[], prepend: number[], remove: number[],
}
export class SourceProperties<K = any> {
  main: SourceManage<K>;
  constructor() { }
  init(main: SourceManage<K>) {
    this.main = main;
  }
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
    if (!cItem.hasElementSet) this.main.nodes.generate(value);
    cItem.element.setAttribute('aria-current', 'true');
  }
  infiniteHeight = false;
  get bottomIndex() {
    let src = this.main;
    let vh = this.viewSize.height;
    if (this.infiniteHeight) return src.length - 1;
    else if (vh == 0) {
      return this.top; 
    }
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
    for (let i = 0; i < _remove.length; i++) {
      let r = src.getRow(_remove[i]);
      r.isConnected = false;
      r.element.remove();//.style.display = 'none';
    }
    
    src.ArrangingContents = true;
    let _add = whatsNext.append;
    for (let i = 0; i < _add.length; i++) nodes.generate(_add[i], true);
    
    src.ArrangingContents = true;
    let _prepend = whatsNext.prepend;
    for (let i = 0; i < _prepend.length; i++) nodes.generate(_prepend[i],false);
    this.top = whatsNext.topIndex;
    this.main.Events.onChangeHiddenCount.fire([this.topHiddenRowCount, this.bottomHiddenRowCount]);
    
    src.ArrangingContents = false;
  }
  getPos(cIndex = this.currentIndex): PosNode {
    let top = this.top;
    let rtrn: PosNode = { topIndex: top, append: [], prepend: [], remove: [], }
    let src = this.main;
    let viewHeight = this.viewSize.height;
    if (cIndex < 0 || cIndex >= src.info.length || viewHeight==0) return rtrn;
    let curBottomIndex = this.bottomIndex;
    let bottom = curBottomIndex;
    // let cIndex = this.currentIndex;

    let freespace = 0;
    if (cIndex < top) {
      top = cIndex;
      let bottomObj = src.getBottomIndex(top, viewHeight, { overflowed: false });
      bottom = bottomObj.index;
      freespace = viewHeight - bottomObj.size;
      if (freespace > 0)
        top = src.getTopIndex(top - 1, freespace, { overflowed: false }).index;
      for (let i = this.top - 1; i >= top; i--)rtrn.prepend.push(i); // prepend element
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
        rtrn.append.push(i); // append element
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
  setPos(index = this.currentIndex) {
    this.applyPos(this.getPos());
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
