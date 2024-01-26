"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUiSearch = void 0;
class listUiSearch {
    constructor(main) {
        this.sampleRow = undefined;
        this.main = main;
    }
    get rows() {
        return this.main.source.rows;
    }
    takeBlueprint(force = false) {
        let hasTakenSample = this.sampleRow != undefined;
        if (!force && hasTakenSample)
            return;
        if (this.rows.length == 0)
            return;
        this.sampleRow = this.rows[0];
        this.experiment();
    }
    experiment() {
        //console.log(this.sampleRow);        
        //console.log(newObjectOpt.analysisObject(this.sampleRow));
    }
}
exports.listUiSearch = listUiSearch;
