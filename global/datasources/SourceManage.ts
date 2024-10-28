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
export class RowInfo {
  element?: HTMLElement;
  searchStatus = SearchStatus.notFound;
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
     if(this.element!=undefined)
    this.element.style.pointerEvents = (!this._isSelectable) ? 'none' : 'all';
  }
  row: any;
  height = 0;
  width = 0;
  runningHeight = 0;
  index = 0;
  filterIndex = 0;
  get getNextSelectable(): RowInfo {
    let nxt = this.next;
    if (nxt == undefined) return undefined;
    if (nxt.isSelectable) return nxt;
    else return nxt?.getNextSelectable;
  }
  get shouldIStopHere() {
    return this.isVisible /*&& this.isSelectable*/;
  }
  next: RowInfo;
  prev: RowInfo;
}
type IndexType = "isAtLast" | "isAtTop" | "continue" | "undefined";
class Info_<K> {
  main: SourceManage<K>;
  constructor(main: SourceManage<K>) { this.main = main; }
  length = 0;
  height = 0;
  width = 0;
  rows: K[] = [];
  doForAll(s: {
    isModified?: boolean,
    isVisible?: boolean,
    searchStatus?: SearchStatus,
    isSelectable?: boolean
  } = {}) {
    let ar = this.main;
    if (ar.length == 0) { return; }
    let rInfo = ar.getRowByObj(ar[0]);
    while (rInfo != undefined) {
      Object.assign(rInfo, s);
      rInfo = rInfo.next;
    }
  }
  refresh() {
    let ar = this.main;
    this.rows.length = 0;
    this.length = 0;
    this.height = 0;
    this.width = 0;
    if (ar.length == 0) { return; }
    let rInfo = ar.getRow(0);
    let w = 0, h = 0, len = 0,index = 0;

    while (rInfo != undefined) {
      if (rInfo.shouldIStopHere) {
        len++;
        h += rInfo.height;
        rInfo.filterIndex = index++;
        rInfo.runningHeight = h;
        w = Math.max(w, rInfo.width);
        this.rows.push(rInfo.row);
      }
      rInfo = rInfo.next;
    }
    this.length = len;
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
  getRow(index: number): RowInfo {
    if (!this[index]) debugger;
    else return this[index][SourceManage.ACCESS_KEY];
  }

  getRowByObj(row: K): RowInfo {
    return row[SourceManage.ACCESS_KEY];
  }
  setRow(index: number, val: RowInfo) {
    let row = this[index];
    if (row) {
      let obj = row[SourceManage.ACCESS_KEY] as RowInfo;
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
  loop_RowInfo(callback = (row: K, info: RowInfo, index: number) => { }) {
    console.log('loop_RowInfo...called');
    let rInfo: RowInfo;
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
    this.onUpdateRowInfo.fire();
  }
  private init_all_rows() {
    let rInfo: RowInfo;
    let akey = SourceManage.ACCESS_KEY;
    let obj: K = undefined;
    let prevRow: RowInfo;
    this.originalSource.length = 0;
    for (let i = 0, len = this.length; i < len; i++) {
      obj = this[i];
      this.originalSource.push(obj);
      prevRow = rInfo;
      rInfo = obj[akey] ?? new RowInfo();
      obj[akey] = rInfo;
      rInfo.index = i;
      rInfo.row = obj;
      rInfo.prev = prevRow;
      if (i == 14 || i == 24 || i == 35 || i == 29) {
        rInfo.isSelectable = false;
      }
      if (i > 0) prevRow.next = rInfo;
      rInfo.filterIndex = i;
      rInfo.element?.data(SourceIndexElementAttr, i);
    }
    this.info.refresh();
  }
  /*private measure_all_size() {
    let w: number = 0, h: number = 0;
    let rInfo: RowInfo; let akey = SourceManage.ACCESS_KEY;
    for (let i = 0, len = this.length; i < len; i++) {
      let obj = this[i];
      rInfo = obj[akey];
      h += rInfo.height;
      w = Math.max(w, rInfo.width);
      rInfo.runningHeight = h;
    }
    this.allElementSize = {
      width: w,
      height: h
    };
  }*/
  ihaveCompletedByMySide() {
    let len = this.length;

    this.init_all_rows();
    this.onCompleteUserSide.fire([len]);
    this.onUpdate.fire([len]);
  }
  originalSource: K[] = []
  callToFill(...indexes) {
    let len = this.length;
    for (let i = 0; i < indexes.length; i++) {
      let row = this[indexes[i]][SourceManage.ACCESS_KEY] as RowInfo;
      if (row) row.isModified = true;
    }
    this.info.refresh();
    this.onUpdate.fire([len]);
  }
  static ACCESS_KEY = uniqOpt.guid;
  onCompleteUserSide = new CommonEvent<(arrayLen: number) => void>();
  onUpdate = new CommonEvent<(arrayLen: number) => void>();
  onUpdateRowInfo = new CommonEvent<() => void>();
};
