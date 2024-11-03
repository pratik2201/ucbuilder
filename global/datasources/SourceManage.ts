import { uniqOpt } from "ucbuilder/build/common";
import { CommonEvent } from "ucbuilder/global/commonEvent";
export const SourceIndexElementAttr = "itmIndx" + uniqOpt.randomNo();
export enum SearchStatus {
  notFound = 0,
  equal = 1,
  startWith = 2,
  include = 3
}
export interface ListViewItemInfo {
  row: object,
  element: HTMLElement,
  index: number
}
export interface BasicSize {
  width: number,
  height: number
}
export class RowInfo<K> {
  element?: HTMLElement;
  searchStatus = SearchStatus.notFound;
  main: SourceManage<K>;
  isModified = false;
  private _isVisible = true;
  private _isVisibleDefault: boolean;
  public get isVisible() {
    return this._isVisible;
  }
  public set isVisible(value) {
    let hasValue = value != undefined;
    let hasDefaultValue = this._isVisibleDefault != undefined;
    if (hasValue) {
      if (hasDefaultValue) this._isVisible = value;
      else this._isVisibleDefault = this._isVisible = value;
    } else {
      if (hasDefaultValue) this._isVisible = this._isVisibleDefault;
    }
  }
  public get isHidden() {
    return !this._isVisible;
  }

  private _isSelectable = true;
  private _isSelectableDefault: boolean;
  public get isSelectable() {
    return this._isSelectable;
  }
  public set isSelectable(value) {
    let hasValue = value != undefined;
    let hasDefaultValue = this._isSelectableDefault != undefined;
    if (hasValue) {
      if (hasDefaultValue) this._isSelectable = value;
      else this._isSelectableDefault = this._isSelectable = value;
    } else {
      if (hasDefaultValue) this._isSelectable = this._isSelectableDefault;
    }
    if (this.element != undefined)
      this.element.style.pointerEvents = (!this._isSelectable) ? 'none' : 'all';
  }
  public get isDisabled() {
    return !this._isSelectable;
  }

  row: K;
  height = 0;
  width = 0;
  runningHeight = 0;
  index = 0;
  //filterIndex = 0;
  get getNextSelectable(): RowInfo<K> {
    let nxt = this.next;
    if (nxt == undefined) return undefined;
    if (nxt.isSelectable && nxt.isVisible) return nxt;
    else return nxt?.getNextSelectable;
  }
  get shouldIStopHere() {
    return this.isVisible /*&& this.isSelectable*/;
  }
  next: RowInfo<K>;
  prev: RowInfo<K>;
}
type IndexType = "isAtLast" | "isAtTop" | "continue" | "undefined";
class Info_<K> {
  main: SourceManage<K>;
  constructor(main: SourceManage<K>) { this.main = main; }
  length = 0;
  height = 0;
  width = 0;
  //rows: K[] = [];
  doForAll(s: {
    isModified?: boolean,
    isVisible?: boolean,
    searchStatus?: SearchStatus,
    isSelectable?: boolean
  } = {}) {
    let ar = this.main;
    if (ar.length == 0) { return; }
    let src = this.main;
    let obj: K = undefined;
    for (let i = 0, ilen = this.main.length; i < ilen; i++) {
      obj = src[i];
      let rInfo = ar.getRowByObj(obj);
      Object.assign(rInfo, s);      
    }
  }
  refresh() {
    let ar = this.main;
    let akey = SourceManage.ACCESS_KEY;
    this.length = 0;
    this.height = 0;
    this.width = 0;
    if (ar.length == 0) { return; }
    let rInfo = ar.getRow(0);
    let w = 0, h = 0, len = 0, index = 0;
    let obj: K = undefined;
    let prevRow: RowInfo<K>;
    let src = this.main;
    this.length = this.main.length;
    //debugger;
    for (let i = 0, ilen = this.length; i < ilen; i++) {
      obj = src[i];
      prevRow = rInfo;
      rInfo = obj[akey];
      h += rInfo.height;
      rInfo.index = i;
      rInfo.runningHeight = h;
      w = Math.max(w, rInfo.width);
      rInfo.prev = prevRow;
      if (i > 0) prevRow.next = rInfo;
    }
    this.height = h;
    this.width = w;
  }
}
export class SourceManage<K> extends Array<K> {
  info: Info_<K>;
  constructor() {
    super(); this.info = new Info_<K>(this);

    /*setInterval(() => {
      console.log(this.info.length);
      
    }, 2000);*/
  }
  getRow(index: number): RowInfo<K> {
    return this[index][SourceManage.ACCESS_KEY];
  }
  static getRow<K>(obj: any): RowInfo<K> {
    return obj[SourceManage.ACCESS_KEY];
  }

  getRowByObj(row: K): RowInfo<K> {
    return row[SourceManage.ACCESS_KEY];
  }
  setRow(index: number, val: RowInfo<K>) {
    let row = this[index];
    if (row) {
      let obj = row[SourceManage.ACCESS_KEY] as RowInfo<K>;
      row[SourceManage.ACCESS_KEY] = val;
    }
  }

  allElementSize: BasicSize = {
    width: 0,
    height: 0
  }
  clear() {
    this.length = 0;
    //this.rowInfo.length = 0;
    //this.update();
  }
  getBottomIndex(topIndex: number, containerHeight: number, { length = undefined, overflowed = false }: { length?: number, overflowed?: boolean }): { index: number, status: IndexType } {
    let h = 0;
    let len = length ? length : this.length;
    let i = topIndex;


    for (; i <= len - 1; i++) {
      h += this.getRow(i).height;
      if (h > containerHeight) break;
    }
    topIndex = overflowed ? i : i - 1;

    let status: IndexType = 'continue';
    if (topIndex == len - 1) status = 'isAtLast';
    else if (topIndex == -1) status = 'undefined';
    return {
      index: topIndex,//index < 0 ? len : index,
      status: status,
    }
  }
  getTopIndex(botomIndex: number, containerHeight: number, { overflowed = false }: { length?: number, overflowed?: boolean }): { index: number, status: IndexType } {
    let i = botomIndex;
    let h = 0;
    for (; i >= 0; i--) {
      h += this.getRow(i).height;
      if (h > containerHeight) { break; }
    }
    botomIndex = overflowed ? i : i + 1;
    let status: IndexType = 'continue';
    if (botomIndex == 0) status = 'isAtTop';
    else if (botomIndex == -1) status = 'undefined';
    return {
      index: botomIndex,//index < 0 ? len : index,
      status: status,
    }
  }
  getIndex(topPoint: number, length: number = undefined) {
    let len = length ? length : this.length;
    //let rows = this.rowInfo;
    let i = 0;
    let h = 0;
    for (; i <= len - 1; i++) {
      h = this.getRow(i).runningHeight;
      if (h > topPoint) break;

    }
    return topPoint == 0 ? 0 : i + 1;
  }
  loop_RowInfo(callback = (row: K, info: RowInfo<K>, index: number) => { }) {
   // console.log('loop_RowInfo...called');
    let rInfo: RowInfo<K>;
    let src = this;
    let akey = SourceManage.ACCESS_KEY;
    let obj: K = undefined;
    for (let i = 0, len = src.length; i < len; i++) {
      let obj = src[i];
      rInfo = obj[akey];
      if (rInfo == undefined) {
        rInfo = new RowInfo();
        rInfo.index = i;
        rInfo.row = obj;
        obj[akey] = rInfo;
        //this.rowInfo[i] = rInfo;
      }
      callback(src[i], rInfo, i);
    }
    this.init_all_rows();
  }
  static StickRow<K>(obj: any): RowInfo<K> {
    let akey = this.ACCESS_KEY;
    let rInfo: RowInfo<K> = obj[akey] ?? new RowInfo();
    obj[akey] = rInfo;
    rInfo.row = obj;
    return rInfo;
  }
  StickRow(obj: K): RowInfo<K> {
    let akey = SourceManage.ACCESS_KEY;
    let rInfo: RowInfo<K> = obj[akey] ?? new RowInfo();
    obj[akey] = rInfo;
    rInfo.row = obj;
    //rInfo.main = this;
    return rInfo;
  }
  private init_all_rows() {
    let rInfo: RowInfo<K>;
    let akey = SourceManage.ACCESS_KEY;
    let obj: K = undefined;
    //let prevRow: RowInfo;
    this.originalSource.length = 0;
    for (let i = 0, len = this.length; i < len; i++) {
      obj = this[i];
      this.originalSource.push(obj);
      rInfo = this.StickRow(obj);  
      rInfo.main = this;
    }
    this.info.refresh();
    //console.log(this.length);
  }

  ihaveCompletedByMySide() {
    let len = this.length;

    this.onCompleteUserSide.fire();
    this.init_all_rows();
    this.onUpdate.fire([len]);
  }
  originalSource: K[] = [];
  refillSource() {
    this.length = 0;
    this.push(...this.originalSource);
    this.info.refresh();
  }
  callToFill(...indexes) {
    let len = this.length;
    for (let i = 0; i < indexes.length; i++) {
      let row = this[indexes[i]][SourceManage.ACCESS_KEY] as RowInfo<K>;
      if (row) row.isModified = true;
    }
    this.info.refresh();
    this.onUpdate.fire([len]);
  }
  static ACCESS_KEY = uniqOpt.guid;
  onUpdate = new CommonEvent<(arrayLen: number) => void>();
  onCompleteUserSide = new CommonEvent<() => void>(); 
};
