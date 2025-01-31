
import { openCloser } from "ucbuilder/global/openCloser";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { StylerRegs } from "ucbuilder/lib/stylers/StylerRegs";
import { RootPathRow } from "ucbuilder/global/findAndReplace";
export const scopeSelectorOptions: ScopeSelectorOptions = {
    selectorText: "",
    scopeSelectorText: "",
    //parent_stamp?: "",
    //parent_stamp_value?: undefined,
    root: undefined,
    isForRoot:false,
    hiddens: {
        root:undefined,
        list: {},
        isForRoot:false,
        counter: 0,
    }
};
export interface HiddenScopeKVP {
    [key: string]: {
        selector?: string,
        funcName?: string,
        value: string
    }
}
export interface HiddenScopeNode {
    list: HiddenScopeKVP,
    root: RootPathRow,
    isForRoot: boolean,scopeSelectorText?: string;
    counter: number
}
export interface ScopeSelectorOptions {
    selectorText: string;
    scopeSelectorText?: string;
    isForRoot:boolean,
    root:RootPathRow,
    hiddens?: HiddenScopeNode
}

export class SelectorHandler {
    main: StylerRegs;
    constructor(main:StylerRegs) {
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
        //return this.parseScopeSeperator_sub(scopeOpt)
       /* if (scopeOpt.selectorText === '[SELF_] mainContainer') {
            debugger;
        }*/
        scopeOpt = Object.assign(scopeSelectorOptions, scopeOpt);
        scopeOpt.hiddens.root = scopeOpt.root;
        scopeOpt.hiddens.scopeSelectorText = scopeOpt.scopeSelectorText;
        scopeOpt.hiddens.isForRoot = scopeOpt.isForRoot;
        if (scopeOpt.selectorText.trim() == '') return '';
        let counter = scopeOpt.hiddens.counter;
        let _this = this;
        let oldSelector = scopeOpt.selectorText;
        if (scopeOpt.selectorText.includes('forms') /*&& sub.indexOf('◄◘') != -1*/) {
            // console.log(_this.main.children);
           // debugger;
            if (counter == 0) {
                //console.log([scopeOpt.parent_stamp, scopeOpt.parent_stamp_value, scopeOpt.scopeSelectorText]);
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
                    scopeOpt.hiddens.list[key] = { selector: cssStyle, funcName: 'has', value: '(' + cssStyle + ')' };
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
                scopeOpt.hiddens.list[key] = { selector: cssStyle, funcName: 'has', value: '(' + cssStyle + ')' };
                return selector + '' + key;
            } else {
                return selector + '(' + cssStyle + ')';
            }

        });
        //let n = Object.assign({}, scopeOpt);
        scopeOpt.selectorText = rtrn;
        if (counter == 0) {
            rtrn = this.loopMultipleSelectors(rtrn, this.main, scopeOpt.hiddens);
            //console.log([oldSelector, rtrn]);
            scopeOpt.hiddens.list = {}
            scopeOpt.hiddens.counter = 0;
        }

        //let sub = this.parseScopeSeperator_sub(scopeOpt);
        // console.log([sub, rtrn]);

        return rtrn;
    }
    loopMultipleSelectors(selector: string, stylers: StylerRegs, hiddens: HiddenScopeNode): string {
        let selectors = selector.split(',');
        let rtrn = [];
        for (let i = 0, len = selectors.length; i < len; i++) {
            rtrn.push(this.splitselector(selectors[i], stylers, hiddens));
        }
        return rtrn.join(',');
    }
    KEY(hiddens: HiddenScopeNode) {
        hiddens.counter++;
        return '◄◘' + hiddens.counter + '◘▀';
    }
    splitselector(selector: string, styler: StylerRegs, hiddens: HiddenScopeNode): string {

        //console.log(selector, hiddens);     
        let splitted = selector.split(' ');
        let hasUcFound = false;
        let kvNode: string;
        let _this = this;
        let nSelector = '';
        for (let i = 0, len = splitted.length; i < len; i++) {
            let sel = splitted[i];
            let matchs = sel.replace(/^in-(\w+)/gm, (s, ucName) => {
                let sub_styler = _this.main.children.find(s => s.controlName === ucName);
                hasUcFound = (sub_styler != undefined);
                if (hasUcFound) {
                    styler = sub_styler;
                    let nnode = `${styler.nodeName}[WRAPPER="${styler.LOCAL_STAMP_KEY}"]`;
                    let key = _this.KEY(hiddens);
                    kvNode = key;
                    hiddens.list[kvNode] = { value: nnode };
                    return key;
                } else return s;
            });
            if (hasUcFound) {
                splitted[i] = matchs;
                let nextSplitters = splitted.slice(i);
                let subSelector = nextSplitters.join(' ');
                splitted[i] = this.splitselector(subSelector.replace(kvNode, '[SELF_]'), styler, hiddens);
                hasUcFound = false;
                splitted = splitted.slice(0, i + 1);
                break;

            } else {
                let ntext = splitted[i];
                ntext = ntext.replace(/◄◘(\d+)◘▀/gm, (r) => {
                    return '(' + _this.loopMultipleSelectors(hiddens.list[r].selector, styler, hiddens) + ')';
                });
                splitted[i] = ntext;
            }
        }
        splitted = splitted.filter(word => word !== "");
        let len = splitted.length;
        let fsel = '';
       
        if (hiddens.isForRoot) {
            fsel = splitted[len - 1];
            splitted[len - 1] = this.setStamp_shu_____(fsel,  '$', "_"+hiddens.root.id);  // ATTR_OF.UC.CLASS_ROOT+''+hiddens.root.id
        } else {
            fsel = splitted[0];
                   
            switch (len) {
                case 1:
                    if (fsel.startsWith('[SELF_]'))
                        splitted[0] = fsel.replace('[SELF_]',`WRAPPER[${ATTR_OF.UC.ALL}="${styler.LOCAL_STAMP_KEY}"]`);  //`WRAPPER.${ATTR_OF.UC.UC_STAMP+''+styler.uniqStamp}` 
                    else {
                    
                        splitted[0] = this.setStamp_shu_____(fsel,  '^', styler.LOCAL_STAMP_KEY+'_');  //ATTR_OF.UC.CLASS_PARENT+''+styler.uniqStamp
                    }
                    break;
                default:
                    if (fsel.startsWith('[SELF_]'))
                        splitted[0] = fsel.replace('[SELF_]',`WRAPPER[${ATTR_OF.UC.ALL}="${styler.LOCAL_STAMP_KEY}"]` );  //   // `WRAPPER.${ATTR_OF.UC.UC_STAMP+''+styler.uniqStamp}`
                    else {
                        fsel = splitted[len - 1];
                        splitted[len - 1] = this.setStamp_shu_____(fsel, '^', styler.LOCAL_STAMP_KEY + '_');  // ATTR_OF.UC.CLASS_PARENT+''+styler.uniqStamp
                    }
                    break;
            }
        }
       /* fsel = splitted[0];
        if (fsel.startsWith('[SELF_]')) {
            splitted[0] = fsel.replace('[SELF_]', `WRAPPER[${ATTR_OF.UC.UC_STAMP}="${styler.uniqStamp}"]`);
        } else {
            splitted[0] = `${fsel}`;//this.setStamp_shu_____(fsel, ATTR_OF.UC.UC_STAMP, styler.uniqStamp);
        }
        if (len > 1) {
            let fsel = splitted[len - 1];
            // splitted[len-1] = this.setStamp_shu_____(fsel, ATTR_OF.UC.PARENT_STAMP, styler.uniqStamp);
        }*/
       // console.log(hiddens.scopeSelectorText);
        
        splitted.unshift(hiddens.scopeSelectorText!=undefined?hiddens.scopeSelectorText:'');
        return splitted.join(' ');
        //scopeOpt = Object.assign(Object.assign({}, scopeSelectorOptions), scopeOpt);
        //return this.parseScopeSeperator_sub(scopeOpt);

    }
    setStamp_shu_____(selector, /*classes*/ regxInd:'^'|'$'='^', stampvalue) {
        let dbl: string[] = selector.split(/ *:: */);
        let sngl: string[] = dbl[0].split(/ *: */);
        //sngl[0] += `.${classes}`;
        sngl[0] += `[${ATTR_OF.UC.ALL}${regxInd}="${stampvalue}"]`;
        dbl[0] = sngl.join(":");
        return dbl.join("::");
    }

    // parseScopeSeperator_sub(scopeOpt: ScopeSelectorOptions): string {
    //     scopeOpt = Object.assign(Object.assign({}, scopeSelectorOptions), scopeOpt);
    //     let oldSelector = scopeOpt.selectorText;
    //     let _this = this;
    //     let _main = this.main;
    //     let rtrn: string = "";
    //     let changed: boolean = false;
    //     let trimedVal: string = "";
    //     let calltime: number = 0;
    //     let preText: string = "";
    //     let postText: string = "";
    //     let rVal: string = "";
    //     scopeOpt.selectorText.split(",").forEach((s: string) => {
    //         changed = false;
    //         trimedVal = s.trim();
    //         calltime = 0;
    //         if (trimedVal == "[SELF_]") {
    //             changed = true;
    //             calltime++;
    //             rVal = `${scopeOpt.scopeSelectorText} ${_main.nodeName}[${ATTR_OF.UC.UC_STAMP}="${_main.uniqStamp}"]`;  //UNIQUE_STAMP ,_main.stamp  <-- i changed dont know why
    //         } else {
    //             rVal = trimedVal.replace(
    //                 /\[SELF_]/gm,
    //                 (match: string, offset: any, input_string: string) => {
    //                     changed = true;
    //                     calltime++;
    //                     if (calltime == 1) {
    //                         if (trimedVal.startsWith("[SELF_]")) {
    //                             return `${scopeOpt.scopeSelectorText} [${ATTR_OF.UC.ALL}="${_main.uniqStamp}"]`;  //UNIQUE_STAMP ,_main.stamp  <-- i changed dont know why
    //                         } else {
    //                             preText = scopeOpt.scopeSelectorText + " ";
    //                             return `[${scopeOpt.parent_stamp}="${scopeOpt.parent_stamp_value}"]`;
    //                         }
    //                     } else {
    //                         preText = scopeOpt.scopeSelectorText;
    //                         return `[${scopeOpt.parent_stamp}="${scopeOpt.parent_stamp_value}"]`;
    //                     }
    //                     return match;
    //                 }
    //             );
    //         }
    //         if (!changed) {
    //             if (scopeOpt.parent_stamp_value != undefined) {
    //                 let dbl: string[] = trimedVal.split(/ *:: */);
    //                 let sngl: string[] = dbl[0].split(/ *: */);
    //                 sngl[0] += `[${scopeOpt.parent_stamp}="${scopeOpt.parent_stamp_value}"]`;
    //                 dbl[0] = sngl.join(":");
    //                 rVal = dbl.join("::");
    //             } else {
    //                 rVal = trimedVal;
    //             }
    //             preText = scopeOpt.scopeSelectorText + " ";
    //         }
    //         rtrn += preText + "" + rVal + "" + postText + ",";
    //     });

    //     rtrn = rtrn.slice(0, -1);
    //     console.log([oldSelector, rtrn]);

    //     return rtrn;
    // }
}
