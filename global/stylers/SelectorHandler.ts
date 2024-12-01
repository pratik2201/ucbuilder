
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
export interface HiddenScopeKVP{
    key: string,
    selector?: string,
    funcName?: string,
    value: string
}
export interface HiddenScopeNode {
    list:HiddenScopeKVP[],
    counter: number
}
export interface ScopeSelectorOptions {
    selectorText: string;
    scopeSelectorText?: string;
    parent_stamp: string;
    parent_stamp_value?: string;
    hiddens?: HiddenScopeNode
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
         scopeOpt = Object.assign(scopeSelectorOptions,scopeOpt );
        let counter = scopeOpt.hiddens.counter;
        let _this = this;
        if (scopeOpt.selectorText.includes('forms') /*&& sub.indexOf('◄◘') != -1*/) {
            // console.log(_this.main.children);
            debugger;
            if (counter == 0) {
                console.log([scopeOpt.parent_stamp,scopeOpt.parent_stamp_value,scopeOpt.scopeSelectorText]);
                console.log(this.main);
                
            }
 
             //debugger;
        }
        let oc = new openCloser();
        //let hiddens: {key:string,value:string}[] = []
        let rtrn = oc.doTask('(', ')', scopeOpt.selectorText, (selector, cssStyle, opened) => {
            if (opened > 1) {
                if (selector.endsWith(':has')) {
                    scopeOpt.selectorText = cssStyle;
                    let key = _this.KEY(scopeOpt.hiddens);
                    cssStyle = _this.parseScopeSeperator(scopeOpt);
                    scopeOpt.hiddens.list.push({ key: key, selector: cssStyle, funcName: 'has', value: '(' + cssStyle + ')' });
                    return selector + '' + key;
                } else {
                    return selector + '(' + cssStyle + ')';
                }
            }
            if (selector.endsWith(':has')) {
                //let n = Object.assign({}, scopeOpt);
                scopeOpt.selectorText = cssStyle;
                // let scss = cssStyle; // this.parseScopeSeperator_sub(n);
                let key = _this.KEY(scopeOpt.hiddens);
                scopeOpt.hiddens.list.push({ key: key, selector: cssStyle, funcName: 'has', value: '(' + cssStyle + ')' });
                return selector + '' + key;
            } else {
                return selector + '(' + cssStyle + ')';
            }

        });
        //let n = Object.assign({}, scopeOpt);
        scopeOpt.selectorText = rtrn;
        if (counter == 0) {
            rtrn = this.splitselector(rtrn, scopeOpt.hiddens);
            console.log(rtrn);
            
            scopeOpt.hiddens.list.length = 0;
            scopeOpt.hiddens.counter = 0;
        }

        let sub = this.parseScopeSeperator_sub(scopeOpt);
        console.log([sub,rtrn]);
        
        return rtrn;
    }
    KEY(hiddens: HiddenScopeNode) {
        hiddens.counter++;
        return '◄◘' + hiddens.counter + '◘▀';
    }
    splitselector(selector: string, hiddens: HiddenScopeNode):string {
        //console.log(selector, hiddens);     
        let splitted = selector.split(' ');
        let hasUcFound = false;
        let kvNode: HiddenScopeKVP;
        let _this = this;
        let nSelector = '';
        for (let i = 0, len = splitted.length; i < len; i++) {
            let sel = splitted[i];
            let matchs = sel.replace(/^in-(\w+)/gm, (s, ucName) => {
                let styler = _this.main.children.find(s => s.controlName === ucName);
                hasUcFound = (styler != undefined);
                if (hasUcFound) {
                    let nnode = `${styler.nodeName}[${ATTR_OF.UC.UC_STAMP}="${styler.uniqStamp}"]`;
                    let key = _this.KEY(hiddens);
                    kvNode = { key: key, value: nnode }
                    hiddens.list.push(kvNode);
                    return key;
                } else return s;
            });
            if (hasUcFound) {                
                splitted[i] = matchs;
                let nextSplitters = splitted.slice(i);
                let subSelector = nextSplitters.join(' ');
                let s = subSelector.replace(kvNode.key, '[SELF_]');
                console.log([...hiddens.list]);
                
                console.log(s);
                
               // console.log(splitted);
               // console.log(JSON.stringify(hiddens.list));
                hasUcFound = false;
            }
        }
        return splitted.join(' ');
        //scopeOpt = Object.assign(Object.assign({}, scopeSelectorOptions), scopeOpt);
        //return this.parseScopeSeperator_sub(scopeOpt);

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
