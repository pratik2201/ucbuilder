import { uniqOpt } from "ucbuilder/build/common";
import { CommonEvent } from "ucbuilder/global/commonEvent";
import { TemplateNode } from "ucbuilder/Template";
import { ResultAnalyser, SearchableItemNode } from "ucbuilder/lib/datasources/ResultAnalyser";
import { NodeHandler } from "ucbuilder/lib/datasources/NodeHandler";
import { SourceProperties } from "ucbuilder/lib/datasources/PropertiesHandler";
import { SourceScrollHandler } from "ucbuilder/lib/datasources/ScrollHandler";
import { RowGenerator } from "ucbuilder/lib/datasources/RowGenerator";
import { RowHandler } from "ucbuilder/lib/datasources/RowHandler";
import { EditorManage } from "ucbuilder/lib/datasources/EditorManage";
export const SourceIndexElementAttr = "itmIndx" + uniqOpt.randomNo();
export enum SearchStatus {
  filterOut = -1,
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
export enum RowInfoType {
  Source = 0,
  TopSticky = 1,
  BothTypeDefault = 2,
}
type RowType = 0 | 1 | 2;
export class RowInfo<K = any> {
  element?: HTMLElement;
  hasElementSet: boolean = false;
  hasMeasurement: boolean = false;
  private _isConnected: boolean = false;
  public get isConnected(): boolean {
    return this._isConnected;/*this.hasElementSet && this.element.isConnected*/;
  }
  public set isConnected(value: boolean) {
    if (!value && this._isConnected) { this.element.remove(); }
    this._isConnected = value;
    // if (value) { this.main.activeIndexes.push(this);
    // } else this.main.activeIndexes.RemoveMultiple(this);
  }

  searchStatus = SearchStatus.notFound;
  main: SourceManage<K>;
  template: TemplateNode;
  isModified = false;
  rowType: RowInfoType = RowInfoType.Source;
  get isOnlySourceRow() { return this.rowType == RowInfoType.Source; }
  get isOnlyCommandRow() { return this.rowType == RowInfoType.TopSticky; }
  get isBothTypeRow() { return this.rowType == RowInfoType.BothTypeDefault; }
  elementIndex = 0;
  private _isVisible = true;
  remove() {
    let main = this.main;
    let category = main.category;
    this.isConnected = false;
    category.DefaultRows.RemoveMultiple(this.row);
    category.FilteredSource.RemoveMultiple(this.row);
    category.FullSample.RemoveMultiple(this.row);
    category.OriginalSource.RemoveMultiple(this.row);
    category.TopStickyRows.RemoveMultiple(this.row);
    for (let i = 0, len = category.others.length; i < len; i++)
      category.others[i].RemoveMultiple(this.row);
    
    //category.TopStickyRows.RemoveMultiple(this.row);
    main.RemoveMultiple(this.row);
    if (main.isLoaded) {
      main.generator.refresh({ setTabIndex: true });
      let index = this.index;
      if (main.info.currentIndex == this.index) {
        main.info.currentItem = undefined;
        main.info.setPos(index, true);
      } else main.info.setPos();
    }

  }
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
    if (this.hasElementSet) {
      //this.element.style.pointerEvents = (!this._isSelectable) ? 'none' : 'all';
      if (this._isSelectable)
        this.element.setAttribute('inert', 'true');
      else this.element.removeAttribute('inert');
    }
  }
  public get isDisabled() {
    return !this._isSelectable;
  }

  row: K;
  height = 0;
  width = 0;
  runningHeight = 0;
  index = 0;
  /*private _index = 0;
  public get index() {
    return this._index;
  }
  public set index(value) {
    //if (value == 107) debugger;
    this._index = value;
  }*/
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
export class SourceManage<K> extends Array<K> {
  info = new SourceProperties<K>();
  activeIndexes: RowInfo<K>[] = [];
  searchables: string[] = [];
  searchablesCommand: string[] = [];
  analyser = new ResultAnalyser<K>();
  nodes = new NodeHandler<K>();
  generator = new RowGenerator<K>();
  rowhandler = new RowHandler<K>();
  scrollbar = new SourceScrollHandler<K>();
  editor = new EditorManage<K>();
  category = {
    FullSample: [] as K[],
    OriginalSource: [] as K[],
    TopStickyRows: [] as K[],
    DefaultRows: [] as K[],
    FilteredSource: [] as K[],
    others:new Array<K[]>(),
    isFiltered: false as boolean,
    startWithBeginIndex: -1,
    startWithEndIndex: -1,
  }

  constructor() {
    super();
    this.info.init(this);
    this.analyser.init(this);;
    this.scrollbar.init(this);
    this.nodes.init(this);
    this.generator.init(this);
    this.rowhandler.init(this);
    this.editor.init(this);
  }

  getRow(index: number): RowInfo<K> {
    if (index >= this.length || index < 0) {
      console.error('INDEX IS OUT OF RANGE ')
      debugger;
    }
    else {
      let row = this[index];
      let rInfo = row[SourceManage.ROW_ACCESS_KEY];
      return (rInfo != undefined) ? rInfo : this.StickRow(row);
      //return r!=undefined?r:this.StickRow(r);
    }
  }
  get CurrentRow(): RowInfo<K> {
    return this[this.info.currentIndex][SourceManage.ROW_ACCESS_KEY];
  }
  static getRow<K>(obj: K): RowInfo<K> {
    if (obj == undefined) {
      console.error('WOW..WOW..WOW...BAIBE')
      debugger;
      return undefined;
    }
    return obj[SourceManage.ROW_ACCESS_KEY];
  }
  private mutedRInfos: RowInfo[] = [];
  mute() {
    let ar = this.category.FullSample;
    let akey = SourceManage.ROW_ACCESS_KEY;
    let muteAr = this.mutedRInfos;
    muteAr.length = 0;
    for (let i = 0, len = ar.length; i < len; i++) {
      muteAr.push(ar[i][akey]);
      delete ar[i][akey];
    }
  }
  unmute() {
    let akey = SourceManage.ROW_ACCESS_KEY;
    let muteAr = this.mutedRInfos;
    for (let i = 0, len = muteAr.length; i < len; i++) {
      let rInf = muteAr[i];
      if (rInf != undefined) rInf.row[akey] = rInf;
    }
    muteAr.length = 0;
  }
  getRowByObj(row: K): RowInfo<K> {
    if (row == undefined) {
      console.error('EH!!!!!!! UNDEFINED AT `getRowByObj` ')
      debugger;
      return undefined;
    }
    let rInfo = row[SourceManage.ROW_ACCESS_KEY];
    return (rInfo != undefined) ? rInfo : this.StickRow(row);
  }
  setRow(index: number, val: RowInfo<K>) {
    let row = this[index];
    if (row) {
      //let obj = row[SourceManage.ACCESS_KEY] as RowInfo<K>;
      row[SourceManage.ROW_ACCESS_KEY] = val;
    }
  }

  allElementSize: BasicSize = {
    width: 0,
    height: 0
  }

  getBottomIndex(topIndex: number, containerHeight: number, { length = undefined, overflowed = false }: { length?: number, overflowed?: boolean }): { index: number, size: number, status: IndexType } {
    if (containerHeight == 0) return { index: topIndex, size: 0, status: 'undefined' };
    let len = length ? length : this.length;


    let i = topIndex, h = 0, size = 0, rInfo: RowInfo<K>, akey = SourceManage.ROW_ACCESS_KEY,
      gen = this.generator;
    for (; i <= len - 1; /*  i++; */) {
      rInfo = this.getRowByObj(this[i]);
      h = gen.takeMeasurement(rInfo).height;
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
    let h = 0, size = 0, rInfo: RowInfo<K>, akey = SourceManage.ROW_ACCESS_KEY,
      gen = this.generator;
    for (; i >= 0;) {
      rInfo = this[i][akey] as RowInfo<K>;
      h = gen.takeMeasurement(rInfo).height;
      size += h;
      if (size > containerHeight) { break; }
      i--;
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


  StickRow(obj: K): RowInfo<K> {
    let akey = SourceManage.ROW_ACCESS_KEY;
    if (obj[akey] != undefined) return obj[akey];
    let rInfo: RowInfo<K> = new RowInfo();
    obj[akey] = rInfo;
    rInfo.row = obj;
    rInfo.main = this;
    //rInfo.main = this;
    return rInfo;
  }
  doIndexing(setAttr = true) {
    let akey = SourceManage.ROW_ACCESS_KEY;
    if (!setAttr)
      for (let i = 0, len = this.length; i < len; i++)
        (this[i][akey] as RowInfo<K>).index = i;
    else
      for (let i = 0, len = this.length; i < len; i++) {
        let rInf = (this[i][akey] as RowInfo<K>);
        rInf.index = i;
        if (rInf.hasElementSet)
          rInf.element.setAttribute('x-tabindex', '' + i);
      }
  }
  makeAllElementsCssDisplay(display: 'none' | 'block' = 'none') {
    let akey = SourceManage.ROW_ACCESS_KEY;
    let ar = this.category.FullSample;
    for (let i = 0, len = ar.length; i < len; i++) {
      let rInf = (ar[i][akey] as RowInfo<K>);
      rInf.elementIndex = i;
      // if (rInf.element != undefined) rInf.element.style.display = display;
    }
  }
  doElementIndexing() {
    let akey = SourceManage.ROW_ACCESS_KEY;
    let ar = this.category.FullSample;
    for (let i = 0, len = ar.length; i < len; i++)
      (ar[i][akey] as RowInfo<K>).elementIndex = i;
  }
  rowseperate() {
    let tmp: K[] = [];
    this.fillInto(tmp);
    let len = tmp.length;
    this.clearAll(false);
    let ctg = this.category;
    let gen = this.generator;
    for (let i = 0; i < len; i++) {
      let row = tmp[i];
      let rInfo = this.StickRow(row);
      switch (rInfo.rowType) {
        case RowInfoType.Source: ctg.OriginalSource.push(row); break;
        case RowInfoType.TopSticky: ctg.TopStickyRows.push(row); break;
        case RowInfoType.BothTypeDefault: ctg.DefaultRows.push(row); break;
      }
    }
    [...ctg.TopStickyRows, ...ctg.DefaultRows, ...ctg.OriginalSource].fillInto(ctg.FullSample);
    ctg.FullSample.fillInto(this);
    this.clearFilter();
    let skey = SourceManage.ROW_ACCESS_KEY;
    let ar = ctg.FullSample;
    for (let i = 0, flen = ar.length; i < flen; i++) {
      let rInfo = ar[i][skey] as RowInfo<K>;
      rInfo.elementIndex = i;
      rInfo.index = i;
    }
    this.Events.onRowSeperationComplete.fire([]);
    this.isLoaded = true;
    this.generator.refresh();

  }
  isLoaded = false;
  ihaveCompletedByMySide(fillRecommand = true) {
    //console.log(['called',this.length]);
    
    /*let len = this.length;
     let ctg = this.category;
     ctg.OriginalSource.length = 0;
     this.fillInto(ctg.OriginalSource);
     ctg.FullSample.length = 0;
     [...ctg.TopStickyRows, ...ctg.DefaultRows, ...ctg.OriginalSource].fillInto(ctg.FullSample);
     this.onCompleteUserSide.fire([ctg.FullSample, 0]);
     this.length = 0;
     ctg.FullSample.fillInto(this);
     this.generator.reload();*/
    this.rowseperate();
    //this.Events.onCompleteUserSide.fire([this.category.FullSample, 0]);
    if (fillRecommand)
      this.callToFill();
  }
  /*pushNew(...items: K[]): number {
    let cat = this.category;
    let slen = this.length;
    let flen = cat.FullSample.length;
    cat.OriginalSource.push(...items);
    cat.FullSample.push(...items);
    let olen = this.length;
    let len = this.push(...items);

    for (let i = 0, ilen = items.length; i < ilen; i++) {
      let nr = this.StickRow(items[i]);
      nr.elementIndex = flen++;
      nr.index = slen++;
    }
    //this.Events.onCompleteUserSide.fire([items, olen]);
    return len;
  }*/

  reset(fireUpdateEvent = true) {
    let anlyse = this.analyser;
    if (this.category.isFiltered) {
      this.clearFilter();
    }
    this.length = 0;
    this.category.FullSample.fillInto(this, true);


    if (fireUpdateEvent) {
      this.callToFill();
    } else this.generator.refresh();
  }
  clearSource() {
    this.length = 0;
    this.nodes.clearView();
  }
  clearAll(clearFilter = true) {
    if (clearFilter)
      this.clearFilter();
    this.nodes.clearView();
    this.length =
      this.category.OriginalSource.length =
      this.category.FullSample.length =
      this.category.FilteredSource.length =
      this.category.DefaultRows.length =
      this.category.TopStickyRows.length = 0;
    this.category.startWithBeginIndex =
      this.category.startWithEndIndex = -1;
  }
  clearFilter() {
    let akey = SourceManage.ROW_ACCESS_KEY;
    let anl = this.analyser;
    let ar = this.category.FullSample;
    for (let i = 0, len = ar.length; i < len; i++) {
      let row = ar[i];
      let rInfo = row[akey] as RowInfo;
      rInfo.hasElementSet = false;
      if (rInfo.searchStatus != SearchStatus.notFound) {
        this.resetRow(rInfo);
      }
    }

    this.category.isFiltered = false;
  }
  resetRow(rInfo: RowInfo<K>) {
    let _searchables = this.searchables;
    let row = rInfo.row;
    if (rInfo.rowType == RowInfoType.Source) {
      rInfo.searchStatus = SearchStatus.notFound;
      for (let i = 0, len = _searchables.length; i < len; i++) {
        const searchable = _searchables[i];
        (row[searchable] as SearchableItemNode).reset();
      }
    } else {
      _searchables = this.searchablesCommand;
      rInfo.searchStatus = SearchStatus.notFound;
      for (let i = 0, len = _searchables.length; i < len; i++) {
        const searchable = _searchables[i];
        (row[searchable] as SearchableItemNode).reset();
      }
    }
    rInfo.isModified = true;
    rInfo.hasMeasurement = rInfo.hasElementSet = false;
    /*if(!this.getRowByObj(row).isSourceRow)return;
    for (let i = 0; i < this.searchables.length; i++) {
      const searchable = this.searchables[i];
      (row[searchable] as SearchableItemNode).reset();
    }
    this.getRowByObj(row).isModified = true;*/
  }
  callToFill() {
    let len = this.length;
    let akey = SourceManage.ROW_ACCESS_KEY;
    //console.log('callto fill');
    
    //this.sort((a, b) => (a[akey] as RowInfo).elementIndex - (b[akey] as RowInfo).elementIndex);
    let category = this.category;
    let hasBeginSet = false, hasEndSet = false;
    if (category.startWithBeginIndex != -1) {
      for (let i = 0, len = this.length; i < len; i++) {
        let rObj = this[i][akey] as RowInfo;

        if (!hasBeginSet && rObj.elementIndex == category.startWithBeginIndex) { hasBeginSet = true; category.startWithBeginIndex = i; }
        if (!hasEndSet && rObj.elementIndex == category.startWithEndIndex) { hasEndSet = true; category.startWithEndIndex = i; }
        if (hasBeginSet && hasEndSet) break;
      }
    }
    this.generator.refresh();
     
    this.Events.onUpdate.fire([len, true]);
  }

  ArrangingContents = false;
  static ROW_ACCESS_KEY = uniqOpt.guid;

  Events = {
    onDemandNewItem: undefined as () => K,
    onChangeHiddenCount: new CommonEvent<(topHiddenCount: number, bottomHiddenCount: number) => void>(),
    onUpdate: new CommonEvent<(arrayLen: number, fillRecommand: boolean) => void>(),
    //onCompleteUserSide: new CommonEvent<(src: K[], indexCounter: number) => void>(),
    onRowSeperationComplete: new CommonEvent<() => void>(),
  }
};