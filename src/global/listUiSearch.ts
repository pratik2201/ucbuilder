import { listUiHandler } from "ucbuilder/global/listUI/extended/listUiHandler";

export class listUiSearch {
    main: listUiHandler;

    constructor(main: listUiHandler) {
        this.main = main;
    }

    get rows(): any[] {
        return this.main.source.rows;
    }

    sampleRow: any = undefined;

    takeBlueprint(force: boolean = false) {
        let hasTakenSample = this.sampleRow != undefined;
        if (!force && hasTakenSample) return;
        if (this.rows.length == 0) return;
        this.sampleRow = this.rows[0];
        this.experiment();
    }

    experiment() {
        //console.log(this.sampleRow);        
        //console.log(newObjectOpt.analysisObject(this.sampleRow));
    }
}