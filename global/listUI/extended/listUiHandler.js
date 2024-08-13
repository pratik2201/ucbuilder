"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUiHandler = void 0;
const CommonEvent_1 = require("ucbuilder/global/CommonEvent");
const listUiSearch_1 = require("ucbuilder/global/listUiSearch");
const timeoutCall_1 = require("ucbuilder/global/timeoutCall");
const enumAndMore_1 = require("../pager/enumAndMore");
class listUiHandler {
    constructor() {
        this.OPTIONS = {
            SESSION: {
                currentIndex: -1,
                scrollTop: 0,
            },
            listSize: undefined,
            currentItem: undefined,
        };
        this.source = new enumAndMore_1.SourceManage();
        this.nodes = {
            itemSize: {
                hasSet: false,
                width: 0,
                height: 0,
                update(htEle) {
                    this.hasSet = true;
                    if (!htEle.isConnected) {
                        document.body.appendChild(htEle);
                        timeoutCall_1.timeoutCall.start(() => {
                            this.width = htEle.offsetWidth;
                            this.height = htEle.offsetHeight;
                        });
                        document.body.removeChild(htEle);
                    }
                    else {
                        this.width = htEle.offsetWidth;
                        this.height = htEle.offsetHeight;
                    }
                },
            },
            getNode: (index) => {
                return this.itemTemplate.extended.generateNode(this.source.rows[index]);
            },
            prepend: (index) => { debugger; return undefined; },
            append: (index, replaceNode = false) => { debugger; return undefined; },
            update: (index) => {
                let nodes = this.nodes;
                let ele = nodes.append(index, true);
                this.setCurrentIndex(this.currentIndex);
                return ele;
            },
            clear: () => {
                this.Records.lstVWEle.innerHTML = "";
                this.Events.onClearContainer.fire();
            },
            indexOf: (ele) => { return -1; },
            fill: () => {
                console.log("ds");
            },
            callToFill: () => { },
            loopVisibleRows: (callback = (ele) => {
                return true;
            }) => { },
            onRendar: () => {
                this.nodes.loopVisibleRows((ele) => {
                    return true;
                });
            },
            __doactualRendar: () => {
                this.nodes.onRendar();
                this.nodes.refreshHiddenCount();
            },
            render() {
                this.__doactualRendar();
            },
            refreshHiddenCount: () => { },
        };
        this.Records = {
            itemAt(index) {
                return undefined;
            },
            lstVWEle: undefined,
            scrollerElement: undefined,
            getItemFromChild(ele) {
                let _container = this.lstVWEle;
                while (true) {
                    if (ele.parentElement == null) {
                        return null;
                    }
                    else if (_container.is(ele.parentElement)) {
                        return ele;
                    }
                    else {
                        ele = ele.parentElement;
                    }
                }
            },
            getNode: (index) => {
                return this.itemTemplate.extended.generateNode(this.source.rows[index]);
            },
        };
        this.Events = {
            onSourceUpdate: new CommonEvent_1.CommonEvent(),
            itemDoubleClick: new CommonEvent_1.CommonEvent(),
            itemMouseDown: new CommonEvent_1.CommonEvent(),
            itemMouseUp: new CommonEvent_1.CommonEvent(),
            onClearContainer: new CommonEvent_1.CommonEvent(),
            currentItemIndexChange: new CommonEvent_1.CommonEvent(),
            newItemGenerate: new CommonEvent_1.CommonEvent(),
            onListUISizeChanged: new CommonEvent_1.CommonEvent(),
            beforeOldItemRemoved: new CommonEvent_1.CommonEvent(),
            onRowNavigationChanged: (callback, event, valToAddRemove) => {
                callback(event, valToAddRemove);
            },
            onReachLastRecord: () => {
                return false;
            },
            onReachFirstRecord: () => {
                return false;
            },
            onkeydown: (e) => { },
        };
        this.keydown_listner = (evt) => {
            this.Events.onkeydown(evt);
        };
        this.search = new listUiSearch_1.listUiSearch(this);
    }
    get length() {
        return this.source.rows.length;
    }
    get currentRecord() {
        return this.source.rows[this.currentIndex];
    }
    get currentIndex() {
        return this.OPTIONS.SESSION.currentIndex;
    }
    set currentIndex(val) {
        this.setCurrentIndex(val);
    }
    set scrollerElement(val) {
        if (val == undefined)
            return;
        if (this.resizeObsrv != undefined)
            this.resizeObsrv.disconnect();
        this.resizeObsrv = new window.ResizeObserver((pera) => {
            timeoutCall_1.timeoutCall.start(() => {
                this.OPTIONS.listSize = pera[0].contentRect;
                this.Events.onListUISizeChanged.fire([pera[0].contentRect]);
            });
        });
        this.Records.scrollerElement = val;
        this.resizeObsrv.observe(val);
    }
    init(lstVw, scrollerElement, uc) {
        this.Records.lstVWEle = lstVw;
        this.source.onUpdate.on((cnt) => { this.Events.onSourceUpdate.fire([cnt]); });
        this.scrollerElement = scrollerElement;
        lstVw.addEventListener("dblclick", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null)
                this.Events.itemDoubleClick.fire([this.currentIndex, e]);
        });
        scrollerElement.addEventListener("keydown", this.keydown_listner);
    }
    setCurrentIndex(val, evt, eventType = 'Other') { }
}
exports.listUiHandler = listUiHandler;
