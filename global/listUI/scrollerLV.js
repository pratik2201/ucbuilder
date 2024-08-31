"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollerLV = void 0;
const keyboard_1 = require("ucbuilder/global/hardware/keyboard");
const listUiHandler_1 = require("ucbuilder/global/listUI/extended/listUiHandler");
class ScrollerLV extends listUiHandler_1.listUiHandler {
    constructor() {
        super();
    }
    init(lstVw, scrollContainer) {
        super.init(lstVw, scrollContainer, undefined);
        this.allItemHT = Array.from(lstVw.childNodes);
        this.Records.itemAt = (index) => {
            return this.allItemHT[index];
        };
        this.nodes.fill = () => {
            let _nodes = this.nodes;
            _nodes.clear();
            this.search.takeBlueprint();
            for (let index = 0, len = this.length - 1; index <= len; index++) {
                _nodes.append(index);
            }
        };
        this.nodes.append = (index, replaceNode = false) => {
            let _records = this.Records;
            let _nodex = this.nodes;
            let itemNode = _nodex.getNode(index);
            itemNode.setAttribute('item-index', index.toString());
            let allHT = this.allItemHT;
            if (allHT.length == 0) {
                _records.lstVWEle.appendChild(itemNode);
            }
            else {
                if (!replaceNode) {
                    let aa = allHT[index - 1];
                    aa.after(itemNode);
                }
                else {
                    allHT[index].replaceWith(itemNode);
                }
            }
            this.Events.newItemGenerate.fire([itemNode, index]);
            return itemNode;
        };
        this.Events.onkeydown = (e) => {
            switch (e.keyCode) {
                case keyboard_1.keyBoard.keys.up: // up key
                    this.setCurrentIndex(this.currentIndex - 1, e, 'Keyboard');
                    e.preventDefault();
                    break;
                case keyboard_1.keyBoard.keys.down: // down key
                    this.setCurrentIndex(this.currentIndex + 1, e, 'Keyboard');
                    e.preventDefault();
                    break;
                case keyboard_1.keyBoard.keys.pageUp: // page up key
                    break;
                case keyboard_1.keyBoard.keys.pageDown: // page down key
                    break;
                case keyboard_1.keyBoard.keys.end: // end key
                    this.setCurrentIndex(this.source._rows.length - 1, e, 'Keyboard');
                    e.preventDefault();
                    break;
                case keyboard_1.keyBoard.keys.home: // home key
                    this.setCurrentIndex(0, e, 'Keyboard');
                    e.preventDefault();
                    break;
            }
        };
        lstVw.addEventListener("mousedown", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.Events.itemMouseDown.fire([itm.index(), e]);
            }
        });
        lstVw.addEventListener("mouseup", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.setCurrentIndex(itm.index(), e, "Mouse");
                this.Events.itemMouseUp.fire([itm.index(), e]);
            }
        });
    }
    setCurrentIndex(val, evt, eventType) {
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
exports.ScrollerLV = ScrollerLV;
