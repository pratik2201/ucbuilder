const { keyBoard } = require("ucbuilder/global/hardware/keyboard");
const { listUiHandler } = require("ucbuilder/global/listUI/extended/listUiHandler");
class scrollerLV extends listUiHandler {
    constructor() {
        super();
    }
    /** @type {container[]}  */
    allItemHT = undefined;
    /**
    * @param {HTMLElement} lstVw 
    * @param {HTMLElement} scrollContainer 
    */
    init(lstVw, scrollContainer) {
        super.init(lstVw, scrollContainer);
        this.allItemHT = lstVw.childNodes;
        this.Records.itemAt = (index) => {
            return this.allItemHT[index];
        };
        this.nodes.fill = () => {
            let _nodes = this.nodes;
            _nodes.clear();
            this.search.takeBlueprint();
            for (let index = 0, len = this.length - 1; index <= len; index++)
                _nodes.append(index);
        };

        /**
        * @param {number} index 
        * @param {boolean} replaceNode 
        * @returns {HTMLElement}
        */
        this.nodes.append = (index, replaceNode = false) => {
            let _records = this.Records;
            let _nodex = this.nodes;
            let itemNode = _nodex.getNode(index);
            itemNode.setAttribute('item-index', index);
            let allHT = this.allItemHT;
            if (allHT.length == 0)
                _records.lstVWEle.appendChild(itemNode);
            else {
                if (!replaceNode) {
                    let aa = allHT[index - 1];
                    aa.after(itemNode);
                } else {
                    allHT[index].replaceWith(itemNode);
                }
            }
            this.Events.newItemGenerate.fire(itemNode, index);
            return itemNode;
        };
        
        this.Events.onkeydown = (e) => {
         
            switch (e.keyCode) {
                case keyBoard.keys.up: // up key
                    this.setCurrentIndex(this.currentIndex - 1, e);
                    e.preventDefault();
                    break;
                case keyBoard.keys.down: // down key
                    this.setCurrentIndex(this.currentIndex + 1, e);
                    e.preventDefault();
                    break;
                case keyBoard.keys.pageUp: // page up key
                    break;
                case keyBoard.keys.pageDown: // page down key
                    break;
                case keyBoard.keys.end: // end key
                    this.setCurrentIndex(this.Records.length - 1, e);
                    e.preventDefault();
                    break;
                case keyBoard.keys.home: // home key
                    this.setCurrentIndex(0, e);
                    e.preventDefault();
                    break;
            }
        };


        lstVw.addEventListener("mousedown", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.setCurrentIndex(itm.index(), e, "Mouse");
                this.Events.itemMouseDown.fire(this.currentIndex, e);
            }
        });
        lstVw.addEventListener("mouseup", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null) {
                this.Events.itemMouseUp.fire(this.currentIndex, e);
            }
        });
    }


    /**
     * @param {number} val 
     * @param {MouseEvent|KeyboardEvent} evt 
     * @param {"Other"|"Keyboard"|"Mouse"} eventType
     */
    setCurrentIndex(val, evt, eventType = "Other") {
        // let pageExtended = this.__extended();
        //if (pageExtended.isFreez) return;
        let oldIndex = this.currentIndex;
        let changed = (val !== oldIndex);
        let _records = this.Records;
        let _scrollElement = _records.scrollerElement;
        let currentItem = this.OPTIONS.currentItem;
        let options = this.OPTIONS;
        let allItems = this.allItemHT;
        let session = options.SESSION;
        if (val >= 0 && val < allItems.length) {
            if (currentItem != undefined)
                currentItem.setAttribute('current-index', '0');
            session.currentIndex = val;
            this.OPTIONS.currentItem = allItems[val];
            currentItem = this.OPTIONS.currentItem;
            currentItem.setAttribute('current-index', '1');
            currentItem.focus();
            if (_scrollElement != undefined &&
                options.listSize != undefined) {
                let itemTop = currentItem.offsetTop;
                let itemHeight = currentItem.offsetHeight;
                let bottom = itemTop + itemHeight;
                let B_diff = options.listSize.height - bottom;

                let bDiff = B_diff + _scrollElement.scrollTop;
                if (bDiff < 0)
                    _scrollElement.scrollTop = Math.abs(B_diff);

                let tDiff = itemTop - _scrollElement.scrollTop;
                if (tDiff < 0)
                    _scrollElement.scrollTop = itemTop;
                session.scrollTop = _scrollElement.scrollTop;
            }
        }

        if (changed)
            this.Events.currentItemIndexChange.fire(oldIndex, session.currentIndex, evt, eventType);
    }


}
module.exports = { scrollerLV }