
import { openCloser } from "ucbuilder/global/openCloser";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { patternList, StylerRegs, StyleSeperatorOptions } from "ucbuilder/global/stylers/StylerRegs";
import { RootPathRow } from "ucbuilder/global/findAndReplace";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
export const scopeSelectorOptions: ScopeSelectorOptions = {
    selectorText: "",
    scopeSelectorText: "",
    parent_stamp: "",
    parent_stamp_value: undefined,
    root: undefined,
    isForRoot: false,
    hiddens: {
        root: undefined,
        list: {},
        isForRoot: false,
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
    isForRoot: boolean, scopeSelectorText?: string;
    counter: number
}
export interface ScopeSelectorOptions {
    selectorText: string;
    scopeSelectorText?: string;
    parent_stamp: string;
    parent_stamp_value?: string;
    isForRoot: boolean,
    root: RootPathRow,
    hiddens?: HiddenScopeNode
}
export class RootAndExcludeHandler {
    main: StylerRegs;
    constructor(main: StylerRegs) {
        this.main = main;
    }
    rootExcludePattern: RegExp;
    checkRoot(selectorText: string, styleContent: string, _params: StyleSeperatorOptions):string[] {
        if (selectorText.match(patternList.rootExcludePattern) == null) return [];
       // debugger;
        let changed = false;
        let _this = this;
        let externalStyles: string[] = [];
        let selectors = selectorText.split(",");
        for (let i = 0; i < selectors.length; i++) {
            const pselctor = selectors[i];
            pselctor.trim().replace(
                patternList.rootExcludePattern,
                (match: string, rootAlices: string, nmode: string) => {

                    switch (nmode) {
                        case ":root":
                            if (rootAlices == undefined || rootAlices == '') {
                                changed = true;
                                externalStyles.push(
                                    _this.main.parseStyleSeperator_sub({
                                        data: _params.scopeSelectorText + styleContent,
                                        callCounter: _params.callCounter,
                                        isForRoot: true,
                                        _rootinfo: undefined
                                    })
                                );
                            } else {
                                let rInfo = rootPathHandler.getInfoByAlices(
                                    rootAlices  // `@${rootAlices}:`
                                ); 
                                if (rInfo != undefined) {
                                    externalStyles.push(
                                        _this.main.parseStyleSeperator_sub({
                                            data: _params.scopeSelectorText + styleContent,
                                            callCounter: _params.callCounter,
                                            isForRoot: true,
                                            _rootinfo: rInfo,
                                        })
                                    );
                                }
                            }
                            break;
                        case ":exclude":
                            externalStyles.push(styleContent);
                            return "";
                    }
                    return "";
                }
            );
        }
        return externalStyles;
    }
}
