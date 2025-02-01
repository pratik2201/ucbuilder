import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { controlOpt, pathInfo } from "ucbuilder/build/common";
import { SourceOptions, StringExchangerCallback } from "ucbuilder/enumAndMore";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { StylerRegs } from "ucbuilder/lib/stylers/StylerRegs";
import { StampGenerator } from "ucbuilder/lib/samping/StampGenerator";
export interface IPassElementOptions {
    applySubTree?: boolean;
    skipTopEle?: boolean;
}
const PassElementOptions: IPassElementOptions = {
    applySubTree: true,
    skipTopEle: false
}
export class userControlStampRow {
    cInfo: codeFileInfo;
    get stamp(): string { return this.styler.TEMPLATE_STAMP_KEY; }
    get uniqStamp(): string { return this.styler.LOCAL_STAMP_KEY; }
    styler: StylerRegs;
    htmlContent: string = "";
    dataHT: HTMLElement;
    fUniq: string = "";
    isOurElement(ele: HTMLElement): boolean {
        return ele.getAttribute(ATTR_OF.UC.ALL).startsWith(this.uniqStamp);
    }
    passElement = <A = HTMLElement | HTMLElement[]>(ele: A, options?: IPassElementOptions): string[] => {
        let option = Object.assign(Object.assign({}, PassElementOptions), options);
        let stamplist: string[] = [];
        let stmpTxt: string = this.stamp;
        let stmpUnq: string = this.uniqStamp;
        //if (this.cInfo.rootInfo == undefined)
        //    console.log(this.cInfo);
        let stmpRt = '' + this.cInfo.rootInfo.id;
        let ar = controlOpt.getArray(ele);
        for(let i=0,iObj=ar,ilen=iObj.length   ;   i < ilen   ;   i++){ 
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
}
export class UserControlStamp {
    static source: userControlStampRow[] = [];

    /*static params:SourceOptions = {
        fInfo: undefined as codeFileInfo | undefined,
        reloadDesign: false,
        reloadKey: "",
        htmlContents: undefined as  | undefined,
        callmeBeforeContentAssign:StringExchangerCallback,
    }*/

    static getStamp(param0: SourceOptions, generateStamp = true): userControlStampRow {
        let rtrn: userControlStampRow | undefined = undefined;
        let lwrName: string = param0.cfInfo.html.rootPath.toLowerCase();
        let _StampGenerator = StampGenerator.generate({
            stampKeys: param0.cfInfo.html.rootPath,
            root: param0.cfInfo.rootInfo
        });
        _StampGenerator.generateSource(undefined, {});
        if (param0.templateName != "") lwrName += "@" + param0.templateName;
        let pathtofind: string = lwrName + "_" + param0.reloadKey;
        let sindex: number = this.source.findIndex(s => s.fUniq == pathtofind);
        if (sindex == -1) {
            rtrn = new userControlStampRow();
            rtrn.styler = new StylerRegs(param0.cfInfo.rootInfo, generateStamp);
            rtrn.fUniq = pathtofind;
            rtrn.cInfo = param0.cfInfo;
            if (param0.htmlContents != undefined) {
                rtrn.htmlContent = param0.htmlContents;
                this.reload(rtrn, param0.beforeContentAssign, param0);
            } else {
                rtrn.htmlContent = FileDataBank.readFile(param0.cfInfo.html.fullPath);
                this.reload(rtrn, param0.beforeContentAssign, param0);
            }
            this.source.push(rtrn);
        } else {
            if (param0.reloadDesign) {
                rtrn = this.source[sindex];
                rtrn.htmlContent =
                    param0.htmlContents != undefined ?
                        param0.htmlContents :
                        pathInfo.readFile(rtrn.cInfo.html.fullPath);
                this.reload(rtrn, param0.beforeContentAssign, param0);
            } else {
                rtrn = this.source[sindex];
                if (param0.beforeContentAssign != undefined) {
                    rtrn.htmlContent = param0.beforeContentAssign(rtrn.htmlContent);
                    rtrn.dataHT = rtrn.htmlContent.$();
                }
            }
        }
        return rtrn;
    }

    static reload(rtrn: userControlStampRow, callback: StringExchangerCallback, param0: SourceOptions) {
        /* rtrn.content = rtrn.content.replace(/^\s*<([\w\.:-]*?)([\S\s]*?)<\/\1>\s*$/g,
             (match: string, otag: string, contents: string, ctag: string) => {                
                 rtrn.styler.nodeName = otag;
                 let newNodeName: string = rtrn.styler.nodeName;
                 return `<${newNodeName} ${ATTR_OF.UC.ALL}="${rtrn.uniqStamp}"  ${contents}</${newNodeName}>`; //   x-tabindex="-1"
             });*/

        rtrn.htmlContent = rtrn.styler.parseStyle(rtrn.htmlContent);
        if (callback != undefined) rtrn.htmlContent = callback(rtrn.htmlContent);
        rtrn.dataHT = rtrn.htmlContent.$();
        rtrn.styler.nodeName = rtrn.dataHT.nodeName;
        rtrn.dataHT.setAttribute(ATTR_OF.UC.ALL, rtrn.uniqStamp);
        rtrn.htmlContent = rtrn.dataHT.outerHTML;
        if (!rtrn.dataHT.hasAttribute('x-tabindex')) {
            rtrn.dataHT.setAttribute('x-tabindex', '-1');
        }

        /*
        rtrn.content = rtrn.content.replace(/^\s*<([\w\.:-]*?)([\S\s]*?)<\/\1>\s*$/g,
            (match: string, otag: string, contents: string, ctag: string) => {                
                rtrn.styler.nodeName = otag;
                let newNodeName: string = rtrn.styler.nodeName;
                return `<${newNodeName} ${ATTR_OF.UC.ALL}="${rtrn.uniqStamp}"  ${contents}</${newNodeName}>`; //   x-tabindex="-1"
            });

        rtrn.content = rtrn.styler.parseStyle(rtrn.content);
        if (callback != undefined) rtrn.content = callback(rtrn.content);

        rtrn.dataHT = rtrn.content.$();
        //rtrn.dataHT.classList.add(ATTR_OF.getUc(rtrn.uniqStamp));
        if (!rtrn.dataHT.hasAttribute('x-tabindex')) {
            rtrn.dataHT.setAttribute('x-tabindex', '-1');
            rtrn.content = rtrn.dataHT.outerHTML;
        }*/

    }
}