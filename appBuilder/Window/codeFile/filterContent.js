const { ATTR_OF } = require("@ucbuilder:/global/runtimeOpt");
class filterContent {
    constructor() { }
    static select_inline_Pattern = /(["=> \w\[\]-^|#~$*.+]*)(::|:)([-\w\(\)]+)/g;
    /**
     * @param {string} data 
     * @param {string} _guid 
     * @returns {string}
     */
    static select_inline_filter(data, _guid = "") {
        let rtrn = "";
        let isReplaced = false;
        rtrn = data.replace(this.select_inline_Pattern,
            /**
             * @param {string} match 
             * @param {string} selector 
             * @param {string} seperator 
             * @param {string} pseudo 
             * @param {number} offset 
             * @param {string} input_string 
             * @returns {string}
             */
            function (
                match,
                selector,
                seperator,
                pseudo,
                offset, input_string) {
                isReplaced = true;
                return `${selector.trim()}[${ATTR_OF.UC.UNIQUE_STAMP}='${_guid}']${seperator}${pseudo}`;
            });
        if (isReplaced) return rtrn;
        return data.trim() + `[${ATTR_OF.UC.UNIQUE_STAMP}='${_guid}']`;

    }

}
module.exports = { filterContent };