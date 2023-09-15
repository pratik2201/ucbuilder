function randNumbers(min = 0, max = 1000000) {
    let difference = max - min;
    let rand = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
}
const GLOBAL_OPTIONS = {
    tabindexes:{
        allowTabInAllForms:true,
    }
}
module.exports = {
    ATTR_OF: {
        UC: Object.freeze({
            UC_STAMP: "uc" + randNumbers(),
            PARENT_STAMP: "parent" + randNumbers(),
            UNIQUE_STAMP: "uniq" + randNumbers(),
            ROOT_STAMP: "root" + randNumbers(),
        }),
    },      
    GLOBAL_OPTIONS
}
