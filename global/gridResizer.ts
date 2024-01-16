import { Rect } from "@ucbuilder:/global/drawing/shapes";
import { newObjectOpt } from "@ucbuilder:/global/objectOpt";
import { Usercontrol } from "@ucbuilder:/Usercontrol";

interface MeasurementRow {
    size: number | undefined;
    data: Record<string, any>;
}
interface GridResizerInitOptions {
    grid: HTMLElement | undefined;
    nodeName: string;
}
type GridTemplateType = "grid-template-columns" | "grid-template-rows";
interface NamingConversion {
    offsetSize: string;
    splitterText: string;
    gridTemplate: GridTemplateType;
    gridAuto: string;
    point: string;
    size: string;
    dir: string;
    pagePoint: string;
    OPPOSITE: {
        scrollPoint: string;
        scrollSize: string;
    };
}
const namingConversion:NamingConversion = {
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
class GridResizer {
    //static boundContainers: container[] = [];
    options: GridResizerInitOptions;
    dgvDomRect: Rect = new Rect();
    measurement: MeasurementRow[] = [];
    resizeMode: "slider" | "unfill" = "unfill";
    get measureText(): string {
        return this.measurement.length <= 1 ? "auto" : this.measurement.map(s => s.size).slice(0, -1).join("px ") + "px auto";
    }
    gridTemplate: GridTemplateType = 'grid-template-columns';
    gridAuto: GridTemplateType = 'grid-template-rows';
    refreshView(): void {
        this.options.grid.style[this.gridTemplate] = this.measureText;
    }
    get hasDefinedStyles(): boolean {
        return this.options?.grid?.style[this.gridTemplate] !== "";
    }
    constructor() {}  
}
export { GridResizer, MeasurementRow, NamingConversion };