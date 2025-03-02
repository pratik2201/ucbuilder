import { Rect } from "ucbuilder/global/drawing/shapes";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { Usercontrol } from "ucbuilder/Usercontrol";

export interface MeasurementRow {
    size: number | undefined;
    data: Record<string, any>;
}
export interface GridResizerInitOptions {
    grid: HTMLElement;
    nodeName: string;
}
const gridResizerInitOptions: GridResizerInitOptions = {
    grid: undefined,
    nodeName: ''
}
export interface NamingConversion {
    offsetSize: string;
    splitterText: string;
    gridTemplate: GridTemplateType;
    gridAuto: GridAutoType;
    point: string;
    size: string;
    dir: string;
    pagePoint: string;
    OPPOSITE: {
        scrollPoint: string;
        scrollSize: string;
    };
}
const namingConversion: NamingConversion = {
    offsetSize: 'offsetWidth',
    splitterText: 'splitter-width',
    gridTemplate: 'grid-template-columns',
    gridAuto: 'grid-auto-rows',
    point: 'x',
    size: 'width',
    dir: 'left',
    pagePoint: 'pageX',
    OPPOSITE: {
        scrollPoint: "scrollTop",
        scrollSize: "scrollBarHeight",
    }
}
export const getConvertedNames = (gridTemplate: GridTemplateType = 'grid-template-columns'): NamingConversion => {
    let _rtrn = newObjectOpt.clone(namingConversion);
    if (gridTemplate == "grid-template-rows") {
        _rtrn.offsetSize = "offsetHeight";
        _rtrn.splitterText = "splitter-height";
        _rtrn.gridTemplate = 'grid-template-rows';
        _rtrn.gridAuto = "grid-auto-columns";
        _rtrn.size = "height";
        _rtrn.point = "y";
        _rtrn.dir = "top";
        _rtrn.pagePoint = "pageY";
        _rtrn.OPPOSITE = {
            scrollPoint: "scrollLeft",
            scrollSize: "scrollBarWidth",
        };
    }
    return _rtrn;
}
type GridTemplateType = "grid-template-columns" | "grid-template-rows";
type GridAutoType = "grid-auto-columns" | "grid-auto-rows";
type ResizeMode = "slider" | "unfill";
export class GridResizer {
    static boundContainers: HTMLElement[] = [];
    options: GridResizerInitOptions = {
        grid: undefined,
        nodeName: ''
    };
    dgvDomRect: Rect = new Rect();
    measurement: MeasurementRow[] = [];
    resizeMode: ResizeMode = "unfill";
    get measureText(): string {
        return this.measurement.length <= 1 ? "auto" : this.measurement.map(s => s.size).slice(0, -1).join("px ") + "px auto";
    }
    gridTemplate: GridTemplateType = namingConversion.gridTemplate;
    gridAuto: GridAutoType = "grid-auto-rows";
    refreshView(): void {
        this.options.grid.style[this.gridTemplate] = this.measureText;
    }
    get hasDefinedStyles(): boolean {
        return this.options?.grid?.style[this.gridTemplate] !== "";
    }
    constructor() { }

    init(options: GridResizerInitOptions) {
        this.options = newObjectOpt.copyProps(options, gridResizerInitOptions);
    }


    static getConvertedNames(gridTemplate: "grid-template-columns" | "grid-template-rows" = "grid-template-columns"): NamingConversion {       
        return getConvertedNames(gridTemplate);
    }
}
