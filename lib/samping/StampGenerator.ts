import { RootPathRow } from "ucbuilder/global/findAndReplace";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { StylerRegs } from "ucbuilder/lib/stylers/StylerRegs";
import { UserControlStamp } from "ucbuilder/lib/UserControlStamp";
export interface ISourceNode {
    cssContent: string;
    htmlContent: string;
    styler: StylerRegs;
    main: StampNode;
}
export interface IStampNode {
    rootFilePath: string;
    main: StampGenerator;
    childs: { [key: string]: ISourceNode; }
}
export class SourceNode implements ISourceNode {
    cssContent: string;
    main: StampNode;
    htmlContent: string;
    styler: StylerRegs;
}
export class StampNode implements IStampNode {
    rootFilePath: string = '';
    main: StampGenerator;
    root: RootPathRow;
    dataHT: HTMLElement;
    childs: { [key: string]: SourceNode; } = {};
    generateSource(key: string = "", { htmlContent = undefined, cssContent = undefined }: {
        htmlContent?: string,
        cssContent?: string,
    }): SourceNode {
        let snode = this.childs[key];
        if (snode == undefined) {
            snode = new SourceNode();
            snode.styler = new StylerRegs(rootPathHandler.getInfo(this.rootFilePath),);
            snode.htmlContent = htmlContent;
            snode.main = this;
            snode.cssContent = cssContent;
            this.childs[key] = snode;
        } else {
            snode.htmlContent = snode.htmlContent ?? htmlContent;
            snode.cssContent = snode.cssContent ?? cssContent;
        }
        
        return snode;
    }
}
export interface IStampArgs{
    stampKeys: string;
    alices?: string;
    root: RootPathRow;
    cssFilePath?: string;
    htmlFilePath?: string;
    cssContent?: string;
    htmlContent?: string;
}
export class StampGenerator {
    static source: StampNode[] = [];
    static generate(args: IStampArgs): StampNode {
        let rtrn = this.source.find(s => s.rootFilePath == args.stampKeys);
        if (rtrn == undefined) {
            rtrn = new StampNode();
            rtrn.main = this;
            rtrn.rootFilePath = args.stampKeys;
            rtrn.root = args.root;            
            this.source.push(rtrn);
        }
        //console.log(this.source);
       
        //console.log(UserControlStamp.source.length);
        return rtrn;
    }
}