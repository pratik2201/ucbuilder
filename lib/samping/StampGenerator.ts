import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { StylerRegs } from "ucbuilder/lib/stylers/StylerRegs";
export interface ISourceNode {
    cssContent: string;
    htmlContent: string;
    styler: StylerRegs;
}
export interface IStampNode {
    rootFilePath: string;
    childs: { [key: string]: ISourceNode; }
}
export class SourceNode implements ISourceNode {
    cssContent: string;
    htmlContent: string;
    styler: StylerRegs;
}
export class StampNode implements IStampNode {
    rootFilePath: string = '';
    childs: { [key: string]: SourceNode; } = {};
    generateSource(key: string = "primary", { htmlContent = undefined, cssContent = undefined }: {
        htmlContent: string,
        cssContent: string,
    }): SourceNode {
        let snode = this.childs[key];
        if (snode == undefined) {
            snode = new SourceNode();
            snode.styler = new StylerRegs(rootPathHandler.getInfo(this.rootFilePath),);
            snode.htmlContent = htmlContent;
            snode.cssContent = cssContent;
            this.childs[key] = snode;
        } else {
            snode.htmlContent = snode.htmlContent ?? htmlContent;
            snode.cssContent = snode.cssContent ?? cssContent;
        }
        return snode;
    }
}
export class StampGenerator {
    source: StampNode[] = [];
    generate(rootFilePath: string): StampNode {
        let rtrn = this.source.find(s => s.rootFilePath == rootFilePath);
        if (rtrn == undefined) {
            rtrn = new StampNode();
            rtrn.rootFilePath = rootFilePath;
        }
        return rtrn;
    }
}