"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATTR_OF = exports.attrOfUC = exports.GLOBAL_OPTIONS = void 0;
function randNumbers(min = 0, max = 1000000) {
    let difference = max - min;
    let rand = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
}
exports.GLOBAL_OPTIONS = {
    tabindexes: {
        allowTabInAllForms: true,
    },
};
exports.attrOfUC = {
    UC_STAMP: "uc" + randNumbers(),
    PARENT_STAMP: "parent" + randNumbers(),
    UNIQUE_STAMP: "uniq" + randNumbers(),
    ROOT_STAMP: "root" + randNumbers(),
};
exports.ATTR_OF = {
    UC: Object.freeze({
        UC_STAMP: "uc" + randNumbers(),
        PARENT_STAMP: "parent" + randNumbers(),
        UNIQUE_STAMP: "uniq" + randNumbers(),
        ROOT_STAMP: "root" + randNumbers(),
    }),
};
