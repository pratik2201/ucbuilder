import { TemplateNode } from "ucbuilder/Template";
import { GenerateMode, NodeHandler } from "ucbuilder/lib/datasources/NodeHandler";
import { SourceProperties } from "ucbuilder/lib/datasources/PropertiesHandler";
import { SourceScrollHandler } from "ucbuilder/lib/datasources/ScrollHandler";
import { RowInfo, SourceIndexElementAttr, SourceManage } from "ucbuilder/lib/datasources/SourceManage";
import { Size } from "ucbuilder/global/drawing/shapes";

export class RowGenerator<K> {
    source: SourceManage<K>;
    config: SourceProperties<K>;
    nodes: NodeHandler<K>;
    scrollbar: SourceScrollHandler<K>;

    constructor() { }
    init(src: SourceManage<K>) {
        this.source = src;
        this.source = src;
        this.config = src.info;
        this.scrollbar = src.scrollbar;
        this.nodes = src.nodes;
    }

    private _measurement(rowInfo: RowInfo<K>) {
        let ele = rowInfo.element;
        //let cmp = window.getComputedStyle(ele);
        /*let ch = Math.max(
            document.body.scrollHeight,
            document.body.clientHeight,
            document.body.offsetHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight,
            document.documentElement.clientHeight);*/
        let br = ele.getBoundingClientRect();
        rowInfo.height = /*Size.getFullHeight(cmp) ||*/ br.height;
        rowInfo.width = /*Size.getFullWidth(cmp) ||*/ br.width;
        rowInfo.hasMeasurement = true;
    }
    generateElement(rowInfo: RowInfo<K>, mode: GenerateMode = GenerateMode.dontGenerate, tarEle?: HTMLElement): HTMLElement {
        let ele: HTMLElement;
        rowInfo.isConnected = false;
        if (!rowInfo.hasElementSet) {
            ele = this.nodes.template.extended.generateNode(rowInfo.row);
            rowInfo.element = ele;
            rowInfo.hasElementSet = true;
            rowInfo.hasMeasurement = false;
            if(!rowInfo.isSelectable)ele.setAttribute('inert', 'true');
            ele.setAttribute('x-tabindex', '' + rowInfo.elementIndex);
            ele.data(SourceIndexElementAttr, rowInfo);
        } else ele = rowInfo.element;
        let cntnr = this.config.container;
        switch (mode) {
            case GenerateMode.dontGenerate: return ele;
            case GenerateMode.append: cntnr.append(ele); break;
            case GenerateMode.prepend: cntnr.prepend(ele); break;
            case GenerateMode.before: if (tarEle == undefined) return; tarEle.before(ele); break;
            case GenerateMode.after: if (tarEle == undefined) return; tarEle.after(ele); break;
        }
        /* if (append === undefined) { return ele; } //  if to not added to dom tree now
         if (append) cntnr.append(ele);
         else cntnr.prepend(ele);*/
        rowInfo.isConnected = true;
        if (!rowInfo.hasMeasurement)
            this._measurement(rowInfo);

        return rowInfo.element;
    }
    takeMeasurement(rowInfo: RowInfo<K>): RowInfo<K> {
        if (rowInfo.hasElementSet) {
            if (!rowInfo.hasMeasurement) {
                let ele = rowInfo.element;
                let connected = rowInfo.isConnected;//ele.isConnected;
                if (!connected)
                    this.config.container.append(ele);
                this._measurement(rowInfo);
                if (!connected) ele.remove();
            }
        } else {
            let ele = this.generateElement(rowInfo, GenerateMode.append);
            rowInfo.isConnected = false;
            ele.remove();
        }
        return rowInfo;
    }


    refresh(args: { setTabIndex?: boolean } = { setTabIndex: false }) {
        let src = this.source,
            akey = SourceManage.ACCESS_KEY,
            cfg = this.config;
        cfg.length = cfg.height = cfg.width = 0;
        if (src.length == 0) { return; }
        let w = 0, h = 0, rInfo: RowInfo<K>, prevRow: RowInfo<K>;
        // src.makeAllElementsCssDisplay();
        cfg.length = src.length;

        //debugger;
        for (let i = 0, ilen = cfg.length; i < ilen; i++) {
            let obj = src[i];
            rInfo = obj[akey];
            h += rInfo.height;
            //console.log(rInfo.hasElementSet);

            if (args.setTabIndex && rInfo.hasElementSet) rInfo.element.setAttribute('x-tabindex', '' + i);
            rInfo.index = i;
            //   console.log([rInfo.index,rInfo]);
            // if (rInfo.element!=undefined) { rInfo.element.setAttribute('x-tabindex', '' + i); // UNCOMANT THIS IF USE INERT FOR `DISPLAY NONE` ELMENTS
            rInfo.runningHeight = h;
            w = Math.max(w, rInfo.width);
            rInfo.prev = prevRow;
            if (i > 0) prevRow.next = rInfo;
            prevRow = rInfo;
        }
        cfg.height = h;
        cfg.width = w;
    }
}