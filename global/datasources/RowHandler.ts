import { TemplateNode } from "ucbuilder/Template";
import { NodeHandler } from "ucbuilder/global/datasources/NodeHandler";
import { SourceProperties } from "ucbuilder/global/datasources/PropertiesHandler";
import { SourceScrollHandler } from "ucbuilder/global/datasources/ScrollHandler";
import { RowInfo, SourceManage } from "ucbuilder/global/datasources/SourceManage";
import { Size } from "ucbuilder/global/drawing/shapes";

export class RowHandler<K> {
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


}