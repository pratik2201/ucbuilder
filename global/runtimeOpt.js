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
            UC_STAMP: "a" + randNumbers(),
            PARENT_STAMP: "b" + randNumbers(),
            UNIQUE_STAMP: "c" + randNumbers(),
            ROOT_STAMP: "r" + randNumbers(),
        }),
    },      
    GLOBAL_OPTIONS
}
