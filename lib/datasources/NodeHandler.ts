import { CommonEvent } from "ucbuilder/global/commonEvent";
import { RowInfo, SourceIndexElementAttr, SourceManage } from "ucbuilder/lib/datasources/SourceManage";
import { SourceProperties } from "ucbuilder/lib/datasources/PropertiesHandler";
import { TemplateNode } from "ucbuilder/Template";
import { SourceScrollHandler } from "ucbuilder/lib/datasources/ScrollHandler";

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


    //calledToFill = false;
    public fill(): void {

        //if (this.calledToFill) return;
        this.source.ArrangingContents = true;
        // this.calledToFill = true;
        let chg = this.config;
        this.clearView();
        let ht: HTMLElement;
        let curIndex = chg.currentIndex;
        let len = chg.bottomIndex;
        // console.log(['fill',chg]);

        if (this.source.length == 0 || (!chg.infiniteHeight && chg.viewSize.height == 0)) {
            /*this.calledToFill = false; */return;
        }
        for (let index = chg.top; index <= len; index++) {
            ht = this.generate(index, true);
            //ht.style.display = 'block';
            if (index == curIndex)
                chg.currentIndex = index;
        }
        this.scrollbar.refreshScrollbarSilantly();
        // this.calledToFill = false;
    };


    generate(index: number, append: boolean = undefined): HTMLElement {

        let rInf = SourceManage.getRow(this.source[index]);
        //let hasSet = rInf.hasElementSet;
        let itemNode = this.source.generator.generateElement(rInf, append);
        //itemNode.element.style.display = 'block';
        if (rInf.isConnected) this.Events.OnComeViewArea.fire([rInf.element, index]);
        // if (hasSet != rInf.hasElementSet) this.Events.OnComeViewArea.fire([rInf.element, index]);
        return rInf.element;
    }
    clearView(): void {
        let src = this.source;
        let childs = this.container.children;
        for (let i = 0, len = childs.length; i < len; i++) {
            let row = this.getRowInfoFromChild(childs[i] as HTMLElement);
            if(row!=undefined)
            row.isConnected = false;
        }
        
        this.container.innerHTML = '';
        //for (let i = 0, len = src.length; i < len; i++)
        //    SourceManage.getRow(this.source[i]).element.style.display = 'none';
    };
    getRow(ele: HTMLElement) {
        return this.getRowInfoFromChild(this.getItemFromChild(ele));
    }
    getRowInfoFromChild(ele: HTMLElement): RowInfo<any> {
        return this.getItemFromChild(ele as HTMLElement)?.data(SourceIndexElementAttr);
    }
    getItemFromChild(ele: HTMLElement): HTMLElement {
        let _container = this.container;
        while (true) {
            if (ele == null || ele.parentElement == null) {
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