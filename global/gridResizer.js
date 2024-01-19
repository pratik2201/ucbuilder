"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridResizer = exports.getConvertedNames = void 0;
const shapes_1 = require("ucbuilder/global/drawing/shapes");
const objectOpt_1 = require("ucbuilder/global/objectOpt");
const namingConversion = {
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
};
const getConvertedNames = (gridTemplate = 'grid-template-columns') => {
    let _rtrn = objectOpt_1.newObjectOpt.clone(namingConversion);
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
};
exports.getConvertedNames = getConvertedNames;
class GridResizer {
    constructor() {
        this.dgvDomRect = new shapes_1.Rect();
        this.measurement = [];
        this.resizeMode = "unfill";
        this.gridTemplate = 'grid-template-columns';
        this.gridAuto = 'grid-template-rows';
    }
    get measureText() {
        return this.measurement.length <= 1 ? "auto" : this.measurement.map(s => s.size).slice(0, -1).join("px ") + "px auto";
    }
    refreshView() {
        this.options.grid.style[this.gridTemplate] = this.measureText;
    }
    get hasDefinedStyles() {
        var _a, _b;
        return ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.grid) === null || _b === void 0 ? void 0 : _b.style[this.gridTemplate]) !== "";
    }
}
exports.GridResizer = GridResizer;
