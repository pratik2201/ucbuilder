import { TemplateNode } from "ucbuilder/Template";
import { NodeHandler } from "ucbuilder/global/datasources/NodeHandler";
import { SourceProperties } from "ucbuilder/global/datasources/PropertiesHandler";
import { SourceScrollHandler } from "ucbuilder/global/datasources/ScrollHandler";
import { RowInfo, SourceManage } from "ucbuilder/global/datasources/SourceManage";
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

    reload() {
        let tpt = this.nodes.template;
        this.nodes.container.innerHTML = '';
        let fullsrc = this.source.category.FullSample;
        for (let i = 0, len = fullsrc.length; i < len; i++) {
            this.generate(fullsrc[i], tpt, i);
        }
        this.refresh();
    }
    generate(row: K, tpt: TemplateNode, elementIndex: number = -1) {
        let rowInfo = row[SourceManage.ACCESS_KEY] as RowInfo<K>;
        if (rowInfo == undefined) {
            rowInfo = new RowInfo<K>();
            rowInfo.elementIndex = elementIndex;
            rowInfo.row = row;
            row[SourceManage.ACCESS_KEY] = rowInfo;
        }
        let genNode = tpt.extended.generateNode(row);
        this.replaceElement(genNode, rowInfo);
    }
    giveMeNewNode(row: K) {
        return this.nodes.template.extended.generateNode(row);
    }
    replaceElement(newElement: HTMLElement, rowInfo: RowInfo<K>) {
        if (rowInfo.element != undefined) {
            rowInfo.element.after(newElement);
            rowInfo.element.remove();
            rowInfo.element = newElement;
        } else {
            rowInfo.element = newElement;
            this.nodes.container.appendChild(newElement);
        }
        newElement.setAttribute('x-tabindex', '' + rowInfo.elementIndex);
        let cmp = window.getComputedStyle(newElement);
        rowInfo.height = Size.getFullHeight(cmp) || newElement.offsetHeight;
        rowInfo.width = Size.getFullWidth(cmp) || newElement.offsetWidth;
    }
    refresh() {
        let src = this.source,
            akey = SourceManage.ACCESS_KEY,
            cfg = this.config;
        cfg.length = cfg.height = cfg.width = 0;
        if (src.length == 0) { return; }
        let w = 0, h = 0, rInfo: RowInfo<K>, prevRow: RowInfo<K>;
        src.makeAllElementsCssDisplay();
        cfg.length = src.length;
        //debugger;
        for (let i = 0, ilen = cfg.length; i < ilen; i++) {
            let obj = src[i];
            rInfo = obj[akey];
            h += rInfo.height;
            rInfo.index = i;
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