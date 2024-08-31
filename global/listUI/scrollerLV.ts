import { keyBoard } from "ucbuilder/global/hardware/keyboard";
import { ItemIndexChangeBy, listUiHandler } from "ucbuilder/global/listUI/extended/listUiHandler";

export class ScrollerLV extends listUiHandler {
    allItemHT: HTMLElement[] | undefined;
    
    constructor() {
        super();
    }
    
    init(lstVw: HTMLElement, scrollContainer: HTMLElement): void {
        super.init(lstVw, scrollContainer,undefined);
        this.allItemHT = Array.from(lstVw.childNodes) as HTMLElement[];
        this.Records.itemAt = (index: number): HTMLElement => {
            return this.allItemHT[index];
        };
        this.nodes.fill = (): void => {
            let _nodes = this.nodes;
            _nodes.clear();
            this.search.takeBlueprint();
            for (let index = 0, len = this.length - 1; index <= len; index++) {
                _nodes.append(index);
            }
        };

        this.nodes.append = (index: number, replaceNode = false): HTMLElement => {
            let _records = this.Records;
            let _nodex = this.nodes;
            let itemNode = _nodex.getNode(index);
            itemNode.setAttribute('item-index', index.toString());
            let allHT = this.allItemHT;
            if (allHT.length == 0) {
                _records.lstVWEle.appendChild(itemNode);
            } else {
                if (!replaceNode) {
                    let aa = allHT[index - 1];
                    aa.after(itemNode);
                } else {
                    allHT[index].replaceWith(itemNode);
                }
            }
            this.Events.newItemGenerate.fire([itemNode, index]);
            return itemNode;
        };
        
        this.Events.onkeydown = (e: KeyboardEvent): void => {
            switch (e.keyCode) {
                case keyBoard.keys.up: // up key
                    this.setCurrentIndex(this.currentIndex - 1, e,'Keyboard');
                    e.preventDefault();
                    break;
                case keyBoard.keys.down: // down key
                    this.setCurrentIndex(this.currentIndex + 1, e,'Keyboard');
                    e.preventDefault();
                    break;
                case keyBoard.keys.pageUp: // page up key
                    break;
                case keyBoard.keys.pageDown: // page down key
                    break;
                case keyBoard.keys.end: // end key
                    this.setCurrentIndex(this.source._rows.length - 1, e,'Keyboard');
                    e.preventDefault();
                    break;
                case keyBoard.keys.home: // home key
                    this.setCurrentIndex(0, e,'Keyboard');
                    e.preventDefault();
                    break;
            }
        };

        lstVw.addEventListener("mousedown", (e: MouseEvent): void => {
            let itm = this.Records.getItemFromChild(e.target as HTMLElement);
            if (itm != null) {
                this.Events.itemMouseDown.fire([itm.index(), e]);
            }
        });
        lstVw.addEventListener("mouseup", (e: MouseEvent): void => {
            let itm = this.Records.getItemFromChild(e.target as HTMLElement);
            if (itm != null) {
                this.setCurrentIndex(itm.index(), e, "Mouse");
                
                this.Events.itemMouseUp.fire([itm.index(), e]);
            }
        });
    }

    setCurrentIndex(val: number, evt: MouseEvent | KeyboardEvent, eventType: ItemIndexChangeBy): void {
        let oldIndex = this.currentIndex;
        let changed = (val !== oldIndex);
        let _records = this.Records;
        let _scrollElement = _records.scrollerElement;
        let currentItem = this.OPTIONS.currentItem;
        let options = this.OPTIONS;
        let allItems = this.allItemHT;
        let session = options.SESSION;
        if (val >= 0 && val < allItems.length) {
            if (currentItem != undefined) {
                currentItem.setAttribute('current-index', '0');
            }
            session.currentIndex = val;
            this.OPTIONS.currentItem = allItems[val];
            currentItem = this.OPTIONS.currentItem;
            currentItem.setAttribute('current-index', '1');
            currentItem.focus();
            if (_scrollElement != undefined && options.listSize != undefined) {
                let itemTop = currentItem.offsetTop;
                let itemHeight = currentItem.offsetHeight;
                let bottom = itemTop + itemHeight;
                let B_diff = options.listSize.height - bottom;

                let bDiff = B_diff + _scrollElement.scrollTop;
                if (bDiff < 0) {
                    _scrollElement.scrollTop = Math.abs(B_diff);
                }

                let tDiff = itemTop - _scrollElement.scrollTop;
                if (tDiff < 0) {
                    _scrollElement.scrollTop = itemTop;
                }
                session.scrollTop = _scrollElement.scrollTop;
            }
        }

        if (changed) {
            this.Events.currentItemIndexChange.fire([oldIndex, session.currentIndex, evt, eventType]);
        }
    }
}