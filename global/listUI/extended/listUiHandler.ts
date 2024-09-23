import { TemplateNode } from "ucbuilder/Template";
import { CommonEvent } from "ucbuilder/global/commonEvent";
import { listUiSearch } from "ucbuilder/global/listUiSearch";
import { timeoutCall } from "ucbuilder/global/timeoutCall";
import { Usercontrol } from "ucbuilder/Usercontrol";
import { SourceManage } from "../pager/enumAndMore";
export type ItemIndexChangeBy = "Other" | "Keyboard" | "Mouse";

export class listUiHandler {
    search: listUiSearch;
    constructor() {
        this.search = new listUiSearch(this);
    }
    OPTIONS: {
        SESSION: {
            currentIndex: number;
            scrollTop: number;
        };
        listSize: DOMRectReadOnly | undefined;
        currentItem: HTMLElement | undefined;
    } = {
            SESSION: {
                currentIndex: -1,
                scrollTop: 0,
            },
            listSize: undefined,
            currentItem: undefined,
        };
    source = new SourceManage();
    /*source = {
        _rows: [],
        get rows(): any[] {
            return this._rows;
        },
        _this: () => this,
        set rows(value: any[]) {
            this._rows = value;
            this.update();
        },
        update() {
            this._this().Events.onSourceUpdate.fire([this._rows.length]);
        },
    };*/

    private _itemTemplate: TemplateNode;
    public get itemTemplate(): TemplateNode {
        return this._itemTemplate;
    }
    public set itemTemplate(value: TemplateNode) {
        this._itemTemplate = value;
        let _itemSize = this.nodes.itemSize;        
        let s = value.extended.size;
        setTimeout(() => {
            _itemSize.height = s.height;
            _itemSize.width = s.width;
        }, 1);
    }

    

    get length(): number {
        return this.source.rows.length;
    }

    nodes = {
        itemSize: {
            hasSet: false,
            width: 0,
            height: 0,
            update(htEle: HTMLElement) {
                this.hasSet = true;

                if (!htEle.isConnected) {
                    document.body.appendChild(htEle);
                    timeoutCall.start(() => {
                        this.width = htEle.offsetWidth;
                        this.height = htEle.offsetHeight;
                    });
                    document.body.removeChild(htEle);
                } else {
                    this.width = htEle.offsetWidth;
                    this.height = htEle.offsetHeight;
                }
            },
        },
        getNode: (index: number): HTMLElement => {
            return this.itemTemplate.extended.generateNode(this.source.rows[index]);
        },
        prepend: (index: number): HTMLElement => { debugger; return undefined; },
        append: (index: number, replaceNode = false): HTMLElement => { debugger; return undefined; },
        update: (index: number): HTMLElement => {
            let nodes = this.nodes;
            let ele = nodes.append(index, true);
            this.setCurrentIndex(this.currentIndex);
            return ele;
        },
        clear: (): void => {
            this.Records.lstVWEle.innerHTML = "";
            this.Events.onClearContainer.fire();

        },
        indexOf: (ele: HTMLElement): number => { return -1; },
        fill: (): void => {
            console.log("ds");
        },
        callToFill: (): void => { },
        loopVisibleRows: (callback = (ele: HTMLElement) => {
            return true;
        }): void => { },
        onRendar: (): void => {
            this.nodes.loopVisibleRows((ele) => {
                return true;
            });
        },
        __doactualRendar: (): void => {
            this.nodes.onRendar();
            this.nodes.refreshHiddenCount();
        },
        render(): void {
            this.__doactualRendar();
        },
        refreshHiddenCount: (): void => { },
    };

    Records = {
        itemAt(index: number): HTMLElement {
            return undefined;
        },
        lstVWEle: undefined as HTMLElement,
        scrollerElement: undefined as HTMLElement,
        getItemFromChild(ele: HTMLElement): HTMLElement {
            let _container = this.lstVWEle;
            while (true) {
                if (ele.parentElement == null) {
                    return null;
                } else if (_container.is(ele.parentElement)) {
                    return ele;
                } else {
                    ele = ele.parentElement;
                }
            }
        },
        getNode: (index: number): HTMLElement => {
            return this.itemTemplate.extended.generateNode(this.source.rows[index]);
        },
    };

    Events = {
        onSourceUpdate: new CommonEvent<(counter: number) => void>(),
        itemDoubleClick: new CommonEvent<(index: number, evt: MouseEvent) => void>(),
        itemMouseDown: new CommonEvent<(index: number, evt: MouseEvent) => void>(),
        itemMouseUp: new CommonEvent<(index: number, evt: MouseEvent) => void>(),
        onClearContainer: new CommonEvent<() => void>(),
        currentItemIndexChange: new CommonEvent<(
            oldIndex: number,
            newIndex: number,
            evt: MouseEvent | KeyboardEvent,
            eventType: ItemIndexChangeBy
        ) => void>(),
        newItemGenerate: new CommonEvent<(itemnode: HTMLElement, index: number) => void>(),
        onListUISizeChanged: new CommonEvent<(rect: DOMRectReadOnly) => void>(),
        beforeOldItemRemoved: new CommonEvent<(itemHT: HTMLElement) => void>(),
        onRowNavigationChanged: (
            callback: (evt: KeyboardEvent, valToAddRemove: number) => void,
            event: KeyboardEvent,
            valToAddRemove: number
        ): void => {
            callback(event, valToAddRemove);
        },
        onReachLastRecord: (): boolean => {
            return false;
        },
        onReachFirstRecord: (): boolean => {
            return false;
        },
        onkeydown: (e: KeyboardEvent): void => { },
    };

    get currentRecord(): any {
        return this.source.rows[this.currentIndex];
    }

    get currentIndex(): number {
        return this.OPTIONS.SESSION.currentIndex;
    }

    set currentIndex(val: number) {
        this.setCurrentIndex(val);
    }

    set scrollerElement(val: HTMLElement) {
        if (val == undefined) return;
        if (this.resizeObsrv != undefined) this.resizeObsrv.disconnect();
        this.resizeObsrv = new window.ResizeObserver((pera) => {
            timeoutCall.start(() => {
                this.OPTIONS.listSize = pera[0].contentRect;
                this.Events.onListUISizeChanged.fire([pera[0].contentRect]);
            });
        });
        this.Records.scrollerElement = val;
        this.resizeObsrv.observe(val);
    }

    resizeObsrv: ResizeObserver;

    init(lstVw: HTMLElement, scrollerElement: HTMLElement, uc: Usercontrol): void {
        this.Records.lstVWEle = lstVw;
        this.source.onUpdate.on((cnt) => { this.Events.onSourceUpdate.fire([cnt]); });
        this.scrollerElement = scrollerElement;
        lstVw.addEventListener("dblclick", (e) => {
            let itm = this.Records.getItemFromChild(e.target as HTMLElement);
            if (itm != null) this.Events.itemDoubleClick.fire([this.currentIndex, e]);
        });

        scrollerElement.addEventListener("keydown", this.keydown_listner);
    }

    setCurrentIndex(val: number, evt?: MouseEvent | KeyboardEvent, eventType: ItemIndexChangeBy = 'Other'): void { }
    keydown_listner = (evt: KeyboardEvent): void => {
        this.Events.onkeydown(evt);
    };
}