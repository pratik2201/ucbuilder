import { controlOpt } from "ucbuilder/build/common";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { RootPathRow } from "ucbuilder/global/findAndReplace";
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
class HTMLCodeNode {
    content: string;
    hasContent: boolean = false;
    hasLoadedByPath: boolean;
    originalContent: string;
    path: string;
    load(original_content: string): boolean {
        let hasAlreadyLoaded = this.hasContent;
        if (original_content != undefined) {
            this.originalContent = original_content;
            this.hasContent = true;
            this.hasLoadedByPath = false;
            return hasAlreadyLoaded;
        }
    }
}
class StyleCodeNode {

    originalContent: string;
    styleHT: HTMLStyleElement;
    counter: number = 0;
    constructor() {
        this.styleHT = document.createElement("style");
        this.styleHT.type = "text/css";
        this.styleHT.setAttribute("rel", 'stylesheet');
    }
    private _content: string;
    public get content(): string {
        return this._content;
    }
    public set content(value: string) {
        this._content = value;
        if (this.styleHT == undefined) {
            this.styleHT = document.createElement("style");

            this.styleHT.type = "text/css";
            this.styleHT.setAttribute("rel", 'stylesheet');
        }
        this.styleHT.innerHTML = this._content;
        SourceNode.resourcesHT.appendChild(this.styleHT);
    }

}
export class SourceNode {
    isNewSource = true;
    counter = 0;
    get stamp(): string { return this.styler.TEMPLATE_STAMP_KEY; }
    get uniqStamp(): string { return this.styler.LOCAL_STAMP_KEY; }
    myObjectKey: string = "";
    accessKey: string = '';
    htmlCode: HTMLCodeNode = new HTMLCodeNode();
    styler: StylerRegs;
    onRelease = [] as (() => void)[]
    dataHT: HTMLElement;
    rootFilePath: string = '';
    root: RootPathRow;
    cssObj: { [key: string]: StyleCodeNode } = {};
    pushCSSByContent(key: string, cssContent: string, localNodeElement?: HTMLElement) {

        let csnd = this.cssObj[key];
        let ccontent = this.styler.parseStyleSeperator_sub({
            data: cssContent,
            localNodeElement: localNodeElement,
        })
        if (csnd == undefined) {
            let newcssCode: StyleCodeNode = new StyleCodeNode();
            newcssCode.originalContent = cssContent;
            newcssCode.content = ccontent;
            newcssCode.styleHT.setAttribute('a-key', key);
            this.cssObj[key] = newcssCode;
        }
    }
    pushCSS(cssFilePath: string, localNodeElement?: HTMLElement) {
        this.pushCSSByContent(
            cssFilePath,
            FileDataBank.readFile(cssFilePath, { /*replaceContentWithKeys: true*/ }),
            localNodeElement
        );
    }
    static resourcesHT: HTMLElement = document.createElement("programres");
    static init() {
        this.resourcesHT.setAttribute("stamp", 'program.stamp');
        document.body.appendChild(this.resourcesHT);
    }
    passElement = <A = HTMLElement | HTMLElement[]>(ele: A, options?: IPassElementOptions): { [xname: string]: HTMLElement } => {
        let option = Object.assign(Object.assign({}, PassElementOptions), options);
        let stamplist: string[] = [];
        let rtrn: { [xname: string]: HTMLElement } = {};
        let xnameAtrr = undefined;
        //let stmpTxt: string = this.stamp;
        let stmpUnq: string = this.uniqStamp;
        //if (this.cInfo.rootInfo == undefined)
        //    console.log(this.cInfo);
        let stmpRt = '' + this.root.id;
        let ar = controlOpt.getArray(ele);
        for (let i = 0, iObj = ar, ilen = iObj.length; i < ilen; i++) {
            const element: HTMLElement = iObj[i];
            if (!option.skipTopEle) {
                element.setAttribute(ATTR_OF.UC.ALL, stmpUnq + "_" + stmpRt);
                xnameAtrr = element.getAttribute(ATTR_OF.X_NAME);
                if (xnameAtrr != null && xnameAtrr.length > 0) {
                    let xctr = rtrn[xnameAtrr];
                    if (xctr == undefined)
                        rtrn[xnameAtrr] = element;
                    else {
                        if (xctr.getType() != 'Array') {
                            (xctr as any as HTMLElement[]).push(element);
                        } else {
                            rtrn[xnameAtrr] = [xctr] as any;
                        }
                    }

                }
            }

            //element.setAttribute(ATTR_OF.UC.PARENT_STAMP, stmpUnq); // stmpTxt i changed dont know why
            //element.setAttribute(ATTR_OF.UC.UNIQUE_STAMP, stmpUnq);
            //element.setAttribute(ATTR_OF.UC.ROOT_STAMP, stmpRt);
            if (option.applySubTree) {
                element.querySelectorAll("*")
                    .forEach((s) => {
                        s.setAttribute(ATTR_OF.UC.ALL, stmpUnq + "_" + stmpRt);
                        xnameAtrr = s.getAttribute(ATTR_OF.X_NAME);
                        if (xnameAtrr != null && xnameAtrr.length > 0) {
                            let xctr = rtrn[xnameAtrr];
                            if (xctr == undefined)
                                rtrn[xnameAtrr] = s as HTMLElement;
                            else {
                                if (xctr.getType() != 'Array') {
                                    (xctr as any as HTMLElement[]).push(s as HTMLElement);
                                } else {
                                    rtrn[xnameAtrr] = [xctr] as any;
                                }
                            }
                        }
                        //s.classList.add(...ATTR_OF.getParent(stmpUnq, stmpRt));
                        //s.setAttribute(ATTR_OF.UC.PARENT_STAMP, stmpUnq); // stmpTxt i changed dont know why
                        //s.setAttribute(ATTR_OF.UC.UNIQUE_STAMP, stmpUnq);
                        //s.setAttribute(ATTR_OF.UC.ROOT_STAMP, stmpRt);
                    });
            }
        }
        console.log(rtrn);

        return rtrn;
    }
    loadHTML(/*callback = (s: string) => s*/) {
        let htCode = this.htmlCode;
        htCode.content = this.styler.parseStyle(htCode.originalContent);
        //if (callback != undefined) htCode.content = callback(htCode.content);
        this.dataHT = htCode.content.$();
        this.styler.nodeName = this.dataHT.nodeName;
        this.dataHT.setAttribute(ATTR_OF.UC.ALL, this.uniqStamp);
        htCode.content = this.dataHT.outerHTML;
        if (!this.dataHT.hasAttribute('x-tabindex')) {
            this.dataHT.setAttribute('x-tabindex', '-1');
        }
        htCode.content = this.dataHT.outerHTML;
        htCode.content = htCode.content.PHP_ADD();//.replace(/<!--\?(=|php)(.*?)\?-->/gm, '<?$1$2?>');
    }
    release() {
        if (StampNode.deregisterSource(this.myObjectKey)) {
            let keys = Object.keys(this.cssObj);
            for (let i = 0, iObj = keys, ilen = iObj.length; i < ilen; i++)
                this.cssObj[iObj[i]].styleHT.remove();
            for (let i = 0, iObj = this.onRelease, ilen = iObj.length; i < ilen; i++)
                iObj[i]();

            this.dataHT =
                this.htmlCode = this.cssObj = undefined;
            delete StampNode.childs[this.myObjectKey];
        }
    }
}
export class StampNode {
    static dataHT: HTMLElement;
    static GetKey(key: string, alice: string) { return key + "@" + alice; }
    static childs: { [key: string]: SourceNode; } = {};
    static registerSoruce({ key, accessName = '', root, generateStamp = true }: {
        key: string, accessName?: string, root: RootPathRow,
        generateStamp?: boolean,
    }): SourceNode {

        let myObjectKey = key; //this.GetKey(key, alices);
        let rtrn: SourceNode = this.childs[myObjectKey];
        if (rtrn == undefined) {
            // console.log(['.....new',myObjectKey]);

            rtrn = new SourceNode();
            //rtrn.main = this;
            rtrn.root = root;
            rtrn.myObjectKey = myObjectKey;
            rtrn.accessKey = accessName;
            this.childs[myObjectKey] = rtrn;
            rtrn.styler = new StylerRegs(rtrn, generateStamp);
        } else rtrn.isNewSource = false;
        rtrn.counter++;
        //console.log([rtrn.counter,'open',myObjectKey]);
        return rtrn;
    }
    static deregisterSource(key: string): boolean {
        let result = false;
        let myObjectKey = key;
        let rtrn: SourceNode = this.childs[myObjectKey];
        if (rtrn != undefined) {
            rtrn.counter--;
            //console.log([rtrn.counter,'close',myObjectKey]);

            result = (rtrn.counter <= 0);
            console.log([rtrn.counter, 'removed', myObjectKey]);

        }
        return result;
    }
}

