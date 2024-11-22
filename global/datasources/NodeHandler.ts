import { CommonEvent } from "ucbuilder/global/commonEvent";
import { RowInfo, SourceIndexElementAttr, SourceManage } from "ucbuilder/global/datasources/SourceManage";
import { SourceProperties } from "ucbuilder/global/datasources/PropertiesHandler";
import { TemplateNode } from "ucbuilder/Template";
import { SourceScrollHandler } from "ucbuilder/global/datasources/ScrollHandler";

export class NodeHandler<K> {
    source: SourceManage<K>;
    config: SourceProperties<K>;
    scrollbar: SourceScrollHandler<K>;
    constructor() { }
    init(src: SourceManage<K>) {
        this.source = src;
        this.config = src.info;
        this.scrollbar = src.scrollbar;
    }
    Events = {
        onClearContainer: new CommonEvent<() => void>(),
        newItemGenerate: new CommonEvent<(itemnode: HTMLElement, index: number) => void>(),
        OnComeViewArea: new CommonEvent<(itemnode: HTMLElement, index: number) => void>(),
    }
    container: HTMLElement;


    calledToFill = false;
    public fill(): void {
        if (this.calledToFill) return;
        this.calledToFill = true;
        let chg = this.config;
        this.clearView();
        let ht: HTMLElement;
        let curIndex = chg.currentIndex;
        for (let index = chg.top, len = chg.bottomIndex; index <= len; index++) {
            ht = this.InView(index);
            //ht.style.display = 'block';
            if (index == curIndex)
                chg.currentIndex = index;
        }
        this.scrollbar.refreshScrollbarSilantly();
        this.calledToFill = false;
    };
    generateElement(index: number): { hasGenerated: boolean, element: HTMLElement } {
        let hasGenerated = false;
        let element: HTMLElement = undefined;
        let src = this.source;
        let obj = src[index];
        let row = src.getRowByObj(obj);

        if (row != undefined) {
            hasGenerated = false; //row.elementReplaceWith!=undefined;//row.isModified;
            element = hasGenerated ? this.getNode(index) : row.element;
            row.isModified = false;
            row.index = index;
            row.element = element;

        } else {
            // console.log('----NEW `RowInfo` ADDED----');
            console.warn('----NEW `RowInfo` ADDED----');
            element = this.getNode(index);
            hasGenerated = true;
            row = new RowInfo<K>();
            row.element = element;
            row.index = index;
            row.row = obj;
            src.setRow(index, row);
        }
        //
        row.element.data(SourceIndexElementAttr, row);

        //}
        ///console.log([hasGenerated, (this.config.top)]);
        //element.setAttribute('x-tabindex', '' + index);
        //element.setAttribute('x-tabindex', ''+(index - this.config.top));
        return {
            hasGenerated: hasGenerated,
            element: element
        }
    }

    InView(index: number, replaceNode: boolean = false): HTMLElement {
        let rInfo = SourceManage.getRow(this.source[index]);
        rInfo.element.style.display = 'block';
        return rInfo.element;
        //let itemNode = this.source.[index];
        /*let itemNode = this.generateElement(index);
        itemNode.element.style.display = 'block';
        if (itemNode.hasGenerated) this.Events.OnComeViewArea.fire([itemNode.element, index]);
        return itemNode.element;*/
    }
    clearView(): void {
        let src = this.source;
        for (let i = 0, len = src.length; i < len; i++)
            SourceManage.getRow(this.source[i]).element.style.display = 'none';
    };
    getRowInfoFromChild(ele: HTMLElement): RowInfo<any> {
        return this.getItemFromChild(ele).data(SourceIndexElementAttr);
    }
    getItemFromChild(ele: HTMLElement): HTMLElement {
        let _container = this.container;
        while (true) {
            if (ele.parentElement == null) {
                return null;
            } else if (_container.is(ele.parentElement)) {
                return ele;
            } else {
                ele = ele.parentElement;
            }
        }
    }
    template: TemplateNode;

    getNode(index: number): HTMLElement {
        return this.template.extended.generateNode(this.source[index]);
    }
}