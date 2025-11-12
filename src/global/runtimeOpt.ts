/*function randNumbers(min: number = 0, max: number = 1000000): number {
    let difference: number = max - min;
    let rand: number = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
}*/

import { GetRandomNo, GetUniqueId } from "../ipc/enumAndMore.js";

 

export type StyleClassScopeType = "l" | "m" | "r" | "g"
export const GLOBAL_OPTIONS: {
    tabindexes: {
        allowTabInAllForms: boolean;
    };
} = {
    tabindexes: {
        allowTabInAllForms: true,
    },
};
/*export interface AttrOfUC {
    UC_STAMP: string,
    PARENT_STAMP: string,
    UNIQUE_STAMP: string,
    ROOT_STAMP: string,
}
export const attrOfUC: AttrOfUC = {
    UC_STAMP: "uc" + uniqOpt.randomNo(),
    PARENT_STAMP: "parent" + uniqOpt.randomNo(),
    UNIQUE_STAMP: "uniq" + uniqOpt.randomNo(),
    ROOT_STAMP: "root" + uniqOpt.randomNo(),
}*/

export const ATTR_OF = {
    __CLASS: (id: string, type: StyleClassScopeType) => {
        return ATTR_OF.UC.ALLC + '' + type + '' + id;
    },
   /* _ROOT_CLASS: (id: string) => {
        return ATTR_OF.UC.ALLC + 'r' + id;
    }, _GROUP_CLASS: (id: string) => {
        return ATTR_OF.UC.ALLC + 'g' + id;
    }, _LOCAL_CLASS: (id: string) => {
        return ATTR_OF.UC.ALLC + 'l' + id;
    }, _LOCAL_MAIN_CLASS: (id: string) => {
        return ATTR_OF.UC.ALLC + 'l' + id;
    },*/
    setUc: (u: string): string => {
        return "." + ATTR_OF.UC.UC_STAMP + "" + u;
    },
    setParent: (u: string): string => {
        return "." + ATTR_OF.UC.CLASS_PARENT + "" + u;
    }, setRoot: (u: string): string => {
        return "." + ATTR_OF.UC.CLASS_ROOT + "" + u;
    },
    getParent: (p: string, r: string): string[] => {
        return [ATTR_OF.UC.CLASS_PARENT + "" + p, ATTR_OF.UC.CLASS_ROOT + "" + r]
    },
    getUc: (u: string): string => {
        return ATTR_OF.UC.UC_STAMP + "" + u;
    },
    X_NAME: "x-name",
    X_FROM: "x-from",
    BASE_OBJECT: "base_object",
    SCOPE_KEY: "x-scope",
    ACCESSIBLE_KEY: "id",
    TEMPLETE_DEFAULT: "primary",
    UC: Object.freeze({
        ALLC: "c" + GetRandomNo(1,9999),
        ALL: "all" + GetUniqueId(),
        UC_STAMP: "uc" + GetUniqueId(),
        CLASS_PARENT: "parent" + GetUniqueId(),
        CLASS_ROOT: "root" + GetUniqueId(),
        CSSStyleDeclarations: 'CSSStyleDeclarations_' + GetUniqueId(),

        //PARENT_STAMP: "parent" + uniqOpt.randomNo(),
        // UNIQUE_STAMP: "uniq" + uniqOpt.randomNo(),
        //ROOT_STAMP: "root" + uniqOpt.randomNo(),
    }),
};

