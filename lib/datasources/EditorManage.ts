import { RowInfo, SourceManage } from "ucbuilder/lib/datasources/SourceManage";
import { TabContainerClearNode, TabIndexManager } from "ucbuilder/lib/TabIndexManager";

export class EditorManage<K> {
    source: SourceManage<K>;

    constructor() {}
    init(_source: SourceManage<K>) {
        this.source = _source;
        
    }
    onDamand(/*onDemandNewRow: () => K*/) {
        let resEvents = TabIndexManager.Events;

        let src = this.source;
        let cfg = src.info;
        let evt = src.Events;
        let lstEle = cfg.container;
        let bLeaveNode: TabContainerClearNode = {
            target: lstEle,
            callback: () => {
                let bRInfo: RowInfo<any>;
                let srclen = src.length;

                if (cfg.currentIndex == srclen - 1 && evt.onDemandNewItem != undefined) {
                    src.ArrangingContents = true;
                    let nIndex = cfg.currentIndex + 1;
                    src.pushNew(evt.onDemandNewItem());
                    src.scrollbar.refreshScrollSize();
                    bRInfo = SourceManage.getRow(src[nIndex]);
                    src.generator.refresh();
                    // if (bRInfo.index >= srclen) {
                    src.nodes.generate(bRInfo.index, true);

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

        let tEnterNode: TabContainerClearNode = {
            target: lstEle,
            callback: () => {
                //cfg.top = 0;
                cfg.currentIndex = cfg.defaultIndex;
                cfg.setPos();
                TabIndexManager.moveNext(lstEle);
                return true;
            }
        };
        resEvents.onContainerTopEnter.push(tEnterNode);

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
                resEvents.onContainerBottomLeave.RemoveMultiple(bLeaveNode);
                resEvents.onContainerTopEnter.RemoveMultiple(tEnterNode);
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