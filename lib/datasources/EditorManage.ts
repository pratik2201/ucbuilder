import { RowInfo, SourceManage } from "ucbuilder/lib/datasources/SourceManage";
import { TabContainerClearNode, TabIndexManager } from "ucbuilder/lib/TabIndexManager";
import { GenerateMode } from "ucbuilder/lib/datasources/NodeHandler";
import { Usercontrol } from "ucbuilder/Usercontrol";

export class EditorManage<K> {
    source: SourceManage<K>;

    removeOnClose(ar:TabContainerClearNode[],node:TabContainerClearNode) {
        let refuc = this.source.info.refUC;
        if (refuc != undefined) {
            refuc.ucExtends.Events.afterClose.on(() => {
                ar.RemoveMultiple(node);
            });
        }
    }
    setTopEnter(wele: HTMLElement, callback = () => 0): TabContainerClearNode {
        let src = this.source;
        let cfg = src.info;
        let node: TabContainerClearNode = {
            target: wele,
            callback: () => {
                let bRInfo: RowInfo<any>;
                if (TabIndexManager.status == 'forward' && callback != undefined) {
                    src.ArrangingContents = true;
                    let nIndex = callback();
                    if (!Number.isInteger(nIndex)) debugger;
                    bRInfo = SourceManage.getRow(src[nIndex]);
                    src.info.setPos(nIndex,true);
                    src.generator.refresh({ setTabIndex: true });
                    TabIndexManager.moveNext(bRInfo.element);
                    TabIndexManager.breakTheLoop = true;
                    TabIndexManager.music = false;
                    src.scrollbar.refreshScrollbarSilantly();
                    src.ArrangingContents = false;
                    return true;
                }
                return true;
            }
        }
        TabIndexManager.Events.onContainerTopEnter.push(node);
        this.removeOnClose(TabIndexManager.Events.onContainerTopEnter, node);
        
        return node;
    }
    
    setBottomLeave(wele: HTMLElement, callback = () => 0): TabContainerClearNode {
        let src = this.source;
        let cfg = src.info;
        let node: TabContainerClearNode = {
            target: wele,
            callback: () => {
                let bRInfo: RowInfo<any>;
                let srclen = src.length;
                let cIndex = cfg.currentIndex;
                if (cIndex == srclen - 1 && callback != undefined) {
                    src.ArrangingContents = true;
                    //let nIndex = cIndex + 1;
                    //this.pushNew(evt.onDemandNewItem(), nIndex);

                    let nIndex = callback();
                    if (!Number.isInteger(nIndex)) debugger;

                    bRInfo = SourceManage.getRow(src[nIndex]);
                    src.nodes.generate(nIndex, GenerateMode.append);
                    src.info.setPos(nIndex,true);
                    src.generator.refresh({ setTabIndex: true });
                    TabIndexManager.moveNext(bRInfo.element);
                    TabIndexManager.breakTheLoop = true;
                    TabIndexManager.music = false;
                    src.scrollbar.refreshScrollbarSilantly();
                    src.ArrangingContents = false;
                } else {
                    cfg.moveNext(undefined, 1);
                    bRInfo = SourceManage.getRow(src[cfg.bottomIndex]);
                    TabIndexManager.moveNext(bRInfo.element);
                    TabIndexManager.breakTheLoop = true;
                    TabIndexManager.music = false;
                    src.scrollbar.refreshScrollbarSilantly();
                }
            }
        }
        TabIndexManager.Events.onContainerBottomLeave.push(node);
        return node;
    }
    constructor() { }
    init(_source: SourceManage<K>) {
        this.source = _source;
    }
    /*onReachRow(row: RowInfo<K>) {
        let resEvents = TabIndexManager.Events;
        let cfg = this.source.info;
        let src = this.source;
        let onDemandNewItem = src.Events.onDemandNewItem;
        let curRow = cfg.currentItem;
        let tEnterNode: TabContainerClearNode = {
            target: row.element,
            callback: () => {
                let bRInfo: RowInfo<any>;
                if (TabIndexManager.status == 'forward' && onDemandNewItem != undefined) {
                    src.ArrangingContents = true;
                    let nIndex = row.index;
                    this.pushNew(onDemandNewItem(), nIndex);
                    src.scrollbar.refreshScrollSize();
                    bRInfo = SourceManage.getRow(src[nIndex]);
                    src.nodes.generate(nIndex, GenerateMode.before, row.element);
                    src.generator.refresh({ setTabIndex: true });
                    cfg.currentIndex = nIndex;
                    src.info.setPos();
                    TabIndexManager.moveNext(bRInfo.element);
                    TabIndexManager.breakTheLoop = true;
                    TabIndexManager.music = false;
                    src.scrollbar.refreshScrollbarSilantly();
                    src.ArrangingContents = false;
                    return true;
                }
                return true;
            }
        };
        resEvents.onContainerTopEnter.push(tEnterNode);
    }*/

    pushNew(row: K, at: number) {
        this.source.splice(at, 0, row);
        let nr = this.source.StickRow(row);

    }
    bLeaveNode: TabContainerClearNode;
    tEnterNode: TabContainerClearNode;
    tLeaveNode: TabContainerClearNode;
    onDamand() {
        let resEvents = TabIndexManager.Events;
        let _this = this;
        let src = this.source;
        let cfg = src.info;
        let evt = src.Events;
        let lstEle = cfg.container;
        this.bLeaveNode = {
            target: lstEle,
            callback: () => {
                let bRInfo: RowInfo<any>;
                let srclen = src.length;
                let cIndex = cfg.currentIndex;
                if (cIndex == srclen - 1 && evt.onDemandNewItem != undefined) {
                    src.ArrangingContents = true;
                    let nIndex = cIndex + 1;
                    this.pushNew(evt.onDemandNewItem(), nIndex);
                    bRInfo = SourceManage.getRow(src[nIndex]);
                    src.nodes.generate(nIndex, GenerateMode.append);
                    cfg.currentIndex = nIndex;
                    src.info.setPos();
                    src.generator.refresh({ setTabIndex: true });
                    TabIndexManager.moveNext(bRInfo.element);
                    TabIndexManager.breakTheLoop = true;
                    TabIndexManager.music = false;
                    src.scrollbar.refreshScrollbarSilantly();
                    src.ArrangingContents = false;
                } else {
                    cfg.moveNext(undefined, 1);
                    bRInfo = SourceManage.getRow(src[cfg.bottomIndex]);
                    TabIndexManager.moveNext(bRInfo.element);
                    TabIndexManager.breakTheLoop = true;
                    TabIndexManager.music = false;
                    src.scrollbar.refreshScrollbarSilantly();
                }
            }
        };
        resEvents.onContainerBottomLeave.push(this.bLeaveNode);

        this.tEnterNode = {
            target: lstEle,
            callback: () => {
                //cfg.top = 0;
                cfg.currentIndex = cfg.defaultIndex;
                cfg.setPos();
                TabIndexManager.moveNext(lstEle);
                //return true;
            }
        };
        resEvents.onContainerTopEnter.push(this.tEnterNode);

        this.tLeaveNode = {
            target: lstEle,
            callback: () => {
                if (cfg.currentIndex == cfg.defaultIndex) return;
                cfg.movePrev(undefined, 1);
                src.scrollbar.refreshScrollbarSilantly();
            }
        };
        resEvents.onContainerTopLeave.push(this.tLeaveNode);

        let refuc = this.source.info.refUC;
        if (refuc != undefined) {
            refuc.ucExtends.Events.afterClose.on(() => {
                _this.stopEditor();
            });
        }
        //src.EditorMode = true;
    }
    stopEditor() {
        let resEvents = TabIndexManager.Events;
        resEvents.onContainerBottomLeave.RemoveMultiple(this.bLeaveNode);
        resEvents.onContainerTopEnter.RemoveMultiple(this.tEnterNode);
        resEvents.onContainerTopLeave.RemoveMultiple(this.tLeaveNode);
    }
    indexing() {
        //let ar = this.main.ll_view.children;
        //for (let i = 0; i < ar.length; i++) ar[i].setAttribute('x-tabindex', '' + i);
    }
}