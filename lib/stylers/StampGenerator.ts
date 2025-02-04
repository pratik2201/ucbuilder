import { controlOpt } from "ucbuilder/build/common";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { RootPathRow } from "ucbuilder/global/findAndReplace";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { StylerRegs } from "ucbuilder/lib/stylers/StylerRegs";
export interface IPassElementOptions {
    applySubTree?: boolean;
    skipTopEle?: boolean;
}
const PassElementOptions: IPassElementOptions = {
    applySubTree: true,
    skipTopEle: false
}
export interface ISourceNode {
    cssCode: CodeNode;
    htmlCode: CodeNode;
    styler: StylerRegs;
    myObjectKey?: string;
    main: StampNode;
}

interface ICodeNode {
    path: string;
    hasContent: boolean;
    hasLoadedByPath: boolean;
    originalContent: string;
    content: string;
}
export class CodeNode implements ICodeNode {
    content: string;
    hasContent: boolean = false;
    hasLoadedByPath: boolean;
    originalContent: string;
    path: string;
    //onContentLoaded: () => {};
    load({ path, content }: { path?: string, content?: string }): boolean {
        let hasAlreadyLoaded = this.hasContent;
        if (content != undefined) {
            this.originalContent = content;
            this.hasContent = true;
            this.hasLoadedByPath = false;
            // this.onContentLoaded();
            return hasAlreadyLoaded;
        }
        if (path != undefined) {
            this.originalContent = FileDataBank.readFile(path);
            this.hasContent = true;
            this.hasLoadedByPath = true;
            //   this.onContentLoaded();
            return hasAlreadyLoaded;
        }
    }
}
export class SourceNode implements ISourceNode {
    isNewSource = true;
    counter = 0;
    get stamp(): string { return this.styler.TEMPLATE_STAMP_KEY; }
    get uniqStamp(): string { return this.styler.LOCAL_STAMP_KEY; }
    myObjectKey: string = "";
    accessKey: string = '';
    cssCode: CodeNode = new CodeNode();
    htmlCode: CodeNode = new CodeNode();
    styler: StylerRegs;
    main: StampNode;
    dataHT: HTMLElement;
    styleHT: HTMLStyleElement;
    rootFilePath: string = '';
    root: RootPathRow;

    static resourcesHT: HTMLElement = document.createElement("programres");
    static init() {
        this.resourcesHT.setAttribute("stamp", 'program.stamp');
        document.body.appendChild(this.resourcesHT);
    }
    passElement = <A = HTMLElement | HTMLElement[]>(ele: A, options?: IPassElementOptions): string[] => {
        let option = Object.assign(Object.assign({}, PassElementOptions), options);
        let stamplist: string[] = [];
        let stmpTxt: string = this.stamp;
        let stmpUnq: string = this.uniqStamp;
        //if (this.cInfo.rootInfo == undefined)
        //    console.log(this.cInfo);
        let stmpRt = '' + this.root.id;
        let ar = controlOpt.getArray(ele);
        for (let i = 0, iObj = ar, ilen = iObj.length; i < ilen; i++) {
            const element: HTMLElement = iObj[i];
            if (!option.skipTopEle) {
                element.setAttribute(ATTR_OF.UC.ALL, stmpUnq + "_" + stmpRt);
            }
            //element.setAttribute(ATTR_OF.UC.PARENT_STAMP, stmpUnq); // stmpTxt i changed dont know why
            // element.setAttribute(ATTR_OF.UC.UNIQUE_STAMP, stmpUnq);
            //element.setAttribute(ATTR_OF.UC.ROOT_STAMP, stmpRt);
            if (option.applySubTree) {
                element.querySelectorAll("*")
                    .forEach((s) => {
                        s.setAttribute(ATTR_OF.UC.ALL, stmpUnq + "_" + stmpRt);
                        // s.classList.add(...ATTR_OF.getParent(stmpUnq, stmpRt));
                        //s.setAttribute(ATTR_OF.UC.PARENT_STAMP, stmpUnq); // stmpTxt i changed dont know why
                        // s.setAttribute(ATTR_OF.UC.UNIQUE_STAMP, stmpUnq);
                        //s.setAttribute(ATTR_OF.UC.ROOT_STAMP, stmpRt);
                    });
            }
        }
        return stamplist;
    }
    loadCSS() {
        if (this.styleHT != undefined) return;
        this.styleHT = document.createElement("style");
        this.styleHT.type = "text/css";
        this.styleHT.setAttribute("rel", 'stylesheet');
        /*this.styleHT.setAttribute("objKey", this.myObjectKey);
        this.styleHT.setAttribute("fUniq", this.uniqStamp);
        this.styleHT.setAttribute("stamp", this.stamp);*/
        this.styleHT.innerHTML = this.cssCode.content;
        SourceNode.resourcesHT.appendChild(this.styleHT);
    }
    loadHTML(callback = (s: string) => s) {
        this.htmlCode.content = this.styler.parseStyle(this.htmlCode.originalContent);
        if (callback != undefined) this.htmlCode.content = callback(this.htmlCode.content);
        this.dataHT = this.htmlCode.content.$();
        this.styler.nodeName = this.dataHT.nodeName;
        this.dataHT.setAttribute(ATTR_OF.UC.ALL, this.uniqStamp);
        this.htmlCode.content = this.dataHT.outerHTML;
        if (!this.dataHT.hasAttribute('x-tabindex')) {
            this.dataHT.setAttribute('x-tabindex', '-1');
        }
    }
    release() {
        if (StampNode.deregisterSource(this.myObjectKey)) {
            this.styleHT.remove();
            this.dataHT =
                this.cssCode =
                this.htmlCode =
                this.styleHT = undefined;

            delete StampNode.childs[this.myObjectKey];
        }
    }
}
export interface IStampArgs {
    stampKeys: string;
    alices?: string;
    root: RootPathRow;
    cssFilePath?: string;
    htmlFilePath?: string;
    cssContent?: string;
    htmlContent?: string;
}
export class StampNode {
    static main: StampGenerator;
    static dataHT: HTMLElement;
    static GetKey(key: string, alice: string) { return key + "@" + alice; }
    static childs: { [key: string]: SourceNode; } = {};
    static registerSoruce({ key, accessName = '', root }: {
        key: string, accessName?: string, root: RootPathRow
    }): SourceNode {
        let myObjectKey = key; //this.GetKey(key, alices);
        let rtrn: SourceNode = this.childs[myObjectKey];
        if (rtrn == undefined) {
            rtrn = new SourceNode();
            //rtrn.main = this;
            rtrn.styler = new StylerRegs(root,);
            rtrn.root = root;
            rtrn.myObjectKey = myObjectKey;
            rtrn.accessKey = accessName;
            this.childs[myObjectKey] = rtrn;
        } else rtrn.isNewSource = false;
        rtrn.counter++;
        //console.log([myObjectKey, rtrn.counter]);
        return rtrn;
    }
    static deregisterSource(key: string): boolean {
        let result = false;
        let myObjectKey = key;
        let rtrn: SourceNode = this.childs[myObjectKey];
        if (rtrn != undefined) {
            rtrn.counter--;
            result = (rtrn.counter == 0);
        }
        return result;
    }
    /*static generateHtml(): {
        hasContentExists: boolean,
        isUpdated: boolean,
        srcNode: SourceNode
    } {
        let rtrn: { isNew: boolean, hasHTMLContentExists: boolean, hasCSSContentExists: boolean, isHtmlUpdated: boolean, isCssUpdated: boolean, srcNode: SourceNode };
    }*/
    static generateSource(/*key: string = "", { htmlFilePath, cssFilePath, htmlContent, cssContent }: {
        htmlFilePath?: string,
        htmlContent?: string,
        cssFilePath?: string,
        cssContent?: string,
    }*/args: IStampArgs): { hasHTMLContentExists: boolean, hasCSSContentExists: boolean, isHtmlUpdated: boolean, isCssUpdated: boolean, srcNode: SourceNode } {
        let rtrn: { isNew: boolean, hasHTMLContentExists: boolean, hasCSSContentExists: boolean, isHtmlUpdated: boolean, isCssUpdated: boolean, srcNode: SourceNode };
        let mySourceKey = args.stampKeys + "@" + args.alices;
        rtrn = {
            isNew: true,
            isHtmlUpdated: false,
            hasHTMLContentExists: false,
            hasCSSContentExists: false,
            isCssUpdated: false,
            srcNode: this.childs[mySourceKey]
        };
        let hasHtml = args.htmlContent != undefined || args.htmlFilePath != undefined;
        let hasCss = args.cssContent != undefined || args.cssFilePath != undefined;
        if (rtrn.srcNode == undefined) {
            rtrn.isNew = true;
            rtrn.srcNode = new SourceNode();
            let srcn = rtrn.srcNode;
            srcn.styler = new StylerRegs(rootPathHandler.getInfo(srcn.rootFilePath),);
            srcn.main = this;
            if (hasHtml) {
                rtrn.hasHTMLContentExists = srcn.htmlCode.load({ content: args.htmlContent, path: args.htmlFilePath });
                rtrn.isHtmlUpdated = true;
            }
            if (hasCss) {
                rtrn.hasCSSContentExists = srcn.cssCode.load({ content: args.cssContent, path: args.cssFilePath });
                rtrn.isCssUpdated = true;
            }
            this.childs[mySourceKey] = srcn;
        } else {
            rtrn.isNew = false;
            let srcn = rtrn.srcNode;
            if (hasHtml) {
                rtrn.hasHTMLContentExists = srcn.htmlCode.load({ content: args.htmlContent, path: args.htmlFilePath });
                rtrn.isHtmlUpdated = true;
            }
            if (hasCss) {
                rtrn.hasCSSContentExists = srcn.cssCode.load({ content: args.cssContent, path: args.cssFilePath });
                rtrn.isCssUpdated = true;
            }
        }
        return rtrn;
    }

}

export class StampGenerator {
    static source: StampNode[] = [];
    static generate(args: IStampArgs): {
        stamp: StampNode,
        isNew: boolean
    } {
        let rtrn: {
            stamp: StampNode,
            isNew: boolean
        };
        /* rtrn = {
             stamp: undefined,
             isNew: true
         }
         rtrn.stamp = this.source.find(s => s.rootFilePath == args.stampKeys);
         rtrn.isNew = rtrn.stamp == undefined;
         if (rtrn.isNew) {
             let stmp = new StampNode();
             stmp = new StampNode();
             stmp.main = this;
             stmp.rootFilePath = args.stampKeys;
             stmp.root = args.root;
             this.source.push(stmp);
             rtrn.stamp = stmp;
         }*/
        //console.log(this.source);

        //console.log(UserControlStamp.source.length);
        return rtrn;
    }
}