import { StampNode, STYLER_SELECTOR_TYPE } from "../lib/StampGenerator.js";
import { ATTR_OF } from "./runtimeOpt.js";

 
class FilterContent {
    static select_inline_Pattern: RegExp = /(["=> \w\[\]-^|#~$*.+]*)(::|:)([-\w\(\)]+)/g;

    static select_inline_filter(data: string, _guid: string = ""): string {
        let rtrn: string = "";
        let isReplaced: boolean = false;
        rtrn = data.replace(this.select_inline_Pattern, function (
            match: string,
            selector: string,
            seperator: string,
            pseudo: string,
            offset: number,
            input_string: string
        ): string {
            isReplaced = true;
            return `${selector.trim()}.${ATTR_OF.__CLASS(_guid, 'l')}${seperator}${pseudo}`;
        });
        if (isReplaced) return rtrn;
        return (StampNode.MODE == STYLER_SELECTOR_TYPE.ATTRIB_SELECTOR) ?
            data.trim() + `[${ATTR_OF.UC.ALL}^='${_guid}_']`
            :
            data.trim() + `.${ATTR_OF.__CLASS(_guid, 'l')}`;
        return;  // old one `[${ATTR_OF.UC.UNIQUE_STAMP}='${_guid}']`
    }
}

export { FilterContent };