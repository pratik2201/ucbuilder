"use strict";
/*function randNumbers(min: number = 0, max: number = 1000000): number {
    let difference: number = max - min;
    let rand: number = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
}*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATTR_OF = exports.attrOfUC = exports.GLOBAL_OPTIONS = void 0;
const common_1 = require("ucbuilder/build/common");
exports.GLOBAL_OPTIONS = {
    tabindexes: {
        allowTabInAllForms: true,
    },
};
exports.attrOfUC = {
    UC_STAMP: "uc" + common_1.uniqOpt.randomNo(),
    PARENT_STAMP: "parent" + common_1.uniqOpt.randomNo(),
    UNIQUE_STAMP: "uniq" + common_1.uniqOpt.randomNo(),
    ROOT_STAMP: "root" + common_1.uniqOpt.randomNo(),
};
exports.ATTR_OF = {
    UC: Object.freeze({
        UC_STAMP: "uc" + common_1.uniqOpt.randomNo(),
        PARENT_STAMP: "parent" + common_1.uniqOpt.randomNo(),
        UNIQUE_STAMP: "uniq" + common_1.uniqOpt.randomNo(),
        ROOT_STAMP: "root" + common_1.uniqOpt.randomNo(),
    }),
};
