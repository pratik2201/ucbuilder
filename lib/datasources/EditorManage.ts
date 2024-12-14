import { RowInfo, SourceManage } from "ucbuilder/lib/datasources/SourceManage";
import { TabContainerClearNode, TabIndexManager } from "ucbuilder/lib/TabIndexManager";
import { GenerateMode } from "ucbuilder/lib/datasources/NodeHandler";

export class EditorManage<K> {
    source: SourceManage<K>;

    constructor() {}
    init(_source: SourceManage<K>) {
        this.source = _source;
        
    }
    onReachRow(row: RowInfo<K>) {
        let resEvents = TabIndexManager.Events;
        let cfg = this.source.info;
        let src = this.source;
        let evt = src.Events;
        let curRow = cfg.currentItem;
        
        let tEnterNode: TabContainerClearNode = {
            target: row.element,
            callback: () => {
                let bRInfo: RowInfo<any>;
                //let srclen = src.length;
                let cIndex = cfg.currentIndex;
                if (curRow==undefined || curRow.index == row.index && evt.onDemandNewItem != undefined) {
                    debugger;
                    src.ArrangingContents = true;
                    let nIndex = cIndex;
                    this.pushNew(evt.onDemandNewItem(nIndex),nIndex);
                    src.scrollbar.refreshScrollSize();
                    bRInfo = SourceManage.getRow(src[nIndex]);
                    src.generator.refresh({setTabIndex:true});
                    // if (bRInfo.index >= srclen) {
                    src.nodes.generate(bRInfo.index, GenerateMode.before,row.element);

                    cfg.currentIndex = bRInfo.index;
                    src.info.setPos();
                    // }

                    //console.log([bRInfo.index,bRInfo.element]);

                    // cfg.moveNext(undefined, 1);
                    TabIndexManager.moveNext(bRInfo.element);
                    TabIndexManager.breakTheLoop = true;
                    TabIndexManager.music = false;
                    src.scrollbar.refreshScrollbarSilantly();
                    src.ArrangingContents = false;

                    //console.log(bRInfo.element);

                } else {

                    cfg.moveNext(undefined, 1);
                    bRInfo = SourceManage.getRow(src[cfg.bottomIndex]);
                    TabIndexManager.moveNext(bRInfo.element);
                    TabIndexManager.breakTheLoop = true;
                    TabIndexManager.music = false;
                    src.scrollbar.refreshScrollbarSilantly();
                }
                return true;
            }
        };
        resEvents.onContainerTopEnter.push(tEnterNode);
    }
    pushNew(row:K,at:number) {
        this.source.splice(at, 0, row);
        let nr = this.source.StickRow(row);
        this.source.generator.refresh();
    }
    onDamand() {
        let resEvents = TabIndexManager.Events;

        let src = this.source;
        let cfg = src.info;
        let evt = src.Events;
        let lstEle = cfg.container;
       /* let bLeaveNode: TabContainerClearNode = {
            target: lstEle,
            callback: () => {
                let bRInfo: RowInfo<any>;
                let srclen = src.length;
                let cIndex = cfg.currentIndex;
                if (cIndex == srclen - 1 && evt.onDemandNewItem != undefined) {
                    src.ArrangingContents = true;
                    let nIndex = cIndex + 1;
                    this.pushNew(evt.onDemandNewItem(cIndex),cIndex);
                    src.scrollbar.refreshScrollSize();
                    bRInfo = SourceManage.getRow(src[nIndex]);
                    src.generator.refresh();
                    // if (bRInfo.index >= srclen) {
                    src.nodes.generate(bRInfo.index, GenerateMode.append);

                    cfg.currentIndex = bRInfo.index;
                    src.info.setPos();
                    // }

                    //console.log([bRInfo.index,bRInfo.element]);

                    // cfg.moveNext(undefined, 1);
                    TabIndexManager.moveNext(bRInfo.element);
                    TabIndexManager.breakTheLoop = true;
                    TabIndexManager.music = false;
                    src.scrollbar.refreshScrollbarSilantly();
                    src.ArrangingContents = false;

                    //console.log(bRInfo.element);

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
        resEvents.onContainerBottomLeave.push(bLeaveNode);
        */
        /*let tEnterNode: TabContainerClearNode = {
            target: lstEle,
            callback: () => {
                //cfg.top = 0;
                cfg.currentIndex = cfg.defaultIndex;
                cfg.setPos();
                TabIndexManager.moveNext(lstEle);
                return true;
            }
        };
        resEvents.onContainerTopEnter.push(tEnterNode);*/

        let tLeaveNode: TabContainerClearNode = {
            target: lstEle,
            callback: () => {
                if (cfg.currentIndex == cfg.defaultIndex) return;
                cfg.movePrev(undefined, 1);
                src.scrollbar.refreshScrollbarSilantly();
            }
        };
        resEvents.onContainerTopLeave.push(tLeaveNode);

        let refuc = this.source.info.refUC;
        if (refuc != undefined) {
            refuc.ucExtends.Events.afterClose.on(() => {
                //resEvents.onContainerBottomLeave.RemoveMultiple(bLeaveNode);
               // resEvents.onContainerTopEnter.RemoveMultiple(tEnterNode);
                resEvents.onContainerTopLeave.RemoveMultiple(tLeaveNode);
            });
        }
        //src.EditorMode = true;
    }

    indexing() {
        //let ar = this.main.ll_view.children;
        //for (let i = 0; i < ar.length; i++) ar[i].setAttribute('x-tabindex', '' + i);
    }
}