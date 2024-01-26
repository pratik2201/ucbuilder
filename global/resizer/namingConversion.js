"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConvertedNames = exports.namingConversion = void 0;
const objectOpt_1 = require("ucbuilder/global/objectOpt");
exports.namingConversion = {
    offsetSize: "offsetWidth",
    splitterText: "splitter-width",
    gridTemplate: "grid-template-columns",
    gridAuto: "grid-auto-rows",
    point: "x",
    size: "width",
    dir: "left",
    resize: "e-resize",
    pagePoint: "pageX",
    client: "clientX",
    offsetPoint: "offsetX",
    scrollPosition: "scrollLeft",
    OPPOSITE: {
        scrollPosition: "scrollTop",
        scrollSize: "scrollBarHeight",
    },
};
const getConvertedNames = (gridTemplate = "grid-template-columns") => {
    let _rtrn = objectOpt_1.newObjectOpt.clone(exports.namingConversion);
    if (gridTemplate == "grid-template-rows") {
        _rtrn.offsetSize = "offsetHeight";
        _rtrn.splitterText = "splitter-height";
        _rtrn.gridTemplate = gridTemplate;
        _rtrn.gridAuto = "grid-auto-columns";
        _rtrn.resize = "n-resize";
        _rtrn.size = "height";
        _rtrn.point = "y";
        _rtrn.dir = "top";
        _rtrn.pagePoint = "pageY";
        _rtrn.client = "clientY";
        _rtrn.offsetPoint = "offsetY";
        _rtrn.scrollPosition = "scrollTop";
        _rtrn.OPPOSITE = {
            scrollPosition: "scrollLeft",
            scrollSize: "scrollBarWidth",
        };
    }
    return _rtrn;
};
exports.getConvertedNames = getConvertedNames;
