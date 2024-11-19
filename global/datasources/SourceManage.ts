import { uniqOpt } from "ucbuilder/build/common";
import { CommonEvent } from "ucbuilder/global/commonEvent";
import { TemplateNode } from "ucbuilder/Template";
import { ResultAnalyser, SearchableItemNode } from "ucbuilder/global/datasources/ResultAnalyser";
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
type RowType = 0 | 1 | 2;
export class RowInfo<K> {
  element?: HTMLElement;
  searchStatus = SearchStatus.notFound;
  main: SourceManage<K>;
  template: TemplateNode;
  isModified = false;
  //isCommandRow = false;
  //isSourceRow = true;
  rowType: RowType = 0;
  get isOnlySourceRow() { return this.rowType == 0; }
  get isOnlyCommandRow() { return this.rowType == 1; }
  get isBothTypeRow() { return this.rowType == 2; }
  viewIndex = 0;
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
type IndexType = "isAtLast" | "isAtTop" | "continue" | "TopOverflowed" | "BottomOverflowed" | "undefined";
class Info_<K> {
  main: SourceManage<K>;
  constructor(main: SourceManage<K>) { this.main = main; }
  length = 0;
  height = 0;
  width = 0;
  EditorMode = false;
  defaultIndex = 0;
  //rows: K[] = [];
  doForAll(s: {
    isModified?: boolean,
    isVisible?: boolean,
    searchStatus?: SearchStatus,
    isSelectable?: boolean
  } = {}) {
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
      rInfo.element?.setAttribute('x-tabindex', '' + i);
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
  searchables: string[] = [];
  analyser: ResultAnalyser<K>;
  constructor() {
    super(); this.info = new Info_<K>(this);
    this.analyser = new ResultAnalyser(this);
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
      //let obj = row[SourceManage.ACCESS_KEY] as RowInfo<K>;
      row[SourceManage.ACCESS_KEY] = val;
    }
  }

  allElementSize: BasicSize = {
    width: 0,
    height: 0
  }

  getBottomIndex(topIndex: number, containerHeight: number, { length = undefined, overflowed = false }: { length?: number, overflowed?: boolean }): { index: number, size: number, status: IndexType } {
    if (containerHeight == 0) return { index: topIndex, size: 0, status: 'undefined' };
    let len = length ? length : this.length;
    let i = topIndex;
    let h = 0;
    let size = 0;
    let rInfo: RowInfo<K>;
    for (; i <= len - 1; /*  i++; */) {
      //rInfo = this.getRow(i);
      //console.log([i,rInfo.element,rInfo.height,rInfo.runningHeight]);      
      h = this.getRow(i).height;
      size += h;
      if (size > containerHeight) break;
      i++;
    }
    size = overflowed ? size : size - h;
    topIndex = overflowed ? i : i - 1;

    let status: IndexType = 'continue';
    if (topIndex == len - 1) status = 'isAtLast';
    else if (topIndex == -1) { topIndex = 0; status = 'undefined'; }

    return {
      index: topIndex,//index < 0 ? len : index,
      size: size,
      status: status,
    }
  }
  getTopIndex(botomIndex: number, containerHeight: number, { overflowed = false }: { length?: number, overflowed?: boolean }): { index: number, size: number, status: IndexType } {
    let i = botomIndex;
    if (containerHeight == 0) return { index: botomIndex, size: 0, status: 'undefined' };
    let h = 0;
    let size = 0;
    for (; i >= 0; i--) {
      h = this.getRow(i).height;
      size += h;
      if (size > containerHeight) { break; }
    }
    size = overflowed ? size : size - h;
    botomIndex = overflowed ? i : i + 1;
    let status: IndexType = 'continue';
    if (botomIndex == 0) status = 'isAtTop';
    else if (botomIndex == -1) status = 'undefined';
    return {
      size: size,
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
  loop_RowInfo(src: K[], callback = (row: K, info: RowInfo<K>, index: number) => { }, indexCounter = 0) {
    // console.log('loop_RowInfo...called');
    let rInfo: RowInfo<K>;
    // let src = this;
    let akey = SourceManage.ACCESS_KEY;
    let obj: K = undefined;
    for (let i = 0, len = src.length; i < len; i++) {
      let obj = src[i];
      rInfo = obj[akey];
      if (rInfo == undefined) {
        rInfo = new RowInfo();
        rInfo.row = obj;
        obj[akey] = rInfo;
        //this.rowInfo[i] = rInfo;
      }
      rInfo.index = indexCounter++;
      callback(src[i], rInfo, i);
    }
    //this.init_all_rows();
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
  /*private init_all_rows(originalSrc:K[]) {
    let rInfo: RowInfo<K>;
    let akey = SourceManage.ACCESS_KEY;
    let obj: K = undefined;
    //let prevRow: RowInfo;
    this.originalSource.length = 0;
    for (let i = 0, len = this.length; i < len; i++) {
      obj = this[i];
      this.originalSource.push(obj);
      rInfo = this.StickRow(obj);  
      //rInfo.main = this;
    }
    this.info.refresh();
    //console.log(this.length);
  }*/
  nullValue: RowInfo<K> | any;
  ihaveCompletedByMySide() {
    let len = this.length;
    this.originalSource.length = 0;
    this.originalSource.push(...this);
    let sample = this.analyser.FullSample;
    // this.nullRow = sample[this.info.defaultIndex];
    //console.log([this.nullRow,this.info.defaultIndex,sample]);

    this.length = 0;
    this.push(...sample);
    this.onCompleteUserSide.fire([sample, 0]);
    for (let i = 0; i < sample.length; i++)this.StickRow(sample[i]);

    this.info.refresh();

    this.onUpdate.fire([len]);
  }
  pushNew(...items: K[]): number {
    this.originalSource.push(...items);
    let olen = this.length;
    let len = this.push(...items);
    for (let i = 0, ilen = items.length; i < ilen; i++)   this.StickRow(items[i]);
    this.onCompleteUserSide.fire([items, olen]);
    this.info.refresh();
    return len;
  }
  originalSource: K[] = [];
  /*clearFilter(sort: boolean = true) {
    let src = this.source;
    src.info.doForAll({
        isModified: true,
        isVisible: undefined,
        searchStatus: SearchStatus.notFound
    });
    src.clear();
    src.push(...src.originalSource);
    if (sort)
        this.sortSource();
    src.callToFill();
    this.lasttext = '';
    this.filterInitlized = false;
}*/
  reset(fireUpdateEvent = true) {
    this.length = 0;
    let anlyse = this.analyser;
    this.push(...this.originalSource);
    let _SortEvent = anlyse.Event.onSortCall;
    this.sort((a, b) => { return _SortEvent(a, b); });
    let _searchables = this.searchables;
    for (let i = 0, len = this.length; i < len; i++) {
      let row = this[i];
      let rInfo = SourceManage.getRow(this[i]);
      for (let j = 0, jlen = _searchables.length; j < jlen; j++)
        (row[_searchables[j]] as SearchableItemNode).reset();
      rInfo.isModified = true;//rInfo.searchStatus != SearchStatus.notFound;
      rInfo.searchStatus = SearchStatus.notFound;
    }
    this.unshift(...anlyse.NonSourceRows);
    anlyse.lasttext = '';
    anlyse.filterInitlized = false;
    /*this.analyser.clearFilter(true);
   let s = this.originalSource;
   for (let i = 0, len = s.length; i < len; i++) {
     this.resetRow(s[i]);
   }*/
    if (fireUpdateEvent) {
      this.callToFill();
    } else this.info.refresh();
  }

  clear(clearOriginalSource: boolean = false) {
    this.length = 0;
    if (clearOriginalSource) this.originalSource.length = 0;
  }
  resetRow(rInfo: RowInfo<K>) {
    if (rInfo.rowType!=0) return;
    let _searchables = this.searchables;
    let row = rInfo.row;
    for (let i = 0, len = _searchables.length; i < len; i++) {
      const searchable = _searchables[i];
      (row[searchable] as SearchableItemNode).reset();
    }
    rInfo.isModified = true;
    /*if(!this.getRowByObj(row).isSourceRow)return;
    for (let i = 0; i < this.searchables.length; i++) {
      const searchable = this.searchables[i];
      (row[searchable] as SearchableItemNode).reset();
    }
    this.getRowByObj(row).isModified = true;*/
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
  onCompleteUserSide = new CommonEvent<(src: K[], indexCounter: number) => void>();
};
