import { TemplateNode } from "ucbuilder/Template";
import { NodeHandler } from "ucbuilder/lib/datasources/NodeHandler";
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

    reload() {
        //let tpt = this.nodes.template;
        this.nodes.container.innerHTML = '';
        let fullsrc = this.source.category.FullSample;
        for (let i = 0, len = fullsrc.length; i < len; i++) {
            let r = this.generateRow(fullsrc[i]);
            r.elementIndex = i;
            //this.generateFull(fullsrc[i], i, tpt);
        }
        this.refresh();
        this.source.isLoaded = true;
    }
    generateRow(row: K): RowInfo<K> {
        let rowInfo = row[SourceManage.ACCESS_KEY] as RowInfo<K>;
        if (rowInfo == undefined) {
            rowInfo = new RowInfo<K>();
            rowInfo.row = row;
            row[SourceManage.ACCESS_KEY] = rowInfo;
        } 
        return rowInfo;
    }
    private generateFull(row: K, elementIndex: number = -1, tpt: TemplateNode = this.nodes.template) {
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
    private _measurement(rowInfo: RowInfo<K>) {
        let ele = rowInfo.element;
        let cmp = window.getComputedStyle(ele);
        rowInfo.height = Size.getFullHeight(cmp) || ele.offsetHeight;
        rowInfo.width = Size.getFullWidth(cmp) || ele.offsetWidth;
        rowInfo.hasMeasurement = true;
    }
    generateElement(rowInfo: RowInfo<K>, append:boolean = undefined): HTMLElement {
        let ele: HTMLElement;
        if (!rowInfo.hasElementSet) {
            ele = this.nodes.template.extended.generateNode(rowInfo.row);
            rowInfo.element = ele;
            rowInfo.hasElementSet = true;
            rowInfo.hasMeasurement = false;
            ele.setAttribute('x-tabindex', '' + rowInfo.elementIndex);
            ele.data(SourceIndexElementAttr, rowInfo);
            
        } else ele = rowInfo.element;
        if (append === undefined) { return ele; }
        if (append) this.nodes.container.append(ele);
        else this.nodes.container.prepend(ele);        
        if(!rowInfo.hasMeasurement)
            this._measurement(rowInfo);
        
        return rowInfo.element;
    }
    takeMeasurement(rowInfo: RowInfo<K>):RowInfo<K> {
        if (rowInfo.hasElementSet) {
            if (!rowInfo.hasMeasurement){
                let ele = rowInfo.element;
                let connected = ele.isConnected;
                if(!connected)
                    this.nodes.container.append(ele);
                this._measurement(rowInfo);
                if (!connected) ele.remove();
            }
        } else {
            let ele = this.generateElement(rowInfo, true);
            ele.remove();
        }
        return rowInfo;
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
        rowInfo.hasElementSet = true;
        newElement.setAttribute('x-tabindex', '' + rowInfo.elementIndex);
        this._measurement(rowInfo);
    }
    
    refresh(args:{setTabIndex?:boolean} = {setTabIndex:false}) {
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
            
            if(args.setTabIndex && rInfo.hasElementSet) rInfo.element.setAttribute('x-tabindex', '' + i);
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