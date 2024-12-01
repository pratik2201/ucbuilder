/*function randNumbers(min: number = 0, max: number = 1000000): number {
    let difference: number = max - min;
    let rand: number = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
}*/

import { uniqOpt } from "ucbuilder/build/common";

export const GLOBAL_OPTIONS: {
    tabindexes: {
        allowTabInAllForms: boolean;
    };
} = {
    tabindexes: {
        allowTabInAllForms: true,
    },
};
export interface AttrOfUC {
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
}

export const ATTR_OF = {
    UC: Object.freeze({
        ALL: "all" + uniqOpt.randomNo(),
        UC_STAMP: "uc" + uniqOpt.randomNo(),
        //PARENT_STAMP: "parent" + uniqOpt.randomNo(),
       // UNIQUE_STAMP: "uniq" + uniqOpt.randomNo(),
        //ROOT_STAMP: "root" + uniqOpt.randomNo(),
    }),
};

