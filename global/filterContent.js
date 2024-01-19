"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterContent = void 0;
const runtimeOpt_1 = require("ucbuilder/global/runtimeOpt");
class FilterContent {
    static select_inline_filter(data, _guid = "") {
        let rtrn = "";
        let isReplaced = false;
        rtrn = data.replace(this.select_inline_Pattern, function (match, selector, seperator, pseudo, offset, input_string) {
            isReplaced = true;
            return `${selector.trim()}[${runtimeOpt_1.attrOfUC.UNIQUE_STAMP}='${_guid}']${seperator}${pseudo}`;
        });
        if (isReplaced)
            return rtrn;
        return data.trim() + `[${runtimeOpt_1.attrOfUC.UNIQUE_STAMP}='${_guid}']`;
    }
}
exports.FilterContent = FilterContent;
FilterContent.select_inline_Pattern = /(["=> \w\[\]-^|#~$*.+]*)(::|:)([-\w\(\)]+)/g;
