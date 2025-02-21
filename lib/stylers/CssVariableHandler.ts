import { CSSVariableScopeSort, patternList, StylerRegs, VariableList } from "ucbuilder/lib/stylers/StylerRegs";
export class CssVariableHandler {
    static GetCombinedCSSVarName = (key: string, uniqId: string, code: CSSVariableScopeSort): string => {
        return `--${key}${uniqId}${code}`;
    }
    static GetCombinedCSSAnimationName = (key: string, uniqId: string, code: CSSVariableScopeSort): string => {
        return `anm${key}${uniqId}${code}`;
    }
    static SetCSSVarValue = (vlst: VariableList, uniqId: any, code: CSSVariableScopeSort, tarEle: HTMLElement = document.body): void => {
        let style = tarEle.style;
        for (const [key, value] of Object.entries(vlst)) {
            style.setProperty(this.GetCombinedCSSVarName(key, uniqId, code), value);
        }
        return;
    }

    static GetCSSVarValue = (key: string, uniqId: string, code: CSSVariableScopeSort, defaultVal: string): string => {
        return ` var(${this.GetCombinedCSSVarName(key, uniqId, code)},${defaultVal}) `;
    }
    GetCSSAnimationName = (animName: string) => {
        let r = animName.match(/^(\w)-(\w+)/i);
        let scope: CSSVariableScopeSort = '' as any;
        let name = animName;
        if (r == null) return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.LOCAL_STAMP_KEY, 'l');
        else {
            scope = r[1] as CSSVariableScopeSort;
            name = r[2];
            switch (scope) {
                case 'g': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.ROOT_STAMP_KEY, 'g');
                case 't': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.TEMPLATE_STAMP_KEY, 't');
                case 'l': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.LOCAL_STAMP_KEY, 'l');
                default: return animName;
            }
        }
    }
    main: StylerRegs;
    constructor(main: StylerRegs) {
        this.main = main;
    }
    handlerVariable(rtrn: string): string {
        let _this = this;
        let _main = this.main;

        //   /(\$[lgit]-\w+)((?:\s*\:\s*(.*?)\s*;)|(?:\s+(.+?)\s*--)|\s*)/gim
        rtrn = rtrn.replace(patternList.varHandler,
            (match: string, fullVarName: string, defaultVal: string) => {
                //console.log([match, fullVarName, defaultVal]);
                let ky: string = fullVarName;//.toLowerCase();
                let scope = ky.charAt(1) as CSSVariableScopeSort;
                let varName = ky.substring(3).trim()
                let uniqId: string = StylerRegs.internalKey;
                let isPrintWithEmptyValue = defaultVal.length == 0;
                let isPrintWithDefaultValue = defaultVal.endsWith('--');
                let isSettingValue = defaultVal.charAt(0) == ':' && defaultVal.slice(-1) == ';';
                if (isPrintWithEmptyValue || isPrintWithDefaultValue) { // GET VALUE 
                    if (isPrintWithDefaultValue) {
                        defaultVal = defaultVal._trimText('--');
                        defaultVal = _this.handlerVariable(defaultVal);
                    }
                    switch (scope) {
                        case "g": uniqId = '' + _main.ROOT_STAMP_KEY; break;
                        case "t": uniqId = _main.TEMPLATE_STAMP_KEY; break;
                        case "l": uniqId = _main.LOCAL_STAMP_KEY; break;
                    }
                    return CssVariableHandler.GetCSSVarValue(
                        varName,
                        uniqId,
                        scope,
                        defaultVal
                    );
                } else if (isSettingValue) { // SET VALUE
                    let tarEle: HTMLElement = undefined;
                    defaultVal = defaultVal._trimText(':').trimText_(';');
                    defaultVal = _this.handlerVariable(defaultVal);
                    switch (scope) {
                        case "g": uniqId = '' + this.main.rootInfo.id; break;
                        case "t":
                            uniqId = _main.TEMPLATE_STAMP_KEY;
                            tarEle = _main.wrapperHT;
                            break;
                        case "l":
                            uniqId = _main.LOCAL_STAMP_KEY;
                            tarEle = _main.wrapperHT;
                            break;
                        default: return match;
                    }
                    let key = varName;
                    CssVariableHandler.SetCSSVarValue({ [key]: defaultVal }, uniqId, scope, tarEle);
                    return '';
                }
                //console.log(scope, varName, defaultVal);
                return match;
            });
        /*
        rtrn = rtrn.replace(
            patternList.varValuePrinterPattern,
            (match: string, varName: string, defaultVal: string) => {
                let ky: string = varName;//.toLowerCase();
                let scope = ky.charAt(1) as CSSVariableScopeSort;
                let uniqId: string = StylerRegs.internalKey;
                //console.log(['printer',patternList.varValuePrinterPattern,varName,defaultVal,match]);
    
                switch (scope) {
                    case "g":
                        uniqId = '' + this.main.rootInfo.id;//_curRoot.id;
                        break;
                    case "t":
                        uniqId = _main.TEMPLATE_STAMP_KEY;
                        break;
                    case "l":
                        uniqId = _main.LOCAL_STAMP_KEY;
                        break;
                }
                return this.main.__VAR.GETVALUE(
                    ky.substring(3).trim(),
                    uniqId,
                    scope,
                    defaultVal
                );
            }
        );
        rtrn = rtrn.replace(
            patternList.varValueGetterPattern,
            (match: string, varName: string, value: string) => {
                //  console.log(['getter',varName,value,match]);
    
                let ky: string = varName;//.toLowerCase();
                let scope: string = ky.charAt(1);
                let uniqId: string = StylerRegs.internalKey;
                let tarEle: HTMLElement = undefined;
                // debugger;
                switch (scope) {
                    case "g":
                        uniqId = '' + this.main.rootInfo.id;//_curRoot.id;
                        break;
                    case "t":
                        uniqId = _main.TEMPLATE_STAMP_KEY;
                        tarEle = _main.wrapperHT;
                        break;
                    case "l":
                        uniqId = _main.LOCAL_STAMP_KEY;
                        tarEle = _main.wrapperHT;
                        break;
                    default: return match;
                }
                let key = ky.substring(3).trim();
                this.main.__VAR.SETVALUE({ [key]: value }, uniqId, scope, tarEle);
                return '';
            }
        );*/
        return rtrn;
    }

    // __VAR = {
    //     getKeyName: (key: string, uniqId: string, code: CSSVariableScopeSort): string => {
    //         return `--${key}${uniqId}${code}`;
    //     },

    //     SETVALUE: (vlst: VariableList, uniqId: string, code: CSSVariableScopeSort, tarEle: HTMLElement = document.body): void => {
    //         let style = tarEle.style;
    //         for (const [key, value] of Object.entries(vlst)) {
    //             style.setProperty(this.__VAR.getKeyName(key, uniqId, code), value);
    //         }
    //         return;
    //     },

    //     GETVALUE: (key: string, uniqId: string, code: CSSVariableScopeSort, defaultVal: string): string => {
    //         return ` var(${this.__VAR.getKeyName(key, uniqId, code)},${defaultVal}) `;
    //     },
    // };
    // static __VAR = {
    //     getKeyName: (key: string, uniqId: string, code: string): string => {
    //         return `--${key}${uniqId}${code}`;
    //     },

    //     SETVALUE: (vlst: VariableList,/*key: string,*/ uniqId: string, code: string, /*value: string,*/ tarEle: HTMLElement = document.body): void => {
    //         let style = tarEle.style;
    //         for (const [key, value] of Object.entries(vlst)) {
    //             style.setProperty(this.__VAR.getKeyName(key, uniqId, code), value);
    //         }
    //         return;
    //     },

    //     GETVALUE: (key: string, uniqId: string, code: string, defaultVal: string): string => {
    //         return ` var(${this.__VAR.getKeyName(key, uniqId, code)},${defaultVal}) `;
    //     },
    // };
}