const { userControlCls } = require("ucbuilder/test/userControlCls");

class prgram {
    constructor() { }
    /** @type {userControlCls}  */ 
    static cur_uc = undefined;
    static _data = "abc";
}
module.exports = prgram;