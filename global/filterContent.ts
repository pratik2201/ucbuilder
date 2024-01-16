import { attrOfUC } from "@ucbuilder:/global/runtimeOpt";

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
            return `${selector.trim()}[${attrOfUC.UNIQUE_STAMP}='${_guid}']${seperator}${pseudo}`;
        });
        if (isReplaced) return rtrn;
        return data.trim() + `[${attrOfUC.UNIQUE_STAMP}='${_guid}']`;
    }
}

export { FilterContent };