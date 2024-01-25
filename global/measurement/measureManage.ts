import { Point, Size } from "ucbuilder/global/drawing/shapes";
import { unitType } from "ucbuilder/global/measurement/enumAndMore";
interface UnitValueNode {
  value: number;
  originalValue: number;
  unit: unitType;
}
export class MeasureManage {
  static DPI: number = 2.83465;

  constructor() { }

  static ptFromSVGal(linfo: SVGAnimatedLength): number {
    return this.ptFromSVGl(linfo.baseVal);
  }

  static ptFromSVGl(linfo: SVGLength): number {
    linfo.convertToSpecifiedUnits(linfo.SVG_LENGTHTYPE_PT);
    return linfo.valueInSpecifiedUnits;
  }

  static ptFromParse(val: string): UnitValueNode {
    if (val == undefined) return undefined;

    let rtrn: UnitValueNode;

    val.replace(
      /([\d\.]+) *([a-z]+)/gim,
      (m, oriz_val, unit) => {

        let ovl = parseFloat(oriz_val);
        rtrn = {
          value: MeasureManage.pxFrom(ovl, unit),
          originalValue: ovl,
          unit: unit
        };
        return "";
      }
    );

    return rtrn;
  }

  static pxFrom(val: number, from: unitType = "mm"): number {
    let cm: undefined;
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

  static ptTo(val: number, to: unitType = "mm"): number {
    let cm: undefined;

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

  static getSizeFrom(
    w: number,
    h: number,
    fromUnit: unitType = "mm"
  ): Size {
    return new Size(this.pxFrom(w, fromUnit), this.pxFrom(h, fromUnit));
  }

  static getSizeTo(w: number, h: number, toUnit: unitType = "mm"): Size {
    return new Size(this.ptTo(w, toUnit), this.ptTo(h, toUnit));
  }

  private static mmToPoint(val: number): number {
    return val * MeasureManage.DPI;
  }

  private static pointToMm(val: number): number {
    return val / MeasureManage.DPI;
  }

  static PIXELS_IN_POINT: number;

  static pixeltoPt(val: number): number {
    return val / MeasureManage.PIXELS_IN_POINT;
  }

  static pixelfromPt(val: number): number {
    return val * MeasureManage.PIXELS_IN_POINT;
  }
}

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