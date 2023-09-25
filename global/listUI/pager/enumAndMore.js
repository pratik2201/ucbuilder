const { uniqOpt } = require("@ucbuilder:/build/common");

module.exports = {
    /** @type {"DISPLAYED"|"OUTSIDE"|"LAST"|"FIRST"}  */
    PageNavigationResult: "DISPLAYED",
    pagerATTR: Object.freeze({
        itemIndex: "itmIndx" + uniqOpt.randomNo()
    })
}