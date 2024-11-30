
import { openCloser } from "ucbuilder/global/openCloser";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { StylerRegs } from "ucbuilder/global/stylers/StylerRegs";
export const scopeSelectorOptions: ScopeSelectorOptions = {
    selectorText: "",
    scopeSelectorText: "",
    parent_stamp: "",
    parent_stamp_value: undefined,
    hiddens: {
        list: [],
        counter: 0,
    }
};

export interface ScopeSelectorOptions {
    selectorText: string;
    scopeSelectorText?: string;
    parent_stamp: string;
    parent_stamp_value?: string;
    hiddens?: {
        list: { key: string, value: string }[],
        counter: number
    }
}

export class SelectorHandler {
    main: StylerRegs;
    constructor(main) {
        this.main = main;
    }
    giveContents(contents) {
        let oc = new openCloser();
        let rtrn = oc.doTask('(', ')', contents, (selector, cssStyle, opened) => {
            if (opened > 1) {
                if (selector.endsWith(':has')) {
                    cssStyle = this.giveContents(cssStyle);
                } else {
                    return selector + '(' + cssStyle + ')';
                }
            }
            if (selector.endsWith(':has')) {
                return selector + '<' + cssStyle + '>';
            } else {
                return selector + '(' + cssStyle + ')';
            }

        });
        return rtrn;
    }
    parseScopeSeperator(scopeOpt: ScopeSelectorOptions): string {
        scopeOpt = Object.assign(Object.assign({}, scopeSelectorOptions), scopeOpt);
        let _this = this;
        if (scopeOpt.selectorText.includes('forms') /*&& sub.indexOf('◄◘') != -1*/) {
            console.log(_this.main.children);
            
            debugger;
        }
        let oc = new openCloser();
        //let hiddens: {key:string,value:string}[] = []
        let rtrn = oc.doTask('(', ')', scopeOpt.selectorText, (selector, cssStyle, opened) => {
            if (opened > 1) {
                if (selector.endsWith(':has')) {           
                    let s = Object.assign({}, scopeOpt);
                    s.selectorText = cssStyle;
                    console.log(cssStyle);
                    let scss = _this.parseScopeSeperator(s);
                    scopeOpt.hiddens.counter++;
                    let key = '◄◘' + scopeOpt.hiddens.counter + '◘▀';
                    scopeOpt.hiddens.list.push({ key: key, value: '(' + scss + ')' });
                    return selector + '' + key;
                } else {
                    return selector + '(' + cssStyle + ')';
                }
            }
            if (selector.endsWith(':has')) {
                let scss = this.splitselector({
                    selectorText: cssStyle,
                    scopeSelectorText: scopeOpt.scopeSelectorText,
                    parent_stamp: scopeOpt.parent_stamp,
                    parent_stamp_value: scopeOpt.parent_stamp_value,
                });
                scopeOpt.hiddens.counter++;
               // debugger;
                let key = '◄◘' + scopeOpt.hiddens.counter + '◘▀';
                scopeOpt.hiddens.list.push({ key: key, value: '(' + scss + ')' });
                return selector + '' + key;
            } else {
                return selector + '(' + cssStyle + ')';
            }

        });
      //  console.log(rtrn);
        let sub = this.parseScopeSeperator_sub({
            selectorText: rtrn,
            scopeSelectorText: scopeOpt.scopeSelectorText,
            parent_stamp: scopeOpt.parent_stamp,
            parent_stamp_value: scopeOpt.parent_stamp_value,
        });
        
       for (let i = 0,len = scopeOpt.hiddens.list.length; i < len; i++) {
        const row = scopeOpt.hiddens.list[i];
        sub = sub.replace(row.key, row.value);
        }
        scopeOpt.hiddens.list.length = 0;
        scopeOpt.hiddens.counter = 0;
        /*let sub = this.parseScopeSeperator_sub({
            selectorText: scopeOpt.selectorText,
            scopeSelectorText: scopeOpt.scopeSelectorText,
            parent_stamp: scopeOpt.parent_stamp,
            parent_stamp_value: scopeOpt.parent_stamp_value,
        });*/
        return sub;
    }
    splitselector(scopeOpt: ScopeSelectorOptions) {
        scopeOpt = Object.assign(Object.assign({}, scopeSelectorOptions), scopeOpt);
        return this.parseScopeSeperator_sub(scopeOpt);

    }
    parseScopeSeperator_sub(scopeOpt: ScopeSelectorOptions): string {
        scopeOpt = Object.assign(Object.assign({}, scopeSelectorOptions), scopeOpt);
        let _this = this;
        let _main = this.main;
        let rtrn: string = "";
        let changed: boolean = false;
        let trimedVal: string = "";
        let calltime: number = 0;
        let preText: string = "";
        let postText: string = "";
        let rVal: string = "";
        //if (selectorText.startsWithI('[SELF_]:focus-within title-text')) debugger;
        scopeOpt.selectorText.split(",").forEach((s: string) => {
            changed = false;
            trimedVal = s.trim();
            calltime = 0;
            if (trimedVal == "[SELF_]") {
                changed = true;
                calltime++;
                rVal = `${scopeOpt.scopeSelectorText} ${_main.nodeName}[${ATTR_OF.UC.UC_STAMP}="${_main.uniqStamp}"]`;  //UNIQUE_STAMP ,_main.stamp  <-- i changed dont know why
            } else {
                //  console.log(trimedVal);
               // console.log(trimedVal.split(' '));

                // trimedVal.split(' ').forEach((val) => {
                //   changed = true;
                //   calltime++;
                //   console.log(val);

                //   if (calltime == 1) {
                //     /*if (trimedVal.startsWith("[SELF_]")) {
                //       return `${scopeSelectorText} ${_main.nodeName}[${ATTR_OF.UC.UC_STAMP}="${_main.uniqStamp}"]`; 
                //     }*/
                //   }
                // })
                rVal = trimedVal.replace(
                    /\[SELF_]/gm,
                    (match: string, offset: any, input_string: string) => {
                        changed = true;
                        calltime++;

                        /*if (trimedVal == "[SELF_]") {
                          return `${scopeSelectorText} ${_main.nodeName}[${ATTR_OF.UC.UC_STAMP}="${_main.uniqStamp}"]`;  //UNIQUE_STAMP ,_main.stamp  <-- i changed dont know why
                        } else {*/
                        if (calltime == 1) {
                            if (trimedVal.startsWith("[SELF_]")) {
                                return `${scopeOpt.scopeSelectorText} [${ATTR_OF.UC.UC_STAMP}="${_main.uniqStamp}"]`;  //UNIQUE_STAMP ,_main.stamp  <-- i changed dont know why
                            } else {
                                preText = scopeOpt.scopeSelectorText + " ";
                                return `[${scopeOpt.parent_stamp}="${scopeOpt.parent_stamp_value}"]`;
                            }
                        } else {
                            preText = scopeOpt.scopeSelectorText;
                            return `[${scopeOpt.parent_stamp}="${scopeOpt.parent_stamp_value}"]`;
                        }
                        /*}*/
                        return match;
                    }
                );
            }
            if (!changed) {
                if (scopeOpt.parent_stamp_value != undefined) {
                    let dbl: string[] = trimedVal.split(/ *:: */);
                    let sngl: string[] = dbl[0].split(/ *: */);
                    sngl[0] += `[${scopeOpt.parent_stamp}="${scopeOpt.parent_stamp_value}"]`;
                    dbl[0] = sngl.join(":");
                    rVal = dbl.join("::");
                } else {
                    rVal = trimedVal;
                }
                preText = scopeOpt.scopeSelectorText + " ";
            }
            rtrn += preText + "" + rVal + "" + postText + ",";
        });

        rtrn = rtrn.slice(0, -1);
        return rtrn;
    }
}
