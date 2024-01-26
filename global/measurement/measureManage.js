"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeasureManage = void 0;
const shapes_1 = require("ucbuilder/global/drawing/shapes");
class MeasureManage {
    constructor() { }
    static ptFromSVGal(linfo) {
        return this.ptFromSVGl(linfo.baseVal);
    }
    static ptFromSVGl(linfo) {
        linfo.convertToSpecifiedUnits(linfo.SVG_LENGTHTYPE_PT);
        return linfo.valueInSpecifiedUnits;
    }
    static ptFromParse(val) {
        if (val == undefined)
            return undefined;
        let rtrn;
        val.replace(/([\d\.]+) *([a-z]+)/gim, (m, oriz_val, unit) => {
            let ovl = parseFloat(oriz_val);
            rtrn = {
                value: MeasureManage.pxFrom(ovl, unit),
                originalValue: ovl,
                unit: unit
            };
            return "";
        });
        return rtrn;
    }
    static pxFrom(val, from = "mm") {
        let cm;
        val = val || 1;
        switch (from) {
            case "pt":
                return val;
            case "cm":
                return this.mmToPoint(val * 10);
            case "in":
                return this.mmToPoint(val * 25.4);
            case "mm":
                return this.mmToPoint(val);
            case "pc":
                return this.mmToPoint(val * 3.0856775814914e19);
            default:
                return val;
        }
    }
    static ptTo(val, to = "mm") {
        let cm;
        switch (to) {
            case "cm":
                return this.pointToMm(val / 10);
            case "mm":
                return this.pointToMm(val);
            case "pc":
                return this.pointToMm(val / 3.0856775814914e19);
            case "in":
                return this.pointToMm(val / 25.4);
            case "pt":
                return val;
            default:
                return val;
        }
    }
    static getSizeFrom(w, h, fromUnit = "mm") {
        return new shapes_1.Size(this.pxFrom(w, fromUnit), this.pxFrom(h, fromUnit));
    }
    static getSizeTo(w, h, toUnit = "mm") {
        return new shapes_1.Size(this.ptTo(w, toUnit), this.ptTo(h, toUnit));
    }
    static mmToPoint(val) {
        return val * MeasureManage.DPI;
    }
    static pointToMm(val) {
        return val / MeasureManage.DPI;
    }
    static pixeltoPt(val) {
        return val / MeasureManage.PIXELS_IN_POINT;
    }
    static pixelfromPt(val) {
        return val * MeasureManage.PIXELS_IN_POINT;
    }
}
exports.MeasureManage = MeasureManage;
MeasureManage.DPI = 2.83465;
(() => {
    let div = document.createElement("div");
    document.body.append(div);
    Object.assign(div.style, {
        height: "1pt",
        left: "-100%",
        position: "absolute",
        top: "-100%",
        width: "1pt",
    });
    MeasureManage.PIXELS_IN_POINT = div.getClientRects()[0].height;
})();
