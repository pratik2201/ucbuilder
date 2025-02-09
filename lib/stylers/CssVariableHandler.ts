import { patternList, StylerRegs, VariableList } from "ucbuilder/lib/stylers/StylerRegs";

export class CssVariableHandler {
    main: StylerRegs;
    constructor(main: StylerRegs) {
        this.main = main;
    }
    handlerVariable(rtrn: string): string {
        let _main = this.main;
        rtrn = rtrn.replace(
            patternList.varValuePrinterPattern,
            (match: string, varName: string, defaultVal: string) => {
                let ky: string = varName;//.toLowerCase();
                let scope: string = ky.charAt(1);
                let uniqId: string = StylerRegs.internalKey;
                //console.log(['printer',patternList.varValuePrinterPattern,varName,defaultVal,match]);

                switch (scope) {
                    case "g":
                        uniqId = '' + this.main.rootInfo;//_curRoot.id;
                        break;
                    case "t":
                        uniqId = _main.TEMPLATE_STAMP_KEY;
                        break;
                    case "l":
                        uniqId = _main.LOCAL_STAMP_KEY;
                        break;
                }
                return StylerRegs.__VAR.GETVALUE(
                    ky.substring(3).trim(),
                    uniqId,
                    scope,
                    defaultVal
                ) /*+ ';'*/;
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
                StylerRegs.__VAR.SETVALUE({ [key]: value }, uniqId, scope, tarEle);
                return '';
            }
        );
        return rtrn;
    }
    static __VAR = {
        getKeyName: (key: string, uniqId: string, code: string): string => {
            return `--${key}${uniqId}${code}`;
        },

        SETVALUE: (vlst: VariableList,/*key: string,*/ uniqId: string, code: string, /*value: string,*/ tarEle: HTMLElement = document.body): void => {
            let style = tarEle.style;
            for (const [key, value] of Object.entries(vlst)) {
                style.setProperty(this.__VAR.getKeyName(key, uniqId, code), value);
            }
            return;
        },

        GETVALUE: (key: string, uniqId: string, code: string, defaultVal: string): string => {
            return ` var(${this.__VAR.getKeyName(key, uniqId, code)},${defaultVal}) `;
        },
    };
}