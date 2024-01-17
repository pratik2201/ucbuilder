import { codeFileInfo } from "@ucbuilder:/build/codeFileInfo";
import { pathInfo, controlOpt } from "@ucbuilder:/build/common";
import { sourceOptions,SourceOptions, StringExchangerCallback } from "@ucbuilder:/enumAndMore";
import { FileDataBank } from "@ucbuilder:/global/fileDataBank";
import { ATTR_OF } from "@ucbuilder:/global/runtimeOpt";
import { stylerRegs } from "@ucbuilder:/global/stylerRegs";

export class userControlStampRow {
    cInfo: codeFileInfo;
    get stamp(): string { return this.styler.stamp; }
    get uniqStamp(): string { return this.styler.uniqStamp; }
    styler: stylerRegs;
    content: string = "";
    dataHT: HTMLElement;
    fUniq: string = "";

    isOurElement(ele: HTMLElement): boolean {
        return ele.getAttribute(ATTR_OF.UC.UNIQUE_STAMP) == this.uniqStamp;
    }

    passElement = (ele: HTMLElement, applySubTree: boolean = true): string[] => {
        let stamplist: string[] = [];
        let stmpTxt: string = this.stamp;
        let stmpUnq: string = this.uniqStamp;
        if (this.cInfo.rootInfo == undefined)
            console.log(this.cInfo);
        let stmpRt = ''+this.cInfo.rootInfo.id;
        let ar: NodeListOf<HTMLElement> = ele.querySelectorAll("*");
        for (let index = 0; index < ar.length; index++) {
            let element: HTMLElement = ar[index];
            element.setAttribute(ATTR_OF.UC.PARENT_STAMP, stmpTxt);
            element.setAttribute(ATTR_OF.UC.UNIQUE_STAMP, stmpUnq);
            element.setAttribute(ATTR_OF.UC.ROOT_STAMP, stmpRt);
            if (applySubTree) {
                element.querySelectorAll("*")
                    .forEach((s) => {
                        s.setAttribute(ATTR_OF.UC.PARENT_STAMP, stmpTxt);
                        s.setAttribute(ATTR_OF.UC.UNIQUE_STAMP, stmpUnq);
                        s.setAttribute(ATTR_OF.UC.ROOT_STAMP, stmpRt);
                    });
            }
        }
        return stamplist;
    }
}
export class userControlStamp {
    static stampNo: number = 0;
    static source: userControlStampRow[] = [];
    static stampCallTimes: number = 0;
    /*static params:SourceOptions = {
        fInfo: undefined as codeFileInfo | undefined,
        reloadDesign: false,
        reloadKey: "",
        htmlContents: undefined as  | undefined,
        callmeBeforeContentAssign:StringExchangerCallback,
    }*/

    static getStamp(param0: SourceOptions): userControlStampRow {
        this.stampCallTimes++;
        let rtrn: userControlStampRow | undefined = undefined;
        let lwrName: string = param0.cfInfo.html.rootPath.toLowerCase();
        if (param0.templateName != "") lwrName += "@" + param0.templateName;
        let pathtofind: string = lwrName + "_" + param0.reloadKey;
        let sindex: number = this.source.findIndex(s => s.fUniq == pathtofind);
        if (sindex == -1) {
            this.stampNo++;
            rtrn = new userControlStampRow();
            rtrn.styler = new stylerRegs(param0.cfInfo.rootInfo, true);
            rtrn.fUniq = pathtofind;
            rtrn.cInfo = param0.cfInfo;
            if (param0.htmlContents != undefined) {
                rtrn.content = param0.htmlContents;
                this.reload(rtrn, param0.beforeContentAssign, param0);
            } else {
                rtrn.content = FileDataBank.readFile(param0.cfInfo.html.rootPath);
                this.reload(rtrn, param0.beforeContentAssign, param0);
            }
            this.source.push(rtrn);
        } else {
            if (param0.reloadDesign) {
                rtrn = this.source[sindex];
                rtrn.content = param0.htmlContents != undefined ? param0.htmlContents : pathInfo.readFile(rtrn.cInfo.html.path);
                this.reload(rtrn, param0.beforeContentAssign, param0);
            } else {
                rtrn = this.source[sindex];
                if (param0.beforeContentAssign != undefined) {
                    rtrn.content = param0.beforeContentAssign(rtrn.content);
                    rtrn.dataHT = rtrn.content.$();
                }
            }
        }
        return rtrn;
    }
    
    static reload(rtrn: userControlStampRow, callback: StringExchangerCallback, param0: SourceOptions) {
        rtrn.content = rtrn.content.replace(/^\s*<([\w\.:-]*?)([\S\s]*?)<\/\1>\s*$/g,
            (match: string, otag: string, contents: string, ctag: string) => {
                switch (param0.nodeNameAs) {
                    case 'targetElement': rtrn.styler.nodeName = param0.targetElementNodeName; break;
                    case 'wrapper': rtrn.styler.nodeName = otag; break;
                }
                let newNodeName: string = rtrn.styler.nodeName;
                return `<${newNodeName} ${ATTR_OF.UC.UC_STAMP}="${rtrn.stamp}" x-tabindex="-1" ${contents}</${newNodeName}>`;
            });

        rtrn.content = rtrn.styler.parseStyle(rtrn.content);
        if (callback != undefined) rtrn.content = callback(rtrn.content);
        rtrn.dataHT = rtrn.content.$();

        if (!rtrn.dataHT.hasAttribute('x-allowtabindex'))
            rtrn.dataHT.setAttribute('x-allowtabindex', '0');
    }
}